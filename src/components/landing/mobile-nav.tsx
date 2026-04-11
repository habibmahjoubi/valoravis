"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="sm:hidden">
      <button
        onClick={() => setOpen(!open)}
        className="p-2 text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Menu"
      >
        {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {open && (
        <div className="absolute top-16 left-0 right-0 bg-card border-b border-border/40 shadow-lg z-50">
          <nav className="flex flex-col px-5 py-4 gap-3">
            <a
              href="#comment"
              onClick={() => setOpen(false)}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
            >
              Comment ca marche
            </a>
            <a
              href="#metiers"
              onClick={() => setOpen(false)}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
            >
              Pour qui
            </a>
            <a
              href="#tarifs"
              onClick={() => setOpen(false)}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
            >
              Tarifs
            </a>
            <div className="pt-2 border-t border-border/40 flex gap-3">
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="flex-1 text-center text-sm font-medium py-2.5 rounded-lg border border-border hover:bg-muted transition-colors"
              >
                Connexion
              </Link>
              <Link
                href="/register"
                onClick={() => setOpen(false)}
                className="flex-1 text-center text-sm font-semibold brand-gradient text-white py-2.5 rounded-lg"
              >
                Essai gratuit
              </Link>
            </div>
          </nav>
        </div>
      )}
    </div>
  );
}
