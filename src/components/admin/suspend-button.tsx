"use client";

import { toggleSuspendUser, deleteUser, resetUserQuota } from "@/actions/admin";

export function SuspendButton({
  userId,
  isSuspended,
}: {
  userId: string;
  isSuspended: boolean;
}) {
  async function handleClick() {
    const action = isSuspended ? "reactiver" : "suspendre";
    if (!confirm(`Voulez-vous ${action} cet utilisateur ?`)) return;
    await toggleSuspendUser(userId);
  }

  return (
    <button
      onClick={handleClick}
      className={`px-2 py-1 rounded text-xs font-medium ${
        isSuspended
          ? "bg-success/10 text-success hover:bg-success/20"
          : "bg-warning/10 text-warning hover:bg-warning/20"
      }`}
    >
      {isSuspended ? "Reactiver" : "Suspendre"}
    </button>
  );
}

export function DeleteUserButton({ userId }: { userId: string }) {
  async function handleClick() {
    if (
      !confirm(
        "ATTENTION : Cette action est irreversible. Supprimer cet utilisateur et toutes ses donnees ?"
      )
    )
      return;
    await deleteUser(userId);
  }

  return (
    <button
      onClick={handleClick}
      className="px-2 py-1 rounded text-xs font-medium bg-destructive/10 text-destructive hover:bg-destructive/20"
    >
      Supprimer
    </button>
  );
}

export function ResetQuotaButton({ userId }: { userId: string }) {
  async function handleClick() {
    if (!confirm("Réinitialiser le quota de cet utilisateur à 0 ?")) return;
    await resetUserQuota(userId);
  }

  return (
    <button
      onClick={handleClick}
      className="px-2 py-1 rounded text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20"
      title="Réinitialiser le quota"
    >
      Reset quota
    </button>
  );
}
