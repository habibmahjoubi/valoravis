import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { NICHE_CONFIGS } from "@/config/niches";
import { LogoutButton } from "@/components/dashboard/logout-button";
import { MobileSidebar } from "@/components/ui/mobile-sidebar";
import {
  LayoutDashboard,
  Users,
  Send,
  Settings,
  CreditCard,
  Star,
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
  if (user.isAdmin) redirect("/admin");
  if (user.isSuspended) redirect("/suspended");

  if (
    user.trialEndsAt &&
    user.trialEndsAt <= new Date() &&
    user.plan !== "free"
  ) {
    await prisma.user.update({
      where: { id: user.id },
      data: { plan: "free", monthlyQuota: 50 },
    });
    user.plan = "free";
    user.monthlyQuota = 50;
  }

  const vocab = NICHE_CONFIGS[user.niche].vocabulary;

  const NAV_ITEMS: { href: string; label: string; icon: LucideIcon }[] = [
    { href: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
    {
      href: "/dashboard/clients",
      label: vocab.clients.charAt(0).toUpperCase() + vocab.clients.slice(1),
      icon: Users,
    },
    { href: "/dashboard/campaigns", label: "Campagnes", icon: Send },
    { href: "/dashboard/settings", label: "Parametres", icon: Settings },
    { href: "/dashboard/billing", label: "Abonnement", icon: CreditCard },
  ];

  return (
    <div className="flex min-h-screen">
      <MobileSidebar>
        <div className="p-4 border-b border-border">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
              <Star className="w-3.5 h-3.5 text-primary-foreground fill-primary-foreground" />
            </div>
            <span className="text-lg font-bold">AvisBoost</span>
          </Link>
          <p className="text-xs text-muted-foreground mt-1 truncate">
            {user.businessName || user.email}
          </p>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {NAV_ITEMS.map((item) => (
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
          <div className="flex items-center justify-between px-3 py-2 text-xs text-muted-foreground">
            <span>
              {user.quotaUsed}/{user.monthlyQuota} envois
            </span>
            <span className="font-medium uppercase">{user.plan}</span>
          </div>
          <LogoutButton />
        </div>
      </MobileSidebar>

      <main className="flex-1 p-4 md:p-8 overflow-auto">{children}</main>
    </div>
  );
}
