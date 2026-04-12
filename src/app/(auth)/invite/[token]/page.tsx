export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { AcceptInviteForm } from "./accept-invite-form";
import Link from "next/link";

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  // Look up the invitation
  let invitation: {
    token: string;
    email: string;
    establishmentName: string;
    role: string;
    expired: boolean;
  } | null = null;

  try {
    const inv = await prisma.establishmentInvitation.findUnique({
      where: { token },
      include: { establishment: true },
    });

    if (inv) {
      invitation = {
        token,
        email: inv.email,
        establishmentName: inv.establishment.name,
        role: inv.role === "ADMIN" ? "Administrateur" : "Membre",
        expired: inv.expires < new Date(),
      };
    }
  } catch { /* ignore */ }

  // Check if the invited email already has an account
  let hasAccount = false;
  if (invitation && !invitation.expired) {
    const existing = await prisma.user.findUnique({
      where: { email: invitation.email },
    });
    hasAccount = !!existing;
  }

  return (
    <div className="min-h-dvh w-full flex flex-col justify-start sm:justify-center px-4 pt-8 sm:pt-0 pb-8">
      <div className="w-full max-w-md mx-auto sm:bg-card sm:border sm:border-border sm:rounded-2xl sm:shadow-sm sm:p-8 lg:p-10">
        <div className="text-center mb-6">
          <Link href="/" className="text-2xl font-bold text-primary">
            Valoravis
          </Link>
        </div>

        {!invitation && (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">Invitation introuvable ou déjà utilisée.</p>
            <Link href="/login" className="text-primary hover:underline font-medium">
              Se connecter
            </Link>
          </div>
        )}

        {invitation?.expired && (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">Cette invitation a expiré.</p>
            <p className="text-sm text-muted-foreground">Demandez à l&apos;administrateur de vous renvoyer une invitation.</p>
          </div>
        )}

        {invitation && !invitation.expired && hasAccount && (
          <div className="text-center py-8">
            <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg mb-6">
              <p className="font-medium">Vous êtes invité à rejoindre</p>
              <p className="text-base sm:text-lg font-bold text-primary mt-1 truncate">{invitation.establishmentName}</p>
              <p className="text-sm text-muted-foreground mt-1">en tant que {invitation.role}</p>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Vous avez déjà un compte avec cette adresse email.
            </p>
            <Link
              href={`/login?callbackUrl=${encodeURIComponent(`/invite/${token}/accept`)}`}
              className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:opacity-90"
            >
              Se connecter pour rejoindre
            </Link>
          </div>
        )}

        {invitation && !invitation.expired && !hasAccount && (
          <AcceptInviteForm
            token={invitation.token}
            email={invitation.email}
            establishmentName={invitation.establishmentName}
            role={invitation.role}
          />
        )}
      </div>
    </div>
  );
}
