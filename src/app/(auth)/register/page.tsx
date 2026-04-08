"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { registerUser } from "@/actions/auth";
import { Stethoscope, Bone, Wrench } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const NICHES: { value: string; label: string; Icon: LucideIcon }[] = [
  { value: "DENTIST", label: "Cabinet dentaire", Icon: Stethoscope },
  { value: "OSTEOPATH", label: "Cabinet d'ostéopathie", Icon: Bone },
  { value: "GARAGE", label: "Garage automobile", Icon: Wrench },
];

const PLAN_LABELS: Record<string, { label: string; description: string }> = {
  free: {
    label: "Gratuit",
    description: "50 envois/mois, sans carte bancaire",
  },
  pro: {
    label: "Pro",
    description: "Essai gratuit 14 jours, puis 29\u20AC/mois",
  },
  business: {
    label: "Business",
    description: "Essai gratuit 14 jours, puis 59\u20AC/mois",
  },
};

function RegisterForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedNiche, setSelectedNiche] = useState("DENTIST");
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedPlan = searchParams.get("plan") || "free";
  const planInfo = PLAN_LABELS[selectedPlan] || PLAN_LABELS.free;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    formData.set("niche", selectedNiche);
    formData.set("plan", selectedPlan);

    const result = await registerUser(formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    router.push("/login?registered=1");
  }

  return (
    <div className="max-w-sm w-full">
      <div className="text-center mb-8">
        <Link href="/" className="text-2xl font-bold text-primary">
          AvisBoost
        </Link>
        <h1 className="text-xl font-semibold mt-4">Créer votre compte</h1>

        {/* Plan sélectionné */}
        <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-lg">
          <span className="text-sm font-medium text-primary">
            Plan {planInfo.label}
          </span>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          {planInfo.description}
        </p>

        {/* Changer de plan */}
        {selectedPlan !== "free" && (
          <div className="mt-2 flex justify-center gap-2 text-xs">
            <Link
              href="/register?plan=free"
              className={`px-2 py-1 rounded ${
                selectedPlan === "free"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Gratuit
            </Link>
            <Link
              href="/register?plan=pro"
              className={`px-2 py-1 rounded ${
                selectedPlan === "pro"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Pro
            </Link>
            <Link
              href="/register?plan=business"
              className={`px-2 py-1 rounded ${
                selectedPlan === "business"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Business
            </Link>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium mb-2">
            Votre métier
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
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
                <niche.Icon className="w-6 h-6 mx-auto mb-1 text-primary" />
                <div className="text-xs leading-tight">{niche.label}</div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1">
            Nom complet
          </label>
          <input
            id="name"
            name="name"
            type="text"
            className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Jean Dupont"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">
            Email professionnel
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="vous@cabinet.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1">
            Mot de passe
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="8 caractères minimum"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-primary-foreground py-2 rounded-lg font-medium hover:opacity-90 disabled:opacity-50"
        >
          {loading
            ? "Création en cours..."
            : selectedPlan === "free"
              ? "Commencer gratuitement"
              : `Démarrer l'essai gratuit ${planInfo.label}`}
        </button>

        {selectedPlan !== "free" && (
          <p className="text-xs text-muted-foreground text-center">
            Aucune carte bancaire requise pour l'essai
          </p>
        )}
      </form>

      <p className="text-center text-sm text-muted-foreground mt-6">
        Déjà un compte ?{" "}
        <Link href="/login" className="text-primary font-medium">
          Se connecter
        </Link>
      </p>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="flex-1 flex items-center justify-center px-4 py-8">
      <Suspense
        fallback={
          <div className="text-center text-muted-foreground">Chargement...</div>
        }
      >
        <RegisterForm />
      </Suspense>
    </div>
  );
}
