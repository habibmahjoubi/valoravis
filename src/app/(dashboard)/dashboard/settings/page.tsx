import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { updateSettings } from "@/actions/dashboard";
import { NICHE_CONFIGS } from "@/config/niches";
import { TemplateEditor } from "@/components/dashboard/template-editor";
import { GooglePlaceField } from "@/components/dashboard/google-place-field";
import { NicheSelector } from "@/components/dashboard/niche-selector";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.user.id },
  });

  // Load custom templates
  const customTemplates = await prisma.template.findMany({
    where: { userId: user.id, niche: user.niche },
  });

  const nicheConfig = NICHE_CONFIGS[user.niche];
  const defaultTemplates = nicheConfig.templates;

  const emailCustom = customTemplates.find((t) => t.channel === "EMAIL");
  const smsCustom = customTemplates.find((t) => t.channel === "SMS");

  const templates = {
    EMAIL: {
      subject: emailCustom?.subject || defaultTemplates.EMAIL.subject,
      body: emailCustom?.body || defaultTemplates.EMAIL.body,
    },
    SMS: {
      body: smsCustom?.body || defaultTemplates.SMS.body,
    },
  };

  return (
    <div className="space-y-8">
      <h1 className="text-xl sm:text-2xl font-bold">Paramètres</h1>

      {/* Business settings */}
      <form
        action={updateSettings}
        className="max-w-lg space-y-5 bg-card border border-border rounded-xl p-6"
      >
        <h2 className="font-semibold">Établissement</h2>
        <div>
          <label className="block text-sm font-medium mb-1">
            Nom de l'établissement
          </label>
          <input
            name="businessName"
            defaultValue={user.businessName || ""}
            required
            className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <NicheSelector
          defaultNiche={user.niche}
          defaultCustomNiche={user.customNiche}
        />

        <GooglePlaceField defaultValue={user.googlePlaceUrl || ""} />

        <div>
          <label className="block text-sm font-medium mb-1">
            Téléphone de l'établissement
          </label>
          <input
            name="phone"
            type="tel"
            defaultValue={user.phone || ""}
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

      {/* Template Editor */}
      <TemplateEditor
        niche={user.niche}
        templates={templates}
        defaultTemplates={defaultTemplates}
      />
    </div>
  );
}
