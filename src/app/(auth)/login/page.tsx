"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { checkEmailVerificationStatus } from "@/actions/auth";
import { PasswordInput } from "@/components/ui/password-input";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const searchParams = useSearchParams();
  const router = useRouter();
  const justRegistered = searchParams.get("registered") === "1";
  const rawCallback = searchParams.get("callbackUrl");
  const callbackUrl =
    rawCallback && rawCallback.startsWith("/") && !rawCallback.startsWith("//")
      ? rawCallback
      : "/dashboard";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Honeypot check (field invisible, only bots fill it)
    const form = e.target as HTMLFormElement;
    const hp = (form.elements.namedItem("_hp_url") as HTMLInputElement)?.value;
    if (hp) { setLoading(false); return; }

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      // Vérifier si l'échec est dû à un email non vérifié
      const verif = await checkEmailVerificationStatus(email);
      if (verif.status === "unverified") {
        router.push(`/check-email?email=${encodeURIComponent(email)}`);
        return;
      }
      setError("Email ou mot de passe incorrect. Vérifiez vos identifiants ou créez un compte.");
      setLoading(false);
      return;
    }

    router.push(callbackUrl);
  }

  return (
    <>
      <div className="text-center mb-8">
        <Link href="/" className="text-2xl font-bold text-primary">
          Valoravis
        </Link>
        <h1 className="text-xl font-semibold mt-4">Connexion</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Connectez-vous à votre espace
        </p>
      </div>

      {justRegistered && (
        <div className="mb-4 p-3 bg-success/10 border border-success/20 rounded-lg text-sm text-success">
          Compte créé avec succès ! Connectez-vous ci-dessous.
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Honeypot anti-bot — invisible field, only bots fill it */}
        <div style={{ position: "absolute", left: "-9999px", height: 0, overflow: "hidden" }} aria-hidden="true">
          <input type="text" name="_hp_url" autoComplete="nope" tabIndex={-1} />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2.5 sm:py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="vous@exemple.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1">
            Mot de passe
          </label>
          <PasswordInput
            id="password"
            name="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Votre mot de passe"
            autoComplete="current-password"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Connexion en cours..." : "Se connecter"}
        </button>
      </form>

      <p className="text-center text-sm mt-3">
        <Link
          href="/forgot-password"
          className="text-muted-foreground hover:text-primary"
        >
          Mot de passe oublié ?
        </Link>
      </p>

      <p className="text-center text-sm text-muted-foreground mt-6">
        Pas encore de compte ?{" "}
        <Link href="/register" className="text-primary font-medium">
          Créer un compte
        </Link>
      </p>
    </>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-dvh w-full flex flex-col justify-start sm:justify-center px-4 pt-10 sm:pt-0 pb-8">
      <div className="w-full sm:max-w-md lg:max-w-lg sm:mx-auto sm:bg-card sm:border sm:border-border sm:rounded-2xl sm:shadow-sm sm:p-8 lg:p-10">
        <Suspense
          fallback={
            <div className="text-center text-muted-foreground">Chargement...</div>
          }
        >
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
