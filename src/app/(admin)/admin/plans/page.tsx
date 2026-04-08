import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import {
  EditPlanForm,
  TogglePlanButton,
} from "@/components/admin/edit-plan-form";
import { CreatePlanForm } from "@/components/admin/create-plan-form";

function formatLimit(value: number): string {
  return value === 0 ? "Illimité" : String(value);
}

export default async function AdminPlansPage() {
  const plans = await prisma.plan.findMany({
    orderBy: { sortOrder: "asc" },
  });

  const userCounts = await Promise.all(
    plans.map((p) =>
      prisma.user.count({ where: { plan: p.key, isAdmin: false } })
    )
  );

  const plansWithUsers = plans.map((p, i) => ({
    ...p,
    userCount: userCounts[i],
    revenue: p.price * userCounts[i],
  }));

  const mrr = plansWithUsers.reduce((sum, p) => sum + p.revenue, 0);
  const totalPaying = plansWithUsers
    .filter((p) => p.price > 0)
    .reduce((sum, p) => sum + p.userCount, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-xl sm:text-2xl font-bold">Offres & Plans</h1>
        <CreatePlanForm />
      </div>

      {/* Revenue */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <div className="bg-card border border-border rounded-xl p-6">
          <p className="text-sm text-muted-foreground">MRR (revenu mensuel)</p>
          <p className="text-2xl sm:text-3xl font-bold mt-1">{formatPrice(mrr)}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-6">
          <p className="text-sm text-muted-foreground">ARR (revenu annuel)</p>
          <p className="text-2xl sm:text-3xl font-bold mt-1">{formatPrice(mrr * 12)}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-6">
          <p className="text-sm text-muted-foreground">Abonnes payants</p>
          <p className="text-2xl sm:text-3xl font-bold mt-1">{totalPaying}</p>
        </div>
      </div>

      {/* Plans */}
      <div className="grid md:grid-cols-3 gap-4">
        {plansWithUsers.map((plan) => (
          <div
            key={plan.id}
            className={`border rounded-xl p-6 ${
              plan.isActive
                ? "bg-card border-border"
                : "bg-muted/50 border-border opacity-60"
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">{plan.name}</h3>
              <TogglePlanButton planId={plan.id} isActive={plan.isActive} />
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Cle</span>
                <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">
                  {plan.key}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Prix</span>
                <span className="font-medium">
                  {plan.price === 0
                    ? "Gratuit"
                    : `${formatPrice(plan.price)}/mois`}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Quota mensuel</span>
                <span className="font-medium">
                  {formatLimit(plan.quota)}
                  {plan.quota > 0 ? " envois" : ""}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Max utilisateurs</span>
                <span className="font-medium">
                  {formatLimit(plan.maxUsers)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Essai gratuit</span>
                <span className="font-medium">
                  {plan.trialDays > 0
                    ? `${plan.trialDays} jours`
                    : "Aucun"}
                </span>
              </div>
              <div className="flex justify-between text-sm border-t border-border pt-2 mt-2">
                <span className="text-muted-foreground">Utilisateurs</span>
                <span className="font-medium">{plan.userCount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Revenu mensuel</span>
                <span className="font-medium">
                  {formatPrice(plan.revenue)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Stripe Price ID</span>
                <span className="font-mono text-xs text-muted-foreground">
                  {plan.stripePriceId || "Non configure"}
                </span>
              </div>
            </div>

            <EditPlanForm plan={plan} />
          </div>
        ))}
      </div>
    </div>
  );
}
