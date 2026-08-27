"use client";

import { useState } from "react";
import { submitRating } from "@/actions/review";
import { Star, Heart } from "lucide-react";

export function SatisfactionGate({
  token,
  businessName,
  clientName,
  googlePlaceUrl,
}: {
  token: string;
  businessName: string;
  clientName: string;
  googlePlaceUrl: string;
}) {
  const [rating, setRating] = useState(0);
  const [hovering, setHovering] = useState(0);
  const [step, setStep] = useState<"rate" | "done">("rate");
  const [feedback, setFeedback] = useState("");
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Record the rating as soon as the client picks a star.
  // Every client — whatever the rating — reaches the same screen, which always
  // offers the Google review link. No selective redirection (review gating).
  async function handleRate(selectedRating: number) {
    setRating(selectedRating);
    setSubmitting(true);
    await submitRating(token, selectedRating, null);
    setStep("done");
    setSubmitting(false);
  }

  // Optional private feedback for the business. Never blocks the Google link.
  async function handleFeedback(e: React.FormEvent) {
    e.preventDefault();
    if (!feedback.trim()) return;
    setSubmitting(true);
    await submitRating(token, rating, feedback);
    setFeedbackSent(true);
    setSubmitting(false);
  }

  if (step === "done") {
    return (
      <div className="w-full sm:max-w-sm bg-card rounded-2xl p-5 sm:p-8 shadow-lg border border-border">
        <div className="text-center mb-5">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Heart className="w-7 h-7 text-primary fill-primary" />
          </div>
          <div className="flex justify-center gap-1 mb-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                className={`w-5 h-5 ${
                  s <= rating ? "text-warning fill-warning" : "text-border"
                }`}
              />
            ))}
          </div>
          <h1 className="text-xl font-bold mb-1">Merci {clientName} !</h1>
          <p className="text-muted-foreground text-sm">
            Votre retour est précieux pour {businessName}.
          </p>
        </div>

        {/* Google review link — offered to every client, regardless of rating */}
        {googlePlaceUrl && (
          <a
            href={googlePlaceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center bg-primary text-primary-foreground py-2.5 rounded-lg text-sm font-medium hover:opacity-90 mb-4"
          >
            Partager mon avis sur Google
          </a>
        )}

        {/* Optional private feedback, available to every client */}
        {feedbackSent ? (
          <p className="text-xs text-center text-muted-foreground">
            Votre commentaire a bien été transmis à {businessName}.
          </p>
        ) : (
          <form onSubmit={handleFeedback} className="space-y-3">
            <label className="block text-sm font-medium text-center">
              Un commentaire pour {businessName} ?
            </label>
            <p className="text-xs text-muted-foreground text-center -mt-1">
              Facultatif et confidentiel — transmis directement à l&apos;établissement.
            </p>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              placeholder="Ce qui vous a plu, ou ce qui pourrait être amélioré..."
            />
            <button
              type="submit"
              disabled={submitting || !feedback.trim()}
              className="w-full bg-muted text-foreground py-2 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50"
            >
              {submitting ? "Envoi..." : "Envoyer mon commentaire"}
            </button>
          </form>
        )}
      </div>
    );
  }

  return (
    <div className="w-full sm:max-w-sm text-center bg-card rounded-2xl p-5 sm:p-8 shadow-lg border border-border">
      <h1 className="text-lg font-bold mb-1">Bonjour {clientName} !</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Comment évaluez-vous votre expérience chez{" "}
        <strong>{businessName}</strong> ?
      </p>

      <div className="flex justify-center gap-1.5 sm:gap-2 mb-4">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onMouseEnter={() => setHovering(star)}
            onMouseLeave={() => setHovering(0)}
            onClick={() => handleRate(star)}
            disabled={submitting}
            className="transition-transform hover:scale-110 disabled:opacity-50"
            aria-label={`${star} étoile${star > 1 ? "s" : ""}`}
          >
            <Star
              className={`w-9 h-9 sm:w-11 sm:h-11 ${
                star <= (hovering || rating)
                  ? "text-primary fill-primary"
                  : "text-border"
              }`}
            />
          </button>
        ))}
      </div>

      <p className="text-xs text-muted-foreground">
        {submitting ? "Enregistrement..." : "Cliquez sur une étoile pour évaluer"}
      </p>
    </div>
  );
}
