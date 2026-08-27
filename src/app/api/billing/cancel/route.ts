import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/resend";
import { checkRateLimit } from "@/lib/rate-limit";
import { reconcileUserSubscription } from "@/lib/subscription";
import { absoluteUrl, escapeHtml } from "@/lib/utils";
import { headers } from "next/headers";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0].trim() || h.get("x-real-ip") || "unknown";
  const rl = await checkRateLimit(`billing-cancel:${ip}`, { maxAttempts: 5, windowMs: 15 * 60 * 1000 });
  if (!rl.success) {
    return NextResponse.json({ error: "Trop de tentatives." }, { status: 429 });
  }

  let user = await prisma.user.findUniqueOrThrow({
    where: { id: session.user.id },
  });

  if (user.isSuspended) {
    return NextResponse.json({ error: "Compte suspendu" }, { status: 403 });
  }

  if (await reconcileUserSubscription(user)) {
    user = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });
  }

  if (user.plan === "free") {
    return NextResponse.json({ error: "Pas d'abonnement actif" }, { status: 400 });
  }

  if (user.cancelRequestedAt) {
    return NextResponse.json({ error: "Demande déjà en cours" }, { status: 400 });
  }

  // Save cancellation request
  await prisma.user.update({
    where: { id: user.id },
    data: { cancelRequestedAt: new Date() },
  });

  // Notify all admins by email
  const admins = await prisma.user.findMany({
    where: { isAdmin: true },
    select: { email: true },
  });

  const adminUrl = absoluteUrl(`/admin/users/${user.id}`);
  const displayName = escapeHtml(user.businessName || user.email);

  for (const admin of admins) {
    sendEmail({
      to: admin.email,
      subject: `[Valoravis] Demande d'annulation — ${user.businessName || user.email}`,
      html: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;background:#ffffff;color:#1a1a1a">
  <h2>Demande d'annulation</h2>
  <p><strong>${displayName}</strong> (${escapeHtml(user.email)}) a demandé l'annulation de son abonnement <strong>${escapeHtml(user.plan)}</strong>.</p>
  <table style="width:100%;border-collapse:collapse;margin:16px 0">
    <tr><td style="padding:8px 0;color:#888">Plan actuel</td><td style="padding:8px 0;font-weight:bold">${escapeHtml(user.plan)}</td></tr>
    <tr><td style="padding:8px 0;color:#888">Date de la demande</td><td style="padding:8px 0">${new Date().toLocaleDateString("fr-FR")}</td></tr>
  </table>
  <p>Connectez-vous au panneau d'administration pour approuver ou rejeter cette demande.</p>
  <a href="${adminUrl}" style="display:inline-block;background:#6d28d9;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;margin:16px 0">
    Voir le profil
  </a>
</div>`,
    }).catch((err) => {
      console.error("[cancel] admin notification failed:", err);
    });
  }

  return NextResponse.json({ ok: true });
}
