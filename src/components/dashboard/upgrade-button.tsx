"use client";

import { useState } from "react";

export function UpgradeButton({
  planKey,
  planName,
}: {
  planKey: string;
  planName: string;
}) {
  const [loading, setLoading] = useState(false);

  async function handleUpgrade() {
    setLoading(true);
    try {
      const res = await fetch("/api/webhooks/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planKey }),
      });
      if (!res.ok) {
        alert("Erreur lors de la creation du paiement. Verifiez la configuration Stripe.");
        return;
      }
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {
      alert("Erreur de connexion. Veuillez reessayer.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleUpgrade}
      disabled={loading}
      className="w-full bg-primary text-primary-foreground py-2 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50"
    >
      {loading ? "Chargement..." : `Passer au plan ${planName}`}
    </button>
  );
}
