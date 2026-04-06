import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { stripe, PLANS } from "@/lib/stripe";
import { absoluteUrl } from "@/lib/utils";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { plan } = await request.json();
  const planConfig = PLANS[plan as keyof typeof PLANS];

  if (!planConfig || !("priceId" in planConfig)) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [
      {
        price: planConfig.priceId,
        quantity: 1,
      },
    ],
    metadata: {
      userId: session.user.id,
      plan,
    },
    success_url: absoluteUrl("/dashboard/billing?success=1"),
    cancel_url: absoluteUrl("/dashboard/billing?canceled=1"),
  });

  return NextResponse.json({ url: checkoutSession.url });
}
