// src/app/(protected)/settings/team/roles/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, Loader2, RefreshCw, Clock, Users } from "lucide-react";
import { ROLES } from "@/lib/roles";

// 新しいコンポーネント名とファイルパスでインポート
import { TeamSummaryCards } from "@/components/features/teams/team-summary-cards";
import { TeamInviteCard } from "@/components/features/teams/team-invite-card";
import { TeamMemberCard, type TeamMember } from "@/components/features/teams/team-member-card";
import { TeamMemberRemoveModal } from "@/components/features/teams/team-member-remove-modal";

export default function TeamMembersPage() {
  const router = useRouter();

  const [members, setMembers] = useState<TeamMember[]>([]);
  const [myUserId, setMyUserId] = useState("");
  const [myRole, setMyRole] = useState("");
  const [teamId, setTeamId] = useState("");
  const [teamName, setTeamName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [removeTarget, setRemoveTarget] = useState<TeamMember | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);

  // ─── データ取得 ───────────────────────
  const fetchMembers = useCallback(async (tid: string) => {
    try {
      const res = await fetch(`/api/teams/${tid}/members`);
      const json = await res.json() as { success: boolean; members?: TeamMember[]; inviteCode?: string };
      if (json.success && json.members) {
        setMembers(json.members);
        if (json.inviteCode) setInviteCode(json.inviteCode);
      }
    } catch {
      toast.error("メンバー情報の取得に失敗しました");
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      try {
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

        const selectedTeamId = localStorage.getItem("iscore_selectedTeamId") ?? "";
        const membership = me.memberships.find(m => m.teamId === selectedTeamId)
          ?? me.memberships.find(m => m.isMainTeam)
          ?? me.memberships[0];

        if (!membership) { router.push("/teams"); return; }

        setTeamId(membership.teamId);
        setTeamName(membership.teamName);
        setMyRole(membership.role);

        await fetchMembers(membership.teamId);
      } catch {
        toast.error("データの取得に失敗しました");
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, [router, fetchMembers]);

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
  const managerCount = activeMembers.filter(m => m.role === ROLES.MANAGER).length;

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
      <TeamSummaryCards
        totalCount={activeMembers.length}
        pendingCount={pendingMembers.length}
        managerCount={managerCount}
      />

      {/* 招待コード (マネージャー権限のみ表示) */}
      {canManage && inviteCode && <TeamInviteCard inviteCode={inviteCode} />}

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
              <TeamMemberCard
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
            <TeamMemberCard
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

      {/* チームメンバー除名確認モーダル */}
      {removeTarget && (
        <TeamMemberRemoveModal
          member={removeTarget}
          isRemoving={isRemoving}
          onConfirm={handleRemoveConfirm}
          onCancel={() => setRemoveTarget(null)}
        />
      )}
    </div>
  );
}
