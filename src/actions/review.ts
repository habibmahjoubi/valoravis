"use server";

import { prisma } from "@/lib/prisma";

export async function submitRating(
  token: string,
  rating: number,
  feedback: string | null
) {
  // Validate rating
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new Error("Note invalide");
  }

  // Validate feedback length
  if (feedback && feedback.length > 2000) {
    throw new Error("Feedback trop long");
  }

  const request = await prisma.reviewRequest.findUnique({
    where: { token },
  });

  if (!request) throw new Error("Demande introuvable");

  // Prevent re-submission
  if (request.rating !== null) {
    throw new Error("Avis deja soumis");
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
