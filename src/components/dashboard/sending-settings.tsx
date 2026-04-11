"use client";

import { useState } from "react";
import { updateSendingSettings } from "@/actions/dashboard";
import { Mail, Smartphone, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

interface SendingSettingsProps {
  defaultChannel: "EMAIL" | "SMS";
  defaultDelay: number | null;
  senderName: string | null;
  replyToEmail: string | null;
  phone: string | null;
  nicheDefaultDelay: number;
  hasSms: boolean;
  establishment: string;
}

export function SendingSettings({
  defaultChannel,
  defaultDelay,
  senderName,
  replyToEmail,
  phone,
  nicheDefaultDelay,
  hasSms,
  establishment,
}: SendingSettingsProps) {
  const [channel, setChannel] = useState(defaultChannel || "EMAIL");
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<{ success?: boolean; error?: string } | null>(null);
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setResult(null);
    const formData = new FormData(e.currentTarget);
    const res = await updateSendingSettings(formData);
    setResult(res || { success: true });
    setSaving(false);
  }

  return (
    <div className="bg-card border border-border rounded-xl p-4 sm:p-6 space-y-5">
      <div>
        <h2 className="font-semibold">Préférences d'envoi</h2>
        <p className="text-xs text-muted-foreground mt-1">
          Configurez le canal et le délai par défaut pour vos demandes d'avis.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Channel selector */}
        <div>
          <label className="block text-sm font-medium mb-2">Canal par défaut</label>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setChannel("EMAIL")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                channel === "EMAIL"
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border text-muted-foreground hover:border-foreground/20"
              }`}
            >
              <Mail className="w-4 h-4" />
              Email
            </button>
            <button
              type="button"
              onClick={() => {
                if (hasSms) setChannel("SMS");
              }}
              disabled={!hasSms}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                channel === "SMS"
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border text-muted-foreground hover:border-foreground/20"
              } ${!hasSms ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <Smartphone className="w-4 h-4" />
              SMS
              {!hasSms && <span className="text-[10px] ml-1">(Pro)</span>}
            </button>
          </div>
          <input type="hidden" name="defaultChannel" value={channel} />
        </div>

        {/* Delay */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Délai avant envoi
          </label>
          <div className="flex flex-wrap items-center gap-2">
            <input
              name="defaultDelay"
              type="number"
              min={0}
              max={720}
              step={1}
              defaultValue={defaultDelay ?? ""}
              placeholder={String(nicheDefaultDelay)}
              className="w-24 px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <span className="text-sm text-muted-foreground">
              heures après le passage du client
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Laisser vide pour utiliser le délai recommandé ({nicheDefaultDelay}h pour votre métier).
          </p>
        </div>

        {/* Email-specific fields */}
        {channel === "EMAIL" && (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">
                Nom de l'expéditeur
              </label>
              <input
                name="senderName"
                type="text"
                maxLength={100}
                defaultValue={senderName || ""}
                placeholder={`Ex: ${establishment.charAt(0).toUpperCase() + establishment.slice(1)} Dupont`}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Le nom affiché dans la boîte de réception du client. Vide = Valoravis.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Adresse de réponse
              </label>
              <input
                name="replyToEmail"
                type="email"
                maxLength={255}
                defaultValue={replyToEmail || ""}
                placeholder={`contact@mon-${establishment}.fr`}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Si le client répond à l'email, sa réponse arrive à cette adresse.
              </p>
            </div>
          </>
        )}

        {/* SMS-specific fields */}
        {channel === "SMS" && (
          <div>
            <label className="block text-sm font-medium mb-1">
              Numéro de téléphone du {establishment}
            </label>
            <input
              name="phone"
              type="tel"
              maxLength={20}
              defaultValue={phone || ""}
              placeholder="06 12 34 56 78"
              className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Ce numéro est utilisé pour identifier votre {establishment} dans les SMS envoyés aux clients.
            </p>
          </div>
        )}

        {/* Save button + status */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="bg-primary text-primary-foreground px-5 py-2 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
          >
            {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Enregistrer
          </button>
          {result?.success && (
            <span className="flex items-center gap-1.5 text-sm text-success">
              <CheckCircle2 className="w-4 h-4" /> Enregistré
            </span>
          )}
          {result?.error && (
            <span className="flex items-center gap-1.5 text-sm text-destructive">
              <AlertCircle className="w-4 h-4" /> {result.error}
            </span>
          )}
        </div>
      </form>

    </div>
  );
}
