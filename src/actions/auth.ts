"use server";

import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/resend";
import { absoluteUrl } from "@/lib/utils";
import bcrypt from "bcryptjs";
import crypto from "crypto";

// --- Inscription ---
export async function registerUser(formData: FormData) {
  const email = (formData.get("email") as string).trim().toLowerCase();
  const password = formData.get("password") as string;
  const name = (formData.get("name") as string) || null;
  const niche = (formData.get("niche") as string) || "DENTIST";

  if (!email || !password) {
    return { error: "Email et mot de passe requis" };
  }

  if (password.length < 8) {
    return { error: "Le mot de passe doit contenir au moins 8 caracteres" };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "Un compte existe deja avec cet email" };
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const selectedPlan = (formData.get("plan") as string) || "free";

  // Charger le plan depuis la base
  const plan = await prisma.plan.findUnique({ where: { key: selectedPlan } });

  const isTrialPlan = plan && plan.trialDays > 0 && plan.price > 0;
  const trialEndsAt = isTrialPlan
    ? new Date(Date.now() + plan.trialDays * 24 * 60 * 60 * 1000)
    : null;

  await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      niche: niche as "DENTIST" | "OSTEOPATH" | "GARAGE",
      plan: plan ? plan.key : "free",
      monthlyQuota: plan
        ? plan.quota === 0
          ? 999999
          : plan.quota
        : 50,
      trialEndsAt,
    },
  });

  return { success: true };
}

// --- Mot de passe oublie ---
export async function requestPasswordReset(formData: FormData) {
  const email = (formData.get("email") as string).trim().toLowerCase();

  if (!email) {
    return { error: "Email requis" };
  }

  const user = await prisma.user.findUnique({ where: { email } });

  // On retourne toujours succes pour ne pas reveler si l'email existe
  if (!user) {
    return { success: true };
  }

  // Supprimer les anciens tokens pour cet email
  await prisma.passwordResetToken.deleteMany({ where: { email } });

  // Generer un token securise
  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 heure

  await prisma.passwordResetToken.create({
    data: { email, token, expires },
  });

  // Envoyer l'email
  const resetUrl = absoluteUrl(`/reset-password?token=${token}`);

  await sendEmail({
    to: email,
    subject: "Reinitialisation de votre mot de passe - AvisBoost",
    html: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
  <h2 style="color:#1a1a1a">Reinitialisation du mot de passe</h2>
  <p>Bonjour,</p>
  <p>Vous avez demande la reinitialisation de votre mot de passe AvisBoost.</p>
  <p>Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe :</p>
  <a href="${resetUrl}" style="display:inline-block;background:#2563eb;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;margin:16px 0">
    Reinitialiser mon mot de passe
  </a>
  <p style="color:#666;font-size:13px">Ce lien expire dans 1 heure.</p>
  <p style="color:#666;font-size:13px">Si vous n'avez pas fait cette demande, ignorez cet email.</p>
</div>`,
  });

  return { success: true };
}

// --- Reinitialiser le mot de passe ---
export async function resetPassword(formData: FormData) {
  const token = formData.get("token") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!token || !password) {
    return { error: "Donnees manquantes" };
  }

  if (password.length < 8) {
    return { error: "Le mot de passe doit contenir au moins 8 caracteres" };
  }

  if (password !== confirmPassword) {
    return { error: "Les mots de passe ne correspondent pas" };
  }

  // Verifier le token
  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token },
  });

  if (!resetToken) {
    return { error: "Lien invalide ou deja utilise" };
  }

  if (resetToken.expires < new Date()) {
    await prisma.passwordResetToken.delete({ where: { id: resetToken.id } });
    return { error: "Ce lien a expire. Veuillez refaire une demande." };
  }

  // Mettre a jour le mot de passe
  const hashedPassword = await bcrypt.hash(password, 12);

  await prisma.user.update({
    where: { email: resetToken.email },
    data: { password: hashedPassword },
  });

  // Supprimer le token utilise
  await prisma.passwordResetToken.delete({ where: { id: resetToken.id } });

  return { success: true };
}
