// filepath: src/app/(protected)/players/page.tsx
"use client";
/* 💡 選手名簿一覧・管理ページ */

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Search, UserPlus, Loader2, UserCircle, Users } from "lucide-react";
import { toast } from "sonner";

// 💡 共通レイアウトコンポーネント
import { SectionHeader } from "@/components/layout/SectionHeader";
import { EmptyState } from "@/components/layout/EmptyState";

// 💡 分割したコンポーネント・型・定数のインポート
import { Player, PlayerFormData, PosCategory } from "@/types/player";
import { getCategory } from "@/components/features/players/constants";
import { PlayerCard } from "@/components/features/players/PlayerCard";
import { SummaryCard } from "@/components/features/players/SummaryCard";
import { PlayerForm } from "@/components/features/players/PlayerForm";

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
      // 💡 Cloudflare WorkersのAPIエンドポイント
      const res = await fetch(`/api/teams/${tid}/players`);
      if (!res.ok) throw new Error("データの取得に失敗しました");
      
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

  // ... (handleAdd, handleEdit, handleDelete のロジックは変更なし) ...

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

  // 💡 チーム未選択時のEmptyState適用
  if (!teamId) {
    return (
      <div className="flex h-[60vh] items-center justify-center p-6 animate-in fade-in">
        <EmptyState 
          icon={UserCircle} 
          title="チームが選択されていません" 
          description="ダッシュボードでチームを選択してください" 
          className="w-full max-w-sm"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-28 animate-in fade-in duration-400">
      <div className="max-w-2xl mx-auto px-4 pt-6 space-y-6">
        
        {/* ━━ ページヘッダー (日本語メイン・英語サブに反転) ━━ */}
        <div className="space-y-4">
          <SectionHeader 
            title="選手名簿"   // 💡 メインを日本語に
            subtitle="PLAYERS" // 💡 サブを英語に
            showPulse={true} 
          />
          
          <div className="flex items-center justify-between bg-card p-3 rounded-[var(--radius-xl)] border border-border shadow-sm">
            <p className="text-sm font-black text-foreground flex items-center gap-1.5">
              <Users className="h-4 w-4 text-primary" />
              {players.length}
              <span className="text-xs font-bold text-muted-foreground">名登録中</span>
            </p>
            <Button 
              onClick={() => setIsAddOpen(true)} 
              size="sm" 
              className="h-9 px-4 rounded-[var(--radius-lg)] font-black gap-2"
            >
              <UserPlus className="h-4 w-4" strokeWidth={2.5} />
              選手追加
            </Button>
          </div>
        </div>

        {/* ━━ カテゴリ別サマリー ━━ */}
        <div className="grid grid-cols-4 gap-2">
          {(["投手", "捕手", "内野手", "外野手"] as PosCategory[]).map(cat => (
            <SummaryCard key={cat} cat={cat} count={counts[cat] ?? 0} isActive={filter === cat} onClick={() => setFilter(filter === cat ? "すべて" : cat)} />
          ))}
        </div>

        {/* ━━ 検索 ━━ */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input placeholder="名前・背番号で検索..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="h-11 pl-10 rounded-[var(--radius-xl)] font-medium bg-card border-border" />
        </div>

        {/* ━━ 選手リスト ━━ */}
        <div className="grid grid-cols-1 gap-3">
          {filtered.length === 0 ? (
            // 💡 検索結果ゼロ時 / データなし時のEmptyState適用
            <EmptyState 
              icon={Users} 
              title="選手が見つかりません" 
              description="検索条件を変更するか、新しい選手を追加してください" 
              className="mt-4"
            />
          ) : (
            filtered.map(player => (
              <PlayerCard key={player.id} player={player} teamId={teamId} onEdit={setEditTarget} onDelete={setDeleteTarget} onDetail={() => router.push(`/players/${player.id}`)} />
            ))
          )}
        </div>
      </div>

      {/* ━━ 各種ダイアログ (現場仕様: onInteractOutsideを装備) ━━ */}
      {/* 略: isAddOpen, editTarget, deleteTarget のDialog */}
    </div>
  );
}
