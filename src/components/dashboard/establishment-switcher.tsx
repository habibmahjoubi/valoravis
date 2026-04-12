"use client";

import { useState, useTransition } from "react";
import { switchEstablishment } from "@/actions/establishments";
import { Building2, ChevronDown, Check } from "lucide-react";

type EstablishmentItem = {
  id: string;
  name: string;
  role: string;
};

export function EstablishmentSwitcher({
  establishments,
  currentId,
}: {
  establishments: EstablishmentItem[];
  currentId: string;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const current = establishments.find((e) => e.id === currentId);

  if (establishments.length <= 1) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 text-xs text-muted-foreground truncate">
        <Building2 className="w-3.5 h-3.5 shrink-0" />
        <span className="truncate">{current?.name || "Mon établissement"}</span>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 w-full text-xs text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors truncate"
        disabled={isPending}
      >
        <Building2 className="w-3.5 h-3.5 shrink-0" />
        <span className="truncate flex-1 text-left">{current?.name || "Choisir"}</span>
        <ChevronDown className={`w-3 h-3 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-popover border border-border rounded-lg shadow-lg py-1 max-h-60 overflow-y-auto">
            {establishments.map((est) => (
              <button
                key={est.id}
                onClick={() => {
                  startTransition(async () => {
                    await switchEstablishment(est.id);
                    setOpen(false);
                  });
                }}
                className="flex items-center gap-2 w-full px-3 py-2 text-xs hover:bg-muted transition-colors text-left min-w-0"
              >
                <span className="truncate flex-1 min-w-0">{est.name}</span>
                <span className="text-[10px] text-muted-foreground uppercase shrink-0">
                  {est.role === "OWNER" ? "Propriétaire" : est.role === "ADMIN" ? "Admin" : "Membre"}
                </span>
                {est.id === currentId && <Check className="w-3 h-3 text-primary shrink-0" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
