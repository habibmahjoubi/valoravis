"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { resetPassword } from "@/actions/auth";

function ResetForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  if (!token) {
    return (
      <div className="max-w-sm w-full text-center">
        <div className="text-4xl mb-4">{"\u{26A0}\uFE0F"}</div>
        <h1 className="text-xl font-bold mb-2">Lien invalide</h1>
        <p className="text-muted-foreground text-sm mb-6">
          Ce lien de reinitialisation est invalide ou a expire.
        </p>
        <Link
          href="/forgot-password"
          className="text-primary text-sm font-medium hover:underline"
        >
          Demander un nouveau lien
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-sm w-full text-center">
        <div className="text-4xl mb-4">{"\u2705"}</div>
        <h1 className="text-xl font-bold mb-2">
          Mot de passe reinitialise
        </h1>
        <p className="text-muted-foreground text-sm mb-6">
          Votre mot de passe a ete modifie avec succes.
        </p>
        <button
          onClick={() => router.push("/login")}
          className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-medium hover:opacity-90"
        >
          Se connecter
        </button>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    formData.set("token", token!);

    const result = await resetPassword(formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  }

  return (
    <div className="max-w-sm w-full">
      <div className="text-center mb-8">
        <Link href="/" className="text-2xl font-bold text-primary">
          AvisBoost
        </Link>
        <h1 className="text-xl font-semibold mt-4">
          Nouveau mot de passe
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Choisissez votre nouveau mot de passe
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium mb-1"
          >
            Nouveau mot de passe
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="8 caracteres minimum"
          />
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium mb-1"
          >
            Confirmer le mot de passe
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            minLength={8}
            className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Repetez le mot de passe"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-primary-foreground py-2 rounded-lg font-medium hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Reinitialisation..." : "Reinitialiser mon mot de passe"}
        </button>
      </form>

      <p className="text-center text-sm text-muted-foreground mt-6">
        <Link href="/login" className="text-primary font-medium">
          Retour a la connexion
        </Link>
      </p>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex-1 flex items-center justify-center px-4">
      <Suspense
        fallback={
          <div className="text-center text-muted-foreground">
            Chargement...
          </div>
        }
      >
        <ResetForm />
      </Suspense>
    </div>
  );
}
