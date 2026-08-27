import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe, getPlanByKey, getPlans } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

const FREE_QUOTA = 50;

async function quotaFor(planKey: string): Promise<number> {
  const plan = await getPlanByKey(planKey);
  if (!plan) return FREE_QUOTA;
  return plan.quota === 0 ? 999999 : plan.quota;
}

export async function POST(request: Request) {
  let body: string;
  try {
    body = await request.text();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const sig = request.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Idempotence : Stripe rejoue les webhooks. On n'agit qu'une fois par event.
  try {
    await prisma.stripeEvent.create({ data: { id: event.id, type: event.type } });
  } catch {
    // Clé primaire déjà présente → déjà traité
    return NextResponse.json({ received: true, duplicate: true });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      if (session.payment_status !== "paid" && session.payment_status !== "no_payment_required") {
        break;
      }
      const userId = session.metadata?.userId;
      const planKey = session.metadata?.plan;
      if (!userId || !planKey) break;

      const plan = await getPlanByKey(planKey);
      if (!plan) break;

      await prisma.user.update({
        where: { id: userId },
        data: {
          stripeCustomerId: session.customer as string,
          stripeSubscriptionId:
            typeof session.subscription === "string" ? session.subscription : null,
          plan: planKey,
          monthlyQuota: await quotaFor(planKey),
          // une nouvelle souscription annule toute demande d'annulation en cours
          cancelRequestedAt: null,
          cancelEffectiveAt: null,
        },
      });
      break;
    }

    case "invoice.paid": {
      const invoice = event.data.object;
      const customerId = invoice.customer as string;
      if (!customerId) break;
      await prisma.user.updateMany({
        where: { stripeCustomerId: customerId },
        data: { quotaUsed: 0 },
      });
      break;
    }

    case "customer.subscription.updated": {
      const sub = event.data.object;
      const customerId = sub.customer as string;
      if (!customerId) break;

      const active = sub.status === "active" || sub.status === "trialing";
      const priceId = sub.items.data[0]?.price?.id;

      if (!active) {
        // past_due / unpaid / canceled / incomplete_expired → rétrograder
        await prisma.user.updateMany({
          where: { stripeCustomerId: customerId },
          data: { plan: "free", monthlyQuota: FREE_QUOTA },
        });
        break;
      }

      // Toujours actif : répercuter un éventuel changement de formule
      if (priceId) {
        const plans = await getPlans();
        const matched = plans.find((p) => p.stripePriceId === priceId);
        if (matched) {
          await prisma.user.updateMany({
            where: { stripeCustomerId: customerId },
            data: { plan: matched.key, monthlyQuota: await quotaFor(matched.key) },
          });
        }
      }
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object;
      const customerId = subscription.customer as string;
      if (!customerId) break;
      await prisma.user.updateMany({
        where: { stripeCustomerId: customerId },
        data: {
          plan: "free",
          monthlyQuota: FREE_QUOTA,
          stripeSubscriptionId: null,
          cancelRequestedAt: null,
          cancelEffectiveAt: null,
        },
      });
      break;
    }
  }

  return NextResponse.json({ received: true });
}
