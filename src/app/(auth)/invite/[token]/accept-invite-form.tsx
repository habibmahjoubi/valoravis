"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { acceptInvitation } from "@/actions/auth";
import { PasswordInput } from "@/components/ui/password-input";

export function AcceptInviteForm({
  token,
  email,
  establishmentName,
  role,
}: {
  token: string;
  email: string;
  establishmentName: string;
  role: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    formData.set("token", token);
    formData.set("email", email);

    const result = await acceptInvitation(formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    router.push("/login?message=Compte créé ! Connectez-vous pour accéder à votre établissement.");
  }

  return (
    <>
      <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg mb-6 text-center">
        <p className="text-sm text-muted-foreground">Vous rejoignez</p>
        <p className="text-base sm:text-lg font-bold text-primary mt-1 truncate">{establishmentName}</p>
        <p className="text-sm text-muted-foreground mt-1">en tant que <strong>{role}</strong></p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={email}
            readOnly
            className="w-full px-3 py-2.5 border border-border rounded-lg bg-muted text-muted-foreground text-sm"
          />
        </div>

        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1">Votre nom</label>
          <input
            id="name"
            name="name"
            type="text"
            required
            autoComplete="name"
            className="w-full px-3 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Jean Dupont"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1">Créer un mot de passe</label>
          <PasswordInput
            id="password"
            name="password"
            required
            minLength={8}
            placeholder="Min. 8 caractères, 1 majuscule, 1 chiffre"
            autoComplete="new-password"
          />
          <p className="text-[11px] text-muted-foreground mt-1">
            Minimum 8 caractères, une majuscule et un chiffre
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Création du compte..." : "Créer mon compte et rejoindre"}
        </button>
      </form>
    </>
  );
}
