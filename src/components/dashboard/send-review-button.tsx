"use client";

import { useState } from "react";
import { sendReviewRequest } from "@/actions/dashboard";

export function SendReviewButton({
  clientId,
  hasEmail,
  hasPhone,
}: {
  clientId: string;
  hasEmail: boolean;
  hasPhone: boolean;
}) {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
      <form action={handleSend} className="inline-flex gap-1">
        <input type="hidden" name="clientId" value={clientId} />
        <input type="hidden" name="delayHours" value="0" />
        {hasEmail && (
          <button
            type="submit"
            name="channel"
            value="EMAIL"
            className="px-2 py-1 text-xs bg-primary/10 text-primary rounded hover:bg-primary/20"
            title="Envoyer par email"
          >
            Email
          </button>
        )}
        {hasPhone && (
          <button
            type="submit"
            name="channel"
            value="SMS"
            className="px-2 py-1 text-xs bg-success/10 text-success rounded hover:bg-success/20"
            title="Envoyer par SMS"
          >
            SMS
          </button>
        )}
        {!hasEmail && !hasPhone && (
          <span className="text-xs text-muted-foreground">Pas de contact</span>
        )}
      </form>
      {error && (
        <span className="text-[11px] text-destructive max-w-[200px] text-right">
          {error}
        </span>
      )}
      {success && (
        <span className="text-[11px] text-success">{success}</span>
      )}
    </div>
  );
}
