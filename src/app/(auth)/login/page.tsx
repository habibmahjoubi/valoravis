"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

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

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Email ou mot de passe incorrect");
      setLoading(false);
      return;
    }

    router.push(callbackUrl);
  }

  return (
    <div className="max-w-sm w-full">
      <div className="text-center mb-8">
        <Link href="/" className="text-2xl font-bold text-primary">
          AvisBoost
        </Link>
        <h1 className="text-xl font-semibold mt-4">Connexion</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Connectez-vous a votre espace
        </p>
      </div>

      {justRegistered && (
        <div className="mb-4 p-3 bg-success/10 border border-success/20 rounded-lg text-sm text-success">
          Compte cree avec succes ! Connectez-vous ci-dessous.
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
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
            className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="vous@exemple.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1">
            Mot de passe
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Votre mot de passe"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-primary-foreground py-2 rounded-lg font-medium hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Connexion en cours..." : "Se connecter"}
        </button>
      </form>

      <p className="text-center text-sm mt-3">
        <Link
          href="/forgot-password"
          className="text-muted-foreground hover:text-primary"
        >
          Mot de passe oublie ?
        </Link>
      </p>

      <p className="text-center text-sm text-muted-foreground mt-6">
        Pas encore de compte ?{" "}
        <Link href="/register" className="text-primary font-medium">
          Creer un compte
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex-1 flex items-center justify-center px-4">
      <Suspense
        fallback={
          <div className="text-center text-muted-foreground">Chargement...</div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
