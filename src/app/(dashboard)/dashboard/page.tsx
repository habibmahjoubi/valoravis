import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { NICHE_CONFIGS } from "@/config/niches";
import { formatDate } from "@/lib/utils";
import { OnboardingModal } from "@/components/dashboard/onboarding-modal";
import { PeriodSelector } from "@/components/dashboard/period-selector";
import { Suspense } from "react";
import { Users, Send, MousePointerClick, Star, Stethoscope, Bone, Wrench, Building2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Niche } from "@/generated/prisma/enums";

const NICHE_ICONS: Record<Niche, LucideIcon> = {
  DENTIST: Stethoscope,
  OSTEOPATH: Bone,
  GARAGE: Wrench,
  OTHER: Building2,
};

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ onboard?: string; niche?: string; period?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const params = await searchParams;
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.user.id },
  });

  if (!user.onboarded || params.onboard === "1") {
    return <OnboardingModal defaultNiche={params.niche || "DENTIST"} />;
  }

  const rawDays = Number(params.period);
  const days = [7, 30, 90].includes(rawDays) ? rawDays : 30;
  const periodStart = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const periodFilter = { createdAt: { gte: periodStart } };

  const [totalClients, totalSent, totalClicked, totalReviewed, recentRequests] =
    await Promise.all([
      prisma.client.count({ where: { userId: user.id } }),
      prisma.reviewRequest.count({
        where: {
          userId: user.id,
          status: { in: ["SENT", "CLICKED", "REVIEWED"] },
          ...periodFilter,
        },
      }),
      prisma.reviewRequest.count({
        where: {
          userId: user.id,
          status: { in: ["CLICKED", "REVIEWED"] },
          ...periodFilter,
        },
      }),
      prisma.reviewRequest.count({
        where: { userId: user.id, status: "REVIEWED", ...periodFilter },
      }),
      prisma.reviewRequest.findMany({
        where: { userId: user.id, ...periodFilter },
        include: { client: true },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
    ]);

  const clickRate =
    totalSent > 0 ? Math.round((totalClicked / totalSent) * 100) : 0;
  const nicheConfig = NICHE_CONFIGS[user.niche];
  const vocab = nicheConfig.vocabulary;

  const stats: { label: string; value: string | number; Icon: LucideIcon }[] = [
    { label: vocab.clients.charAt(0).toUpperCase() + vocab.clients.slice(1), value: totalClients, Icon: Users },
    { label: "Envois", value: `${user.quotaUsed}/${user.monthlyQuota}`, Icon: Send },
    { label: "Taux de clic", value: `${clickRate}%`, Icon: MousePointerClick },
    { label: "Avis obtenus", value: totalReviewed, Icon: Star },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            {(() => { const NIcon = NICHE_ICONS[user.niche]; return <NIcon className="w-6 h-6 text-primary" />; })()}
            {user.businessName || "Mon établissement"}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {nicheConfig.label} — Plan {user.plan}
          </p>
        </div>
        <Suspense>
          <PeriodSelector />
        </Suspense>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-card border border-border rounded-xl p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">{stat.label}</span>
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <stat.Icon className="w-4 h-4 text-primary" />
              </div>
            </div>
            <p className="text-2xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Recent activity */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h2 className="font-semibold mb-4">
          Activité récente ({days} derniers jours)
        </h2>
        {recentRequests.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            Aucune activité sur cette période. Ajoutez des {vocab.clients} et
            envoyez votre première demande d'avis !
          </p>
        ) : (
          <div className="space-y-3">
            {recentRequests.map((req) => (
              <div
                key={req.id}
                className="flex items-center justify-between py-2 border-b border-border last:border-0"
              >
                <div>
                  <p className="text-sm font-medium">{req.client.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {req.channel} — {formatDate(req.createdAt)}
                  </p>
                </div>
                <StatusBadge status={req.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    PENDING: { label: "En attente", className: "bg-warning/10 text-warning" },
    SENT: { label: "Envoyé", className: "bg-primary/10 text-primary" },
    CLICKED: { label: "Cliqué", className: "bg-success/10 text-success" },
    REVIEWED: {
      label: "Avis laissé",
      className: "bg-success/10 text-success",
    },
    FEEDBACK: {
      label: "Feedback",
      className: "bg-muted text-muted-foreground",
    },
    FAILED: {
      label: "Échoué",
      className: "bg-destructive/10 text-destructive",
    },
  };

  const c = config[status] || config.PENDING;

  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${c.className}`}
    >
      {c.label}
    </span>
  );
}
