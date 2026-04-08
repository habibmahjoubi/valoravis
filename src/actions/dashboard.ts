"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createReviewRequest } from "@/services/review-request.service";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Niche, Channel } from "@/generated/prisma/enums";

async function getUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Non authentifié");
  return session.user.id;
}

// --- Onboarding ---
export async function completeOnboarding(formData: FormData) {
  const userId = await getUserId();
  const businessName = formData.get("businessName") as string;
  const niche = formData.get("niche") as Niche;
  const customNiche = (formData.get("customNiche") as string) || null;
  const googlePlaceUrl = formData.get("googlePlaceUrl") as string;
  const phone = (formData.get("phone") as string) || null;

  await prisma.user.update({
    where: { id: userId },
    data: {
      businessName,
      niche,
      customNiche: niche === "OTHER" ? customNiche : null,
      googlePlaceUrl,
      phone,
      onboarded: true,
    },
  });

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

// --- Validation helper ---
function validateLength(value: string | null, max: number, label: string) {
  if (value && value.length > max) throw new Error(`${label} trop long (max ${max} caractères)`);
}

// --- Clients ---
export async function addClient(formData: FormData) {
  const userId = await getUserId();
  const name = formData.get("name") as string;
  validateLength(name, 200, "Nom");
  validateLength(formData.get("email") as string, 255, "Email");
  validateLength(formData.get("notes") as string, 1000, "Notes");

  await prisma.client.create({
    data: {
      user: { connect: { id: userId } },
      name: formData.get("name") as string,
      email: (formData.get("email") as string) || null,
      phone: (formData.get("phone") as string) || null,
      notes: (formData.get("notes") as string) || null,
    },
  });

  revalidatePath("/dashboard/clients");
}

export async function updateClient(formData: FormData) {
  const userId = await getUserId();
  const clientId = formData.get("clientId") as string;

  await prisma.client.update({
    where: { id: clientId, userId },
    data: {
      name: formData.get("name") as string,
      email: (formData.get("email") as string) || null,
      phone: (formData.get("phone") as string) || null,
      notes: (formData.get("notes") as string) || null,
    },
  });

  revalidatePath("/dashboard/clients");
}

export async function deleteClient(clientId: string) {
  const userId = await getUserId();

  await prisma.client.delete({
    where: { id: clientId, userId },
  });

  revalidatePath("/dashboard/clients");
}

export async function importClients(csvData: string) {
  const userId = await getUserId();
  const lines = csvData.split("\n").filter((l) => l.trim());

  if (lines.length > 5000) {
    return { imported: 0, skipped: 0, error: "Maximum 5000 lignes autorisées" };
  }

  let imported = 0;
  let skipped = 0;

  for (const line of lines) {
    const [name, email, phone, notes] = line
      .split(",")
      .map((s) => s.trim().replace(/^"|"$/g, ""));
    if (!name) {
      skipped++;
      continue;
    }
    if (!email && !phone) {
      skipped++;
      continue;
    }

    const orClauses = [];
    if (email) orClauses.push({ email });
    if (phone) orClauses.push({ phone });

    const existing = await prisma.client.findFirst({
      where: { userId, OR: orClauses },
    });
    if (existing) {
      skipped++;
      continue;
    }

    await prisma.client.create({
      data: {
        userId,
        name,
        email: email || null,
        phone: phone || null,
        notes: notes || null,
      },
    });
    imported++;
  }

  revalidatePath("/dashboard/clients");
  return { imported, skipped };
}

// --- Review Requests ---
export async function sendReviewRequest(formData: FormData) {
  const userId = await getUserId();
  const clientId = formData.get("clientId") as string;
  const channelRaw = formData.get("channel") as string;
  if (!["EMAIL", "SMS"].includes(channelRaw)) {
    return { error: "Canal invalide" };
  }
  const channel = channelRaw as Channel;
  const delayHours = Number(formData.get("delayHours") ?? 0);
  if (!Number.isFinite(delayHours) || delayHours < 0 || delayHours > 720) {
    return { error: "Délai invalide" };
  }

  try {
    await createReviewRequest({
      userId,
      clientId,
      channel,
      delayHours,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erreur inconnue";
    return { error: message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/campaigns");
  return { success: true };
}

// --- Trial / Plan ---
export async function startTrial(planKey: string) {
  const userId = await getUserId();

  const plan = await prisma.plan.findUnique({ where: { key: planKey } });
  if (!plan || plan.trialDays <= 0) {
    return { error: "Ce plan ne propose pas d'essai gratuit" };
  }

  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });

  // Verifier que l'utilisateur n'a pas deja eu un essai
  if (user.trialEndsAt) {
    return { error: "Vous avez déjà utilisé votre essai gratuit" };
  }

  const trialEndsAt = new Date(
    Date.now() + plan.trialDays * 24 * 60 * 60 * 1000
  );

  await prisma.user.update({
    where: { id: userId },
    data: {
      plan: plan.key,
      monthlyQuota: plan.quota === 0 ? 999999 : plan.quota,
      trialEndsAt,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/billing");
  return { success: true };
}

// --- Templates ---
export async function saveTemplate(formData: FormData) {
  const userId = await getUserId();
  const niche = formData.get("niche") as Niche;
  const channel = formData.get("channel") as Channel;
  const name = (formData.get("name") as string) || "Sans nom";
  const subject = (formData.get("subject") as string) || null;
  const body = formData.get("body") as string;
  const templateId = formData.get("templateId") as string | null;
  const isDefault = formData.get("isDefault") === "true";

  // If setting as default, unset other defaults for same user/niche/channel
  if (isDefault) {
    await prisma.template.updateMany({
      where: { userId, niche, channel, isDefault: true },
      data: { isDefault: false },
    });
  }

  if (templateId) {
    // Update existing, or create if it was deleted
    const existing = await prisma.template.findFirst({ where: { id: templateId, userId } });
    if (existing) {
      await prisma.template.update({
        where: { id: templateId, userId },
        data: { name, subject, body, isDefault },
      });
    } else {
      await prisma.template.create({
        data: { userId, niche, channel, name, subject, body, isDefault },
      });
    }
  } else {
    await prisma.template.create({
      data: { userId, niche, channel, name, subject, body, isDefault },
    });
  }

  revalidatePath("/dashboard/settings");
}

export async function deleteTemplate(formData: FormData) {
  const userId = await getUserId();
  const templateId = formData.get("templateId") as string;

  await prisma.template.delete({
    where: { id: templateId, userId },
  });

  revalidatePath("/dashboard/settings");
}

// --- Satisfaction Threshold ---
export async function updateThreshold(formData: FormData) {
  const userId = await getUserId();
  const threshold = Number(formData.get("threshold"));
  if (!Number.isInteger(threshold) || threshold < 1 || threshold > 5) {
    throw new Error("Seuil invalide (entre 1 et 5)");
  }

  await prisma.user.update({
    where: { id: userId },
    data: { satisfactionThreshold: threshold },
  });

  revalidatePath("/dashboard/settings");
}

// --- Settings ---
export async function updateSettings(formData: FormData) {
  const userId = await getUserId();
  const niche = formData.get("niche") as Niche;
  const customNicheInput = formData.get("customNiche") as string | null;

  // Si niche OTHER : sauvegarder le customNiche saisi
  // Si autre niche : garder l'ancien customNiche au cas où l'utilisateur reviendrait
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const customNiche =
    niche === "OTHER"
      ? customNicheInput || user.customNiche
      : null;

  await prisma.user.update({
    where: { id: userId },
    data: {
      businessName: formData.get("businessName") as string,
      niche,
      customNiche,
      googlePlaceUrl: formData.get("googlePlaceUrl") as string,
      phone: (formData.get("phone") as string) || null,
    },
  });

  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard");
}
