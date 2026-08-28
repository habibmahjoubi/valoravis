import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { updateSettings } from "@/actions/dashboard";
import { NICHE_CONFIGS } from "@/config/niches";
import { TemplateEditor } from "@/components/dashboard/template-editor";
import { GooglePlaceField } from "@/components/dashboard/google-place-field";
import { NicheSelector } from "@/components/dashboard/niche-selector";
import { ThresholdSelector } from "@/components/dashboard/threshold-selector";
import { SendingSettings } from "@/components/dashboard/sending-settings";
import { hasFeature } from "@/config/plan-features";
import { getCurrentEstablishment, getEstablishmentOwner } from "@/lib/establishment";
import { Lock } from "lucide-react";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.user.id },
  });

  const establishment = await getCurrentEstablishment();

  // MEMBER cannot access settings
  if (establishment && establishment.role === "MEMBER") {
    redirect("/dashboard");
  }

  const owner = establishment && establishment.role !== "OWNER"
    ? await getEstablishmentOwner(establishment.id)
    : null;
  const effectivePlan = owner?.plan ?? user.plan;

  const niche = establishment?.niche ?? user.niche;

  // Load custom templates scoped by establishment
  const customTemplates = await prisma.template.findMany({
    where: {
      userId: user.id,
      niche,
      ...(establishment ? { establishmentId: establishment.id } : {}),
    },
    orderBy: { isDefault: "desc" },
  });

  const nicheConfig = NICHE_CONFIGS[niche];
  const defaultTemplates = nicheConfig.templates;

  // Serialize templates for the editor
  const userTemplates = customTemplates.map((t) => ({
    id: t.id,
    name: t.name,
    channel: t.channel as "EMAIL" | "SMS",
    subject: t.subject || undefined,
    body: t.body,
    isDefault: t.isDefault,
  }));

  return (
    <div className="space-y-8">
      <h1 className="text-xl sm:text-2xl font-bold">Paramètres</h1>

      {/* Business settings */}
      <form
        action={updateSettings}
        className="max-w-2xl space-y-5 bg-card border border-border rounded-xl p-4 sm:p-6"
      >
        <h2 className="font-semibold">Établissement {establishment ? `— ${establishment.name}` : ""}</h2>
        <div>
          <label className="block text-sm font-medium mb-1">
            Nom de l'établissement
          </label>
          <input
            name="businessName"
            defaultValue={establishment?.name || user.businessName || ""}
            required
            className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <NicheSelector
          defaultNiche={niche}
          defaultCustomNiche={establishment?.customNiche || user.customNiche}
        />

        <GooglePlaceField defaultValue={establishment?.googlePlaceUrl || user.googlePlaceUrl || ""} />

        <div>
          <label className="block text-sm font-medium mb-1">
            Téléphone du {nicheConfig.vocabulary.establishment}
          </label>
          <input
            name="phone"
            type="tel"
            defaultValue={establishment?.phone || user.phone || ""}
            className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <button
          type="submit"
          className="bg-primary text-primary-foreground px-4 sm:px-6 py-2 rounded-lg text-sm font-medium hover:opacity-90"
        >
          Enregistrer
        </button>
      </form>

      {/* Sending Preferences */}
      <SendingSettings
        defaultChannel={(establishment?.defaultChannel || user.defaultChannel) as "EMAIL" | "SMS"}
        defaultDelay={establishment?.defaultDelay ?? user.defaultDelay}
        senderName={establishment?.senderName || user.senderName}
        replyToEmail={establishment?.replyToEmail || user.replyToEmail}
        phone={establishment?.phone || user.phone}
        nicheDefaultDelay={nicheConfig.defaultDelay}
        hasSms={hasFeature(effectivePlan, "sms")}
        establishment={nicheConfig.vocabulary.establishment}
        businessName={establishment?.name || user.businessName || ""}
        smsSenderOverride={process.env.SMS_SENDER_ID?.trim() || null}
      />

      {/* Satisfaction Threshold */}
      <ThresholdSelector defaultValue={establishment?.satisfactionThreshold ?? user.satisfactionThreshold} />

      {/* Template Editor */}
      {hasFeature(effectivePlan, "custom_templates") ? (
        <TemplateEditor
          niche={niche}
          userTemplates={userTemplates}
          defaultTemplates={defaultTemplates}
          presets={nicheConfig.presets}
        />
      ) : (
        <div className="bg-card border border-border rounded-xl p-4 sm:p-6">
          <h2 className="font-semibold mb-4">Templates de messages</h2>
          <div className="text-center py-8">
            <Lock className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-3">
              Les templates personnalisés sont disponibles à partir du plan Pro.
            </p>
            <a href="/dashboard/billing" className="text-sm text-primary hover:underline font-medium">
              Passer au plan Pro
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
