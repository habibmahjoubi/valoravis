"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { sendEmail } from "@/lib/resend";
import { stripe } from "@/lib/stripe";
import { absoluteUrl, escapeHtml, addBusinessDays } from "@/lib/utils";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Non authentifié");
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.user.id },
  });
  if (!user.isAdmin) throw new Error("Accès refusé");
  return user;
}

// --- Gestion utilisateurs ---
export async function toggleSuspendUser(userId: string) {
  await requireAdmin();
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
  });
  await prisma.user.update({
    where: { id: userId },
    data: { isSuspended: !user.isSuspended },
  });
  revalidatePath("/admin/users");
}

export async function updateUserPlan(formData: FormData) {
  const admin = await requireAdmin();
  const userId = formData.get("userId") as string;
  const planKey = formData.get("plan") as string;

  if (!userId || !planKey) throw new Error("Données manquantes");
  if (userId === admin.id) throw new Error("Impossible de modifier votre propre compte");

  // Résoudre le quota depuis le plan en DB (0 = illimité → 999999)
  const plan = await prisma.plan.findUnique({ where: { key: planKey } });
  const monthlyQuota = plan
    ? plan.quota === 0 ? 999999 : plan.quota
    : 50;

  await prisma.user.update({
    where: { id: userId },
    data: { plan: planKey, monthlyQuota },
  });
  revalidatePath("/admin/users");
}

export async function deleteUser(userId: string) {
  const admin = await requireAdmin();
  if (admin.id === userId) throw new Error("Impossible de supprimer votre propre compte");

  // Supprimer d'abord les établissements dont l'utilisateur est le seul OWNER,
  // sinon ils resteraient orphelins (plus aucun OWNER, ingérables).
  const owned = await prisma.establishment.findMany({
    where: { members: { some: { userId, role: "OWNER" } } },
    include: { members: { where: { role: "OWNER" }, select: { userId: true } } },
  });
  for (const est of owned) {
    if (est.members.length === 1) {
      await prisma.establishment.delete({ where: { id: est.id } });
    }
  }

  await prisma.user.delete({ where: { id: userId } });
  revalidatePath("/admin/users");
}

export async function resetUserQuota(userId: string) {
  await requireAdmin();
  await prisma.user.update({
    where: { id: userId },
    data: { quotaUsed: 0 },
  });
  revalidatePath("/admin/users");
}

// --- Gestion des plans ---
export async function updatePlan(formData: FormData) {
  await requireAdmin();
  const planId = formData.get("planId") as string;
  const name = formData.get("name") as string;
  const rawPrice = formData.get("price") as string;
  const price = parseFloat(rawPrice.replace(",", "."));
  const quota = Number(formData.get("quota"));
  const maxUsers = Number(formData.get("maxUsers"));
  const trialDays = Number(formData.get("trialDays"));
  const stripePriceId = (formData.get("stripePriceId") as string) || null;

  if (!isFinite(price) || price < 0 || price > 99999) throw new Error("Prix invalide");
  if (!Number.isInteger(quota) || quota < 0) throw new Error("Quota invalide");
  if (!Number.isInteger(maxUsers) || maxUsers < 0) throw new Error("Max utilisateurs invalide");
  if (!Number.isInteger(trialDays) || trialDays < 0 || trialDays > 365) throw new Error("Jours d'essai invalide");

  await prisma.plan.update({
    where: { id: planId },
    data: { name, price, quota, maxUsers, trialDays, stripePriceId },
  });

  // Mettre a jour le quota de tous les utilisateurs sur ce plan
  // 0 = illimité → on met 999999 en base pour simplifier les comparaisons
  const plan = await prisma.plan.findUnique({ where: { id: planId } });
  if (plan) {
    await prisma.user.updateMany({
      where: { plan: plan.key },
      data: { monthlyQuota: quota === 0 ? 999999 : quota },
    });
  }

  revalidatePath("/admin/plans");
  revalidatePath("/admin/users");
}

export async function createPlan(formData: FormData) {
  await requireAdmin();
  const key = String(formData.get("key") ?? "").toLowerCase().replace(/\s+/g, "-");
  const name = String(formData.get("name") ?? "").trim();
  const price = parseFloat(String(formData.get("price") ?? "").replace(",", "."));
  const quota = Number(formData.get("quota"));

  if (!/^[a-z0-9-]{2,30}$/.test(key)) throw new Error("Clé invalide (a-z, 0-9, tirets)");
  if (!name || name.length > 60) throw new Error("Nom invalide");
  if (!isFinite(price) || price < 0 || price > 99999) throw new Error("Prix invalide");
  if (!Number.isInteger(quota) || quota < 0) throw new Error("Quota invalide");

  const existing = await prisma.plan.findUnique({ where: { key } });
  if (existing) throw new Error("Un plan avec cette clé existe déjà");

  const maxOrder = await prisma.plan.aggregate({ _max: { sortOrder: true } });

  await prisma.plan.create({
    data: {
      key,
      name,
      price,
      quota,
      sortOrder: (maxOrder._max.sortOrder || 0) + 1,
    },
  });

  revalidatePath("/admin/plans");
}

export async function togglePlanActive(planId: string) {
  await requireAdmin();
  const plan = await prisma.plan.findUniqueOrThrow({ where: { id: planId } });
  await prisma.plan.update({
    where: { id: planId },
    data: { isActive: !plan.isActive },
  });
  revalidatePath("/admin/plans");
}

// --- Cancellation management ---
export async function approveCancellation(userId: string) {
  await requireAdmin();
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  if (!user.cancelRequestedAt) throw new Error("Aucune demande d'annulation");

  const effectiveDate = addBusinessDays(new Date(), 5);

  // Programmer la résiliation réelle côté Stripe à la date effective.
  if (user.stripeSubscriptionId) {
    try {
      await stripe.subscriptions.update(user.stripeSubscriptionId, {
        cancel_at: Math.floor(effectiveDate.getTime() / 1000),
      });
    } catch (err) {
      console.error("[cancel] Stripe schedule cancel failed:", err);
      throw new Error("Échec de la programmation de la résiliation Stripe. Réessayez.");
    }
  }

  await prisma.user.update({
    where: { id: userId },
    data: { cancelEffectiveAt: effectiveDate },
  });

  const displayName = escapeHtml(user.businessName || user.email.split("@")[0]);
  const formattedDate = effectiveDate.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  sendEmail({
    to: user.email,
    subject: "Votre demande d'annulation a été approuvée — Valoravis",
    html: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;background:#ffffff;color:#1a1a1a">
  <h2>Annulation approuvée</h2>
  <p>Bonjour ${displayName},</p>
  <p>Votre demande d'annulation a été approuvée. Votre abonnement <strong>${escapeHtml(user.plan)}</strong> sera résilié le <strong>${formattedDate}</strong>.</p>
  <p>Vous conservez l'accès à toutes les fonctionnalités jusqu'à cette date.</p>
  <a href="${absoluteUrl("/dashboard/billing")}" style="display:inline-block;background:#6d28d9;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;margin:16px 0">
    Mon abonnement
  </a>
</div>`,
  }).catch((err) => console.error("[cancel] user notification failed:", err));

  revalidatePath("/admin");
  revalidatePath("/admin/users");
}

export async function rejectCancellation(userId: string) {
  await requireAdmin();
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  if (!user.cancelRequestedAt) throw new Error("Aucune demande d'annulation");

  // Annuler une éventuelle résiliation déjà programmée côté Stripe.
  if (user.stripeSubscriptionId) {
    try {
      await stripe.subscriptions.update(user.stripeSubscriptionId, {
        cancel_at: null,
        cancel_at_period_end: false,
      });
    } catch (err) {
      console.error("[cancel] Stripe un-schedule failed:", err);
    }
  }

  await prisma.user.update({
    where: { id: userId },
    data: { cancelRequestedAt: null, cancelEffectiveAt: null },
  });

  const displayName = escapeHtml(user.businessName || user.email.split("@")[0]);

  sendEmail({
    to: user.email,
    subject: "Votre demande d'annulation a été refusée — Valoravis",
    html: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;background:#ffffff;color:#1a1a1a">
  <h2>Annulation refusée</h2>
  <p>Bonjour ${displayName},</p>
  <p>Votre demande d'annulation a été examinée et refusée. Votre abonnement <strong>${escapeHtml(user.plan)}</strong> reste actif.</p>
  <a href="${absoluteUrl("/dashboard/billing")}" style="display:inline-block;background:#6d28d9;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;margin:16px 0">
    Mon abonnement
  </a>
</div>`,
  }).catch((err) => console.error("[cancel] user notification failed:", err));

  revalidatePath("/admin");
  revalidatePath("/admin/users");
}
