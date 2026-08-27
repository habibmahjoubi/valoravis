"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireRole, getEstablishmentOwner } from "@/lib/establishment";
import { getEstablishmentLimit, getMembersPerEstablishment } from "@/config/plan-features";
import { formString } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import type { Niche, Channel } from "@/generated/prisma/enums";

async function getUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Non authentifié");
  return session.user.id;
}

function validateLength(value: string | null, max: number, label: string) {
  if (value && value.length > max) throw new Error(`${label} trop long (max ${max} caractères)`);
}

// --- Switch establishment ---
export async function switchEstablishment(establishmentId: string) {
  const userId = await getUserId();

  // Verify access
  const membership = await prisma.establishmentMember.findUnique({
    where: { userId_establishmentId: { userId, establishmentId } },
  });
  if (!membership) throw new Error("Accès refusé");

  const cookieStore = await cookies();
  cookieStore.set("current-establishment-id", establishmentId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });

  revalidatePath("/dashboard");
}

// --- Create establishment ---
export async function createEstablishment(formData: FormData) {
  const userId = await getUserId();
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });

  // Check establishment limit
  const currentCount = await prisma.establishmentMember.count({
    where: { userId, role: "OWNER" },
  });
  const limit = getEstablishmentLimit(user.plan);
  if (currentCount >= limit) {
    return { error: `Limite atteinte : ${limit} établissement${limit > 1 ? "s" : ""} pour le plan ${user.plan}. Passez au plan supérieur.` };
  }

  const name = formData.get("name") as string;
  const niche = formData.get("niche") as Niche;
  const customNiche = (formData.get("customNiche") as string) || null;
  const googlePlaceUrl = (formData.get("googlePlaceUrl") as string) || null;
  const phone = (formData.get("phone") as string) || null;

  validateLength(name, 200, "Nom de l'établissement");
  validateLength(customNiche, 100, "Métier personnalisé");
  validateLength(googlePlaceUrl, 2000, "URL Google");
  validateLength(phone, 20, "Téléphone");

  if (!name) return { error: "Le nom de l'établissement est requis." };

  const establishment = await prisma.establishment.create({
    data: {
      name,
      niche,
      customNiche: niche === "OTHER" ? customNiche : null,
      googlePlaceUrl,
      phone,
      members: {
        create: { userId, role: "OWNER" },
      },
    },
  });

  // Auto-switch to the new establishment
  const cookieStore = await cookies();
  cookieStore.set("current-establishment-id", establishment.id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });

  revalidatePath("/dashboard");
  return { success: true, establishmentId: establishment.id };
}

// --- Update establishment ---
export async function updateEstablishment(formData: FormData) {
  const userId = await getUserId();
  const establishmentId = formData.get("establishmentId") as string;

  await requireRole(userId, establishmentId, "ADMIN");

  const name = formData.get("name") as string;
  const niche = formData.get("niche") as Niche;
  const customNiche = (formData.get("customNiche") as string) || null;
  const googlePlaceUrl = (formData.get("googlePlaceUrl") as string) || null;
  const phone = (formData.get("phone") as string) || null;

  validateLength(name, 200, "Nom de l'établissement");
  validateLength(customNiche, 100, "Métier personnalisé");
  validateLength(googlePlaceUrl, 2000, "URL Google");
  validateLength(phone, 20, "Téléphone");

  await prisma.establishment.update({
    where: { id: establishmentId },
    data: {
      name,
      niche,
      customNiche: niche === "OTHER" ? customNiche : null,
      googlePlaceUrl,
      phone,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/establishments");
  revalidatePath("/dashboard/settings");
}

// --- Update establishment sending settings ---
export async function updateEstablishmentSendingSettings(formData: FormData) {
  const userId = await getUserId();
  const establishmentId = formString(formData, "establishmentId");

  await requireRole(userId, establishmentId, "ADMIN");

  const defaultChannel = formData.get("defaultChannel") as string;
  const defaultDelayRaw = formData.get("defaultDelay") as string;
  const senderName = (formData.get("senderName") as string) || null;
  const replyToEmail = (formData.get("replyToEmail") as string) || null;
  const phone = (formData.get("phone") as string) || null;

  if (!["EMAIL", "SMS"].includes(defaultChannel)) {
    return { error: "Canal invalide" };
  }

  const defaultDelay = defaultDelayRaw !== "" ? Number(defaultDelayRaw) : null;
  if (defaultDelay !== null && (!Number.isFinite(defaultDelay) || defaultDelay < 0 || defaultDelay > 720)) {
    return { error: "Délai invalide (0 à 720 heures)" };
  }

  validateLength(senderName, 100, "Nom de l'expéditeur");
  validateLength(phone, 20, "Téléphone");
  if (replyToEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(replyToEmail)) {
    return { error: "Adresse de réponse invalide" };
  }

  await prisma.establishment.update({
    where: { id: establishmentId },
    data: {
      defaultChannel: defaultChannel as Channel,
      defaultDelay,
      senderName,
      replyToEmail,
      ...(phone !== null ? { phone } : {}),
    },
  });

  revalidatePath("/dashboard/settings");
  return { success: true };
}

// --- Delete establishment ---
export async function deleteEstablishment(establishmentId: string) {
  const userId = await getUserId();
  await requireRole(userId, establishmentId, "OWNER");

  // Cannot delete last establishment
  const ownerCount = await prisma.establishmentMember.count({
    where: { userId, role: "OWNER" },
  });
  if (ownerCount <= 1) {
    return { error: "Vous ne pouvez pas supprimer votre dernier établissement." };
  }

  await prisma.establishment.delete({ where: { id: establishmentId } });

  // Clear cookie if it was the current one
  const cookieStore = await cookies();
  const current = cookieStore.get("current-establishment-id")?.value;
  if (current === establishmentId) {
    cookieStore.delete("current-establishment-id");
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/establishments");
  return { success: true };
}

// --- Invite member ---
export async function inviteMember(formData: FormData) {
  const userId = await getUserId();
  const establishmentId = formString(formData, "establishmentId");
  const email = formString(formData, "email").trim().toLowerCase();
  const role = formString(formData, "role") || "MEMBER";

  if (!["ADMIN", "MEMBER"].includes(role)) {
    return { error: "Rôle invalide" };
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Email invalide" };
  }

  await requireRole(userId, establishmentId, "ADMIN");

  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });

  // La limite dépend du plan du PROPRIÉTAIRE (les membres en héritent partout),
  // pas de celui de l'ADMIN qui envoie l'invitation.
  const owner = await getEstablishmentOwner(establishmentId);
  const effectivePlan = owner?.plan ?? user.plan;

  // Check members limit (count current members + pending invitations)
  const [memberCount, pendingInvites] = await Promise.all([
    prisma.establishmentMember.count({ where: { establishmentId } }),
    prisma.establishmentInvitation.count({
      where: { establishmentId, expires: { gt: new Date() } },
    }),
  ]);
  const limit = getMembersPerEstablishment(effectivePlan);
  if (memberCount + pendingInvites >= limit) {
    return { error: `Limite de ${limit} membre${limit > 1 ? "s" : ""} atteinte pour ce plan.` };
  }

  const establishment = await prisma.establishment.findUniqueOrThrow({
    where: { id: establishmentId },
  });

  // Déjà membre ? (l'ADMIN voit de toute façon la liste des membres — pas une fuite)
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    const existingMember = await prisma.establishmentMember.findUnique({
      where: { userId_establishmentId: { userId: existingUser.id, establishmentId } },
    });
    if (existingMember) {
      return { error: "Cet utilisateur est déjà membre de cet établissement." };
    }
  }

  // Dans TOUS les cas (compte existant ou non) : on crée une invitation à accepter.
  // Personne n'est ajouté à un établissement sans action explicite de sa part.
  const { randomBytes } = await import("crypto");
  const token = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  // Upsert invitation (replace if already invited)
  await prisma.establishmentInvitation.upsert({
    where: { establishmentId_email: { establishmentId, email } },
    update: { role: role as "ADMIN" | "MEMBER", token, expires, invitedBy: userId },
    create: {
      establishmentId,
      email,
      role: role as "ADMIN" | "MEMBER",
      token,
      expires,
      invitedBy: userId,
    },
  });

  // Send invitation email
  const { sendEmail } = await import("@/lib/resend");
  const { absoluteUrl, escapeHtml } = await import("@/lib/utils");
  const roleLabel = role === "ADMIN" ? "Administrateur" : "Membre";
  const inviteUrl = absoluteUrl(`/invite/${token}`);
  const inviterName = escapeHtml(user.name || user.email);
  const estName = escapeHtml(establishment.name);
  const cta = existingUser ? "Rejoindre l'établissement" : "Créer mon compte";

  await sendEmail({
    to: email,
    subject: `Invitation à rejoindre ${establishment.name} sur Valoravis`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
        <h2>Vous êtes invité !</h2>
        <p><strong>${inviterName}</strong> vous invite à rejoindre l'établissement <strong>${estName}</strong> en tant que <strong>${roleLabel}</strong> sur Valoravis.</p>
        <p>Cliquez ci-dessous pour accepter l'invitation :</p>
        <p><a href="${inviteUrl}" style="display:inline-block;background:#6366f1;color:#fff;padding:10px 24px;border-radius:8px;text-decoration:none;font-weight:600">${cta}</a></p>
        <p style="color:#666;font-size:12px">Ce lien expire dans 7 jours. Si vous n'attendiez pas cette invitation, ignorez cet email.</p>
      </div>
    `,
  });

  revalidatePath("/dashboard/establishments");
  return { success: true, message: "Invitation envoyée." };
}

// --- Remove member ---
export async function removeMember(formData: FormData) {
  const userId = await getUserId();
  const establishmentId = formData.get("establishmentId") as string;
  const memberId = formData.get("memberId") as string;

  await requireRole(userId, establishmentId, "ADMIN");

  const member = await prisma.establishmentMember.findUnique({
    where: { id: memberId },
  });
  if (!member || member.establishmentId !== establishmentId) {
    return { error: "Membre introuvable." };
  }
  if (member.role === "OWNER") {
    return { error: "Impossible de retirer le propriétaire." };
  }

  await prisma.establishmentMember.delete({ where: { id: memberId } });

  revalidatePath("/dashboard/establishments");
  return { success: true };
}

// --- Update member role ---
export async function updateMemberRole(formData: FormData) {
  const userId = await getUserId();
  const establishmentId = formData.get("establishmentId") as string;
  const memberId = formData.get("memberId") as string;
  const newRole = formData.get("role") as string;

  if (!["ADMIN", "MEMBER"].includes(newRole)) {
    return { error: "Rôle invalide" };
  }

  await requireRole(userId, establishmentId, "OWNER");

  const member = await prisma.establishmentMember.findUnique({
    where: { id: memberId },
  });
  if (!member || member.establishmentId !== establishmentId) {
    return { error: "Membre introuvable." };
  }
  if (member.role === "OWNER") {
    return { error: "Impossible de modifier le rôle du propriétaire." };
  }

  await prisma.establishmentMember.update({
    where: { id: memberId },
    data: { role: newRole as "ADMIN" | "MEMBER" },
  });

  revalidatePath("/dashboard/establishments");
  return { success: true };
}

// --- Update establishment threshold ---
export async function updateEstablishmentThreshold(formData: FormData) {
  const userId = await getUserId();
  const establishmentId = formData.get("establishmentId") as string;
  const threshold = Number(formData.get("threshold"));

  await requireRole(userId, establishmentId, "ADMIN");

  if (!Number.isInteger(threshold) || threshold < 1 || threshold > 5) {
    throw new Error("Seuil invalide (entre 1 et 5)");
  }

  await prisma.establishment.update({
    where: { id: establishmentId },
    data: { satisfactionThreshold: threshold },
  });

  revalidatePath("/dashboard/settings");
}
