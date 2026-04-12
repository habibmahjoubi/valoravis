"use client";

import { useState, useTransition } from "react";
import { inviteMember, removeMember, updateMemberRole } from "@/actions/establishments";
import { Users, UserPlus, X, Shield, ShieldCheck, Crown, Trash2, Clock } from "lucide-react";

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

export function MembersPanel({
  establishmentId,
  members,
  currentUserRole,
  membersLimit,
  pendingInvites = [],
}: {
  establishmentId: string;
  members: Member[];
  currentUserRole: string;
  membersLimit: number;
  pendingInvites?: PendingInvite[];
}) {
  const [open, setOpen] = useState(false);
  const canManage = currentUserRole === "OWNER" || currentUserRole === "ADMIN";

  return (
    <div className="mt-3 pt-3 border-t border-border">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <Users className="w-3.5 h-3.5" />
        {members.length} membre{members.length !== 1 ? "s" : ""}
        <span className="text-[10px]">({members.length}/{membersLimit})</span>
      </button>

      {open && (
        <div className="mt-3 space-y-2">
          {/* Member list */}
          {members.map((member) => (
            <MemberRow
              key={member.id}
              member={member}
              establishmentId={establishmentId}
              canManage={canManage}
              isOwner={currentUserRole === "OWNER"}
            />
          ))}

          {/* Pending invitations */}
          {canManage && pendingInvites.length > 0 && (
            <div className="mt-2 space-y-1">
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Invitations en attente</p>
              {pendingInvites.map((inv) => (
                <div key={inv.id} className="flex items-center justify-between py-1.5 px-2 rounded-lg bg-amber-500/5 border border-amber-500/10 text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <div className="min-w-0">
                      <p className="truncate text-muted-foreground">{inv.email}</p>
                      <p className="text-[10px] text-muted-foreground/60">
                        {inv.role === "ADMIN" ? "Admin" : "Membre"} — expire le {new Date(inv.expires).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Invite form */}
          {canManage && members.length < membersLimit && (
            <InviteForm establishmentId={establishmentId} isOwner={currentUserRole === "OWNER"} />
          )}

          {canManage && members.length >= membersLimit && (
            <p className="text-[10px] text-muted-foreground mt-2">
              Limite de {membersLimit} membres atteinte.{" "}
              <a href="/dashboard/billing" className="text-primary hover:underline">Upgrader</a>
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function MemberRow({
  member,
  establishmentId,
  canManage,
  isOwner,
}: {
  member: Member;
  establishmentId: string;
  canManage: boolean;
  isOwner: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const RoleIcon = member.role === "OWNER" ? Crown : member.role === "ADMIN" ? ShieldCheck : Shield;
  const roleLabel = member.role === "OWNER" ? "Propriétaire" : member.role === "ADMIN" ? "Admin" : "Membre";
  const roleColor = member.role === "OWNER" ? "text-primary" : member.role === "ADMIN" ? "text-amber-500" : "text-muted-foreground";

  return (
    <div className="flex items-center justify-between py-1.5 px-2 rounded-lg bg-muted/50 text-xs">
      <div className="flex items-center gap-2 min-w-0">
        <RoleIcon className={`w-3.5 h-3.5 shrink-0 ${roleColor}`} />
        <div className="min-w-0">
          <p className="font-medium truncate">{member.userName || member.userEmail}</p>
          {member.userName && (
            <p className="text-[10px] text-muted-foreground truncate">{member.userEmail}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0 ml-2">
        {/* Role change - only OWNER can change roles, and not on themselves */}
        {isOwner && member.role !== "OWNER" && (
          <select
            value={member.role}
            disabled={isPending}
            onChange={(e) => {
              const formData = new FormData();
              formData.set("establishmentId", establishmentId);
              formData.set("memberId", member.id);
              formData.set("role", e.target.value);
              startTransition(async () => {
                const result = await updateMemberRole(formData);
                if (result?.error) setError(result.error);
              });
            }}
            className="text-[10px] sm:text-xs bg-background border border-border rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="ADMIN">Admin</option>
            <option value="MEMBER">Membre</option>
          </select>
        )}

        {/* Show role badge for non-changeable roles */}
        {(!isOwner || member.role === "OWNER") && (
          <span className={`text-[10px] font-medium ${roleColor}`}>{roleLabel}</span>
        )}

        {/* Remove button */}
        {canManage && member.role !== "OWNER" && (
          <button
            disabled={isPending}
            onClick={() => {
              const formData = new FormData();
              formData.set("establishmentId", establishmentId);
              formData.set("memberId", member.id);
              startTransition(async () => {
                const result = await removeMember(formData);
                if (result?.error) setError(result.error);
              });
            }}
            className="p-1 text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
            title="Retirer ce membre"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        )}
      </div>

      {error && <p className="text-[10px] text-destructive mt-1">{error}</p>}
    </div>
  );
}

function InviteForm({ establishmentId, isOwner }: { establishmentId: string; isOwner: boolean }) {
  const [showForm, setShowForm] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors mt-1"
      >
        <UserPlus className="w-3.5 h-3.5" />
        Inviter un membre
      </button>
    );
  }

  return (
    <form
      className="mt-2 space-y-2 p-2 bg-muted/30 rounded-lg border border-border"
      action={(formData) => {
        startTransition(async () => {
          setError(null);
          setSuccess(false);
          formData.set("establishmentId", establishmentId);
          const result = await inviteMember(formData);
          if (result?.error) {
            setError(result.error);
          } else {
            setSuccess(true);
            setTimeout(() => {
              setShowForm(false);
              setSuccess(false);
            }, 1500);
          }
        });
      }}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium">Inviter un membre</span>
        <button type="button" onClick={() => { setShowForm(false); setError(null); }}>
          <X className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
        </button>
      </div>

      <input
        name="email"
        type="email"
        required
        placeholder="email@exemple.com"
        className="w-full px-2.5 py-1.5 border border-border rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary"
      />

      {isOwner && (
        <select
          name="role"
          defaultValue="MEMBER"
          className="w-full px-2.5 py-1.5 border border-border rounded-lg text-xs bg-background focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="MEMBER">Membre - voir et envoyer</option>
          <option value="ADMIN">Admin - gérer l'établissement</option>
        </select>
      )}

      {!isOwner && <input type="hidden" name="role" value="MEMBER" />}

      {error && <p className="text-[10px] text-destructive">{error}</p>}
      {success && <p className="text-[10px] text-green-600">Membre ajouté !</p>}

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-primary text-primary-foreground py-1.5 rounded-lg text-xs font-medium hover:opacity-90 disabled:opacity-50"
      >
        {isPending ? "Invitation..." : "Inviter"}
      </button>
    </form>
  );
}
