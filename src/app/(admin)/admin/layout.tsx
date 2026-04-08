import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { LogoutButton } from "@/components/dashboard/logout-button";
import { MobileSidebar } from "@/components/ui/mobile-sidebar";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Star,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const NAV_ITEMS: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/admin", label: "Vue d'ensemble", icon: LayoutDashboard },
  { href: "/admin/users", label: "Utilisateurs", icon: Users },
  { href: "/admin/plans", label: "Offres & Plans", icon: CreditCard },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user?.isAdmin) redirect("/dashboard");

  return (
    <div className="flex min-h-screen">
      <MobileSidebar title="AvisBoost Admin">
        <div className="p-4 border-b border-border">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
              <Star className="w-3.5 h-3.5 text-primary-foreground fill-primary-foreground" />
            </div>
            <span className="text-lg font-bold">AvisBoost</span>
          </Link>
          <div className="flex items-center gap-2 mt-1">
            <span className="px-2 py-0.5 bg-destructive/10 text-destructive text-xs font-medium rounded">
              Admin
            </span>
            <span className="text-xs text-muted-foreground truncate">
              {user.email}
            </span>
          </div>
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
          <LogoutButton />
        </div>
      </MobileSidebar>

      <main className="flex-1 px-4 pb-4 pt-18 md:p-8 overflow-auto">{children}</main>
    </div>
  );
}
