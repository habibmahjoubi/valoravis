"use server";

import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { headers } from "next/headers";

export async function submitRating(
  token: string,
  rating: number,
  feedback: string | null
) {
  // Rate limiting par IP pour éviter le brute force de tokens
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0].trim() || h.get("x-real-ip") || "unknown";
  const rl = rateLimit(`review:${ip}`, { maxAttempts: 10, windowMs: 60 * 60 * 1000 });
  if (!rl.success) {
    throw new Error("Trop de tentatives. Réessayez plus tard.");
  }

  // Validate token format
  if (!token || typeof token !== "string" || token.length > 128) {
    throw new Error("Lien invalide");
  }

  // Validate rating
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new Error("Note invalide (entre 1 et 5)");
  }

  // Validate feedback length
  if (feedback && feedback.length > 2000) {
    throw new Error("Votre message est trop long (2000 caractères maximum)");
  }

  const request = await prisma.reviewRequest.findUnique({
    where: { token },
    include: { user: { select: { satisfactionThreshold: true } } },
  });

  if (!request) throw new Error("Ce lien de demande d'avis est invalide");

  // Prevent re-submission
  if (request.rating !== null) {
    throw new Error("Vous avez déjà donné votre avis, merci !");
  }

  const threshold = request.user.satisfactionThreshold;

  await prisma.reviewRequest.update({
    where: { id: request.id },
    data: {
      rating,
      feedback: feedback?.slice(0, 2000) || null,
      status: rating >= threshold ? "REVIEWED" : "FEEDBACK",
    },
  });
}
