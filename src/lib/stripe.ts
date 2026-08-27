import Stripe from "stripe";
import { prisma } from "./prisma";

// Construction paresseuse : ne pas exiger la clé au moment du build.
let _stripe: Stripe | null = null;
function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY manquant");
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-03-31.basil",
    });
  }
  return _stripe;
}

// Proxy : conserve l'API `stripe.xxx.yyy(...)` sans construire le client au build.
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    const c = getStripe() as unknown as Record<string | symbol, unknown>;
    const v = c[prop];
    return typeof v === "function" ? v.bind(c) : v;
  },
});

// Fallback statique UNIQUEMENT si la table Plan est vide/inaccessible.
// La source de vérité est la table `Plan` en base (voir getPlanByKey / getPlans).
export const DEFAULT_PLANS = {
  free: { name: "Gratuit", quota: 50, price: 0 },
  pro: { name: "Pro", quota: 100, price: 29, priceId: process.env.STRIPE_PRICE_PRO! },
  business: { name: "Business", quota: 500, price: 79, priceId: process.env.STRIPE_PRICE_BUSINESS! },
} as const;

// Pour compatibilite avec le code existant
export const PLANS = DEFAULT_PLANS;

// Repli : si la ligne Plan existe mais sans stripePriceId, utiliser la variable
// d'environnement historique (STRIPE_PRICE_PRO / STRIPE_PRICE_BUSINESS).
function priceIdFor(key: string, dbValue: string | null): string | null {
  if (dbValue) return dbValue;
  const env = process.env[`STRIPE_PRICE_${key.toUpperCase()}`];
  return env || null;
}

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
    stripePriceId: priceIdFor(p.key, p.stripePriceId),
  }));
}

// Trouver un plan par sa cle. Retourne toujours une forme homogène
// { key, name, price, quota, trialDays, stripePriceId }.
export async function getPlanByKey(key: string) {
  const plan = await prisma.plan.findUnique({ where: { key } });
  if (plan) {
    return {
      key: plan.key,
      name: plan.name,
      price: plan.price,
      quota: plan.quota,
      trialDays: plan.trialDays,
      stripePriceId: priceIdFor(plan.key, plan.stripePriceId),
    };
  }

  // Fallback
  const fallback = DEFAULT_PLANS[key as keyof typeof DEFAULT_PLANS];
  if (fallback) {
    return {
      key,
      name: fallback.name,
      price: fallback.price,
      quota: fallback.quota,
      trialDays: 0,
      stripePriceId: "priceId" in fallback ? fallback.priceId : null,
    };
  }
  return null;
}
