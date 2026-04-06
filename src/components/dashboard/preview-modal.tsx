"use client";

import { useState } from "react";

export function PreviewButton({
  clientName,
  businessName,
  channel,
  templateBody,
  templateSubject,
}: {
  clientName: string;
  businessName: string;
  channel: "EMAIL" | "SMS";
  templateBody: string;
  templateSubject?: string;
}) {
  const [open, setOpen] = useState(false);

  function resolve(text: string) {
    const resolved = text
      .replace(/\{\{clientName\}\}/g, clientName)
      .replace(/\{\{businessName\}\}/g, businessName)
      .replace(/\{\{link\}\}/g, "https://example.com/review/xxx");
    return resolved;
  }

  function sanitizeHtml(html: string) {
    // Strip dangerous tags/attributes, keep safe formatting
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/on\w+="[^"]*"/gi, "")
      .replace(/on\w+='[^']*'/gi, "")
      .replace(/javascript:/gi, "");
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="px-2 py-1 text-xs text-muted-foreground hover:bg-muted rounded"
        title="Apercu du message"
      >
        Apercu
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="bg-card border border-border rounded-xl p-6 w-full max-w-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">
            Apercu {channel === "EMAIL" ? "Email" : "SMS"}
          </h3>
          <button
            onClick={() => setOpen(false)}
            className="text-muted-foreground hover:text-foreground text-lg"
          >
            x
          </button>
        </div>

        {channel === "EMAIL" && templateSubject && (
          <div className="mb-3">
            <p className="text-xs text-muted-foreground mb-1">Objet :</p>
            <p className="text-sm font-medium">
              {resolve(templateSubject)}
            </p>
          </div>
        )}

        {channel === "EMAIL" ? (
          <div
            className="border border-border rounded-lg p-4 bg-white text-sm"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(resolve(templateBody)) }}
          />
        ) : (
          <div className="border border-border rounded-lg p-4 bg-muted/30">
            <p className="text-sm">{resolve(templateBody)}</p>
            <p className="text-xs text-muted-foreground mt-2">
              {resolve(templateBody).length} caracteres
            </p>
          </div>
        )}

        <button
          onClick={() => setOpen(false)}
          className="mt-4 w-full py-2 border border-border rounded-lg text-sm hover:bg-muted"
        >
          Fermer
        </button>
      </div>
    </div>
  );
}
