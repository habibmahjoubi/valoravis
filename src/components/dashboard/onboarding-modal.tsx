"use client";

import { completeOnboarding } from "@/actions/dashboard";
import { GooglePlaceField } from "./google-place-field";
import { Stethoscope, Bone, Wrench } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const NICHES: { value: string; label: string; Icon: LucideIcon }[] = [
  { value: "DENTIST", label: "Cabinet dentaire", Icon: Stethoscope },
  { value: "OSTEOPATH", label: "Ostéopathie", Icon: Bone },
  { value: "GARAGE", label: "Garage auto", Icon: Wrench },
];

export function OnboardingModal({ defaultNiche }: { defaultNiche: string }) {
  return (
    <div className="max-w-md mx-auto mt-12">
      <h1 className="text-2xl font-bold mb-2">Bienvenue sur AvisBoost !</h1>
      <p className="text-muted-foreground mb-6">
        Configurez votre établissement en 30 secondes.
      </p>

      <form action={completeOnboarding} className="space-y-5">
        <div>
          <label className="block text-sm font-medium mb-1">
            Nom de votre établissement
          </label>
          <input
            name="businessName"
            required
            className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Cabinet Dentaire du Parc"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Votre métier
          </label>
          <div className="grid grid-cols-3 gap-2">
            {NICHES.map((niche) => (
              <label key={niche.value} className="cursor-pointer">
                <input
                  type="radio"
                  name="niche"
                  value={niche.value}
                  defaultChecked={niche.value === defaultNiche}
                  className="peer sr-only"
                />
                <div className="p-3 rounded-lg border border-border text-center text-sm peer-checked:border-primary peer-checked:ring-2 peer-checked:ring-primary hover:border-primary/50 transition-colors">
                  <niche.Icon className="w-6 h-6 mx-auto mb-1 text-primary" />
                  <div className="text-xs">{niche.label}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        <GooglePlaceField defaultValue="" />

        <div>
          <label className="block text-sm font-medium mb-1">
            Téléphone de l'établissement (pour les SMS)
          </label>
          <input
            name="phone"
            type="tel"
            className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="+33 6 12 34 56 78"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-primary text-primary-foreground py-2 rounded-lg font-medium hover:opacity-90"
        >
          Commencer à collecter des avis
        </button>
      </form>
    </div>
  );
}
