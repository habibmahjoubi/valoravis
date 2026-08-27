import { prisma } from "@/lib/prisma";

const FREE_QUOTA = 50;

type ReconcilableUser = {
  id: string;
  plan: string;
  trialEndsAt: Date | null;
  cancelEffectiveAt: Date | null;
};

/**
 * Applique de façon idempotente les rétrogradations dues :
 * - essai gratuit expiré
 * - date d'annulation effective atteinte
 *
 * Appelé aux points d'entrée (layouts, routes de facturation) pour que
 * l'état du plan ne dépende pas d'une simple visite du dashboard.
 * Renvoie true si une rétrogradation a été appliquée.
 */
export async function reconcileUserSubscription(user: ReconcilableUser): Promise<boolean> {
  const now = new Date();

  const trialExpired =
    !!user.trialEndsAt && user.trialEndsAt <= now && user.plan !== "free";
  const cancelDue =
    !!user.cancelEffectiveAt && user.cancelEffectiveAt <= now && user.plan !== "free";

  if (!trialExpired && !cancelDue) return false;

  await prisma.user.update({
    where: { id: user.id },
    data: {
      plan: "free",
      monthlyQuota: FREE_QUOTA,
      quotaUsed: 0,
      ...(cancelDue ? { cancelRequestedAt: null, cancelEffectiveAt: null } : {}),
    },
  });
  return true;
}
