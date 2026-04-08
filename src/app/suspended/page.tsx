import Link from "next/link";
import { Ban } from "lucide-react";

export default function SuspendedPage() {
  return (
    <div className="min-h-dvh w-full flex flex-col justify-start sm:justify-center px-4 pt-12 sm:pt-0 pb-8">
      <div className="w-full sm:max-w-sm sm:mx-auto text-center">
        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
          <Ban className="w-8 h-8 text-destructive" />
        </div>
        <h1 className="text-xl font-bold mb-2">Compte suspendu</h1>
        <p className="text-muted-foreground text-sm mb-6">
          Votre compte à ete suspendu. Si vous pensez qu'il s'agit d'une erreur,
          veuillez contacter le support.
        </p>
        <Link
          href="/"
          className="text-primary text-sm font-medium hover:underline"
        >
          Retour à l'accueil
        </Link>
      </div>
    </div>
  );
}
