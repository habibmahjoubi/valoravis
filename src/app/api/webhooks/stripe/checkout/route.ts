import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe, getPlanByKey } from "@/lib/stripe";
import { absoluteUrl } from "@/lib/utils";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUniqueOrThrow({ where: { id: session.user.id } });
  if (user.isSuspended) {
    return NextResponse.json({ error: "Compte suspendu" }, { status: 403 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const { plan } = body;
  if (!plan || typeof plan !== "string") {
    return NextResponse.json({ error: "Missing plan" }, { status: 400 });
  }

  const planConfig = await getPlanByKey(plan);
  if (!planConfig || planConfig.price <= 0 || !planConfig.stripePriceId) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: planConfig.stripePriceId, quantity: 1 }],
    client_reference_id: session.user.id,
    ...(user.stripeCustomerId ? { customer: user.stripeCustomerId } : {}),
    metadata: { userId: session.user.id, plan },
    success_url: absoluteUrl("/dashboard/billing?success=1"),
    cancel_url: absoluteUrl("/dashboard/billing?canceled=1"),
  });

  return NextResponse.json({ url: checkoutSession.url });
}
