"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";

export function MobileSidebar({
  children,
  title = "AvisBoost",
}: {
  children: React.ReactNode;
  title?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 h-14 bg-card border-b border-border flex items-center px-4">
        <button
          onClick={() => setOpen(!open)}
          className="p-2 -ml-2 rounded-lg hover:bg-muted"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
        <span className="ml-2 font-bold">{title}</span>
      </div>

      {/* Overlay */}
      {open && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:relative z-40 w-64 border-r border-border bg-card flex flex-col h-screen transition-transform duration-200 md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div onClick={() => setOpen(false)}>{children}</div>
      </aside>

      {/* Mobile spacer */}
      <div className="md:hidden h-14 flex-shrink-0" />
    </>
  );
}
