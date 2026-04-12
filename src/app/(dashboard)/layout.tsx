import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { NICHE_CONFIGS } from "@/config/niches";
import { LogoutButton } from "@/components/dashboard/logout-button";
import { MobileSidebar } from "@/components/ui/mobile-sidebar";
import { EstablishmentSwitcher } from "@/components/dashboard/establishment-switcher";
import { getCurrentEstablishment, getUserEstablishments, getEstablishmentOwner } from "@/lib/establishment";
import {
  LayoutDashboard,
  Users,
  Send,
  Settings,
  CreditCard,
  Star,
  Building2,
} from "lucide-react";
import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) redirect("/login");
  if (!user.emailVerified) redirect(`/check-email?email=${encodeURIComponent(user.email)}`);
  if (user.isAdmin) redirect("/admin");
  if (user.isSuspended) redirect("/suspended");

  if (
    user.trialEndsAt &&
    user.trialEndsAt <= new Date() &&
    user.plan !== "free"
  ) {
    await prisma.user.update({
      where: { id: user.id },
      data: { plan: "free", monthlyQuota: 50, quotaUsed: 0 },
    });
    user.plan = "free";
    user.monthlyQuota = 50;
    user.quotaUsed = 0;
  }

  // Auto-downgrade if cancellation effective date has passed
  if (
    user.cancelEffectiveAt &&
    user.cancelEffectiveAt <= new Date() &&
    user.plan !== "free"
  ) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        plan: "free",
        monthlyQuota: 50,
        quotaUsed: 0,
        cancelRequestedAt: null,
        cancelEffectiveAt: null,
      },
    });
    user.plan = "free";
    user.monthlyQuota = 50;
    user.quotaUsed = 0;
  }

  // Get current establishment context
  const establishment = await getCurrentEstablishment();
  const establishments = await getUserEstablishments(user.id);

  // MEMBER inherits the OWNER's plan/quota
  const owner = establishment && establishment.role !== "OWNER"
    ? await getEstablishmentOwner(establishment.id)
    : null;
  const effectivePlan = owner?.plan ?? user.plan;
  const effectiveQuotaUsed = owner?.quotaUsed ?? user.quotaUsed;
  const effectiveQuota = owner?.monthlyQuota ?? user.monthlyQuota;

  const niche = establishment?.niche ?? user.niche;
  const vocab = NICHE_CONFIGS[niche].vocabulary;

  const role = establishment?.role ?? "OWNER";
  const isOwner = role === "OWNER";
  const isAdmin = role === "OWNER" || role === "ADMIN";

  const NAV_ITEMS: { href: string; label: string; icon: LucideIcon; show: boolean }[] = [
    { href: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard, show: true },
    {
      href: "/dashboard/clients",
      label: vocab.clients.charAt(0).toUpperCase() + vocab.clients.slice(1),
      icon: Users,
      show: true,
    },
    { href: "/dashboard/campaigns", label: "Campagnes", icon: Send, show: true },
    { href: "/dashboard/establishments", label: "Établissements", icon: Building2, show: true },
    { href: "/dashboard/settings", label: "Paramètres", icon: Settings, show: isAdmin },
    { href: "/dashboard/billing", label: "Abonnement", icon: CreditCard, show: isOwner },
  ];

  return (
    <div className="flex min-h-screen">
      <MobileSidebar>
        <div className="p-4 border-b border-border">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
              <Star className="w-3.5 h-3.5 text-primary-foreground fill-primary-foreground" />
            </div>
            <span className="text-lg font-bold">Valoravis</span>
          </Link>
          <EstablishmentSwitcher
            establishments={establishments.map((e) => ({
              id: e.id,
              name: e.name,
              role: e.role,
            }))}
            currentId={establishment?.id ?? ""}
          />
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {NAV_ITEMS.filter((item) => item.show).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-muted transition-colors"
            >
              <item.icon className="w-4 h-4 text-muted-foreground" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-3 border-t border-border">
          <div className="flex items-center justify-between px-3 py-2 text-xs text-muted-foreground min-w-0">
            <span className="truncate">
              {effectiveQuotaUsed}/{effectiveQuota} envois
            </span>
            <span className="font-medium uppercase shrink-0 ml-2">{effectivePlan}</span>
          </div>
          <LogoutButton />
        </div>
      </MobileSidebar>

      <main className="flex-1 px-4 pb-4 pt-18 md:p-8 overflow-auto">{children}</main>
    </div>
  );
}
