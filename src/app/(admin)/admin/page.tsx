import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate, formatPrice } from "@/lib/utils";
import {
  Users,
  Banknote,
  Send,
  Star,
  TrendingUp,
  AlertTriangle,
  AlertCircle,
  UserPlus,
  Mail,
  Stethoscope,
  Bone,
  Wrench,
  Building2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export default async function AdminDashboard() {
  const now = new Date();
  const in3Days = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    activeUsers,
    suspendedUsers,
    freeUsers,
    proUsers,
    businessUsers,
    dentistUsers,
    osteopathUsers,
    garageUsers,
    otherUsers,
    totalRequests,
    totalSent,
    totalClicked,
    totalReviewed,
    totalFeedback,
    recentSignups,
    recentRequests,
    expiringTrials,
    expiredTrials,
    plans,
  ] = await Promise.all([
    prisma.user.count({ where: { isAdmin: false } }),
    prisma.user.count({ where: { isAdmin: false, isSuspended: false } }),
    prisma.user.count({ where: { isAdmin: false, isSuspended: true } }),
    prisma.user.count({ where: { isAdmin: false, plan: "free" } }),
    prisma.user.count({ where: { isAdmin: false, plan: "pro" } }),
    prisma.user.count({ where: { isAdmin: false, plan: "business" } }),
    prisma.user.count({ where: { isAdmin: false, niche: "DENTIST" } }),
    prisma.user.count({ where: { isAdmin: false, niche: "OSTEOPATH" } }),
    prisma.user.count({ where: { isAdmin: false, niche: "GARAGE" } }),
    prisma.user.count({ where: { isAdmin: false, niche: "OTHER" } }),
    prisma.reviewRequest.count(),
    prisma.reviewRequest.count({ where: { status: "SENT" } }),
    prisma.reviewRequest.count({ where: { status: "CLICKED" } }),
    prisma.reviewRequest.count({ where: { status: "REVIEWED" } }),
    prisma.reviewRequest.count({ where: { status: "FEEDBACK" } }),
    prisma.user.findMany({
      where: { isAdmin: false },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        email: true,
        businessName: true,
        niche: true,
        plan: true,
        createdAt: true,
      },
    }),
    prisma.reviewRequest.findMany({
      where: { user: { isAdmin: false } },
      include: { user: true, client: true },
      orderBy: { createdAt: "desc" },
      take: 15,
    }),
    prisma.user.findMany({
      where: {
        isAdmin: false,
        trialEndsAt: { gte: now, lte: in3Days },
        plan: { not: "free" },
      },
      orderBy: { trialEndsAt: "asc" },
    }),
    prisma.user.findMany({
      where: {
        isAdmin: false,
        trialEndsAt: { lt: now },
        plan: { not: "free" },
      },
      take: 5,
      orderBy: { trialEndsAt: "desc" },
    }),
    prisma.plan.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
  ]);

  // Compute MRR from DB plans
  const planCounts: Record<string, number> = { free: freeUsers, pro: proUsers, business: businessUsers };
  const mrr = plans.reduce((sum, p) => {
    const count = planCounts[p.key] || 0;
    return sum + p.price * count;
  }, 0);

  const payingUsers = proUsers + businessUsers;
  const arpu = payingUsers > 0 ? mrr / payingUsers : 0;
  const conversionRate =
    totalUsers > 0 ? Math.round((payingUsers / totalUsers) * 100) : 0;
  const activeTrials = expiringTrials.length;

  // Merge timeline
  type TimelineItem = {
    type: "signup" | "request";
    date: Date;
    label: string;
    sublabel: string;
    status?: string;
    userId?: string;
  };

  const timeline: TimelineItem[] = [
    ...recentSignups.map((u) => ({
      type: "signup" as const,
      date: u.createdAt,
      label: u.businessName || u.email,
      sublabel: `s'est inscrit (${u.plan})`,
      userId: u.id,
    })),
    ...recentRequests.map((r) => ({
      type: "request" as const,
      date: r.createdAt,
      label: r.user.businessName || r.user.email,
      sublabel: `\u2192 ${r.client.name}`,
      status: r.status,
      userId: r.user.id,
    })),
  ]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 15);

  const statusConfig: Record<string, { label: string; className: string }> = {
    PENDING: { label: "En attente", className: "bg-warning/10 text-warning" },
    SENT: { label: "Envoyé", className: "bg-primary/10 text-primary" },
    CLICKED: { label: "Cliqué", className: "bg-success/10 text-success" },
    REVIEWED: { label: "Avis", className: "bg-success/10 text-success" },
    FEEDBACK: { label: "Feedback", className: "bg-muted text-muted-foreground" },
    FAILED: { label: "Échoué", className: "bg-destructive/10 text-destructive" },
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-8">Tableau de bord</h1>

      {/* Alerts */}
      {(expiringTrials.length > 0 || expiredTrials.length > 0) && (
        <div className="space-y-3 mb-8">
          {expiringTrials.length > 0 && (
            <div className="bg-warning/10 border border-warning/20 rounded-xl p-4">
              <h3 className="text-sm font-medium text-warning mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> Essais expirant dans 3 jours (
                {expiringTrials.length})
              </h3>
              <div className="space-y-1">
                {expiringTrials.map((u) => {
                  const daysLeft = Math.ceil(
                    (u.trialEndsAt!.getTime() - now.getTime()) /
                      (1000 * 60 * 60 * 24)
                  );
                  return (
                    <Link
                      key={u.id}
                      href={`/admin/users/${u.id}`}
                      className="flex justify-between text-sm hover:bg-warning/10 rounded px-2 py-1"
                    >
                      <span>
                        {u.businessName || u.email} ({u.plan})
                      </span>
                      <span className="text-warning font-medium">
                        {daysLeft}j restant{daysLeft > 1 ? "s" : ""}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {expiredTrials.length > 0 && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4">
              <h3 className="text-sm font-medium text-destructive mb-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> Essais expires ({expiredTrials.length})
              </h3>
              <div className="space-y-1">
                {expiredTrials.map((u) => (
                  <Link
                    key={u.id}
                    href={`/admin/users/${u.id}`}
                    className="flex justify-between text-sm hover:bg-destructive/10 rounded px-2 py-1"
                  >
                    <span>{u.businessName || u.email} ({u.plan})</span>
                    <span className="text-destructive text-xs">
                      expiré le {formatDate(u.trialEndsAt!)}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* KPI row 1 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        {([
          { label: "Utilisateurs", value: String(totalUsers), Icon: Users },
          { label: "MRR", value: formatPrice(mrr), Icon: Banknote },
          { label: "Demandes envoyées", value: String(totalSent), Icon: Send },
          { label: "Avis Google", value: String(totalReviewed), Icon: Star },
        ] as { label: string; value: string; Icon: LucideIcon }[]).map((stat) => (
          <div
            key={stat.label}
            className="bg-card border border-border rounded-xl p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">
                {stat.label}
              </span>
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <stat.Icon className="w-4 h-4 text-primary" />
              </div>
            </div>
            <p className="text-2xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* KPI row 2 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "ARPU", value: formatPrice(arpu) },
          { label: "Conversion Free\u2192Paid", value: `${conversionRate}%` },
          { label: "Essais actifs", value: String(activeTrials) },
          { label: "Comptes suspendus", value: String(suspendedUsers) },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-card border border-border rounded-xl p-4"
          >
            <p className="text-xs text-muted-foreground">{stat.label}</p>
            <p className="text-xl font-bold mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {/* Par plan */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="font-semibold mb-4">Par plan</h2>
          <div className="space-y-3">
            {plans.map((p) => {
              const count = planCounts[p.key] || 0;
              const pct =
                totalUsers > 0 ? Math.round((count / totalUsers) * 100) : 0;
              return (
                <div key={p.key}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm">
                      {p.name}{" "}
                      {p.price > 0 && (
                        <span className="text-muted-foreground">
                          ({formatPrice(p.price)}/mois)
                        </span>
                      )}
                    </span>
                    <span className="text-sm font-medium">
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5">
                    <div
                      className="bg-primary rounded-full h-1.5"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Par niche */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="font-semibold mb-4">Par métier</h2>
          <div className="space-y-3">
            {([
              { label: "Dentistes", value: dentistUsers, Icon: Stethoscope },
              { label: "Ostéopathes", value: osteopathUsers, Icon: Bone },
              { label: "Garages", value: garageUsers, Icon: Wrench },
              { label: "Autres", value: otherUsers, Icon: Building2 },
            ] as { label: string; value: number; Icon: LucideIcon }[]).map((n) => (
              <div
                key={n.label}
                className="flex items-center justify-between"
              >
                <span className="text-sm flex items-center gap-2">
                  <n.Icon className="w-4 h-4 text-muted-foreground" />
                  {n.label}
                </span>
                <span className="text-sm font-medium">{n.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Activite avis */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="font-semibold mb-4">Performance globale</h2>
          <div className="space-y-3">
            {[
              { label: "Total demandes", value: totalRequests },
              { label: "Envoyées", value: totalSent },
              { label: "Cliquées", value: totalClicked },
              { label: "Avis Google", value: totalReviewed },
              { label: "Feedbacks privés", value: totalFeedback },
            ].map((s) => (
              <div
                key={s.label}
                className="flex items-center justify-between"
              >
                <span className="text-sm text-muted-foreground">
                  {s.label}
                </span>
                <span className="text-sm font-medium">{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Statut comptes */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="font-semibold mb-4">Statut des comptes</h2>
          <div className="flex gap-4">
            <div className="flex-1 bg-success/10 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-success">{activeUsers}</p>
              <p className="text-xs text-success">Actifs</p>
            </div>
            <div className="flex-1 bg-destructive/10 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-destructive">
                {suspendedUsers}
              </p>
              <p className="text-xs text-destructive">Suspendus</p>
            </div>
          </div>
        </div>

        {/* Revenue breakdown */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="font-semibold mb-4">Revenus par plan</h2>
          <div className="space-y-2">
            {plans
              .filter((p) => p.price > 0)
              .map((p) => {
                const count = planCounts[p.key] || 0;
                const revenue = p.price * count;
                return (
                  <div
                    key={p.key}
                    className="flex items-center justify-between text-sm"
                  >
                    <span>
                      {p.name} ({count} users x {formatPrice(p.price)})
                    </span>
                    <span className="font-medium">{formatPrice(revenue)}/mois</span>
                  </div>
                );
              })}
            <div className="flex items-center justify-between text-sm font-bold border-t border-border pt-2 mt-2">
              <span>Total MRR</span>
              <span>{formatPrice(mrr)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h2 className="font-semibold mb-4">Activité récente</h2>
        {timeline.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucune activité</p>
        ) : (
          <div className="space-y-2 max-h-96 overflow-auto">
            {timeline.map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between py-2 border-b border-border last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${item.type === "signup" ? "bg-success/10" : "bg-primary/10"}`}>
                    {item.type === "signup" ? (
                      <UserPlus className="w-4 h-4 text-success" />
                    ) : (
                      <Mail className="w-4 h-4 text-primary" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm">
                      <Link
                        href={`/admin/users/${item.userId}`}
                        className="font-medium hover:text-primary"
                      >
                        {item.label}
                      </Link>{" "}
                      <span className="text-muted-foreground">
                        {item.sublabel}
                      </span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {item.status && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                        (statusConfig[item.status] || statusConfig.PENDING)
                          .className
                      }`}
                    >
                      {(statusConfig[item.status] || statusConfig.PENDING).label}
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatDate(item.date)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
