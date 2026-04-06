"use client";

import { useState } from "react";
import { startTrial } from "@/actions/dashboard";

export function TrialButton({
  planKey,
  planName,
  trialDays,
}: {
  planKey: string;
  planName: string;
  trialDays: number;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleTrial() {
    setLoading(true);
    setError("");
    const result = await startTrial(planKey);
    if (result.error) {
      setError(result.error);
    }
    setLoading(false);
  }

  return (
    <div>
      <button
        onClick={handleTrial}
        disabled={loading}
        className="w-full bg-primary text-primary-foreground py-2 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50"
      >
        {loading
          ? "Activation..."
          : `Essai gratuit ${trialDays} jours — ${planName}`}
      </button>
      {error && (
        <p className="text-xs text-destructive mt-1 text-center">{error}</p>
      )}
    </div>
  );
}
