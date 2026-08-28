"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createReviewRequest } from "@/services/review-request.service";
import { isFormulaInjection, formString } from "@/lib/utils";
import { sanitizeTemplateHtml } from "@/lib/sanitize";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Niche, Channel } from "@/generated/prisma/enums";
import { hasFeature, getImportLimit } from "@/config/plan-features";
import { getCurrentEstablishment, getEstablishmentOwner } from "@/lib/establishment";

async function getUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Non authentifié");
  return session.user.id;
}

async function getEstablishmentId(): Promise<string | null> {
  const est = await getCurrentEstablishment();
  return est?.id ?? null;
}

/** Returns the effective plan string: OWNER's plan if member, else user's own plan */
async function getEffectivePlan(userId: string): Promise<string> {
  const est = await getCurrentEstablishment();
  if (est && est.role !== "OWNER") {
    const owner = await getEstablishmentOwner(est.id);
    if (owner) return owner.plan;
  }
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  return user.plan;
}

// --- Onboarding ---
export async function completeOnboarding(formData: FormData) {
  const userId = await getUserId();

  // Garde-fou : l'onboarding ne crée qu'un seul établissement. S'il a déjà été
  // fait (ou si l'utilisateur possède déjà un établissement), on ne recrée rien.
  const existingOwnership = await prisma.establishmentMember.findFirst({
    where: { userId, role: "OWNER" },
  });
  if (existingOwnership) {
    redirect("/dashboard");
  }

  const businessName = formString(formData, "businessName").trim();
  const niche = formData.get("niche") as Niche;
  const customNiche = formString(formData, "customNiche") || null;
  const googlePlaceUrl = formString(formData, "googlePlaceUrl");
  const phone = formString(formData, "phone") || null;

  if (!businessName) throw new Error("Le nom de l'établissement est requis.");
  validateLength(businessName, 200, "Nom de l'établissement");
  validateLength(customNiche, 100, "Métier personnalisé");
  validateLength(googlePlaceUrl, 2000, "URL Google");
  validateLength(phone, 20, "Téléphone");

  // Create the first establishment + OWNER membership
  const establishment = await prisma.establishment.create({
    data: {
      name: businessName,
      niche,
      customNiche: niche === "OTHER" ? customNiche : null,
      googlePlaceUrl,
      phone,
      members: {
        create: { userId, role: "OWNER" },
      },
    },
  });

  // Also update User for backward compatibility
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

  // Set the current establishment cookie
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  cookieStore.set("current-establishment-id", establishment.id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
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
  const establishmentId = await getEstablishmentId();
  const name = formString(formData, "name").trim();
  const email = formString(formData, "email") || null;
  const phone = formString(formData, "phone") || null;
  const notes = formString(formData, "notes") || null;
  if (!name) throw new Error("Le nom est requis.");
  validateLength(name, 200, "Nom");
  validateLength(email, 255, "Email");
  validateLength(notes, 1000, "Notes");

  if (!establishmentId) throw new Error("Aucun établissement sélectionné.");

  await prisma.client.create({
    data: {
      user: { connect: { id: userId } },
      establishment: { connect: { id: establishmentId } },
      name,
      email,
      phone,
      notes,
    },
  });

  revalidatePath("/dashboard/clients");
}

export async function updateClient(formData: FormData) {
  const userId = await getUserId();
  const establishmentId = await getEstablishmentId();
  const clientId = formString(formData, "clientId");
  const name = formString(formData, "name").trim();
  if (!name) throw new Error("Le nom est requis.");
  validateLength(name, 200, "Nom");

  // Scope to establishment to prevent IDOR across establishments
  await prisma.client.update({
    where: { id: clientId, userId, ...(establishmentId ? { establishmentId } : {}) },
    data: {
      name,
      email: formString(formData, "email") || null,
      phone: formString(formData, "phone") || null,
      notes: formString(formData, "notes") || null,
    },
  });

  revalidatePath("/dashboard/clients");
}

export async function deleteClient(clientId: string) {
  const userId = await getUserId();

  // MEMBER cannot delete clients
  const est = await getCurrentEstablishment();
  if (est && est.role === "MEMBER") {
    throw new Error("Permissions insuffisantes.");
  }

  await prisma.client.delete({
    where: { id: clientId, userId, ...(est ? { establishmentId: est.id } : {}) },
  });

  revalidatePath("/dashboard/clients");
}

export async function importClients(csvData: string) {
  const userId = await getUserId();
  const establishmentId = await getEstablishmentId();
  if (!establishmentId) {
    return { imported: 0, skipped: 0, errors: [{ row: 0, name: "", reason: "Aucun établissement sélectionné." }] };
  }

  // MEMBER cannot import clients
  const est = await getCurrentEstablishment();
  if (est && est.role === "MEMBER") {
    return { imported: 0, skipped: 0, errors: [{ row: 0, name: "", reason: "Permissions insuffisantes." }] };
  }
  const plan = await getEffectivePlan(userId);
  if (!hasFeature(plan, "csv_import")) {
    return { imported: 0, skipped: 0, errors: [{ row: 0, name: "", reason: "L'import CSV nécessite le plan Pro ou supérieur." }] };
  }
  const limit = getImportLimit(plan);
  const lines = csvData.split("\n").filter((l) => l.trim());

  if (lines.length > limit) {
    return { imported: 0, skipped: 0, errors: [{ row: 0, name: "", reason: `Maximum ${limit} lignes pour le plan ${plan} (${lines.length} fournies).` }] };
  }

  let imported = 0;
  let skipped = 0;
  const errors: { row: number; name: string; reason: string }[] = [];

  for (let i = 0; i < lines.length; i++) {
    const parts: string[] = [];
    let current = "";
    let inQuotes = false;
    for (const char of lines[i]) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        parts.push(current.trim().replace(/^"|"$/g, ""));
        current = "";
      } else {
        current += char;
      }
    }
    parts.push(current.trim().replace(/^"|"$/g, ""));

    const [name, email, phone, notes] = parts;
    const rowNum = i + 1;

    if (!name || name.length > 200) {
      skipped++;
      errors.push({ row: rowNum, name: name || "", reason: !name ? "Nom manquant" : "Nom trop long (max 200)" });
      continue;
    }
    // Prevent CSV formula injection (tous les champs, y compris les notes)
    if (
      isFormulaInjection(name) ||
      isFormulaInjection(email) ||
      isFormulaInjection(phone) ||
      isFormulaInjection(notes)
    ) {
      skipped++;
      errors.push({ row: rowNum, name, reason: "Valeur invalide (caractère interdit en début de champ)" });
      continue;
    }
    if (!email && !phone) {
      skipped++;
      errors.push({ row: rowNum, name, reason: "Email ou téléphone requis" });
      continue;
    }
    if (email && (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 255)) {
      skipped++;
      errors.push({ row: rowNum, name, reason: "Email invalide" });
      continue;
    }
    if (phone && (!/^\+?[\d\s\-().]{6,20}$/.test(phone) || phone.length > 20)) {
      skipped++;
      errors.push({ row: rowNum, name, reason: "Téléphone invalide" });
      continue;
    }
    if (notes && notes.length > 500) {
      skipped++;
      errors.push({ row: rowNum, name, reason: "Notes trop longues (max 500)" });
      continue;
    }

    const orClauses = [];
    if (email) orClauses.push({ email });
    if (phone) orClauses.push({ phone });

    const existing = await prisma.client.findFirst({
      where: { userId, establishmentId, OR: orClauses },
    });
    if (existing) {
      skipped++;
      errors.push({ row: rowNum, name, reason: "Doublon (email ou tél. déjà existant)" });
      continue;
    }

    await prisma.client.create({
      data: {
        userId,
        establishmentId,
        name,
        email: email || null,
        phone: phone || null,
        notes: notes || null,
      },
    });
    imported++;
  }

  revalidatePath("/dashboard/clients");
  return { imported, skipped, errors };
}

// --- Review Requests ---
export async function sendReviewRequest(formData: FormData) {
  const userId = await getUserId();
  const establishmentId = await getEstablishmentId();
  if (!establishmentId) return { error: "Aucun établissement sélectionné." };
  const clientId = formData.get("clientId") as string;

  // Verify client belongs to this establishment
  const client = await prisma.client.findFirst({
    where: { id: clientId, userId, establishmentId },
  });
  if (!client) return { error: "Client introuvable dans cet établissement." };

  const channelRaw = formData.get("channel") as string;
  if (!["EMAIL", "SMS"].includes(channelRaw)) {
    return { error: "Canal invalide" };
  }
  const channel = channelRaw as Channel;

  if (channel === "SMS") {
    const plan = await getEffectivePlan(userId);
    if (!hasFeature(plan, "sms")) {
      return { error: "L'envoi par SMS nécessite le plan Pro ou supérieur." };
    }
  }

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
      establishmentId: establishmentId ?? undefined,
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
  const establishmentId = await getEstablishmentId();

  // MEMBER cannot manage templates
  const est = await getCurrentEstablishment();
  if (est && est.role === "MEMBER") {
    throw new Error("Permissions insuffisantes.");
  }
  const plan = await getEffectivePlan(userId);
  if (!hasFeature(plan, "custom_templates")) {
    throw new Error("Les templates personnalisés nécessitent le plan Pro ou supérieur.");
  }
  const niche = formData.get("niche") as Niche;
  const channel = formData.get("channel") as Channel;
  const name = (formData.get("name") as string) || "Sans nom";
  const subject = (formData.get("subject") as string) || null;
  const body = sanitizeTemplateHtml(formString(formData, "body"));
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
        data: { userId, establishmentId, niche, channel, name, subject, body, isDefault },
      });
    }
  } else {
    await prisma.template.create({
      data: { userId, establishmentId, niche, channel, name, subject, body, isDefault },
    });
  }

  revalidatePath("/dashboard/settings");
}

export async function deleteTemplate(formData: FormData) {
  const userId = await getUserId();
  const est = await getCurrentEstablishment();
  if (est && est.role === "MEMBER") throw new Error("Permissions insuffisantes.");
  const plan = await getEffectivePlan(userId);
  if (!hasFeature(plan, "custom_templates")) {
    throw new Error("Les templates personnalisés nécessitent le plan Pro ou supérieur.");
  }
  const templateId = formData.get("templateId") as string;

  await prisma.template.delete({
    where: { id: templateId, userId },
  });

  revalidatePath("/dashboard/settings");
}

// --- Satisfaction Threshold ---
export async function updateThreshold(formData: FormData) {
  const userId = await getUserId();
  const est = await getCurrentEstablishment();
  if (est && est.role === "MEMBER") throw new Error("Permissions insuffisantes.");
  const threshold = Number(formData.get("threshold"));
  if (!Number.isInteger(threshold) || threshold < 1 || threshold > 5) {
    throw new Error("Seuil invalide (entre 1 et 5)");
  }

  // Écrire au niveau de l'établissement courant (source de vérité lue par
  // l'app), et garder User synchronisé pour la rétrocompatibilité.
  if (est) {
    await prisma.establishment.update({
      where: { id: est.id },
      data: { satisfactionThreshold: threshold },
    });
  }
  await prisma.user.update({
    where: { id: userId },
    data: { satisfactionThreshold: threshold },
  });

  revalidatePath("/dashboard/settings");
}

// --- Sending Preferences ---
export async function updateSendingSettings(formData: FormData) {
  const userId = await getUserId();
  const est = await getCurrentEstablishment();
  if (est && est.role === "MEMBER") return { error: "Permissions insuffisantes." };
  const defaultChannel = formData.get("defaultChannel") as string;
  const defaultDelayRaw = formData.get("defaultDelay") as string;
  const senderName = (formData.get("senderName") as string) || null;
  const replyToEmail = (formData.get("replyToEmail") as string) || null;
  const phone = (formData.get("phone") as string) || null;

  if (!["EMAIL", "SMS"].includes(defaultChannel)) {
    return { error: "Canal invalide" };
  }

  if (defaultChannel === "SMS") {
    const plan = await getEffectivePlan(userId);
    if (!hasFeature(plan, "sms")) {
      return { error: "Le SMS nécessite le plan Pro ou supérieur." };
    }
    if (!phone) {
      return { error: "Un numéro de téléphone est requis pour utiliser les SMS." };
    }
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

  const data = {
    defaultChannel: defaultChannel as Channel,
    defaultDelay,
    senderName,
    replyToEmail,
    ...(phone !== null ? { phone } : {}),
  };

  // Écrire au niveau de l'établissement courant + garder User synchronisé.
  if (est) {
    await prisma.establishment.update({ where: { id: est.id }, data });
  }
  await prisma.user.update({ where: { id: userId }, data });

  revalidatePath("/dashboard/settings");
  return { success: true };
}

export async function sendTestEmail() {
  const userId = await getUserId();
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });

  if (!user.email) return { error: "Aucun email configuré sur votre compte." };

  const { sendEmail } = await import("@/lib/resend");
  const { NICHE_CONFIGS } = await import("@/config/niches");
  const nicheConfig = NICHE_CONFIGS[user.niche];

  const vars: Record<string, string> = {
    clientName: "Marie Dupont",
    businessName: user.businessName || "Mon établissement",
    link: "#",
  };

  const template = nicheConfig.templates.EMAIL;
  const subject = (template.subject || "Votre avis compte").replace(
    /\{\{(\w+)\}\}/g,
    (_, key) => vars[key] || ""
  );
  const html = template.body.replace(
    /\{\{(\w+)\}\}/g,
    (_, key) => vars[key] || ""
  );

  try {
    await sendEmail({
      to: user.email,
      subject: `[TEST] ${subject}`,
      html,
      fromName: user.senderName || undefined,
      replyTo: user.replyToEmail || undefined,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erreur inconnue";
    return { error: message };
  }

  return { success: true };
}

export async function sendTestSms() {
  const userId = await getUserId();
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const plan = await getEffectivePlan(userId);

  if (!hasFeature(plan, "sms")) {
    return { error: "Le SMS nécessite le plan Pro ou supérieur." };
  }

  if (!user.phone) return { error: "Ajoutez votre numéro de téléphone dans les paramètres d'établissement." };

  const { sendSms } = await import("@/lib/sms");
  const { NICHE_CONFIGS } = await import("@/config/niches");
  const { toSmsSenderId, stripAccents } = await import("@/lib/utils");
  const nicheConfig = NICHE_CONFIGS[user.niche];

  const vars: Record<string, string> = {
    clientName: "Marie Dupont",
    businessName: user.businessName || "Mon établissement",
    link: "https://example.com",
  };

  const template = nicheConfig.templates.SMS;
  const body = stripAccents(
    `[TEST] ${template.body.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] || "")}`
  );

  try {
    await sendSms({
      to: user.phone,
      body,
      senderId: toSmsSenderId(user.senderName || user.businessName),
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erreur inconnue";
    return { error: message };
  }

  return { success: true };
}

// --- Settings ---
export async function updateSettings(formData: FormData) {
  const userId = await getUserId();
  const estCtx = await getCurrentEstablishment();
  if (estCtx && estCtx.role === "MEMBER") throw new Error("Permissions insuffisantes.");
  const establishmentId = estCtx?.id ?? null;
  const niche = formData.get("niche") as Niche;
  const customNicheInput = formString(formData, "customNiche") || null;

  const businessName = formString(formData, "businessName").trim();
  const googlePlaceUrl = formString(formData, "googlePlaceUrl");
  const phone = formString(formData, "phone") || null;

  if (!businessName) throw new Error("Le nom de l'établissement est requis.");
  validateLength(businessName, 200, "Nom de l'établissement");
  validateLength(customNicheInput, 100, "Métier personnalisé");
  validateLength(googlePlaceUrl, 2000, "URL Google");
  validateLength(phone, 20, "Téléphone");

  const customNiche = niche === "OTHER" ? customNicheInput : null;

  // Update establishment if available
  if (establishmentId) {
    await prisma.establishment.update({
      where: { id: establishmentId },
      data: {
        name: businessName,
        niche,
        customNiche,
        googlePlaceUrl,
        phone,
      },
    });
  }

  // Also keep User in sync for backward compat
  await prisma.user.update({
    where: { id: userId },
    data: {
      businessName,
      niche,
      customNiche,
      googlePlaceUrl,
      phone,
    },
  });

  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard");
}
