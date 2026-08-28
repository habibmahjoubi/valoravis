import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/resend";
import { sendSms } from "@/lib/sms";
import { NICHE_CONFIGS } from "@/config/niches";
import { absoluteUrl, escapeHtml, toSmsSenderId, stripAccents } from "@/lib/utils";
import { sanitizeTemplateHtml } from "@/lib/sanitize";
import type { Channel, Niche } from "@/generated/prisma/enums";
import crypto from "crypto";

function fillTemplate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? "");
}

type DeliverParams = {
  requestId: string;
  token: string;
  channel: Channel;
  userId: string;
  establishmentId: string | null;
  niche: Niche;
  businessName: string;
  businessPhone: string | null;
  senderName: string | null;
  replyToEmail: string | null;
  client: { name: string; email: string | null; phone: string | null };
};

/**
 * Envoie une demande d'avis (email ou SMS) et met à jour son statut.
 * - Le corps HTML des emails est ré-assaini au moment de l'envoi (défense en profondeur).
 * - Le contenu SMS utilise des variables NON échappées HTML (texte brut).
 */
async function deliverReviewRequest(p: DeliverParams): Promise<"SENT" | "FAILED"> {
  const nicheConfig = NICHE_CONFIGS[p.niche];

  const customTemplate = await prisma.template.findFirst({
    where: {
      userId: p.userId,
      niche: p.niche,
      channel: p.channel,
      ...(p.establishmentId ? { establishmentId: p.establishmentId } : {}),
    },
    orderBy: { isDefault: "desc" },
  });
  const template = customTemplate
    ? { subject: customTemplate.subject || undefined, body: customTemplate.body }
    : nicheConfig.templates[p.channel];

  const link = absoluteUrl(`/review/${p.token}`);
  // Variables texte brut (SMS, objet d'email)
  const textVars = {
    clientName: p.client.name,
    businessName: p.businessName,
    link,
  };
  // Variables échappées HTML (corps d'email uniquement)
  const htmlVars = {
    clientName: escapeHtml(p.client.name),
    businessName: escapeHtml(p.businessName),
    link,
  };

  try {
    if (p.channel === "EMAIL" && p.client.email) {
      const subjectTpl =
        template.subject || nicheConfig.templates.EMAIL.subject || "Votre avis compte";
      await sendEmail({
        to: p.client.email,
        subject: fillTemplate(subjectTpl, textVars),
        html: sanitizeTemplateHtml(fillTemplate(template.body, htmlVars)),
        fromName: p.senderName || undefined,
        replyTo: p.replyToEmail || undefined,
      });
    } else if (p.channel === "SMS" && p.client.phone) {
      // Sender ID = nom du commerce (senderName sinon nom de l'établissement).
      const senderId = toSmsSenderId(p.senderName || p.businessName);
      let smsBody = fillTemplate(template.body, textVars);
      // Le client ne peut pas répondre à un Sender ID → on ajoute le contact
      // (le nom du commerce figure déjà dans le corps du message).
      if (senderId && p.businessPhone) {
        smsBody += ` Contact : ${p.businessPhone}`;
      }
      // SMS sans accents : reste en GSM-7 (160 car./segment au lieu de 70).
      await sendSms({
        to: p.client.phone,
        body: stripAccents(smsBody),
        senderId,
      });
    }

    await prisma.reviewRequest.update({
      where: { id: p.requestId },
      data: { status: "SENT", sentAt: new Date() },
    });
    return "SENT";
  } catch (error) {
    console.error(
      "[review-request] send failed:",
      error instanceof Error ? error.message : "unknown"
    );
    await prisma.reviewRequest.update({
      where: { id: p.requestId },
      data: { status: "FAILED" },
    });
    return "FAILED";
  }
}

export async function createReviewRequest({
  userId,
  clientId,
  channel,
  delayHours,
  establishmentId,
}: {
  userId: string;
  clientId: string;
  channel: Channel;
  delayHours?: number;
  establishmentId?: string;
}) {
  // Transaction interactive : vérifications + création atomiques (anti race condition)
  const request = await prisma.$transaction(async (tx) => {
    // Le quota est celui du PROPRIÉTAIRE de l'établissement (les membres n'ont
    // pas de quota propre), sinon celui de l'utilisateur.
    let quotaUserId = userId;
    if (establishmentId) {
      const owner = await tx.establishmentMember.findFirst({
        where: { establishmentId, role: "OWNER" },
        select: { userId: true },
      });
      if (owner) quotaUserId = owner.userId;
    }

    const quotaUser = await tx.user.findUniqueOrThrow({ where: { id: quotaUserId } });

    if (quotaUser.isSuspended) {
      throw new Error("Compte suspendu.");
    }
    if (quotaUser.quotaUsed >= quotaUser.monthlyQuota) {
      throw new Error("Quota mensuel atteint. Passez au plan supérieur.");
    }

    // Vérifier que le client appartient bien à l'utilisateur
    const client = await tx.client.findFirst({
      where: { id: clientId, userId },
    });
    if (!client) {
      throw new Error("Client introuvable.");
    }

    // Anti-doublons : pas de demande au même client dans les 7 derniers jours
    const recentRequest = await tx.reviewRequest.findFirst({
      where: {
        clientId,
        createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        status: { not: "FAILED" },
      },
    });
    if (recentRequest) {
      throw new Error(
        "Une demande a déjà été envoyée à ce client il y a moins de 7 jours."
      );
    }

    const user = await tx.user.findUniqueOrThrow({ where: { id: userId } });
    const nicheConfig = NICHE_CONFIGS[user.niche];
    const delay =
      delayHours !== undefined
        ? delayHours
        : user.defaultDelay !== null
          ? user.defaultDelay
          : nicheConfig.defaultDelay;

    const scheduledAt = new Date(Date.now() + delay * 60 * 60 * 1000);

    const [req] = await Promise.all([
      tx.reviewRequest.create({
        data: {
          userId,
          clientId,
          establishmentId: establishmentId || null,
          channel,
          scheduledAt,
          token: crypto.randomBytes(32).toString("hex"),
        },
      }),
      tx.user.update({
        where: { id: quotaUserId },
        data: { quotaUsed: { increment: 1 } },
      }),
    ]);

    return req;
  });

  // Envoi immediat si delai = 0
  const effectiveDelay = delayHours !== undefined ? delayHours : null;
  if (effectiveDelay === 0) {
    const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
    const client = await prisma.client.findUniqueOrThrow({
      where: { id: clientId, userId },
    });
    const establishment = establishmentId
      ? await prisma.establishment.findUnique({ where: { id: establishmentId } })
      : null;

    await deliverReviewRequest({
      requestId: request.id,
      token: request.token,
      channel,
      userId,
      establishmentId: establishmentId ?? null,
      niche: establishment?.niche ?? user.niche,
      businessName: establishment?.name ?? user.businessName ?? "notre établissement",
      businessPhone: establishment?.phone ?? user.phone,
      senderName: establishment?.senderName ?? user.senderName,
      replyToEmail: establishment?.replyToEmail ?? user.replyToEmail,
      client: { name: client.name, email: client.email, phone: client.phone },
    });
  }

  return request;
}

export async function processPendingRequests() {
  // Claim atomique : chaque exécution s'attribue un lot via un claimId unique.
  // Deux exécutions concurrentes ne peuvent pas traiter la même ligne (double envoi).
  // Les claims « bloqués » (> 5 min) sont automatiquement récupérés.
  const claimId = crypto.randomUUID();
  const now = new Date();
  const staleBefore = new Date(now.getTime() - 5 * 60 * 1000);

  await prisma.reviewRequest.updateMany({
    where: {
      status: "PENDING",
      scheduledAt: { lte: now },
      OR: [{ claimId: null }, { claimedAt: { lt: staleBefore } }],
    },
    data: { claimId, claimedAt: now },
  });

  const pending = await prisma.reviewRequest.findMany({
    where: { claimId, status: "PENDING" },
    include: { user: true, client: true, establishment: true },
    take: 100,
  });

  const results = { sent: 0, failed: 0, skipped: 0 };

  for (const request of pending) {
    const { user, client, establishment } = request;

    // Ne pas envoyer pour un compte suspendu ou un essai expiré non rétrogradé
    const trialExpired =
      !!user.trialEndsAt && user.trialEndsAt <= new Date() && user.plan !== "free";
    if (user.isSuspended || trialExpired) {
      await prisma.reviewRequest.update({
        where: { id: request.id },
        data: { status: "FAILED" },
      });
      results.skipped++;
      continue;
    }

    const status = await deliverReviewRequest({
      requestId: request.id,
      token: request.token,
      channel: request.channel,
      userId: user.id,
      establishmentId: establishment?.id ?? null,
      niche: establishment?.niche ?? user.niche,
      businessName: establishment?.name ?? user.businessName ?? "notre établissement",
      businessPhone: establishment?.phone ?? user.phone,
      senderName: establishment?.senderName ?? user.senderName,
      replyToEmail: establishment?.replyToEmail ?? user.replyToEmail,
      client: { name: client.name, email: client.email, phone: client.phone },
    });

    if (status === "SENT") results.sent++;
    else results.failed++;
  }

  return results;
}
