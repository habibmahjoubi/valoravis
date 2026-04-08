"use server";

import { prisma } from "@/lib/prisma";

export async function submitRating(
  token: string,
  rating: number,
  feedback: string | null
) {
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
  });

  if (!request) throw new Error("Ce lien de demande d'avis est invalide");

  // Prevent re-submission
  if (request.rating !== null) {
    throw new Error("Vous avez déjà donné votre avis, merci !");
  }

  await prisma.reviewRequest.update({
    where: { id: request.id },
    data: {
      rating,
      feedback: feedback?.slice(0, 2000) || null,
      status: rating >= 4 ? "REVIEWED" : "FEEDBACK",
    },
  });
}
