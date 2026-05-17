// src/app/(protected)/settings/team/roles/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ShieldCheck,
  Loader2,
  UserCog,
  Trash2,
  ChevronLeft,
  Crown,
  Users,
  Clock,
  ChevronDown,
  AlertCircle,
  RefreshCw,
  Copy,
  Check,
  UserPlus
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ROLES } from "@/lib/roles";
import type { Role } from "@/lib/roles";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 型定義
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
interface TeamMember {
  memberId: string;
  userId: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  role: string;
  status: "active" | "pending";
  joinedAt: number | null;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ロール設定（表示名・色・アイコン）
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const ROLE_CONFIG: Record<string, {
  label: string;
  desc: string;
  color: string;
  bg: string;
  icon: React.ReactNode;
}> = {
  [ROLES.MANAGER]: {
    label: "監督 / 代表",
    desc: "全権限 — チーム設定・メンバー管理まで",
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/30",
    icon: <Crown className="h-3.5 w-3.5" />,
  },
  [ROLES.COACH]: {
    label: "コーチ",
    desc: "スコア入力・選手管理・データ閲覧",
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/30",
    icon: <ShieldCheck className="h-3.5 w-3.5" />,
  },
  [ROLES.SCORER]: {
    label: "スコアラー",
    desc: "スコア入力・データ閲覧",
    color: "text-green-600 dark:text-green-400",
    bg: "bg-green-500/10 border-green-500/30",
    icon: <UserCog className="h-3.5 w-3.5" />,
  },
  [ROLES.STAFF]: {
    label: "スタッフ",
    desc: "データ閲覧・限定的な情報アクセス",
    color: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-500/10 border-purple-500/30",
    icon: <Users className="h-3.5 w-3.5" />,
  },
  [ROLES.PLAYER]: {
    label: "選手",
    desc: "チームデータの閲覧のみ",
    color: "text-sky-600 dark:text-sky-400",
    bg: "bg-sky-500/10 border-sky-500/30",
    icon: <Users className="h-3.5 w-3.5" />,
  },
  [ROLES.VIEWER]: {
    label: "閲覧者",
    desc: "統計・試合結果の閲覧のみ",
    color: "text-muted-foreground",
    bg: "bg-muted/40 border-border/40",
    icon: <Users className="h-3.5 w-3.5" />,
  },
  [ROLES.PENDING]: {
    label: "承認待ち",
    desc: "参加申請中 — 監督の承認を待っています",
    color: "text-orange-600 dark:text-orange-400",
    bg: "bg-orange-500/10 border-orange-500/30",
    icon: <Clock className="h-3.5 w-3.5" />,
  },
};

const SELECTABLE_ROLES: Role[] = [
  ROLES.MANAGER,
  ROLES.COACH,
  ROLES.SCORER,
  ROLES.STAFF,
  ROLES.PLAYER,
  ROLES.VIEWER,
];

function getRoleConfig(role: string) {
  return ROLE_CONFIG[role] ?? {
    label: role,
    desc: "",
    color: "text-muted-foreground",
    bg: "bg-muted/40 border-border/40",
    icon: <Users className="h-3.5 w-3.5" />,
  };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// RoleBadge
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function RoleBadge({ role }: { role: string }) {
  const cfg = getRoleConfig(role);
  return (
    <span className={cn(
      "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black border uppercase tracking-wider",
      cfg.bg, cfg.color
    )}>
      {cfg.icon}
      {cfg.label}
    </span>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// RoleSelector ドロップダウン
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
interface RoleSelectorProps {
  currentRole: string;
  memberId: string;
  myRole: string;
  onRoleChange: (memberId: string, newRole: string) => Promise<void>;
  disabled?: boolean;
}

function RoleSelector({ currentRole, memberId, myRole, onRoleChange, disabled }: RoleSelectorProps) {
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
          cfg.bg, cfg.color,
          canChange && "hover:opacity-80 cursor-pointer",
          !canChange && "cursor-default opacity-80"
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
                  className={cn(
                    "w-full flex items-start gap-2.5 px-3 py-2.5 rounded-xl text-left transition-colors hover:bg-muted/60",
                    r === currentRole && "bg-primary/10"
                  )}
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

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MemberCard
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
interface MemberCardProps {
  member: TeamMember;
  myUserId: string;
  myRole: string;
  onRoleChange: (memberId: string, newRole: string) => Promise<void>;
  onRemove: (member: TeamMember) => void;
}

function MemberCard({ member, myUserId, myRole, onRoleChange, onRemove }: MemberCardProps) {
  const isMe = member.userId === myUserId;
  const canManage = myRole === ROLES.MANAGER || myRole === "SYSTEM_ADMIN";
  const isPending = member.status === "pending";

  const joinedDate = member.joinedAt
    ? new Date(member.joinedAt * 1000).toLocaleDateString("ja-JP", { year: "numeric", month: "short", day: "numeric" })
    : null;

  return (
    <div className={cn(
      "group flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-2xl border transition-all",
      isPending
        ? "bg-orange-500/5 border-orange-500/20"
        : "bg-card/60 border-border/40 hover:border-primary/30 hover:bg-primary/5"
    )}>
      {/* アバター */}
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

      {/* 名前・メール */}
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

      {/* ロール選択 */}
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

      {/* 除名ボタン */}
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

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 除名確認モーダル
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
interface RemoveConfirmModalProps {
  member: TeamMember;
  isRemoving: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

function RemoveConfirmModal({ member, isRemoving, onConfirm, onCancel }: RemoveConfirmModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-card rounded-3xl border border-border/50 shadow-2xl p-6 space-y-5 animate-in slide-in-from-bottom-4 duration-300">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-red-500/10 flex items-center justify-center shrink-0">
            <AlertCircle className="h-6 w-6 text-red-500" />
          </div>
          <div>
            <h3 className="font-black text-base text-foreground">メンバーを除名しますか？</h3>
            <p className="text-xs text-muted-foreground mt-0.5">この操作は取り消せません</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 border border-border/40">
          <Avatar className="h-9 w-9 shrink-0">
            <AvatarImage src={member.avatarUrl ?? ""} />
            <AvatarFallback className="bg-primary/10 text-primary font-black text-xs">
              {(member.name || "?").slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-black">{member.name}</p>
            <p className="text-[11px] text-muted-foreground">{member.email}</p>
          </div>
        </div>

        <div className="flex gap-2 pt-1">
          <Button variant="outline" onClick={onCancel} disabled={isRemoving}
            className="flex-1 rounded-2xl font-bold border-border/50">
            キャンセル
          </Button>
          <Button onClick={onConfirm} disabled={isRemoving}
            className="flex-1 rounded-2xl font-black bg-red-500 hover:bg-red-600 text-white border-0">
            {isRemoving ? <Loader2 className="h-4 w-4 animate-spin" /> : "除名する"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// メインページ
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export default function TeamMembersPage() {
  const router = useRouter();

  const [members, setMembers] = useState<TeamMember[]>([]);
  const [myUserId, setMyUserId] = useState("");
  const [myRole, setMyRole] = useState("");
  const [teamId, setTeamId] = useState("");
  const [teamName, setTeamName] = useState("");
  const [inviteCode, setInviteCode] = useState(""); // 招待コードの状態管理
  const [isCopied, setIsCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [removeTarget, setRemoveTarget] = useState<TeamMember | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);

  // ─── データ取得 ───────────────────────
  const fetchMembers = useCallback(async (tid: string) => {
    try {
      const res = await fetch(`/api/teams/${tid}/members`);
      const json = await res.json() as { success: boolean; members?: TeamMember[], inviteCode?: string };
      if (json.success && json.members) {
        setMembers(json.members);
        // Cloudflare Workers のレスポンスに招待コードを含める想定
        if (json.inviteCode) {
          setInviteCode(json.inviteCode);
        }
      }
    } catch {
      toast.error("メンバー情報の取得に失敗しました");
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      try {
        // 1. 自分のセッション取得
        const meRes = await fetch("/api/auth/me");
        const meJson = await meRes.json() as {
          success: boolean;
          data: {
            id: string;
            memberships: { teamId: string; teamName: string; role: string; isMainTeam: boolean }[];
          };
        };
        if (!meJson.success) throw new Error("認証エラー");

        const me = meJson.data;
        setMyUserId(me.id);

        // 2. 選択中チームを特定
        const selectedTeamId = localStorage.getItem("iscore_selectedTeamId") ?? "";
        const membership = me.memberships.find(m => m.teamId === selectedTeamId)
          ?? me.memberships.find(m => m.isMainTeam)
          ?? me.memberships[0];

        if (!membership) { router.push("/teams"); return; }

        setTeamId(membership.teamId);
        setTeamName(membership.teamName);
        setMyRole(membership.role);

        // 3. メンバー一覧取得
        await fetchMembers(membership.teamId);
      } catch {
        toast.error("データの取得に失敗しました");
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, [router, fetchMembers]);

  // ─── 招待コードコピー機能 ──────────────
  const handleCopyCode = async () => {
    if (!inviteCode) return;
    try {
      await navigator.clipboard.writeText(inviteCode);
      setIsCopied(true);
      toast.success("招待コードをコピーしました！");
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      toast.error("クリップボードへのコピーに失敗しました");
    }
  };

  // ─── ロール変更 ───────────────────────
  const handleRoleChange = async (memberId: string, newRole: string) => {
    try {
      const res = await fetch(`/api/teams/${teamId}/members/${memberId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      const json = await res.json() as { success: boolean; error?: string };
      if (!json.success) throw new Error(json.error ?? "更新失敗");

      setMembers(prev => prev.map(m =>
        m.memberId === memberId ? { ...m, role: newRole } : m
      ));
      toast.success("ロールを変更しました");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "ロールの変更に失敗しました");
    }
  };

  // ─── 除名 ─────────────────────────────
  const handleRemoveConfirm = async () => {
    if (!removeTarget) return;
    setIsRemoving(true);
    try {
      const res = await fetch(`/api/teams/${teamId}/members/${removeTarget.memberId}`, {
        method: "DELETE",
      });
      const json = await res.json() as { success: boolean; error?: string };
      if (!json.success) throw new Error(json.error ?? "除名失敗");

      setMembers(prev => prev.filter(m => m.memberId !== removeTarget.memberId));
      toast.success(`${removeTarget.name} さんをチームから除名しました`);
      setRemoveTarget(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "除名処理に失敗しました");
    } finally {
      setIsRemoving(false);
    }
  };

  // ─── 表示分類 ─────────────────────────
  const activeMembers = members.filter(m => m.status === "active");
  const pendingMembers = members.filter(m => m.status === "pending");
  const canManage = myRole === ROLES.MANAGER || myRole === "SYSTEM_ADMIN";

  // ─── ローディング ─────────────────────
  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm font-bold text-muted-foreground">メンバー情報を取得中...</p>
        </div>
      </div>
    );
  }

  // ─── 本体 ─────────────────────────────
  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500 pb-24">

      {/* ヘッダー */}
      <div className="flex items-start gap-4">
        <Button
          variant="ghost" size="icon"
          onClick={() => router.back()}
          className="h-10 w-10 rounded-full bg-card/60 border border-border/40 hover:bg-muted shrink-0 mt-1"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="border-primary/30 text-primary bg-primary/5 rounded-full px-3 py-0.5 text-[9px] font-black tracking-widest uppercase">
              Team Settings
            </Badge>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black italic tracking-tighter uppercase text-foreground leading-none">
            Members
          </h1>
          <p className="text-sm font-bold text-muted-foreground mt-1 truncate">{teamName}</p>
        </div>
        <Button
          variant="ghost" size="icon"
          onClick={() => fetchMembers(teamId)}
          className="h-10 w-10 rounded-full bg-card/60 border border-border/40 hover:bg-muted shrink-0 mt-1"
          title="更新"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* サマリーバー */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Members", value: activeMembers.length, color: "text-foreground" },
          { label: "Pending", value: pendingMembers.length, color: pendingMembers.length > 0 ? "text-orange-500" : "text-muted-foreground" },
          { label: "Managers", value: activeMembers.filter(m => m.role === ROLES.MANAGER).length, color: "text-amber-500" },
        ].map(({ label, value, color }) => (
          <Card key={label} className="bg-card/40 border-border/40 rounded-2xl shadow-none">
            <CardContent className="p-4 text-center">
              <p className={cn("text-3xl font-black tabular-nums", color)}>{value}</p>
              <p className="text-[9px] font-black text-muted-foreground uppercase tracking-wider mt-1">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 招待コード (マネージャー権限のみ表示) */}
      {canManage && inviteCode && (
        <Card className="bg-primary/5 border-primary/20 rounded-2xl overflow-hidden relative">
          <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
          <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-black flex items-center gap-1.5 text-primary">
                <UserPlus className="h-4 w-4" />
                チーム招待コード
              </h3>
              <p className="text-xs text-muted-foreground mt-1 font-medium">
                このコードを共有して、新しいメンバーをチームに招待しましょう。
              </p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="bg-background border border-border/50 rounded-xl px-4 py-2 flex-1 sm:flex-none text-center sm:text-left min-w-[140px]">
                <code className="text-lg font-black tracking-widest text-foreground select-all">
                  {inviteCode}
                </code>
              </div>
              <Button
                onClick={handleCopyCode}
                variant={isCopied ? "default" : "outline"}
                className={cn(
                  "h-11 px-4 rounded-xl transition-all font-bold shrink-0",
                  isCopied 
                    ? "bg-green-500 hover:bg-green-600 text-white border-green-500" 
                    : "border-border/50 hover:bg-muted"
                )}
              >
                {isCopied ? (
                  <><Check className="h-4 w-4 mr-1.5" /> コピー完了</>
                ) : (
                  <><Copy className="h-4 w-4 mr-1.5" /> コピー</>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 承認待ちメンバー */}
      {pendingMembers.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-orange-500" />
            <h2 className="text-sm font-black uppercase tracking-widest text-orange-500">
              承認待ち ({pendingMembers.length})
            </h2>
          </div>
          <div className="space-y-2">
            {pendingMembers.map(m => (
              <MemberCard
                key={m.memberId}
                member={m}
                myUserId={myUserId}
                myRole={myRole}
                onRoleChange={handleRoleChange}
                onRemove={setRemoveTarget}
              />
            ))}
          </div>
          {canManage && (
            <Button
              variant="outline"
              onClick={() => router.push("/teams/requests")}
              className="w-full rounded-2xl h-11 border-orange-500/30 text-orange-500 hover:bg-orange-500/10 font-bold text-sm"
            >
              参加申請を管理する →
            </Button>
          )}
        </div>
      )}

      {/* アクティブメンバー */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-black uppercase tracking-widest text-primary">
            Active Members ({activeMembers.length})
          </h2>
        </div>
        <div className="space-y-2">
          {activeMembers.map(m => (
            <MemberCard
              key={m.memberId}
              member={m}
              myUserId={myUserId}
              myRole={myRole}
              onRoleChange={handleRoleChange}
              onRemove={setRemoveTarget}
            />
          ))}
        </div>
      </div>

      {/* 除名確認モーダル */}
      {removeTarget && (
        <RemoveConfirmModal
          member={removeTarget}
          isRemoving={isRemoving}
          onConfirm={handleRemoveConfirm}
          onCancel={() => setRemoveTarget(null)}
        />
      )}
    </div>
  );
}
