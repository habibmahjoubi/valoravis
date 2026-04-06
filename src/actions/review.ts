"use server";

import { prisma } from "@/lib/prisma";

export async function submitRating(
  token: string,
  rating: number,
  feedback: string | null
) {
  const request = await prisma.reviewRequest.findUnique({
    where: { token },
  });

  if (!request) throw new Error("Demande introuvable");

  await prisma.reviewRequest.update({
    where: { id: request.id },
    data: {
      rating,
      feedback,
      status: rating >= 4 ? "REVIEWED" : "FEEDBACK",
    },
  });
}
