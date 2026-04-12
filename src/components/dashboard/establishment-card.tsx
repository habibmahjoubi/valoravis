"use client";

import { useState, useTransition } from "react";
import { switchEstablishment, deleteEstablishment } from "@/actions/establishments";
import { MembersPanel } from "@/components/dashboard/members-panel";
import { Building2, Check, Trash2, MapPin, Phone, Users } from "lucide-react";

type Member = {
  id: string;
  userName: string | null;
  userEmail: string;
  role: string;
};

type PendingInvite = {
  id: string;
  email: string;
  role: string;
  expires: string;
};

export function EstablishmentCard({
  id,
  name,
  niche,
  customNiche,
  phone,
  googlePlaceUrl,
  role,
  isCurrent,
  isOnlyOne,
  members,
  membersLimit,
  pendingInvites = [],
}: {
  id: string;
  name: string;
  niche: string;
  customNiche: string | null;
  phone: string | null;
  googlePlaceUrl: string | null;
  role: string;
  isCurrent: boolean;
  isOnlyOne: boolean;
  members: Member[];
  membersLimit: number;
  pendingInvites?: PendingInvite[];
}) {
  const [isPending, startTransition] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const roleLabel = role === "OWNER" ? "Propriétaire" : role === "ADMIN" ? "Admin" : "Membre";
  const roleColor = role === "OWNER" ? "text-primary" : role === "ADMIN" ? "text-amber-500" : "text-muted-foreground";

  return (
    <div className={`bg-card border rounded-xl p-4 sm:p-5 transition-all ${isCurrent ? "border-primary/50 ring-2 ring-primary/20" : "border-border"}`}>
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <Building2 className="w-5 h-5 text-primary shrink-0" />
          <div className="min-w-0">
            <h3 className="font-semibold text-sm truncate">{name}</h3>
            <p className="text-xs text-muted-foreground truncate">{customNiche || niche}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className={`text-[10px] font-medium uppercase ${roleColor}`}>
            {roleLabel}
          </span>
          {isCurrent && (
            <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
              Actif
            </span>
          )}
        </div>
      </div>

      <div className="space-y-1 mb-4 text-xs text-muted-foreground">
        {phone && (
          <div className="flex items-center gap-1.5">
            <Phone className="w-3 h-3 shrink-0" />
            <span className="truncate">{phone}</span>
          </div>
        )}
        {googlePlaceUrl && (
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3 h-3" />
            <span className="truncate">Google Maps configuré</span>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {!isCurrent && (
          <button
            onClick={() => {
              startTransition(async () => {
                await switchEstablishment(id);
              });
            }}
            disabled={isPending}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:opacity-90 disabled:opacity-50"
          >
            <Check className="w-3 h-3" />
            Sélectionner
          </button>
        )}

        {role === "OWNER" && !isOnlyOne && (
          <>
            {!confirmDelete ? (
              <button
                onClick={() => setConfirmDelete(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-destructive hover:bg-destructive/10 rounded-lg text-xs transition-colors"
              >
                <Trash2 className="w-3 h-3" />
                Supprimer
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    startTransition(async () => {
                      const result = await deleteEstablishment(id);
                      if (result?.error) setError(result.error);
                      setConfirmDelete(false);
                    });
                  }}
                  disabled={isPending}
                  className="px-3 py-1.5 bg-destructive text-destructive-foreground rounded-lg text-xs font-medium hover:opacity-90 disabled:opacity-50"
                >
                  Confirmer
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground"
                >
                  Annuler
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {error && <p className="text-xs text-destructive mt-2">{error}</p>}

      {/* Members panel — MEMBER sees only count, ADMIN/OWNER can manage */}
      {role === "MEMBER" ? (
        <div className="mt-3 pt-3 border-t border-border">
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" />
            {members.length} membre{members.length !== 1 ? "s" : ""}
          </p>
        </div>
      ) : (
        <MembersPanel
          establishmentId={id}
          members={members}
          currentUserRole={role}
          membersLimit={membersLimit}
          pendingInvites={pendingInvites}
        />
      )}
    </div>
  );
}
