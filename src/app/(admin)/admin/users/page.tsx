import Link from "next/link";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { formatDate, getNicheLabel } from "@/lib/utils";
import {
  SuspendButton,
  DeleteUserButton,
  ResetQuotaButton,
} from "@/components/admin/suspend-button";
import { ChangePlanForm } from "@/components/admin/change-plan-form";
import { UserSearch } from "@/components/admin/user-search";
import { ExportCsvButton } from "@/components/admin/export-csv-button";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{
    plan?: string;
    niche?: string;
    status?: string;
    q?: string;
  }>;
}) {
  const params = await searchParams;

  // Only show users who OWN at least one establishment (not pure members)
  const where: Record<string, unknown> = {
    isAdmin: false,
    memberships: { some: { role: "OWNER" } },
  };
  if (params.plan) where.plan = params.plan;
  if (params.niche) where.niche = params.niche;
  if (params.status === "suspended") where.isSuspended = true;
  if (params.status === "active") where.isSuspended = false;
  if (params.q) {
    where.OR = [
      { email: { contains: params.q, mode: "insensitive" } },
      { businessName: { contains: params.q, mode: "insensitive" } },
    ];
  }

  const owners = await prisma.user.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      memberships: {
        where: { role: "OWNER" },
        include: {
          establishment: {
            include: {
              _count: { select: { members: true, clients: true, reviewRequests: true } },
            },
          },
        },
      },
    },
  });

  // Flatten: one row per establishment
  const rows = owners.flatMap((owner) =>
    owner.memberships.map((m) => ({
      owner,
      establishment: m.establishment,
      memberCount: m.establishment._count.members,
      clientCount: m.establishment._count.clients,
      requestCount: m.establishment._count.reviewRequests,
    }))
  );

  // CSV export
  const csvHeader = "Établissement,Propriétaire,Email,Métier,Plan,Quota,Membres,Clients,Envois,Inscription";
  const csvRows = rows.map(
    (r) =>
      `"${r.establishment.name}","${r.owner.name || ""}","${r.owner.email}","${r.establishment.niche}","${r.owner.plan}","${r.owner.quotaUsed}/${r.owner.monthlyQuota}","${r.memberCount}","${r.clientCount}","${r.requestCount}","${r.owner.createdAt.toISOString().slice(0, 10)}"`
  );
  const csvData = [csvHeader, ...csvRows].join("\n");

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl sm:text-2xl font-bold">Établissements</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">
            {rows.length} établissement{rows.length !== 1 ? "s" : ""} · {owners.length} propriétaire{owners.length !== 1 ? "s" : ""}
          </span>
          <ExportCsvButton data={csvData} />
        </div>
      </div>

      {/* Search */}
      <Suspense>
        <UserSearch />
      </Suspense>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <FilterLink
          href="/admin/users"
          label="Tous"
          active={!params.plan && !params.niche && !params.status}
        />
        <FilterLink
          href="/admin/users?plan=free"
          label="Free"
          active={params.plan === "free"}
        />
        <FilterLink
          href="/admin/users?plan=pro"
          label="Pro"
          active={params.plan === "pro"}
        />
        <FilterLink
          href="/admin/users?plan=business"
          label="Business"
          active={params.plan === "business"}
        />
        <span className="border-l border-border" />
        <FilterLink
          href="/admin/users?status=active"
          label="Actifs"
          active={params.status === "active"}
        />
        <FilterLink
          href="/admin/users?status=suspended"
          label="Suspendus"
          active={params.status === "suspended"}
        />
      </div>

      <div className="bg-card border border-border rounded-xl overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">
                Établissement
              </th>
              <th className="hidden md:table-cell text-left text-xs font-medium text-muted-foreground px-4 py-3">
                Propriétaire
              </th>
              <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">
                Plan
              </th>
              <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">
                Quota
              </th>
              <th className="hidden sm:table-cell text-left text-xs font-medium text-muted-foreground px-4 py-3">
                Membres
              </th>
              <th className="hidden sm:table-cell text-left text-xs font-medium text-muted-foreground px-4 py-3">
                Clients
              </th>
              <th className="hidden sm:table-cell text-left text-xs font-medium text-muted-foreground px-4 py-3">
                Envois
              </th>
              <th className="hidden md:table-cell text-left text-xs font-medium text-muted-foreground px-4 py-3">
                Inscription
              </th>
              <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={9}
                  className="px-4 py-8 text-center text-muted-foreground text-sm"
                >
                  Aucun établissement trouvé
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr
                  key={row.establishment.id}
                  className={`border-b border-border last:border-0 ${
                    row.owner.isSuspended ? "opacity-50 bg-destructive/5" : ""
                  }`}
                >
                  <td className="px-4 py-3 max-w-[200px]">
                    <Link
                      href={`/admin/users/${row.owner.id}`}
                      className="hover:text-primary block"
                    >
                      <div className="flex flex-wrap items-center gap-1">
                        <p className="text-sm font-medium truncate">{row.establishment.name}</p>
                        {row.owner.isSuspended && (
                          <span className="px-1.5 py-0.5 bg-destructive/10 text-destructive text-[10px] rounded font-medium shrink-0">
                            Suspendu
                          </span>
                        )}
                        {row.owner.trialEndsAt &&
                          row.owner.trialEndsAt > new Date() && (
                            <span className="px-1.5 py-0.5 bg-primary/10 text-primary text-[10px] rounded font-medium shrink-0">
                              Essai
                            </span>
                          )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {getNicheLabel(row.establishment.niche, row.establishment.customNiche)}
                      </p>
                    </Link>
                  </td>
                  <td className="hidden md:table-cell px-4 py-3">
                    <p className="text-sm truncate">{row.owner.name || row.owner.email}</p>
                    <p className="text-xs text-muted-foreground truncate">{row.owner.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <ChangePlanForm
                      userId={row.owner.id}
                      currentPlan={row.owner.plan}
                      currentQuota={row.owner.monthlyQuota}
                    />
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={
                        row.owner.quotaUsed >= row.owner.monthlyQuota
                          ? "text-destructive font-medium"
                          : "text-muted-foreground"
                      }
                    >
                      {row.owner.quotaUsed}/{row.owner.monthlyQuota}
                    </span>
                  </td>
                  <td className="hidden sm:table-cell px-4 py-3 text-sm text-muted-foreground">
                    {row.memberCount}
                  </td>
                  <td className="hidden sm:table-cell px-4 py-3 text-sm text-muted-foreground">
                    {row.clientCount}
                  </td>
                  <td className="hidden sm:table-cell px-4 py-3 text-sm text-muted-foreground">
                    {row.requestCount}
                  </td>
                  <td className="hidden md:table-cell px-4 py-3 text-sm text-muted-foreground">
                    {formatDate(row.owner.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center justify-end gap-1.5">
                      <ResetQuotaButton userId={row.owner.id} />
                      <SuspendButton
                        userId={row.owner.id}
                        isSuspended={row.owner.isSuspended}
                      />
                      <DeleteUserButton userId={row.owner.id} />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FilterLink({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <a
      href={href}
      className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
        active
          ? "bg-primary text-primary-foreground"
          : "bg-muted text-muted-foreground hover:text-foreground"
      }`}
    >
      {label}
    </a>
  );
}
