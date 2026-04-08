"use client";

import { useState } from "react";
import { updateThreshold } from "@/actions/dashboard";
import { Star } from "lucide-react";

export function ThresholdSelector({ defaultValue }: { defaultValue: number }) {
  const [value, setValue] = useState(defaultValue);
  const [saved, setSaved] = useState(false);

  return (
    <div className="max-w-lg bg-card border border-border rounded-xl p-4 sm:p-6">
      <h2 className="font-semibold mb-1">Seuil de satisfaction</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Les clients qui donnent une note <strong>en dessous</strong> de ce seuil
        seront redirigés vers un formulaire privé au lieu de Google.
      </p>

      <div className="flex items-center gap-3 mb-3">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setValue(star)}
            className="transition-transform hover:scale-110"
            aria-label={`${star} étoile${star > 1 ? "s" : ""}`}
          >
            <Star
              className={`w-8 h-8 sm:w-9 sm:h-9 ${
                star <= value
                  ? "text-primary fill-primary"
                  : "text-border"
              }`}
            />
          </button>
        ))}
      </div>

      <p className="text-sm text-muted-foreground mb-4">
        {value === 1 ? (
          "Tous les avis seront redirigés vers Google (pas de filtre)."
        ) : (
          <>
            Note <strong>&lt; {value}</strong> → feedback privé.
            Note <strong>≥ {value}</strong> → redirigé vers Google.
          </>
        )}
      </p>

      <button
        onClick={async () => {
          const fd = new FormData();
          fd.append("threshold", String(value));
          await updateThreshold(fd);
          setSaved(true);
          setTimeout(() => setSaved(false), 2000);
        }}
        className="bg-primary text-primary-foreground px-4 sm:px-6 py-2 rounded-lg text-sm font-medium hover:opacity-90"
      >
        Enregistrer
      </button>
      {saved && (
        <span className="ml-3 text-sm text-success">Enregistré !</span>
      )}
    </div>
  );
}
