export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

/**
 * This page is hit when an existing user logs in via the invite flow.
 * It accepts the invitation and redirects to the dashboard.
 */
export default async function AcceptInvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=${encodeURIComponent(`/invite/${token}/accept`)}`);
  }

  try {
    const inv = await prisma.establishmentInvitation.findUnique({
      where: { token },
    });

    // L'invitation ne peut être acceptée que par le compte dont l'email
    // correspond exactement à celui invité.
    const sessionUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { email: true },
    });
    const emailMatches =
      !!sessionUser &&
      !!inv &&
      sessionUser.email.toLowerCase() === inv.email.toLowerCase();

    if (inv && emailMatches && inv.expires > new Date()) {
      // Check not already a member
      const existing = await prisma.establishmentMember.findUnique({
        where: {
          userId_establishmentId: {
            userId: session.user.id,
            establishmentId: inv.establishmentId,
          },
        },
      });

      if (!existing) {
        await prisma.establishmentMember.create({
          data: {
            userId: session.user.id,
            establishmentId: inv.establishmentId,
            role: inv.role,
          },
        });
      }

      // Delete the used invitation
      await prisma.establishmentInvitation.delete({
        where: { id: inv.id },
      });

      // Set current establishment cookie
      const cookieStore = await cookies();
      cookieStore.set("current-establishment-id", inv.establishmentId, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
      });
    }
  } catch { /* ignore */ }

  redirect("/dashboard");
}
