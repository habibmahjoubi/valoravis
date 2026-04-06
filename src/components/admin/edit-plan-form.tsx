"use client";

import { useState } from "react";
import { updatePlan, togglePlanActive } from "@/actions/admin";

export function EditPlanForm({
  plan,
}: {
  plan: {
    id: string;
    key: string;
    name: string;
    price: number;
    quota: number;
    maxUsers: number;
    trialDays: number;
    stripePriceId: string | null;
    isActive: boolean;
  };
}) {
  const [editing, setEditing] = useState(false);
  const [priceValue, setPriceValue] = useState(
    plan.price.toString().replace(".", ",")
  );

  if (!editing) {
    return (
      <button
        onClick={() => setEditing(true)}
        className="text-xs text-primary hover:underline"
      >
        Modifier
      </button>
    );
  }

  return (
    <form
      action={async (formData) => {
        await updatePlan(formData);
        setEditing(false);
      }}
      className="space-y-3 mt-3 pt-3 border-t border-border"
    >
      <input type="hidden" name="planId" value={plan.id} />

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-muted-foreground mb-1">
            Nom
          </label>
          <input
            name="name"
            defaultValue={plan.name}
            required
            className="w-full px-2 py-1.5 border border-border rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <label className="block text-xs text-muted-foreground mb-1">
            Prix (EUR/mois)
          </label>
          <input
            name="price"
            type="text"
            value={priceValue}
            onChange={(e) => {
              const v = e.target.value.replace(/[^0-9.,]/g, "");
              setPriceValue(v);
            }}
            required
            placeholder="9,99"
            className="w-full px-2 py-1.5 border border-border rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <label className="block text-xs text-muted-foreground mb-1">
            Quota mensuel
          </label>
          <input
            name="quota"
            type="number"
            min="0"
            defaultValue={plan.quota}
            required
            className="w-full px-2 py-1.5 border border-border rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <p className="text-[10px] text-muted-foreground mt-0.5">
            0 = illimite
          </p>
        </div>
        <div>
          <label className="block text-xs text-muted-foreground mb-1">
            Max utilisateurs
          </label>
          <input
            name="maxUsers"
            type="number"
            min="0"
            defaultValue={plan.maxUsers}
            required
            className="w-full px-2 py-1.5 border border-border rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <p className="text-[10px] text-muted-foreground mt-0.5">
            0 = illimite
          </p>
        </div>
        <div>
          <label className="block text-xs text-muted-foreground mb-1">
            Jours d'essai gratuit
          </label>
          <input
            name="trialDays"
            type="number"
            min="0"
            defaultValue={plan.trialDays}
            required
            className="w-full px-2 py-1.5 border border-border rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <p className="text-[10px] text-muted-foreground mt-0.5">
            0 = pas d'essai
          </p>
        </div>
        <div className="col-span-2">
          <label className="block text-xs text-muted-foreground mb-1">
            Stripe Price ID
          </label>
          <input
            name="stripePriceId"
            defaultValue={plan.stripePriceId || ""}
            placeholder="price_..."
            className="w-full px-2 py-1.5 border border-border rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          className="px-3 py-1.5 bg-primary text-primary-foreground rounded text-xs font-medium hover:opacity-90"
        >
          Enregistrer
        </button>
        <button
          type="button"
          onClick={() => setEditing(false)}
          className="px-3 py-1.5 border border-border rounded text-xs hover:bg-muted"
        >
          Annuler
        </button>
      </div>
    </form>
  );
}

export function TogglePlanButton({
  planId,
  isActive,
}: {
  planId: string;
  isActive: boolean;
}) {
  return (
    <button
      onClick={() => togglePlanActive(planId)}
      className={`text-xs px-2 py-1 rounded font-medium ${
        isActive
          ? "bg-success/10 text-success"
          : "bg-muted text-muted-foreground"
      }`}
    >
      {isActive ? "Actif" : "Inactif"}
    </button>
  );
}
