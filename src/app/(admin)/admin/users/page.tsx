import Link from "next/link";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
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

  const where: Record<string, unknown> = { isAdmin: false };
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

  const users = await prisma.user.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { clients: true, reviewRequests: true },
      },
    },
  });

  // CSV export data
  const csvHeader = "Email,Etablissement,Metier,Plan,Quota,Clients,Envois,Inscription";
  const csvRows = users.map(
    (u) =>
      `"${u.email}","${u.businessName || ""}","${u.niche}","${u.plan}","${u.quotaUsed}/${u.monthlyQuota}","${u._count.clients}","${u._count.reviewRequests}","${u.createdAt.toISOString().slice(0, 10)}"`
  );
  const csvData = [csvHeader, ...csvRows].join("\n");

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Utilisateurs</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">
            {users.length} compte{users.length !== 1 ? "s" : ""}
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
                Utilisateur
              </th>
              <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">
                Metier
              </th>
              <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">
                Plan
              </th>
              <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">
                Quota
              </th>
              <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">
                Clients
              </th>
              <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">
                Envois
              </th>
              <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">
                Inscription
              </th>
              <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-8 text-center text-muted-foreground text-sm"
                >
                  Aucun utilisateur trouve
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr
                  key={user.id}
                  className={`border-b border-border last:border-0 ${
                    user.isSuspended ? "opacity-50 bg-destructive/5" : ""
                  }`}
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/users/${user.id}`}
                      className="hover:text-primary"
                    >
                      <p className="text-sm font-medium">
                        {user.businessName || "Non configure"}
                        {user.isSuspended && (
                          <span className="ml-1 px-1.5 py-0.5 bg-destructive/10 text-destructive text-[10px] rounded font-medium">
                            Suspendu
                          </span>
                        )}
                        {user.trialEndsAt &&
                          user.trialEndsAt > new Date() && (
                            <span className="ml-1 px-1.5 py-0.5 bg-primary/10 text-primary text-[10px] rounded font-medium">
                              Essai
                            </span>
                          )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {user.email}
                      </p>
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-sm">{user.niche}</td>
                  <td className="px-4 py-3">
                    <ChangePlanForm
                      userId={user.id}
                      currentPlan={user.plan}
                      currentQuota={user.monthlyQuota}
                    />
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={
                        user.quotaUsed >= user.monthlyQuota
                          ? "text-destructive font-medium"
                          : "text-muted-foreground"
                      }
                    >
                      {user.quotaUsed}/{user.monthlyQuota}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {user._count.clients}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {user._count.reviewRequests}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <ResetQuotaButton userId={user.id} />
                      <SuspendButton
                        userId={user.id}
                        isSuspended={user.isSuspended}
                      />
                      <DeleteUserButton userId={user.id} />
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
