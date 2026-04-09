"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { registerUser } from "@/actions/auth";
import { PasswordInput } from "@/components/ui/password-input";
import { Stethoscope, Bone, Wrench, Building2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const NICHES: { value: string; label: string; Icon: LucideIcon; emailHint: string; nameHint: string }[] = [
  { value: "DENTIST", label: "Cabinet dentaire", Icon: Stethoscope, emailHint: "vous@cabinet-dentaire.com", nameHint: "Dr. Jean Dupont" },
  { value: "OSTEOPATH", label: "Ostéopathie", Icon: Bone, emailHint: "vous@cabinet-osteo.com", nameHint: "Marie Martin" },
  { value: "GARAGE", label: "Garage auto", Icon: Wrench, emailHint: "contact@mon-garage.com", nameHint: "Garage Central" },
  { value: "OTHER", label: "Autre métier", Icon: Building2, emailHint: "vous@mon-entreprise.com", nameHint: "Jean Dupont" },
];

type PlanOption = {
  key: string;
  name: string;
  price: number;
  quota: number;
  trialDays: number;
  label: string;
  description: string;
};

export function RegisterForm({ plans }: { plans: PlanOption[] }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedNiche, setSelectedNiche] = useState("DENTIST");
  const [customNiche, setCustomNiche] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedPlan = searchParams.get("plan") || "free";
  const planInfo = plans.find((p) => p.key === selectedPlan) || plans[0];
  const currentNiche = NICHES.find((n) => n.value === selectedNiche) || NICHES[0];

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    formData.set("niche", selectedNiche);
    formData.set("plan", selectedPlan);
    if (selectedNiche === "OTHER") {
      formData.set("customNiche", customNiche);
    }

    const result = await registerUser(formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    // Auto-login après inscription
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const loginResult = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (loginResult?.error) {
      router.push("/login?registered=1");
      return;
    }

    router.push("/dashboard");
  }

  return (
    <>
      <div className="text-center mb-8">
        <Link href="/" className="text-2xl font-bold text-primary">
          Valoravis
        </Link>
        <h1 className="text-xl font-semibold mt-4">Créer votre compte</h1>

        <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-lg">
          <span className="text-sm font-medium text-primary">
            Plan {planInfo.name}
          </span>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          {planInfo.description}
        </p>

        <div className="mt-2 flex justify-center gap-2 text-xs">
          {plans.map((plan) => (
            <Link
              key={plan.key}
              href={`/register?plan=${plan.key}`}
              className={`px-2.5 py-1 rounded-full transition-colors ${
                selectedPlan === plan.key
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {plan.name}
            </Link>
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium mb-2">Votre métier</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {NICHES.map((niche) => (
              <button
                key={niche.value}
                type="button"
                onClick={() => setSelectedNiche(niche.value)}
                className={`p-3 rounded-lg border text-center text-sm ${
                  selectedNiche === niche.value
                    ? "border-primary bg-primary/5 ring-2 ring-primary"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <niche.Icon className="w-5 h-5 mx-auto mb-1 text-primary" />
                <div className="text-xs leading-tight">{niche.label}</div>
              </button>
            ))}
          </div>

          {selectedNiche === "OTHER" && (
            <input
              type="text"
              value={customNiche}
              onChange={(e) => setCustomNiche(e.target.value)}
              placeholder="Ex: restaurant, coiffeur, coach..."
              required
              className="w-full mt-2 px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          )}
        </div>

        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1">Nom complet</label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            className="w-full px-3 py-2.5 sm:py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder={currentNiche.nameHint}
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">Email professionnel</label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="w-full px-3 py-2.5 sm:py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder={currentNiche.emailHint}
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1">Mot de passe</label>
          <PasswordInput
            id="password"
            name="password"
            required
            minLength={8}
            placeholder="Min. 8 caractères, 1 majuscule, 1 chiffre"
            autoComplete="new-password"
          />
          <p className="text-[11px] text-muted-foreground mt-1">
            Minimum 8 caractères, une majuscule et un chiffre
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-primary-foreground py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-medium hover:opacity-90 disabled:opacity-50"
        >
          {loading
            ? "Création du compte..."
            : planInfo.price === 0
              ? "Commencer gratuitement"
              : planInfo.trialDays > 0
                ? `Essai gratuit ${planInfo.trialDays}j`
                : `Choisir ${planInfo.name}`}
        </button>

        {planInfo.price > 0 && (
          <p className="text-xs text-muted-foreground text-center">
            Aucune carte bancaire requise pour l&apos;essai
          </p>
        )}
      </form>

      <p className="text-center text-sm text-muted-foreground mt-6">
        Déjà un compte ?{" "}
        <Link href="/login" className="text-primary font-medium">Se connecter</Link>
      </p>
    </>
  );
}
