"use client";

import { deleteClient } from "@/actions/dashboard";

export function DeleteClientButton({ clientId }: { clientId: string }) {
  return (
    <button
      onClick={async () => {
        if (confirm("Supprimer ce client ?")) {
          await deleteClient(clientId);
        }
      }}
      className="px-3 py-1.5 text-xs text-destructive hover:bg-destructive/10 rounded"
      title="Supprimer"
    >
      Supprimer
    </button>
  );
}
