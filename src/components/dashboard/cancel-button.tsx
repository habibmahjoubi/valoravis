"use client";

import { useState } from "react";

export function CancelButton() {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleCancel() {
    if (
      !confirm(
        "Etes-vous sur de vouloir annuler votre abonnement ? Il restera actif jusqu'a la fin de la période en cours."
      )
    )
      return;

    setLoading(true);
    const res = await fetch("/api/billing/cancel", { method: "POST" });
    if (res.ok) {
      setDone(true);
    } else {
      alert("Erreur lors de l'annulation. Veuillez réessayer.");
    }
    setLoading(false);
  }

  if (done) {
    return (
      <p className="text-sm text-muted-foreground">
        Votre abonnement sera annulé à la fin de la période en cours.
      </p>
    );
  }

  return (
    <button
      onClick={handleCancel}
      disabled={loading}
      className="px-4 py-2 text-sm border border-destructive text-destructive rounded-lg hover:bg-destructive/10 disabled:opacity-50"
    >
      {loading ? "Annulation..." : "Annuler mon abonnement"}
    </button>
  );
}
