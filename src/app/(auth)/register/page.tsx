import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { RegisterForm } from "./register-form";

export default async function RegisterPage() {
  const plans = await prisma.plan.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  const planOptions = plans.map((plan) => ({
    key: plan.key,
    name: plan.name,
    price: plan.price,
    quota: plan.quota,
    trialDays: plan.trialDays,
    label: plan.price === 0 ? "Gratuit" : formatPrice(plan.price) + "/mois",
    description:
      plan.price === 0
        ? `${plan.quota} envois/mois, sans carte bancaire`
        : plan.trialDays > 0
          ? `Essai gratuit ${plan.trialDays} jours, puis ${formatPrice(plan.price)}/mois`
          : `${formatPrice(plan.price)}/mois`,
  }));

  return (
    <div className="min-h-dvh w-full flex flex-col justify-start sm:justify-center px-4 pt-8 sm:pt-0 pb-8">
      <div className="w-full sm:max-w-md lg:max-w-lg sm:mx-auto sm:bg-card sm:border sm:border-border sm:rounded-2xl sm:shadow-sm sm:p-8 lg:p-10">
        <Suspense fallback={<div className="text-center text-muted-foreground">Chargement...</div>}>
          <RegisterForm plans={planOptions} />
        </Suspense>
      </div>
    </div>
  );
}
