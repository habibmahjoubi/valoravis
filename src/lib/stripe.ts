import Stripe from "stripe";
import { prisma } from "./prisma";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-03-31.basil",
});

// Fallback statique si la base n'est pas accessible
export const DEFAULT_PLANS = {
  free: { name: "Gratuit", quota: 50, price: 0 },
  pro: { name: "Pro", quota: 200, price: 29, priceId: process.env.STRIPE_PRICE_PRO! },
  business: { name: "Business", quota: 500, price: 59, priceId: process.env.STRIPE_PRICE_BUSINESS! },
} as const;

// Pour compatibilite avec le code existant
export const PLANS = DEFAULT_PLANS;

// Charger les plans depuis la base de donnees
export async function getPlans() {
  const plans = await prisma.plan.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  if (plans.length === 0) {
    // Fallback sur les plans par defaut
    return Object.entries(DEFAULT_PLANS).map(([key, plan]) => ({
      key,
      name: plan.name,
      price: plan.price,
      quota: plan.quota,
      stripePriceId: "priceId" in plan ? plan.priceId : null,
    }));
  }

  return plans.map((p) => ({
    key: p.key,
    name: p.name,
    price: p.price,
    quota: p.quota,
    stripePriceId: p.stripePriceId,
  }));
}

// Trouver un plan par sa cle
export async function getPlanByKey(key: string) {
  const plan = await prisma.plan.findUnique({ where: { key } });
  if (plan) return plan;

  // Fallback
  const fallback = DEFAULT_PLANS[key as keyof typeof DEFAULT_PLANS];
  if (fallback) return { key, ...fallback, stripePriceId: null };
  return null;
}
