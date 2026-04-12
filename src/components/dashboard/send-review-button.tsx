"use client";

import { useState } from "react";
import { sendReviewRequest } from "@/actions/dashboard";
import { Lock } from "lucide-react";
import Link from "next/link";
import { hasFeature } from "@/config/plan-features";

export function SendReviewButton({
  clientId,
  hasEmail,
  hasPhone,
  userPlan,
  defaultDelay = 0,
}: {
  clientId: string;
  hasEmail: boolean;
  hasPhone: boolean;
  userPlan: string;
  defaultDelay?: number;
}) {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const canSms = hasFeature(userPlan, "sms");

  async function handleSend(formData: FormData) {
    setError("");
    setSuccess("");

    const result = await sendReviewRequest(formData);

    if (result?.error) {
      setError(result.error);
      setTimeout(() => setError(""), 5000);
      return;
    }

    setSuccess("Envoyé !");
    setTimeout(() => setSuccess(""), 3000);
  }

  return (
    <div className="inline-flex flex-col items-end gap-1">
      <form action={handleSend} className="inline-flex flex-wrap gap-1.5">
        <input type="hidden" name="clientId" value={clientId} />
        <input type="hidden" name="delayHours" value={defaultDelay} />
        {hasEmail && (
          <button
            type="submit"
            name="channel"
            value="EMAIL"
            className="px-3 py-2 text-xs bg-primary/10 text-primary rounded hover:bg-primary/20"
            title="Envoyer par email"
          >
            Email
          </button>
        )}
        {hasPhone && canSms && (
          <button
            type="submit"
            name="channel"
            value="SMS"
            className="px-3 py-2 text-xs bg-success/10 text-success rounded hover:bg-success/20"
            title="Envoyer par SMS"
          >
            SMS
          </button>
        )}
        {hasPhone && !canSms && (
          <Link
            href="/dashboard/billing"
            className="px-3 py-2 text-xs bg-muted text-muted-foreground rounded inline-flex items-center gap-1"
            title="SMS disponible avec le plan Pro"
          >
            <Lock className="w-3 h-3" />
            SMS
          </Link>
        )}
        {!hasEmail && !hasPhone && (
          <span className="text-xs text-muted-foreground">Pas de contact</span>
        )}
      </form>
      {error && (
        <span className="text-[11px] text-destructive max-w-[200px] break-words">
          {error}
        </span>
      )}
      {success && (
        <span className="text-[11px] text-success">{success}</span>
      )}
    </div>
  );
}
