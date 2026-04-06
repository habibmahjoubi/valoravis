"use client";

import { useState } from "react";
import { saveTemplate, resetTemplate } from "@/actions/dashboard";

type TemplateData = { subject?: string; body: string };

const VARIABLES = [
  { key: "{{clientName}}", label: "Prenom client" },
  { key: "{{businessName}}", label: "Etablissement" },
  { key: "{{link}}", label: "Lien d'avis" },
];

export function TemplateEditor({
  niche,
  templates,
  defaultTemplates,
}: {
  niche: string;
  templates: { EMAIL: TemplateData; SMS: TemplateData };
  defaultTemplates: { EMAIL: TemplateData; SMS: TemplateData };
}) {
  const [channel, setChannel] = useState<"EMAIL" | "SMS">("EMAIL");
  const [subject, setSubject] = useState(templates.EMAIL.subject || "");
  const [body, setBody] = useState(templates.EMAIL.body);
  const [saved, setSaved] = useState(false);

  function switchChannel(ch: "EMAIL" | "SMS") {
    setChannel(ch);
    setSubject(templates[ch].subject || "");
    setBody(templates[ch].body);
    setSaved(false);
  }

  function insertVariable(variable: string) {
    setBody((prev) => prev + variable);
  }

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <h2 className="font-semibold mb-4">Templates de messages</h2>

      {/* Channel tabs */}
      <div className="flex gap-2 mb-4">
        {(["EMAIL", "SMS"] as const).map((ch) => (
          <button
            key={ch}
            onClick={() => switchChannel(ch)}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              channel === ch
                ? "bg-primary text-primary-foreground"
                : "border border-border hover:bg-muted"
            }`}
          >
            {ch === "EMAIL" ? "Email" : "SMS"}
          </button>
        ))}
      </div>

      <form
        action={async (formData) => {
          await saveTemplate(formData);
          setSaved(true);
          setTimeout(() => setSaved(false), 2000);
        }}
        className="space-y-4"
      >
        <input type="hidden" name="niche" value={niche} />
        <input type="hidden" name="channel" value={channel} />

        {channel === "EMAIL" && (
          <div>
            <label className="block text-sm font-medium mb-1">Objet</label>
            <input
              name="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-1">
            Corps du message
          </label>
          <textarea
            name="body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={channel === "SMS" ? 4 : 10}
            className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary font-mono resize-none"
          />
          {channel === "SMS" && (
            <p
              className={`text-xs mt-1 ${
                body.length > 160
                  ? "text-destructive"
                  : "text-muted-foreground"
              }`}
            >
              {body.length}/160 caracteres
              {body.length > 160 && " (attention : SMS long)"}
            </p>
          )}
        </div>

        {/* Variables */}
        <div>
          <p className="text-xs text-muted-foreground mb-2">
            Variables disponibles (cliquez pour inserer) :
          </p>
          <div className="flex flex-wrap gap-2">
            {VARIABLES.map((v) => (
              <button
                key={v.key}
                type="button"
                onClick={() => insertVariable(v.key)}
                className="px-2 py-1 text-xs bg-muted rounded border border-border hover:bg-muted/80"
              >
                {v.key} <span className="text-muted-foreground">({v.label})</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2 items-center">
          <button
            type="submit"
            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90"
          >
            Enregistrer
          </button>
          <button
            type="button"
            onClick={async () => {
              const fd = new FormData();
              fd.append("niche", niche);
              fd.append("channel", channel);
              await resetTemplate(fd);
              setSubject(defaultTemplates[channel].subject || "");
              setBody(defaultTemplates[channel].body);
            }}
            className="px-4 py-2 border border-border rounded-lg text-sm hover:bg-muted"
          >
            Restaurer le defaut
          </button>
          {saved && (
            <span className="text-sm text-success">Enregistre !</span>
          )}
        </div>
      </form>
    </div>
  );
}
