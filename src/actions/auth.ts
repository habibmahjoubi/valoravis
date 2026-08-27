"use server";

import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import { sendEmail } from "@/lib/resend";
import { absoluteUrl, escapeHtml, formString } from "@/lib/utils";
import { headers } from "next/headers";
import bcrypt from "bcryptjs";
import crypto from "crypto";

// --- Helpers ---
function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePassword(password: string): string | null {
  if (!password || password.length < 8) {
    return "Le mot de passe doit contenir au moins 8 caractères";
  }
  if (!/[A-Z]/.test(password)) {
    return "Le mot de passe doit contenir au moins une majuscule";
  }
  if (!/[0-9]/.test(password)) {
    return "Le mot de passe doit contenir au moins un chiffre";
  }
  return null;
}

async function getClientIp(): Promise<string> {
  const h = await headers();
  return (
    h.get("x-forwarded-for")?.split(",")[0].trim() ||
    h.get("x-real-ip") ||
    "unknown"
  );
}

async function generateVerificationToken(email: string): Promise<string> {
  // Supprimer les anciens tokens pour cet email
  await prisma.emailVerificationToken.deleteMany({ where: { email } });

  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 heures

  await prisma.emailVerificationToken.create({
    data: { email, token: tokenHash, expires },
  });

  return token;
}

async function sendVerificationEmail(email: string, name: string | null, token: string) {
  const verifyUrl = absoluteUrl(`/verify-email?token=${token}`);
  const displayName = escapeHtml(name || email.split("@")[0]);

  await sendEmail({
    to: email,
    subject: `Vérifiez votre email - Valoravis`,
    html: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;background:#ffffff;color:#1a1a1a">
  <h2>Bienvenue sur Valoravis !</h2>
  <p>Bonjour ${displayName},</p>
  <p>Merci pour votre inscription. Pour activer votre compte, veuillez confirmer votre adresse email en cliquant sur le bouton ci-dessous :</p>
  <a href="${verifyUrl}" style="display:inline-block;background:#6d28d9;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;margin:16px 0">
    Vérifier mon email
  </a>
  <p style="color:#888;font-size:13px">Ce lien expire dans 24 heures.</p>
  <p style="color:#888;font-size:13px">Si vous n'avez pas créé ce compte, ignorez cet email.</p>
</div>`,
  });
}

// --- Vérifier si un email non vérifié bloque le login ---
// Appelé uniquement après un échec de login (mot de passe correct mais compte
// non vérifié). On exige donc le mot de passe pour éviter d'en faire un oracle
// d'énumération de comptes, et on limite par IP.
export async function checkEmailVerificationStatus(email: string, password?: string) {
  if (!email || !validateEmail(email)) return { status: "unknown" as const };

  const ip = await getClientIp();
  const rl = await checkRateLimit(`verif-status:${ip}`, { maxAttempts: 10, windowMs: 15 * 60 * 1000 });
  if (!rl.success) return { status: "unknown" as const };

  const user = await prisma.user.findUnique({
    where: { email: email.trim().toLowerCase() },
    select: { emailVerified: true, password: true },
  });

  // Toujours exécuter bcrypt (anti-timing) et ne rien révéler sans le bon mot de passe
  const dummyHash = "$2b$12$000000000000000000000uGWGmhFBiGFCkT9OJkwROmkAR.gzZXa";
  const ok = await bcrypt.compare(password || "", user?.password || dummyHash);

  if (!user || !user.password || !ok) return { status: "unknown" as const };
  if (!user.emailVerified) return { status: "unverified" as const };
  return { status: "verified" as const };
}

// --- Inscription ---
export async function registerUser(formData: FormData) {
  const email = formString(formData, "email").trim().toLowerCase();
  const password = formString(formData, "password");
  const name = formString(formData, "name") || null;
  const niche = formString(formData, "niche") || "DENTIST";
  const customNiche = formString(formData, "customNiche") || null;
  const inviteToken = formString(formData, "inviteToken") || null;

  if (!email || !password) {
    return { error: "Email et mot de passe requis" };
  }

  // Rate limit par email
  const rlEmail = await checkRateLimit(`register:${email}`, { maxAttempts: 5, windowMs: 15 * 60 * 1000 });
  if (!rlEmail.success) {
    return { error: `Trop de tentatives. Réessayez dans ${rlEmail.retryAfterSeconds}s.` };
  }

  // Rate limit par IP (3 inscriptions / 5 minutes)
  const ip = await getClientIp();
  const rlIp = await checkRateLimit(`register-ip:${ip}`, { maxAttempts: 3, windowMs: 5 * 60 * 1000 });
  if (!rlIp.success) {
    return { error: `Trop de tentatives depuis cette adresse. Réessayez dans ${rlIp.retryAfterSeconds}s.` };
  }

  if (!validateEmail(email)) {
    return { error: "Adresse email invalide" };
  }

  if (email.length > 255 || (name && name.length > 100)) {
    return { error: "Données trop longues" };
  }

  const passwordError = validatePassword(password);
  if (passwordError) {
    return { error: passwordError };
  }

  // Ne pas révéler si l'email existe déjà : on renvoie le même succès générique
  // et on envoie un email « vous avez déjà un compte » à la place.
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    try {
      await sendEmail({
        to: email,
        subject: "Vous avez déjà un compte Valoravis",
        html: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;background:#ffffff;color:#1a1a1a">
  <h2>Un compte existe déjà</h2>
  <p>Bonjour,</p>
  <p>Quelqu'un vient de tenter de créer un compte Valoravis avec cette adresse email, mais un compte existe déjà.</p>
  <p><a href="${absoluteUrl("/login")}" style="color:#6d28d9">Se connecter</a> — ou <a href="${absoluteUrl("/forgot-password")}" style="color:#6d28d9">réinitialiser votre mot de passe</a>.</p>
  <p style="color:#888;font-size:13px">Si vous n'êtes pas à l'origine de cette tentative, vous pouvez ignorer cet email.</p>
</div>`,
      });
    } catch (err) {
      console.error("[register] existing-account email failed:", err);
    }
    return { success: true, email };
  }

  // Validate invitation token if provided
  let invitation: {
    id: string;
    establishmentId: string;
    role: "OWNER" | "ADMIN" | "MEMBER";
    email: string;
  } | null = null;

  if (inviteToken) {
    const inv = await prisma.establishmentInvitation.findUnique({
      where: { token: inviteToken },
    });
    if (!inv || inv.expires < new Date()) {
      return { error: "Lien d'invitation invalide ou expiré." };
    }
    if (inv.email !== email) {
      return { error: "Cet email ne correspond pas à l'invitation." };
    }
    invitation = { id: inv.id, establishmentId: inv.establishmentId, role: inv.role, email: inv.email };
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const selectedPlan = formString(formData, "plan") || "free";

  const plan = await prisma.plan.findUnique({ where: { key: selectedPlan } });

  // Sécurité : on ne provisionne un plan payant à l'inscription QUE s'il s'agit
  // d'un véritable essai gratuit (prix > 0 ET jours d'essai > 0). Tout autre cas
  // (plan inconnu, plan payant sans essai) retombe sur "free". Les plans payants
  // s'activent ensuite via Stripe Checkout.
  const isTrialPlan = !!plan && plan.trialDays > 0 && plan.price > 0;
  const grantedPlanKey = isTrialPlan ? plan!.key : "free";
  const grantedQuota = isTrialPlan
    ? plan!.quota === 0
      ? 999999
      : plan!.quota
    : 50;
  const trialEndsAt = isTrialPlan
    ? new Date(Date.now() + plan!.trialDays * 24 * 60 * 60 * 1000)
    : null;

  // If invited: auto-verify email (the invitation link proves email ownership)
  const isInvited = !!invitation;

  let newUser;
  try {
    newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        businessName: name,
        niche: niche as "DENTIST" | "OSTEOPATH" | "GARAGE" | "OTHER",
        customNiche: niche === "OTHER" ? customNiche : null,
        plan: grantedPlanKey,
        monthlyQuota: grantedQuota,
        trialEndsAt,
        emailVerified: isInvited ? new Date() : null,
        onboarded: isInvited,
      },
    });
  } catch {
    return { error: "Erreur lors de la création du compte. Réessayez." };
  }

  // If invited: add to establishment and clean up invitation
  if (invitation) {
    try {
      await prisma.establishmentMember.create({
        data: {
          userId: newUser.id,
          establishmentId: invitation.establishmentId,
          role: invitation.role,
        },
      });
      await prisma.establishmentInvitation.delete({
        where: { id: invitation.id },
      });
    } catch (err) {
      console.error("[register] accept invitation failed:", err);
    }

    return { success: true, email, invited: true };
  }

  // Normal registration: send verification email
  try {
    const token = await generateVerificationToken(email);
    await sendVerificationEmail(email, name, token);
  } catch (err) {
    console.error("[register] verification email failed:", err);
  }

  return { success: true, email };
}

// --- Accepter une invitation (créer un compte simplifié) ---
export async function acceptInvitation(formData: FormData) {
  const token = formString(formData, "token");
  const email = formString(formData, "email").trim().toLowerCase();
  const name = formString(formData, "name") || null;
  const password = formString(formData, "password");

  if (!token || !email || !password) {
    return { error: "Données manquantes" };
  }

  const passwordError = validatePassword(password);
  if (passwordError) {
    return { error: passwordError };
  }

  if (name && name.length > 100) {
    return { error: "Nom trop long" };
  }

  // Rate limit
  const ip = await getClientIp();
  const rl = await checkRateLimit(`invite-accept:${ip}`, { maxAttempts: 5, windowMs: 15 * 60 * 1000 });
  if (!rl.success) {
    return { error: `Trop de tentatives. Réessayez dans ${rl.retryAfterSeconds}s.` };
  }

  // Validate invitation
  const inv = await prisma.establishmentInvitation.findUnique({
    where: { token },
    include: { establishment: true },
  });

  if (!inv || inv.expires < new Date()) {
    return { error: "Invitation invalide ou expirée." };
  }

  if (inv.email !== email) {
    return { error: "Email non autorisé." };
  }

  // Check if account already exists
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "Un compte existe déjà avec cet email. Connectez-vous plutôt." };
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  try {
    // Create the user — auto-verified, onboarded, attached to establishment
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        businessName: name,
        niche: inv.establishment.niche,
        emailVerified: new Date(),
        onboarded: true,
        plan: "free",
        monthlyQuota: 50,
      },
    });

    // Add to establishment
    await prisma.establishmentMember.create({
      data: {
        userId: user.id,
        establishmentId: inv.establishmentId,
        role: inv.role,
      },
    });

    // Delete used invitation
    await prisma.establishmentInvitation.delete({ where: { id: inv.id } });
  } catch {
    return { error: "Erreur lors de la création du compte. Réessayez." };
  }

  return { success: true };
}

// --- Vérifier l'email ---
export async function verifyEmail(token: string) {
  if (!token) {
    return { error: "Token manquant" };
  }

  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const verificationToken = await prisma.emailVerificationToken.findUnique({
    where: { token: tokenHash },
  });

  if (!verificationToken) {
    return { error: "Lien invalide ou déjà utilisé" };
  }

  if (verificationToken.expires < new Date()) {
    await prisma.emailVerificationToken.delete({ where: { id: verificationToken.id } });
    return { error: "Ce lien a expiré. Demandez un nouveau lien de vérification." };
  }

  // Activer le compte
  try {
    await prisma.user.update({
      where: { email: verificationToken.email },
      data: { emailVerified: new Date() },
    });
  } catch {
    return { error: "Erreur lors de la vérification. Réessayez." };
  }

  // Supprimer le token utilisé
  await prisma.emailVerificationToken.delete({ where: { id: verificationToken.id } });

  // Accept pending establishment invitations for this email
  await acceptPendingInvitations(verificationToken.email);

  return { success: true };
}

async function acceptPendingInvitations(email: string) {
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return;

    const invitations = await prisma.establishmentInvitation.findMany({
      where: { email, expires: { gt: new Date() } },
    });

    for (const inv of invitations) {
      // Check not already a member
      const existing = await prisma.establishmentMember.findUnique({
        where: { userId_establishmentId: { userId: user.id, establishmentId: inv.establishmentId } },
      });
      if (!existing) {
        await prisma.establishmentMember.create({
          data: {
            userId: user.id,
            establishmentId: inv.establishmentId,
            role: inv.role,
          },
        });
      }
    }

    // Clean up used invitations
    if (invitations.length > 0) {
      await prisma.establishmentInvitation.deleteMany({
        where: { email },
      });
    }
  } catch (err) {
    console.error("[verify-email] accept invitations failed:", err);
  }
}

// --- Renvoyer l'email de vérification ---
export async function resendVerificationEmail(email: string) {
  if (!email || !validateEmail(email)) {
    return { error: "Adresse email invalide" };
  }

  const normalizedEmail = email.trim().toLowerCase();

  // Rate limit par email (3 renvois / 15 minutes)
  const rl = await checkRateLimit(`resend-verify:${normalizedEmail}`, { maxAttempts: 3, windowMs: 15 * 60 * 1000 });
  if (!rl.success) {
    return { error: `Trop de tentatives. Réessayez dans ${rl.retryAfterSeconds}s.` };
  }

  // Rate limit par IP
  const ip = await getClientIp();
  const rlIp = await checkRateLimit(`resend-verify-ip:${ip}`, { maxAttempts: 5, windowMs: 15 * 60 * 1000 });
  if (!rlIp.success) {
    return { error: `Trop de tentatives. Réessayez dans ${rlIp.retryAfterSeconds}s.` };
  }

  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

  // Ne pas révéler si l'email existe — toujours retourner succès
  if (!user || user.emailVerified) {
    return { success: true };
  }

  try {
    const token = await generateVerificationToken(normalizedEmail);
    await sendVerificationEmail(normalizedEmail, user.name, token);
  } catch (err) {
    console.error("[resend-verify] email failed:", err);
    return { error: "Erreur lors de l'envoi. Réessayez dans quelques instants." };
  }

  return { success: true };
}

// --- Mot de passe oublié ---
export async function requestPasswordReset(formData: FormData) {
  const email = formString(formData, "email").trim().toLowerCase();

  if (!email || !validateEmail(email)) {
    return { error: "Adresse email invalide" };
  }

  const rl = await checkRateLimit(`reset:${email}`, { maxAttempts: 3, windowMs: 60 * 60 * 1000 });
  if (!rl.success) {
    return { error: `Trop de tentatives. Réessayez dans ${rl.retryAfterSeconds}s.` };
  }

  const user = await prisma.user.findUnique({ where: { email } });

  // Toujours retourner succès pour ne pas révéler si l'email existe
  if (!user) {
    return { success: true };
  }

  // Supprimer les anciens tokens pour cet email
  await prisma.passwordResetToken.deleteMany({ where: { email } });

  // Générer un token sécurisé — on stocke le hash en DB, pas le token brut
  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 heure

  await prisma.passwordResetToken.create({
    data: { email, token: tokenHash, expires },
  });

  // Envoyer l'email avec le token brut (le user clique dessus)
  const resetUrl = absoluteUrl(`/reset-password?token=${token}`);

  try {
    await sendEmail({
      to: email,
      subject: "Réinitialisation de votre mot de passe - Valoravis",
      html: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;background:#ffffff;color:#1a1a1a">
  <h2>Réinitialisation du mot de passe</h2>
  <p>Bonjour,</p>
  <p>Vous avez demandé la réinitialisation de votre mot de passe Valoravis.</p>
  <p>Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe :</p>
  <a href="${resetUrl}" style="display:inline-block;background:#6d28d9;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;margin:16px 0">
    Réinitialiser mon mot de passe
  </a>
  <p style="color:#888;font-size:13px">Ce lien expire dans 1 heure.</p>
  <p style="color:#888;font-size:13px">Si vous n'avez pas fait cette demande, ignorez cet email.</p>
</div>`,
    });
  } catch {
    // Si l'email échoue, supprimer le token créé
    await prisma.passwordResetToken.deleteMany({ where: { email } });
    return { error: "Erreur lors de l'envoi de l'email. Réessayez dans quelques instants." };
  }

  return { success: true };
}

// --- Réinitialiser le mot de passe ---
export async function resetPassword(formData: FormData) {
  const token = formString(formData, "token");
  const password = formString(formData, "password");
  const confirmPassword = formString(formData, "confirmPassword");

  if (!token || !password) {
    return { error: "Données manquantes" };
  }

  const passwordError = validatePassword(password);
  if (passwordError) {
    return { error: passwordError };
  }

  if (password !== confirmPassword) {
    return { error: "Les mots de passe ne correspondent pas" };
  }

  // Vérifier le token — on hash le token reçu et on compare avec la DB
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token: tokenHash },
  });

  if (!resetToken) {
    return { error: "Lien invalide ou déjà utilisé" };
  }

  if (resetToken.expires < new Date()) {
    await prisma.passwordResetToken.delete({ where: { id: resetToken.id } });
    return { error: "Ce lien a expiré. Veuillez refaire une demande." };
  }

  // Mettre à jour le mot de passe
  const hashedPassword = await bcrypt.hash(password, 12);

  try {
    await prisma.user.update({
      where: { email: resetToken.email },
      data: { password: hashedPassword },
    });
  } catch {
    return { error: "Erreur lors de la réinitialisation. Réessayez." };
  }

  // Supprimer le token utilisé
  await prisma.passwordResetToken.delete({ where: { id: resetToken.id } });

  return { success: true };
}
