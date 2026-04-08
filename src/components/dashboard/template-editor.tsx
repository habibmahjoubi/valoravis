"use client";

import { useState } from "react";
import { saveTemplate, deleteTemplate } from "@/actions/dashboard";
import { Plus, Trash2, Check, FileText, ArrowLeft } from "lucide-react";

type TemplateData = { subject?: string; body: string };
type TemplatePreset = { name: string; subject?: string; body: string };
type UserTemplate = {
  id: string;
  name: string;
  channel: "EMAIL" | "SMS";
  subject?: string;
  body: string;
  isDefault: boolean;
};

const VARIABLES = [
  { key: "{{clientName}}", label: "Prénom client" },
  { key: "{{businessName}}", label: "Établissement" },
  { key: "{{link}}", label: "Lien d'avis" },
];

export function TemplateEditor({
  niche,
  userTemplates,
  defaultTemplates,
  presets,
}: {
  niche: string;
  userTemplates: UserTemplate[];
  defaultTemplates: { EMAIL: TemplateData; SMS: TemplateData };
  presets: { EMAIL: TemplatePreset[]; SMS: TemplatePreset[] };
}) {
  const [channel, setChannel] = useState<"EMAIL" | "SMS">("EMAIL");
  const [templates, setTemplates] = useState<UserTemplate[]>(userTemplates);

  // Determine initial view based on whether user has EMAIL templates
  const initTpl = userTemplates.find((t) => t.channel === "EMAIL");
  const [selectedId, setSelectedId] = useState<string | null>(initTpl?.id ?? null);
  const [isNew, setIsNew] = useState(false);
  const [name, setName] = useState(initTpl?.name ?? "");
  const [subject, setSubject] = useState(initTpl?.subject ?? "");
  const [body, setBody] = useState(initTpl?.body ?? "");
  const [saved, setSaved] = useState(false);
  const [isDefault, setIsDefault] = useState(initTpl?.isDefault ?? false);
  const [showPresets, setShowPresets] = useState(!initTpl);

  const channelTemplates = templates.filter((t) => t.channel === channel);

  // --- State transitions ---

  function resetFields(f: { name?: string; subject?: string; body?: string; isDefault?: boolean }) {
    setName(f.name ?? "");
    setSubject(f.subject ?? "");
    setBody(f.body ?? "");
    setIsDefault(f.isDefault ?? false);
    setSaved(false);
  }

  function selectTemplate(t: UserTemplate) {
    setSelectedId(t.id);
    setIsNew(false);
    setShowPresets(false);
    resetFields({ name: t.name, subject: t.subject, body: t.body, isDefault: t.isDefault });
  }

  function goToPresets() {
    setIsNew(false);
    setShowPresets(true);
    setSelectedId(null);
    resetFields({});
  }

  function switchChannel(ch: "EMAIL" | "SMS") {
    setChannel(ch);
    const first = templates.find((t) => t.channel === ch);
    if (first) {
      selectTemplate(first);
    } else {
      goToPresets();
    }
  }

  function startBlank() {
    setSelectedId(null);
    setIsNew(true);
    setShowPresets(false);
    resetFields({
      subject: defaultTemplates[channel].subject,
      body: defaultTemplates[channel].body,
      isDefault: channelTemplates.length === 0,
    });
  }

  function loadPreset(preset: TemplatePreset) {
    setSelectedId(null);
    setIsNew(true);
    setShowPresets(false);
    resetFields({
      name: preset.name,
      subject: preset.subject,
      body: preset.body,
      isDefault: channelTemplates.length === 0,
    });
  }

  function insertVariable(variable: string) {
    setBody((prev) => prev + variable);
  }

  // Show presets if explicitly asked OR if no templates and not editing
  const presetsVisible = showPresets || (!isNew && !selectedId && channelTemplates.length === 0);
  const editorVisible = (isNew || selectedId) && !presetsVisible;

  return (
    <div className="bg-card border border-border rounded-xl p-4 sm:p-6">
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

      {/* Template tabs (only when more than 1 template) */}
      {channelTemplates.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {channelTemplates.map((t) => (
            <button
              key={t.id}
              onClick={() => selectTemplate(t)}
              className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                selectedId === t.id && editorVisible
                  ? "border-primary bg-primary/10 text-primary font-medium"
                  : "border-border hover:bg-muted"
              }`}
            >
              {t.name}
              {t.isDefault && (
                <span className="ml-1.5 text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded">
                  défaut
                </span>
              )}
            </button>
          ))}
          <button
            onClick={() => goToPresets()}
            className={`px-3 py-1.5 rounded-lg text-sm border border-dashed transition-colors flex items-center gap-1 ${
              presetsVisible
                ? "border-primary bg-primary/10 text-primary"
                : "border-border hover:bg-muted text-muted-foreground"
            }`}
          >
            <Plus className="w-3.5 h-3.5" /> Ajouter
          </button>
        </div>
      )}

      {/* ── Preset picker ── */}
      {presetsVisible && (
        <div>
          <p className="text-sm font-medium mb-3">
            {channelTemplates.length === 0
              ? "Choisissez un modèle pour commencer :"
              : "Choisissez un modèle prédéfini :"}
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            {presets[channel].map((preset) => (
              <button
                key={preset.name}
                onClick={() => loadPreset(preset)}
                className="text-left border border-border rounded-xl p-3 sm:p-4 hover:border-primary hover:bg-primary/5 transition-colors"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <FileText className="w-4 h-4 text-primary" />
                  <span className="font-medium text-sm">{preset.name}</span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {channel === "EMAIL" && preset.subject
                    ? preset.subject
                    : preset.body.replace(/<[^>]*>/g, "").slice(0, 80) + "..."}
                </p>
              </button>
            ))}
          </div>
          <button
            onClick={() => startBlank()}
            className="mt-3 text-sm text-muted-foreground hover:text-foreground"
          >
            ou partir de zéro
          </button>
        </div>
      )}

      {/* ── Editor form ── */}
      {editorVisible && (
        <form
          action={async (formData) => {
            await saveTemplate(formData);
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);

            const existingId = formData.get("templateId") as string;
            const newIsDefault = formData.get("isDefault") === "true";
            const tpl: UserTemplate = {
              id: existingId || "temp-" + Date.now(),
              name,
              channel,
              subject: channel === "EMAIL" ? subject : undefined,
              body,
              isDefault: newIsDefault,
            };

            setTemplates((prev) => {
              let updated = prev.map((t) =>
                newIsDefault && t.channel === channel && t.id !== tpl.id
                  ? { ...t, isDefault: false }
                  : t
              );
              if (isNew) {
                updated = [...updated, tpl];
              } else {
                updated = updated.map((t) => (t.id === selectedId ? tpl : t));
              }
              return updated;
            });

            setSelectedId(tpl.id);
            setIsNew(false);
            setIsDefault(newIsDefault);
          }}
          className="space-y-4"
        >
          <input type="hidden" name="niche" value={niche} />
          <input type="hidden" name="channel" value={channel} />
          <input type="hidden" name="isDefault" value={String(isDefault)} />
          {!isNew && selectedId && (
            <input type="hidden" name="templateId" value={selectedId} />
          )}

          {/* Name */}
          <div>
            <label className="block text-sm font-medium mb-1">Nom du template</label>
            <input
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Ex: Formel, Amical, Relance..."
              className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Subject (email only) */}
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

          {/* Body */}
          <div>
            <label className="block text-sm font-medium mb-1">Corps du message</label>
            <textarea
              name="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={channel === "SMS" ? 4 : 10}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary font-mono resize-none"
            />
            {channel === "SMS" && (
              <p className={`text-xs mt-1 ${body.length > 160 ? "text-destructive" : "text-muted-foreground"}`}>
                {body.length}/160 caractères
                {body.length > 160 && " (attention : SMS long)"}
              </p>
            )}
          </div>

          {/* Variables */}
          <div>
            <p className="text-xs text-muted-foreground mb-2">
              Variables disponibles (cliquez pour insérer) :
            </p>
            <div className="flex flex-wrap gap-2">
              {VARIABLES.map((v) => (
                <button
                  key={v.key}
                  type="button"
                  onClick={() => insertVariable(v.key)}
                  className="px-2.5 py-1.5 text-xs bg-muted rounded border border-border hover:bg-muted/80"
                >
                  {v.key} <span className="text-muted-foreground">({v.label})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Default toggle */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              className="rounded border-border"
            />
            <span className="text-sm">
              Template par défaut pour {channel === "EMAIL" ? "l'email" : "le SMS"}
            </span>
          </label>

          {/* Actions */}
          <div className="flex flex-wrap gap-2 items-center">
            <button
              type="submit"
              className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90"
            >
              {isNew ? "Créer le template" : "Enregistrer"}
            </button>
            {isNew && (
              <button
                type="button"
                onClick={() => goToPresets()}
                className="flex items-center gap-1.5 px-4 py-2 border border-border rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Choisir un autre modèle
              </button>
            )}
            {!isNew && selectedId && channelTemplates.length > 1 && (
              <button
                type="button"
                onClick={async () => {
                  if (!confirm("Supprimer ce template ?")) return;
                  const fd = new FormData();
                  fd.append("templateId", selectedId);
                  await deleteTemplate(fd);
                  setTemplates((prev) => prev.filter((t) => t.id !== selectedId));
                  const remaining = templates.filter(
                    (t) => t.channel === channel && t.id !== selectedId
                  );
                  if (remaining.length > 0) {
                    selectTemplate(remaining[0]);
                  } else {
                    goToPresets();
                  }
                }}
                className="flex items-center gap-1 px-4 py-2 border border-destructive/30 text-destructive rounded-lg text-sm hover:bg-destructive/10"
              >
                <Trash2 className="w-3.5 h-3.5" /> Supprimer
              </button>
            )}
            {!isNew && channelTemplates.length === 1 && (
              <button
                type="button"
                onClick={() => goToPresets()}
                className="flex items-center gap-1.5 px-4 py-2 border border-border rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                <Plus className="w-3.5 h-3.5" /> Ajouter un template
              </button>
            )}
            {saved && (
              <span className="flex items-center gap-1 text-sm text-success">
                <Check className="w-3.5 h-3.5" /> Enregistré !
              </span>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
