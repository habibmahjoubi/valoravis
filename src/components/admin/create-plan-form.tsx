"use client";

import { useState } from "react";
import { createPlan } from "@/actions/admin";

export function CreatePlanForm() {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90"
      >
        + Ajouter un plan
      </button>
    );
  }

  return (
    <form
      action={async (formData) => {
        await createPlan(formData);
        setOpen(false);
      }}
      className="bg-card border border-border rounded-xl p-4 grid grid-cols-2 md:grid-cols-5 gap-3 items-end"
    >
      <div>
        <label className="block text-xs text-muted-foreground mb-1">
          Cle (unique)
        </label>
        <input
          name="key"
          required
          placeholder="ex: starter"
          className="w-full px-2 py-1.5 border border-border rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
      <div>
        <label className="block text-xs text-muted-foreground mb-1">Nom</label>
        <input
          name="name"
          required
          placeholder="ex: Starter"
          className="w-full px-2 py-1.5 border border-border rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
      <div>
        <label className="block text-xs text-muted-foreground mb-1">
          Prix (EUR)
        </label>
        <input
          name="price"
          type="number"
          min="0"
          required
          placeholder="0"
          className="w-full px-2 py-1.5 border border-border rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
      <div>
        <label className="block text-xs text-muted-foreground mb-1">
          Quota
        </label>
        <input
          name="quota"
          type="number"
          min="1"
          required
          placeholder="50"
          className="w-full px-2 py-1.5 border border-border rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          className="px-3 py-1.5 bg-primary text-primary-foreground rounded text-sm font-medium hover:opacity-90"
        >
          Creer
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="px-3 py-1.5 border border-border rounded text-sm hover:bg-muted"
        >
          Annuler
        </button>
      </div>
    </form>
  );
}
