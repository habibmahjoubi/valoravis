import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { toGoogleWriteReviewUrl } from "@/lib/utils";
import { SatisfactionGate } from "@/components/review/satisfaction-gate";
import { Heart } from "lucide-react";

export default async function ReviewPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const request = await prisma.reviewRequest.findUnique({
    where: { token },
    include: { user: true, client: true },
  });

  if (!request) notFound();

  if (request.status === "SENT") {
    await prisma.reviewRequest.update({
      where: { id: request.id },
      data: { status: "CLICKED", clickedAt: new Date() },
    });
  }

  if (request.rating) {
    const googleUrl = toGoogleWriteReviewUrl(
      request.user.googlePlaceUrl || ""
    );
    return (
      <div className="min-h-dvh w-full flex flex-col justify-start sm:justify-center px-4 pt-12 sm:pt-0 pb-8 bg-muted">
        <div className="w-full sm:max-w-sm sm:mx-auto text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-primary fill-primary" />
          </div>
          <h1 className="text-xl font-bold mb-2">Merci !</h1>
          <p className="text-muted-foreground mb-4">
            Votre retour à bien ete enregistré.
          </p>
          {googleUrl && request.rating >= 4 && (
            <a
              href={googleUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-primary text-primary-foreground px-4 sm:px-6 py-2 rounded-lg text-sm font-medium hover:opacity-90"
            >
              Publier aussi sur Google
            </a>
          )}
        </div>
      </div>
    );
  }

  const googleReviewUrl = toGoogleWriteReviewUrl(
    request.user.googlePlaceUrl || ""
  );

  return (
    <div className="min-h-dvh w-full flex flex-col justify-start sm:justify-center px-4 pt-12 sm:pt-0 pb-8 bg-muted">
      <div className="w-full sm:max-w-sm sm:mx-auto">
      <SatisfactionGate
        token={token}
        businessName={request.user.businessName || "notre établissement"}
        clientName={request.client.name}
        googlePlaceUrl={googleReviewUrl}
      />
      </div>
    </div>
  );
}
