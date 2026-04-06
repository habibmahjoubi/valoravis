import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { stripe, getPlans } from "@/lib/stripe";
import { formatPrice } from "@/lib/utils";
import { Sparkles, AlertTriangle } from "lucide-react";
import { UpgradeButton } from "@/components/dashboard/upgrade-button";
import { CancelButton } from "@/components/dashboard/cancel-button";
import { TrialButton } from "@/components/dashboard/trial-button";

export default async function BillingPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.user.id },
  });

  const plans = await getPlans();
  const currentPlan = plans.find((p) => p.key === user.plan) || plans[0];

  // Plans complets depuis la base (avec trialDays)
  const dbPlans = await prisma.plan.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  const isOnTrial = user.trialEndsAt && user.trialEndsAt > new Date();
  const trialExpired = user.trialEndsAt && user.trialEndsAt <= new Date();
  const hasUsedTrial = !!user.trialEndsAt;

  // Fetch subscription and invoices if paid user
  let subscription: { cancel_at_period_end: boolean; current_period_end: number } | null = null;
  let invoices: { id: string; created: number; amount_paid: number; status: string | null; invoice_pdf: string | null }[] = [];

  if (user.stripeCustomerId) {
    try {
      const subs = await stripe.subscriptions.list({
        customer: user.stripeCustomerId,
        limit: 1,
      });
      if (subs.data[0]) {
        subscription = {
          cancel_at_period_end: subs.data[0].cancel_at_period_end,
          current_period_end: subs.data[0].current_period_end,
        };
      }

      const inv = await stripe.invoices.list({
        customer: user.stripeCustomerId,
        limit: 10,
      });
      invoices = inv.data.map((i) => ({
        id: i.id,
        created: i.created,
        amount_paid: i.amount_paid,
        status: i.status,
        invoice_pdf: i.invoice_pdf,
      }));
    } catch {
      // Stripe not configured or customer not found
    }
  }

  const isPaid = user.plan !== "free";

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Abonnement</h1>

      {/* Current plan */}
      <div className="bg-card border border-border rounded-xl p-6 mb-8">
        <h2 className="font-semibold mb-2">Plan actuel</h2>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold">{formatPrice(currentPlan.price)}</span>
          <span className="text-muted-foreground">/mois</span>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Plan {currentPlan.name} — {user.quotaUsed}/{currentPlan.quota} envois
          utilises ce mois
        </p>
        <div className="mt-3 w-full bg-muted rounded-full h-2">
          <div
            className="bg-primary rounded-full h-2 transition-all"
            style={{
              width: `${Math.min((user.quotaUsed / currentPlan.quota) * 100, 100)}%`,
            }}
          />
        </div>

        {/* Trial status */}
        {isOnTrial && user.trialEndsAt && (
          <div className="mt-3 bg-primary/10 border border-primary/20 rounded-lg p-3">
            <p className="text-sm text-primary font-medium flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> Essai gratuit en cours
            </p>
            <p className="text-xs text-primary/80 mt-1">
              Votre essai se termine le{" "}
              {new Intl.DateTimeFormat("fr-FR", {
                day: "numeric",
                month: "long",
                year: "numeric",
              }).format(user.trialEndsAt)}
              . Passez a un abonnement payant pour continuer.
            </p>
          </div>
        )}

        {trialExpired && (
          <div className="mt-3 bg-warning/10 border border-warning/20 rounded-lg p-3">
            <p className="text-sm text-warning font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> Essai gratuit expire
            </p>
            <p className="text-xs text-warning/80 mt-1">
              Votre essai est termine. Souscrivez un abonnement pour continuer a utiliser les fonctionnalites avancees.
            </p>
          </div>
        )}

        {/* Subscription status */}
        {subscription?.cancel_at_period_end && (
          <p className="mt-3 text-sm text-warning">
            Votre abonnement sera annule le{" "}
            {new Intl.DateTimeFormat("fr-FR", {
              day: "numeric",
              month: "long",
              year: "numeric",
            }).format(new Date(subscription.current_period_end * 1000))}
          </p>
        )}

        {isPaid && !subscription?.cancel_at_period_end && (
          <div className="mt-4">
            <CancelButton />
          </div>
        )}
      </div>

      {/* Plans */}
      <h2 className="font-semibold mb-4">Changer de plan</h2>
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        {dbPlans.map((plan) => {
          const isCurrent = user.plan === plan.key;
          const canTrial =
            plan.trialDays > 0 && plan.price > 0 && !hasUsedTrial && !isCurrent;
          const canUpgrade =
            plan.price > 0 && !canTrial && !isCurrent && plan.stripePriceId;

          return (
            <div
              key={plan.key}
              className={`border rounded-xl p-5 ${
                isCurrent
                  ? "border-primary ring-2 ring-primary bg-primary/5"
                  : "border-border bg-card"
              }`}
            >
              <h3 className="font-semibold">{plan.name}</h3>
              <div className="my-3">
                {plan.price === 0 ? (
                  <span className="text-2xl font-bold">Gratuit</span>
                ) : (
                  <>
                    <span className="text-2xl font-bold">
                      {formatPrice(plan.price)}
                    </span>
                    <span className="text-muted-foreground text-sm">/mois</span>
                  </>
                )}
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                {plan.quota === 0
                  ? "Envois illimites"
                  : `${plan.quota} envois/mois`}
              </p>

              {isCurrent ? (
                <span className="block text-center py-2 text-sm text-primary font-medium">
                  Plan actuel
                  {isOnTrial && " (essai)"}
                </span>
              ) : canTrial ? (
                <TrialButton
                  planKey={plan.key}
                  planName={plan.name}
                  trialDays={plan.trialDays}
                />
              ) : canUpgrade ? (
                <UpgradeButton planKey={plan.key} planName={plan.name} />
              ) : plan.price === 0 ? null : (
                <span className="block text-center py-2 text-sm text-muted-foreground">
                  {hasUsedTrial
                    ? "Essai deja utilise"
                    : "Contactez-nous"}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Invoice History */}
      <h2 className="font-semibold mb-4">Historique des paiements</h2>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {invoices.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            Aucun paiement enregistre.
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">
                  Date
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">
                  Montant
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">
                  Statut
                </th>
                <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">
                  Facture
                </th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr
                  key={inv.id}
                  className="border-b border-border last:border-0"
                >
                  <td className="px-4 py-3 text-sm">
                    {new Intl.DateTimeFormat("fr-FR", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    }).format(new Date(inv.created * 1000))}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium">
                    {(inv.amount_paid / 100).toFixed(2)} EUR
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        inv.status === "paid"
                          ? "bg-success/10 text-success"
                          : "bg-warning/10 text-warning"
                      }`}
                    >
                      {inv.status === "paid" ? "Paye" : inv.status || "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {inv.invoice_pdf && (
                      <a
                        href={inv.invoice_pdf}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline"
                      >
                        Telecharger PDF
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
