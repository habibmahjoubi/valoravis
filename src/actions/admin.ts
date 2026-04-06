"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Non authentifie");
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.user.id },
  });
  if (!user.isAdmin) throw new Error("Acces refuse");
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
  await requireAdmin();
  const userId = formData.get("userId") as string;
  const plan = formData.get("plan") as string;
  const monthlyQuota = Number(formData.get("monthlyQuota"));

  if (!userId || !plan) throw new Error("Donnees manquantes");
  if (!Number.isInteger(monthlyQuota) || monthlyQuota < 0 || monthlyQuota > 999999) {
    throw new Error("Quota invalide");
  }

  await prisma.user.update({
    where: { id: userId },
    data: { plan, monthlyQuota },
  });
  revalidatePath("/admin/users");
}

export async function deleteUser(userId: string) {
  await requireAdmin();
  // Prevent admin from deleting themselves
  const admin = await requireAdmin();
  if (admin.id === userId) throw new Error("Impossible de supprimer votre propre compte");

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
  // 0 = illimite → on met 999999 en base pour simplifier les comparaisons
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
  const key = (formData.get("key") as string).toLowerCase().replace(/\s+/g, "-");
  const name = formData.get("name") as string;
  const price = parseFloat((formData.get("price") as string).replace(",", "."));
  const quota = Number(formData.get("quota"));

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
