"use client";

import { useState } from "react";
import { addClient } from "@/actions/dashboard";

export function AddClientForm() {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="mb-6 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90"
      >
        + Ajouter un client
      </button>
    );
  }

  return (
    <form
      action={async (formData) => {
        await addClient(formData);
        setOpen(false);
      }}
      className="bg-card border border-border rounded-xl p-4 mb-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3"
    >
      <input
        name="name"
        required
        placeholder="Nom complet"
        className="px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
      />
      <input
        name="email"
        type="email"
        placeholder="Email"
        className="px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
      />
      <input
        name="phone"
        type="tel"
        placeholder="Telephone"
        className="px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
      />
      <input
        name="notes"
        placeholder="Notes (optionnel)"
        className="px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
      />
      <div className="flex gap-2">
        <button
          type="submit"
          className="flex-1 bg-primary text-primary-foreground px-3 py-2 rounded-lg text-sm font-medium hover:opacity-90"
        >
          Ajouter
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="px-3 py-2 border border-border rounded-lg text-sm hover:bg-muted"
        >
          Annuler
        </button>
      </div>
    </form>
  );
}
