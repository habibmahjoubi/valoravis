import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { formatDate, formatPrice } from "@/lib/utils";
import {
  SuspendButton,
  DeleteUserButton,
  ResetQuotaButton,
} from "@/components/admin/suspend-button";
import { ChangePlanForm } from "@/components/admin/change-plan-form";

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      clients: { orderBy: { createdAt: "desc" }, take: 20 },
      reviewRequests: {
        include: { client: true },
        orderBy: { createdAt: "desc" },
        take: 20,
      },
      _count: { select: { clients: true, reviewRequests: true } },
    },
  });

  if (!user || user.isAdmin) notFound();

  const sentCount = user.reviewRequests.filter((r) =>
    ["SENT", "CLICKED", "REVIEWED"].includes(r.status)
  ).length;
  const clickedCount = user.reviewRequests.filter((r) =>
    ["CLICKED", "REVIEWED"].includes(r.status)
  ).length;
  const reviewedCount = user.reviewRequests.filter(
    (r) => r.status === "REVIEWED"
  ).length;
  const clickRate =
    sentCount > 0 ? Math.round((clickedCount / sentCount) * 100) : 0;

  const isOnTrial = user.trialEndsAt && user.trialEndsAt > new Date();
  const trialExpired =
    user.trialEndsAt && user.trialEndsAt <= new Date() && user.plan !== "free";

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
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/admin/users"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          {"\u2190"} Retour aux utilisateurs
        </Link>
      </div>

      <div className="flex flex-col md:flex-row items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold">
            {user.businessName || "Non configure"}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">{user.email}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="px-2 py-0.5 bg-muted rounded text-xs font-medium">
              {user.niche}
            </span>
            <ChangePlanForm
              userId={user.id}
              currentPlan={user.plan}
              currentQuota={user.monthlyQuota}
            />
            {user.isSuspended && (
              <span className="px-2 py-0.5 bg-destructive/10 text-destructive rounded text-xs font-medium">
                Suspendu
              </span>
            )}
            {isOnTrial && (
              <span className="px-2 py-0.5 bg-primary/10 text-primary rounded text-xs font-medium">
                Essai en cours
              </span>
            )}
            {trialExpired && (
              <span className="px-2 py-0.5 bg-warning/10 text-warning rounded text-xs font-medium">
                Essai expire
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ResetQuotaButton userId={user.id} />
          <SuspendButton userId={user.id} isSuspended={user.isSuspended} />
          <DeleteUserButton userId={user.id} />
        </div>
      </div>

      {/* Trial info */}
      {user.trialEndsAt && (
        <div
          className={`mb-6 p-3 rounded-lg border text-sm ${
            isOnTrial
              ? "bg-primary/10 border-primary/20 text-primary"
              : "bg-warning/10 border-warning/20 text-warning"
          }`}
        >
          Essai {isOnTrial ? "en cours" : "expire"} — Fin :{" "}
          {formatDate(user.trialEndsAt)}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {[
          { label: "Clients", value: user._count.clients },
          {
            label: "Quota",
            value: `${user.quotaUsed}/${user.monthlyQuota}`,
          },
          { label: "Envoyés", value: sentCount },
          { label: "Cliques", value: `${clickedCount} (${clickRate}%)` },
          { label: "Avis Google", value: reviewedCount },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-card border border-border rounded-xl p-4"
          >
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="text-xl font-bold mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Infos */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="font-semibold mb-3">Informations</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Inscription</span>
              <span>{formatDate(user.createdAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Téléphone</span>
              <span>{user.phone || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Lien Google</span>
              <span className="max-w-[200px] truncate text-right">
                {user.googlePlaceUrl ? (
                  <a
                    href={user.googlePlaceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Configure
                  </a>
                ) : (
                  "Non configure"
                )}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Onboarde</span>
              <span>{user.onboarded ? "Oui" : "Non"}</span>
            </div>
          </div>
        </div>

        {/* Clients list */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="font-semibold mb-3">
            Clients ({user._count.clients})
          </h2>
          {user.clients.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucun client</p>
          ) : (
            <div className="space-y-2 max-h-60 overflow-auto">
              {user.clients.map((c) => (
                <div
                  key={c.id}
                  className="flex justify-between py-1.5 border-b border-border last:border-0 text-sm"
                >
                  <div>
                    <p className="font-medium">{c.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {c.email || c.phone || "—"}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(c.createdAt)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Review requests */}
      <div className="bg-card border border-border rounded-xl overflow-x-auto">
        <div className="p-4 border-b border-border">
          <h2 className="font-semibold">
            Derniers envois ({user._count.reviewRequests})
          </h2>
        </div>
        {user.reviewRequests.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground text-sm">
            Aucun envoi
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-2">
                  Client
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-2">
                  Canal
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-2">
                  Statut
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-2">
                  Note
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-2">
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              {user.reviewRequests.map((req) => {
                const sc = statusConfig[req.status] || statusConfig.PENDING;
                return (
                  <tr
                    key={req.id}
                    className="border-b border-border last:border-0"
                  >
                    <td className="px-4 py-2 text-sm">{req.client.name}</td>
                    <td className="px-4 py-2 text-sm text-muted-foreground">
                      {req.channel}
                    </td>
                    <td className="px-4 py-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${sc.className}`}
                      >
                        {sc.label}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-sm">
                      {req.rating ? "\u2B50".repeat(req.rating) : "\u2014"}
                    </td>
                    <td className="px-4 py-2 text-xs text-muted-foreground">
                      {formatDate(req.createdAt)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
