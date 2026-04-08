"use client";

import { useState } from "react";
import { updateClient } from "@/actions/dashboard";

export function EditClientForm({
  clientId,
  name,
  email,
  phone,
  notes,
}: {
  clientId: string;
  name: string;
  email: string | null;
  phone: string | null;
  notes: string | null;
}) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="px-2 py-1 text-xs text-primary hover:bg-primary/10 rounded"
        title="Modifier"
      >
        Modifier
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start sm:items-center justify-center z-50 px-4 pt-16 sm:pt-0">
      <form
        action={async (formData) => {
          await updateClient(formData);
          setOpen(false);
        }}
        className="bg-card border border-border rounded-xl p-4 md:p-6 w-full sm:max-w-md space-y-4"
      >
        <h3 className="font-semibold text-lg">Modifier le contact</h3>
        <input type="hidden" name="clientId" value={clientId} />
        <div>
          <label className="block text-sm font-medium mb-1">Nom</label>
          <input
            name="name"
            required
            defaultValue={name}
            className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            name="email"
            type="email"
            defaultValue={email || ""}
            className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Téléphone</label>
          <input
            name="phone"
            type="tel"
            defaultValue={phone || ""}
            className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Notes</label>
          <input
            name="notes"
            defaultValue={notes || ""}
            className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            className="flex-1 bg-primary text-primary-foreground px-3 py-2 rounded-lg text-sm font-medium hover:opacity-90"
          >
            Enregistrer
          </button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="px-4 py-2 border border-border rounded-lg text-sm hover:bg-muted"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
}
