import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { formatDate } from "@/lib/utils";
import { CampaignFilters } from "@/components/dashboard/campaign-filters";
import { Suspense } from "react";
import { Mail, Smartphone, Star } from "lucide-react";
import type { RequestStatus, Channel } from "@/generated/prisma/enums";

export default async function CampaignsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; channel?: string; period?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const params = await searchParams;

  // Build dynamic where clause
  const where: Record<string, unknown> = { userId: session.user.id };

  const validStatuses = ["PENDING", "SENT", "CLICKED", "REVIEWED", "FEEDBACK", "FAILED"];
  const validChannels = ["EMAIL", "SMS"];
  const validPeriods = ["7", "30", "90"];

  if (params.status && validStatuses.includes(params.status)) {
    where.status = params.status as RequestStatus;
  }
  if (params.channel && validChannels.includes(params.channel)) {
    where.channel = params.channel as Channel;
  }
  if (params.period && validPeriods.includes(params.period)) {
    const days = Number(params.period);
    where.createdAt = { gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000) };
  }

  const requests = await prisma.reviewRequest.findMany({
    where,
    include: { client: true },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  const statusConfig: Record<string, { label: string; className: string }> = {
    PENDING: { label: "En attente", className: "bg-warning/10 text-warning" },
    SENT: { label: "Envoyé", className: "bg-primary/10 text-primary" },
    CLICKED: { label: "Cliqué", className: "bg-success/10 text-success" },
    REVIEWED: {
      label: "Avis laissé",
      className: "bg-success/10 text-success",
    },
    FEEDBACK: {
      label: "Feedback privé",
      className: "bg-muted text-muted-foreground",
    },
    FAILED: {
      label: "Échoué",
      className: "bg-destructive/10 text-destructive",
    },
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-6">
        <h1 className="text-xl sm:text-2xl font-bold">Campagnes</h1>
        <span className="text-sm text-muted-foreground">
          {requests.length} résultat{requests.length !== 1 ? "s" : ""}
        </span>
      </div>

      <Suspense>
        <CampaignFilters />
      </Suspense>

      <div className="bg-card border border-border rounded-xl overflow-x-auto">
        {requests.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground">
            Aucune campagne correspondant aux filtres.
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">
                  Client
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">
                  Canal
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">
                  Statut
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">
                  Note
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">
                  Date
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">
                  Feedback
                </th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => {
                const sc = statusConfig[req.status] || statusConfig.PENDING;
                return (
                  <tr
                    key={req.id}
                    className="border-b border-border last:border-0"
                  >
                    <td className="px-4 py-3 text-sm font-medium">
                      {req.client.name}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5">
                        {req.channel === "EMAIL" ? (
                          <Mail className="w-3.5 h-3.5" />
                        ) : (
                          <Smartphone className="w-3.5 h-3.5" />
                        )}
                        {req.channel}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${sc.className}`}
                      >
                        {sc.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {req.rating ? (
                        <span className="inline-flex gap-0.5">
                          {Array.from({ length: req.rating }).map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 text-primary fill-primary" />
                          ))}
                        </span>
                      ) : (
                        "\u2014"
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {formatDate(req.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground max-w-xs truncate">
                      {req.feedback || "\u2014"}
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
