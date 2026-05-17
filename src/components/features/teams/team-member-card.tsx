// src/components/features/teams/team-member-card.tsx
"use client";

import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ShieldCheck, Loader2, UserCog, Trash2, Crown, Users, Clock, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { ROLES } from "@/lib/roles";
import type { Role } from "@/lib/roles";

export interface TeamMember {
  memberId: string;
  userId: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  role: string;
  status: "active" | "pending";
  joinedAt: number | null;
}

const ROLE_CONFIG: Record<string, {
  label: string;
  desc: string;
  color: string;
  bg: string;
  icon: React.ReactNode;
}> = {
  [ROLES.MANAGER]: { label: "監督 / 代表", desc: "全権限 — チーム設定・メンバー管理まで", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/10 border-amber-500/30", icon: <Crown className="h-3.5 w-3.5" /> },
  [ROLES.COACH]: { label: "コーチ", desc: "スコア入力・選手管理・データ閲覧", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-500/10 border-blue-500/30", icon: <ShieldCheck className="h-3.5 w-3.5" /> },
  [ROLES.SCORER]: { label: "スコアラー", desc: "スコア入力・データ閲覧", color: "text-green-600 dark:text-green-400", bg: "bg-green-500/10 border-green-500/30", icon: <UserCog className="h-3.5 w-3.5" /> },
  [ROLES.STAFF]: { label: "スタッフ", desc: "データ閲覧・限定的な情報アクセス", color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-500/10 border-purple-500/30", icon: <Users className="h-3.5 w-3.5" /> },
  [ROLES.PLAYER]: { label: "選手", desc: "チームデータの閲覧のみ", color: "text-sky-600 dark:text-sky-400", bg: "bg-sky-500/10 border-sky-500/30", icon: <Users className="h-3.5 w-3.5" /> },
  [ROLES.VIEWER]: { label: "閲覧者", desc: "統計・試合結果の閲覧のみ", color: "text-muted-foreground", bg: "bg-muted/40 border-border/40", icon: <Users className="h-3.5 w-3.5" /> },
  [ROLES.PENDING]: { label: "承認待ち", desc: "参加申請中 — 監督の承認を待っています", color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-500/10 border-orange-500/30", icon: <Clock className="h-3.5 w-3.5" /> },
};

const SELECTABLE_ROLES: Role[] = [ROLES.MANAGER, ROLES.COACH, ROLES.SCORER, ROLES.STAFF, ROLES.PLAYER, ROLES.VIEWER];

function getRoleConfig(role: string) {
  return ROLE_CONFIG[role] ?? { label: role, desc: "", color: "text-muted-foreground", bg: "bg-muted/40 border-border/40", icon: <Users className="h-3.5 w-3.5" /> };
}

function RoleBadge({ role }: { role: string }) {
  const cfg = getRoleConfig(role);
  return (
    <span className={cn("inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black border uppercase tracking-wider", cfg.bg, cfg.color)}>
      {cfg.icon}
      {cfg.label}
    </span>
  );
}

function RoleSelector({ currentRole, memberId, myRole, onRoleChange, disabled }: {
  currentRole: string; memberId: string; myRole: string; onRoleChange: (memberId: string, newRole: string) => Promise<void>; disabled?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isChanging, setIsChanging] = useState(false);
  const cfg = getRoleConfig(currentRole);
  const canChange = !disabled && (myRole === ROLES.MANAGER || myRole === "SYSTEM_ADMIN");

  const handleSelect = async (role: string) => {
    if (role === currentRole) { setIsOpen(false); return; }
    setIsChanging(true);
    setIsOpen(false);
    await onRoleChange(memberId, role);
    setIsChanging(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => canChange && setIsOpen(!isOpen)}
        disabled={isChanging || !canChange}
        className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black border uppercase tracking-wider transition-all",
          cfg.bg, cfg.color, canChange && "hover:opacity-80 cursor-pointer", !canChange && "cursor-default opacity-80"
        )}
      >
        {isChanging ? <Loader2 className="h-3 w-3 animate-spin" /> : cfg.icon}
        {cfg.label}
        {canChange && <ChevronDown className={cn("h-3 w-3 transition-transform", isOpen && "rotate-180")} />}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-8 z-40 w-52 rounded-2xl border border-border/50 bg-card shadow-xl p-1.5 animate-in fade-in slide-in-from-top-2 duration-150">
            {SELECTABLE_ROLES.map((r) => {
              const rc = getRoleConfig(r);
              return (
                <button
                  key={r}
                  onClick={() => handleSelect(r)}
                  className={cn("w-full flex items-start gap-2.5 px-3 py-2.5 rounded-xl text-left transition-colors hover:bg-muted/60", r === currentRole && "bg-primary/10")}
                >
                  <span className={cn("mt-0.5", rc.color)}>{rc.icon}</span>
                  <div className="flex flex-col">
                    <span className={cn("text-xs font-black", rc.color)}>{rc.label}</span>
                    <span className="text-[9px] text-muted-foreground leading-tight">{rc.desc}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

interface TeamMemberCardProps {
  member: TeamMember;
  myUserId: string;
  myRole: string;
  onRoleChange: (memberId: string, newRole: string) => Promise<void>;
  onRemove: (member: TeamMember) => void;
}

export function TeamMemberCard({ member, myUserId, myRole, onRoleChange, onRemove }: TeamMemberCardProps) {
  const isMe = member.userId === myUserId;
  const canManage = myRole === ROLES.MANAGER || myRole === "SYSTEM_ADMIN";
  const isPending = member.status === "pending";

  const joinedDate = member.joinedAt
    ? new Date(member.joinedAt * 1000).toLocaleDateString("ja-JP", { year: "numeric", month: "short", day: "numeric" })
    : null;

  return (
    <div className={cn(
      "group flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-2xl border transition-all",
      isPending ? "bg-orange-500/5 border-orange-500/20" : "bg-card/60 border-border/40 hover:border-primary/30 hover:bg-primary/5"
    )}>
      <div className="relative shrink-0">
        <Avatar className="h-10 w-10 sm:h-12 sm:w-12 border-2 border-border/40">
          <AvatarImage src={member.avatarUrl ?? ""} alt={member.name} className="object-cover" />
          <AvatarFallback className="bg-primary/10 text-primary font-black text-sm">
            {(member.name || "?").slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        {isPending && (
          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-orange-500 border-2 border-background flex items-center justify-center">
            <Clock className="h-2.5 w-2.5 text-white" />
          </span>
        )}
        {isMe && (
          <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-primary border-2 border-background flex items-center justify-center">
            <ShieldCheck className="h-2.5 w-2.5 text-primary-foreground" />
          </span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-black truncate text-foreground">
            {member.name}
            {isMe && <span className="ml-1.5 text-[9px] font-black text-primary uppercase tracking-wider">（あなた）</span>}
          </p>
        </div>
        <p className="text-[11px] text-muted-foreground truncate">{member.email}</p>
        {joinedDate && (
          <p className="text-[10px] text-muted-foreground/60 mt-0.5">
            {isPending ? "申請日: " : "参加: "}{joinedDate}
          </p>
        )}
      </div>

      <div className="shrink-0">
        {isPending ? (
          <RoleBadge role={ROLES.PENDING} />
        ) : (
          <RoleSelector
            currentRole={member.role}
            memberId={member.memberId}
            myRole={myRole}
            onRoleChange={onRoleChange}
            disabled={isMe}
          />
        )}
      </div>

      {canManage && !isMe && (
        <button
          onClick={() => onRemove(member)}
          className="shrink-0 h-8 w-8 rounded-xl border border-border/40 flex items-center justify-center text-muted-foreground hover:bg-red-500 hover:text-white hover:border-red-500 transition-all opacity-0 group-hover:opacity-100"
          title="チームから除名"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
