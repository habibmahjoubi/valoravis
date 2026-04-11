import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/resend";
import { sendSms } from "@/lib/sms";
import { NICHE_CONFIGS } from "@/config/niches";
import { absoluteUrl, escapeHtml } from "@/lib/utils";
import type { Channel, Niche } from "@/generated/prisma/enums";
import crypto from "crypto";

function resolveTemplate(
  template: string,
  vars: Record<string, string>
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] || "");
}

export async function createReviewRequest({
  userId,
  clientId,
  channel,
  delayHours,
}: {
  userId: string;
  clientId: string;
  channel: Channel;
  delayHours?: number;
}) {
  // Transaction interactive : vérifications + création atomiques (anti race condition)
  const request = await prisma.$transaction(async (tx) => {
    const user = await tx.user.findUniqueOrThrow({
      where: { id: userId },
    });

    if (user.quotaUsed >= user.monthlyQuota) {
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
        userId,
        createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        status: { not: "FAILED" },
      },
    });
    if (recentRequest) {
      throw new Error(
        "Une demande a déjà été envoyée à ce client il y a moins de 7 jours."
      );
    }

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
          channel,
          scheduledAt,
          token: crypto.randomBytes(32).toString("hex"),
        },
      }),
      tx.user.update({
        where: { id: userId },
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
    const nicheConfig = NICHE_CONFIGS[user.niche];

    const customTemplate = await prisma.template.findFirst({
      where: { userId, niche: user.niche, channel },
      orderBy: { isDefault: "desc" },
    });
    const template = customTemplate
      ? { subject: customTemplate.subject || undefined, body: customTemplate.body }
      : nicheConfig.templates[channel];

    const vars = {
      clientName: escapeHtml(client.name),
      businessName: escapeHtml(user.businessName || "notre établissement"),
      link: absoluteUrl(`/review/${request.token}`),
    };

    try {
      if (channel === "EMAIL" && client.email) {
        await sendEmail({
          to: client.email,
          subject: resolveTemplate(template.subject || nicheConfig.templates[channel].subject || "Votre avis compte", vars),
          html: resolveTemplate(template.body, vars),
          fromName: user.senderName || undefined,
          replyTo: user.replyToEmail || undefined,
        });
      } else if (channel === "SMS" && client.phone) {
        await sendSms({
          to: client.phone,
          body: resolveTemplate(template.body, vars),
        });
      }

      await prisma.reviewRequest.update({
        where: { id: request.id },
        data: { status: "SENT", sentAt: new Date() },
      });
    } catch (error) {
      console.error(`[review-request] send failed ${request.id}:`, error instanceof Error ? error.message : "unknown");
      await prisma.reviewRequest.update({
        where: { id: request.id },
        data: { status: "FAILED" },
      });
    }
  }

  return request;
}

export async function processPendingRequests() {
  const pending = await prisma.reviewRequest.findMany({
    where: {
      status: "PENDING",
      scheduledAt: { lte: new Date() },
    },
    include: {
      user: true,
      client: true,
    },
    take: 50,
  });

  const results = { sent: 0, failed: 0 };

  for (const request of pending) {
    try {
      const { user, client } = request;
      const nicheConfig = NICHE_CONFIGS[user.niche];

      // US15-16 - Check for custom template first (prefer default)
      const customTemplate = await prisma.template.findFirst({
        where: { userId: user.id, niche: user.niche, channel: request.channel },
        orderBy: { isDefault: "desc" },
      });
      const template = customTemplate
        ? {
            subject: customTemplate.subject || undefined,
            body: customTemplate.body,
          }
        : nicheConfig.templates[request.channel];

      const vars = {
        clientName: escapeHtml(client.name),
        businessName: escapeHtml(user.businessName || "notre établissement"),
        link: absoluteUrl(`/review/${request.token}`),
      };

      if (request.channel === "EMAIL" && client.email) {
        await sendEmail({
          to: client.email,
          subject: resolveTemplate(template.subject || nicheConfig.templates[request.channel].subject || "Votre avis compte", vars),
          html: resolveTemplate(template.body, vars),
          fromName: user.senderName || undefined,
          replyTo: user.replyToEmail || undefined,
        });
      } else if (request.channel === "SMS" && client.phone) {
        await sendSms({
          to: client.phone,
          body: resolveTemplate(template.body, vars),
        });
      }

      await prisma.reviewRequest.update({
        where: { id: request.id },
        data: { status: "SENT", sentAt: new Date() },
      });
      results.sent++;
    } catch (error) {
      console.error(`[review-request] batch send failed:`, error instanceof Error ? error.message : "unknown");
      await prisma.reviewRequest.update({
        where: { id: request.id },
        data: { status: "FAILED" },
      });
      results.failed++;
    }
  }

  return results;
}
