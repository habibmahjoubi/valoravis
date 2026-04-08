"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { resetPassword } from "@/actions/auth";
import { PasswordInput } from "@/components/ui/password-input";
import { AlertTriangle, CheckCircle } from "lucide-react";

function ResetForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  if (!token) {
    return (
      <div className="text-center">
        <div className="w-14 h-14 rounded-full bg-warning/10 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-7 h-7 text-warning" />
        </div>
        <h1 className="text-xl font-bold mb-2">Lien invalide</h1>
        <p className="text-muted-foreground text-sm mb-6">
          Ce lien de réinitialisation est invalide ou à expire.
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
      <div className="text-center">
        <div className="w-14 h-14 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-7 h-7 text-success" />
        </div>
        <h1 className="text-xl font-bold mb-2">
          Mot de passe réinitialisé
        </h1>
        <p className="text-muted-foreground text-sm mb-6">
          Votre mot de passe a été modifié avec succès.
        </p>
        <button
          onClick={() => router.push("/login")}
          className="bg-primary text-primary-foreground px-4 sm:px-6 py-2 rounded-lg font-medium hover:opacity-90 text-sm sm:text-base"
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
    <>
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
          <PasswordInput
            id="password"
            name="password"
            required
            minLength={8}
            placeholder="Min. 8 caractères, 1 majuscule, 1 chiffre"
          />
          <p className="text-[11px] text-muted-foreground mt-1">
            Minimum 8 caractères, une majuscule et un chiffre
          </p>
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium mb-1"
          >
            Confirmer le mot de passe
          </label>
          <PasswordInput
            id="confirmPassword"
            name="confirmPassword"
            required
            minLength={8}
            placeholder="Répétez le mot de passe"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-primary-foreground py-2 rounded-lg font-medium hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Réinitialisation..." : "Réinitialiser le mot de passe"}
        </button>
      </form>

      <p className="text-center text-sm text-muted-foreground mt-6">
        <Link href="/login" className="text-primary font-medium">
          Retour à la connexion
        </Link>
      </p>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-dvh w-full flex flex-col justify-start sm:justify-center px-4 pt-10 sm:pt-0 pb-8">
      <div className="w-full sm:max-w-sm sm:mx-auto">
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
    </div>
  );
}
