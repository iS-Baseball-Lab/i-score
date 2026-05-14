// src/app/(protected)/players/page.tsx
"use client";
/* 💡 選手名簿一覧・管理ページ */

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Search, UserPlus, Loader2, Activity, UserCircle, Users } from "lucide-react";
import { toast } from "sonner";

// 分割したコンポーネント・型・定数のインポート
import { Player, PlayerFormData, PosCategory } from "@/types/player";
import { getCategory } from "@/components/features/players/constants";
import { PlayerCard } from "@/components/features/players/PlayerCard";
import { SummaryCard } from "@/components/features/players/SummaryCard";
import { PlayerForm, EMPTY_FORM } from "@/components/features/players/PlayerForm";

export default function PlayerRosterPage() {
  const router = useRouter();
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [teamId, setTeamId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<PosCategory | "すべて">("すべて");

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Player | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Player | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPlayers = useCallback(async (tid: string) => {
    setIsLoading(true);
    try {
      // 💡 APIは最終的にCloudflare Workersに展開される前提
      const res = await fetch(`/api/teams/${tid}/players`);
      if (!res.ok) throw new Error();
      const data = (await res.json()) as Player[];
      setPlayers(Array.isArray(data) ? data : []);
    } catch {
      toast.error("選手一覧の取得に失敗しました");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const tid = localStorage.getItem("iscore_selectedTeamId");
    if (!tid) { setIsLoading(false); return; }
    setTeamId(tid);
    fetchPlayers(tid);
  }, [fetchPlayers]);

  const handleAdd = async (data: PlayerFormData) => {
    if (!teamId) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/teams/${teamId}/players`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      toast.success(`${data.name} 選手を登録しました`);
      setIsAddOpen(false);
      await fetchPlayers(teamId);
    } catch {
      toast.error("登録に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async (data: PlayerFormData) => {
    if (!teamId || !editTarget) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/teams/${teamId}/players/${editTarget.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      toast.success(`${data.name} 選手を更新しました`);
      setEditTarget(null);
      await fetchPlayers(teamId);
    } catch {
      toast.error("更新に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!teamId || !deleteTarget) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/teams/${teamId}/players/${deleteTarget.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success(`${deleteTarget.name} 選手を削除しました`);
      setDeleteTarget(null);
      await fetchPlayers(teamId);
    } catch {
      toast.error("削除に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = players.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.uniformNumber.includes(searchQuery);
    const cat = getCategory(p.primaryPosition);
    return matchesSearch && (filter === "すべて" || cat === filter);
  });

  const counts = players.reduce<Record<string, number>>((acc, p) => {
    const cat = getCategory(p.primaryPosition);
    acc[cat] = (acc[cat] ?? 0) + 1;
    return acc;
  }, {});

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary/40 mx-auto" />
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">Loading...</p>
        </div>
      </div>
    );
  }

  if (!teamId) {
    return (
      <div className="flex h-[60vh] items-center justify-center p-6">
        <div className="text-center space-y-4 opacity-40">
          <UserCircle className="h-14 w-14 mx-auto" />
          <p className="font-black text-lg">チームが選択されていません</p>
          <p className="text-sm text-muted-foreground font-bold">ダッシュボードでチームを選択してください</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-28 animate-in fade-in duration-400">
      <div className="max-w-2xl mx-auto px-4 pt-6 space-y-5">
        {/* ヘッダー */}
        <div className="flex items-end justify-between gap-3">
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="inline-flex items-center gap-1 text-[10px] font-black text-primary uppercase tracking-[0.25em]">
                <Activity className="h-3 w-3" />選手管理
              </span>
            </div>
            <h1 className="text-[1.7rem] font-black tracking-tight leading-none">
              選手<span className="text-primary">名簿</span>
            </h1>
            <p className="text-xs font-bold text-muted-foreground mt-1 flex items-center gap-1">
              <Users className="h-3 w-3" />{players.length}名登録中
            </p>
          </div>
          <Button onClick={() => setIsAddOpen(true)} size="sm" className="h-10 px-4 rounded-[var(--radius-xl)] font-black gap-2 shadow-sm shrink-0">
            <UserPlus className="h-4 w-4" strokeWidth={2.5} />選手追加
          </Button>
        </div>

        {/* サマリーカード */}
        <div className="grid grid-cols-4 gap-2">
          {(["投手", "捕手", "内野手", "外野手"] as PosCategory[]).map(cat => (
            <SummaryCard key={cat} cat={cat} count={counts[cat] ?? 0} isActive={filter === cat} onClick={() => setFilter(filter === cat ? "すべて" : cat)} />
          ))}
        </div>

        {/* 検索 */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input placeholder="名前・背番号で検索..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="h-11 pl-10 rounded-[var(--radius-xl)] font-medium bg-card border-border" />
        </div>

        {/* 選手リスト（途切れていた部分の補完） */}
        <div className="grid grid-cols-1 gap-3">
          {filtered.length === 0 ? (
            <div className="text-center py-10 bg-muted/20 rounded-[var(--radius-2xl)] border border-dashed border-border">
              <p className="text-sm font-bold text-muted-foreground">選手が見つかりません</p>
            </div>
          ) : (
            filtered.map(player => (
              <PlayerCard key={player.id} player={player} teamId={teamId} onEdit={setEditTarget} onDelete={setDeleteTarget} onDetail={() => router.push(`/players/${player.id}`)} />
            ))
          )}
        </div>
      </div>

      {/* ━━ 各種ダイアログ ━━ */}
      {/* 💡 現場対応: onInteractOutside でダイアログの外側タップによる意図しないクローズを防止 */}
      
      {/* 追加ダイアログ */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent onInteractOutside={(e) => e.preventDefault()} className="rounded-[var(--radius-2xl)] bg-card border-border sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-black text-xl">新規選手の追加</DialogTitle>
            <DialogDescription className="text-xs font-bold text-muted-foreground">新しい選手情報を入力してください。</DialogDescription>
          </DialogHeader>
          <PlayerForm onSubmit={handleAdd} onCancel={() => setIsAddOpen(false)} isSubmitting={isSubmitting} submitLabel="登録する" />
        </DialogContent>
      </Dialog>

      {/* 編集ダイアログ */}
      <Dialog open={!!editTarget} onOpenChange={(open) => !open && setEditTarget(null)}>
        <DialogContent onInteractOutside={(e) => e.preventDefault()} className="rounded-[var(--radius-2xl)] bg-card border-border sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-black text-xl">選手情報の編集</DialogTitle>
            <DialogDescription className="text-xs font-bold text-muted-foreground">登録内容を修正します。</DialogDescription>
          </DialogHeader>
          {editTarget && (
            <PlayerForm
              initial={{
                name: editTarget.name, uniformNumber: editTarget.uniformNumber,
                primaryPosition: editTarget.primaryPosition ?? "",
                throws: editTarget.throws ?? "", bats: editTarget.bats ?? "",
              }}
              onSubmit={handleEdit} onCancel={() => setEditTarget(null)} isSubmitting={isSubmitting} submitLabel="更新する"
            />
          )}
        </DialogContent>
      </Dialog>

      {/* 削除確認ダイアログ */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent onInteractOutside={(e) => e.preventDefault()} className="rounded-[var(--radius-2xl)] bg-card border-border sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-black text-xl text-destructive">選手の削除</DialogTitle>
            <DialogDescription className="text-sm font-bold mt-2">
              本当に <span className="text-foreground">{deleteTarget?.name}</span> 選手を削除してもよろしいですか？<br />
              <span className="text-xs text-muted-foreground">※この操作は取り消せません。</span>
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setDeleteTarget(null)} className="flex-1 h-12 rounded-[var(--radius-xl)] font-black">キャンセル</Button>
            <Button type="button" variant="destructive" onClick={handleDelete} disabled={isSubmitting} className="flex-1 h-12 rounded-[var(--radius-xl)] font-black">
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "削除する"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}
