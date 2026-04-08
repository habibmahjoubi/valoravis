"use client";

import { useState } from "react";
import { submitRating } from "@/actions/review";
import { Star, Heart } from "lucide-react";

export function SatisfactionGate({
  token,
  businessName,
  clientName,
  googlePlaceUrl,
  threshold = 4,
}: {
  token: string;
  businessName: string;
  clientName: string;
  googlePlaceUrl: string;
  threshold?: number;
}) {
  const [rating, setRating] = useState(0);
  const [hovering, setHovering] = useState(0);
  const [step, setStep] = useState<"rate" | "feedback" | "thanks">("rate");
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleRate(selectedRating: number) {
    setRating(selectedRating);
    setSubmitting(true);

    if (selectedRating >= threshold && googlePlaceUrl) {
      await submitRating(token, selectedRating, null);
      window.location.href = googlePlaceUrl;
    } else if (selectedRating >= threshold) {
      await submitRating(token, selectedRating, null);
      setStep("thanks");
      setSubmitting(false);
    } else {
      setStep("feedback");
      setSubmitting(false);
    }
  }

  async function handleFeedback(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    await submitRating(token, rating, feedback);
    setStep("thanks");
    setSubmitting(false);
  }

  if (step === "thanks") {
    return (
      <div className="w-full sm:max-w-sm text-center bg-card rounded-2xl p-5 sm:p-8 shadow-lg border border-border">
        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Heart className="w-7 h-7 text-primary fill-primary" />
        </div>
        <h1 className="text-xl font-bold mb-2">Merci {clientName} !</h1>
        <p className="text-muted-foreground text-sm">
          Votre retour est précieux pour {businessName}.
        </p>
      </div>
    );
  }

  if (step === "feedback") {
    return (
      <div className="w-full sm:max-w-sm bg-card rounded-2xl p-5 sm:p-8 shadow-lg border border-border">
        <div className="text-center mb-4">
          <div className="flex justify-center gap-1 mb-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                className={`w-5 h-5 ${
                  s <= rating
                    ? "text-warning fill-warning"
                    : "text-border"
                }`}
              />
            ))}
          </div>
          <h2 className="text-lg font-bold">
            Que pouvons-nous améliorer ?
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Votre retour est confidentiel et sera envoyé directement a{" "}
            {businessName}.
          </p>
        </div>

        <form onSubmit={handleFeedback} className="space-y-4">
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            required
            rows={4}
            autoFocus
            className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            placeholder="Dites-nous ce qui pourrait être amélioré..."
          />
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-primary text-primary-foreground py-2 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50"
          >
            {submitting ? "Envoi..." : "Envoyer mon retour"}
          </button>
        </form>
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

      <div className="flex justify-center gap-2 mb-4">
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
              className={`w-10 h-10 ${
                star <= (hovering || rating)
                  ? "text-primary fill-primary"
                  : "text-border"
              }`}
            />
          </button>
        ))}
      </div>

      {submitting ? (
        <p className="text-xs text-muted-foreground">
          Redirection vers Google...
        </p>
      ) : (
        <p className="text-xs text-muted-foreground">
          Cliquez sur une étoile pour evaluer
        </p>
      )}
    </div>
  );
}
