// src/app/(protected)/players/page.tsx
"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Search, UserPlus, ChevronRight,
  Loader2, Activity, Pencil, Trash2,
  UserCircle, Shield, Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 型定義
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
interface Player {
  id: string;
  name: string;
  uniformNumber: string;
  primaryPosition: string | null;
  throws: string | null;
  bats: string | null;
  isActive: number | boolean;
}

type PositionKey = "P" | "C" | "1B" | "2B" | "3B" | "SS" | "LF" | "CF" | "RF" | "DH";

const POSITION_LABELS: Record<PositionKey, string> = {
  P: "投手", C: "捕手", "1B": "一塁", "2B": "二塁", "3B": "三塁",
  SS: "遊撃", LF: "左翼", CF: "中堅", RF: "右翼", DH: "指名打者",
};

type PosCategory = "投手" | "捕手" | "内野手" | "外野手" | "DH" | "未設定";

const POSITION_CATEGORY: Record<PositionKey, PosCategory> = {
  P: "投手", C: "捕手",
  "1B": "内野手", "2B": "内野手", "3B": "内野手", SS: "内野手",
  LF: "外野手", CF: "外野手", RF: "外野手",
  DH: "DH",
};

// ポジション別カラーパレット（CSS変数＋Tailwindカラー）
const POSITION_COLOR: Record<PosCategory, {
  accent: string;       // 背番号エリア背景
  accentText: string;   // 背番号テキスト
  badge: string;        // ポジションバッジ
  dot: string;          // ドット
  filter: string;       // フィルタボタン選択時
}> = {
  投手: {
    accent: "bg-blue-500",
    accentText: "text-white",
    badge: "bg-blue-500/10 text-blue-600 border-blue-500/30 dark:text-blue-400",
    dot: "bg-blue-500",
    filter: "bg-blue-500/15 text-blue-700 border-blue-500/40 dark:text-blue-300",
  },
  捕手: {
    accent: "bg-orange-500",
    accentText: "text-white",
    badge: "bg-orange-500/10 text-orange-600 border-orange-500/30 dark:text-orange-400",
    dot: "bg-orange-500",
    filter: "bg-orange-500/15 text-orange-700 border-orange-500/40 dark:text-orange-300",
  },
  内野手: {
    accent: "bg-emerald-500",
    accentText: "text-white",
    badge: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30 dark:text-emerald-400",
    dot: "bg-emerald-500",
    filter: "bg-emerald-500/15 text-emerald-700 border-emerald-500/40 dark:text-emerald-300",
  },
  外野手: {
    accent: "bg-amber-500",
    accentText: "text-white",
    badge: "bg-amber-500/10 text-amber-600 border-amber-500/30 dark:text-amber-400",
    dot: "bg-amber-500",
    filter: "bg-amber-500/15 text-amber-700 border-amber-500/40 dark:text-amber-300",
  },
  DH: {
    accent: "bg-purple-500",
    accentText: "text-white",
    badge: "bg-purple-500/10 text-purple-600 border-purple-500/30 dark:text-purple-400",
    dot: "bg-purple-500",
    filter: "bg-purple-500/15 text-purple-700 border-purple-500/40 dark:text-purple-300",
  },
  未設定: {
    accent: "bg-muted",
    accentText: "text-muted-foreground",
    badge: "bg-muted text-muted-foreground border-border",
    dot: "bg-muted-foreground/50",
    filter: "bg-muted text-muted-foreground border-border",
  },
};

function getCategory(pos: string | null): PosCategory {
  if (!pos) return "未設定";
  return POSITION_CATEGORY[pos as PositionKey] ?? "未設定";
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// フォームデータ
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
interface PlayerFormData {
  name: string;
  uniformNumber: string;
  primaryPosition: string;
  throws: string;
  bats: string;
}

const EMPTY_FORM: PlayerFormData = {
  name: "", uniformNumber: "", primaryPosition: "", throws: "", bats: "",
};

interface PlayerFormProps {
  initial?: PlayerFormData;
  onSubmit: (data: PlayerFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  submitLabel: string;
}

function PlayerForm({ initial = EMPTY_FORM, onSubmit, onCancel, isSubmitting, submitLabel }: PlayerFormProps) {
  const [form, setForm] = useState<PlayerFormData>(initial);
  const set = (key: keyof PlayerFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm(prev => ({ ...prev, [key]: e.target.value }));

  return (
    <form onSubmit={async (e) => { e.preventDefault(); await onSubmit(form); }} className="space-y-4 pt-1">
      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1.5">
          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">背番号 *</Label>
          <Input
            value={form.uniformNumber}
            onChange={set("uniformNumber")}
            placeholder="01"
            required maxLength={3}
            className="h-12 rounded-[var(--radius-xl)] text-center text-xl font-black"
          />
        </div>
        <div className="col-span-2 space-y-1.5">
          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">氏名 *</Label>
          <Input
            value={form.name}
            onChange={set("name")}
            placeholder="山田 太郎"
            required
            className="h-12 rounded-[var(--radius-xl)] font-bold"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">守備位置</Label>
        <select
          value={form.primaryPosition}
          onChange={set("primaryPosition")}
          className="w-full h-12 rounded-[var(--radius-xl)] bg-input border border-border px-3 font-bold text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">未設定</option>
          {(Object.keys(POSITION_LABELS) as PositionKey[]).map(k => (
            <option key={k} value={k}>{k} — {POSITION_LABELS[k]}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">投</Label>
          <select value={form.throws} onChange={set("throws")} className="w-full h-12 rounded-[var(--radius-xl)] bg-input border border-border px-3 font-bold text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
            <option value="">未設定</option>
            <option value="R">右投 (R)</option>
            <option value="L">左投 (L)</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">打</Label>
          <select value={form.bats} onChange={set("bats")} className="w-full h-12 rounded-[var(--radius-xl)] bg-input border border-border px-3 font-bold text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
            <option value="">未設定</option>
            <option value="R">右打 (R)</option>
            <option value="L">左打 (L)</option>
            <option value="B">両打 (B)</option>
          </select>
        </div>
      </div>

      <div className="flex gap-3 pt-1">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1 h-12 rounded-[var(--radius-xl)] font-black">
          キャンセル
        </Button>
        <Button type="submit" disabled={isSubmitting} className="flex-1 h-12 rounded-[var(--radius-xl)] font-black">
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : submitLabel}
        </Button>
      </div>
    </form>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 選手カード（新デザイン）
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
interface PlayerCardProps {
  player: Player;
  teamId: string;
  onEdit: (p: Player) => void;
  onDelete: (p: Player) => void;
  onDetail: (p: Player) => void;
}

function PlayerCard({ player, onEdit, onDelete, onDetail }: PlayerCardProps) {
  const category = getCategory(player.primaryPosition);
  const colors = POSITION_COLOR[category];
  const posLabel = player.primaryPosition
    ? POSITION_LABELS[player.primaryPosition as PositionKey] ?? player.primaryPosition
    : null;
  const isActive = player.isActive === 1 || player.isActive === true;

  const throwsLabel = player.throws === "R" ? "右" : player.throws === "L" ? "左" : null;
  const batsLabel = player.bats === "R" ? "右" : player.bats === "L" ? "左" : player.bats === "B" ? "両" : null;

  return (
    <div className={cn(
      "group relative bg-card border border-border overflow-hidden",
      "rounded-[var(--radius-2xl)]",
      "transition-all duration-200 hover:shadow-md hover:shadow-black/5 dark:hover:shadow-black/20",
      "hover:-translate-y-0.5",
      !isActive && "opacity-60",
    )}>
      <div className="flex items-stretch">

        {/* ━━ 左：背番号カラムブロック ━━ */}
        <div className={cn(
          "flex flex-col items-center justify-center w-[4.5rem] shrink-0 py-4 gap-1",
          colors.accent,
        )}>
          <span className={cn(
            "text-3xl font-black italic tabular-nums leading-none tracking-tighter",
            colors.accentText,
          )}>
            {player.uniformNumber}
          </span>
          {player.primaryPosition && (
            <span className={cn(
              "text-[9px] font-black uppercase tracking-wider leading-none opacity-80",
              colors.accentText,
            )}>
              {player.primaryPosition}
            </span>
          )}
        </div>

        {/* ━━ 中央：選手情報 ━━ */}
        <div className="flex-1 px-3.5 py-3 min-w-0 flex flex-col justify-center gap-0.5">
          {/* ポジションフルネーム & 非アクティブ */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={cn(
              "inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-md border",
              colors.badge,
            )}>
              <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", colors.dot)} />
              {posLabel ?? "ポジション未設定"}
            </span>
            {!isActive && (
              <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground border border-border">
                非アクティブ
              </span>
            )}
          </div>

          {/* 氏名 */}
          <p className="text-[1.05rem] font-black tracking-tight text-card-foreground leading-snug truncate">
            {player.name}
          </p>

          {/* 投打情報 */}
          {(throwsLabel || batsLabel) && (
            <p className="text-[10px] font-bold text-muted-foreground leading-none">
              {throwsLabel && `投：${throwsLabel}`}
              {throwsLabel && batsLabel && "　"}
              {batsLabel && `打：${batsLabel}`}
            </p>
          )}
        </div>

        {/* ━━ 右：アクションボタン（常時表示） ━━ */}
        <div className="flex flex-col items-center justify-center gap-0.5 px-2 py-2 border-l border-border/40 shrink-0 bg-muted/20">
          {/* 編集 */}
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(player); }}
            className={cn(
              "w-9 h-9 flex items-center justify-center rounded-[var(--radius-lg)]",
              "text-muted-foreground",
              "hover:text-primary hover:bg-primary/10",
              "active:scale-90 transition-all duration-150",
            )}
            title="編集"
          >
            <Pencil className="h-[15px] w-[15px]" strokeWidth={2.2} />
          </button>

          {/* 削除 */}
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(player); }}
            className={cn(
              "w-9 h-9 flex items-center justify-center rounded-[var(--radius-lg)]",
              "text-muted-foreground",
              "hover:text-destructive hover:bg-destructive/10",
              "active:scale-90 transition-all duration-150",
            )}
            title="削除"
          >
            <Trash2 className="h-[15px] w-[15px]" strokeWidth={2.2} />
          </button>

          {/* 詳細 */}
          <button
            onClick={(e) => { e.stopPropagation(); onDetail(player); }}
            className={cn(
              "w-9 h-9 flex items-center justify-center rounded-[var(--radius-lg)]",
              "text-muted-foreground",
              "hover:text-card-foreground hover:bg-muted",
              "active:scale-90 transition-all duration-150",
            )}
            title="詳細"
          >
            <ChevronRight className="h-[15px] w-[15px]" strokeWidth={2.5} />
          </button>
        </div>

      </div>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// カテゴリサマリーカード
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
interface SummaryCardProps {
  cat: PosCategory;
  count: number;
  isActive: boolean;
  onClick: () => void;
}

function SummaryCard({ cat, count, isActive, onClick }: SummaryCardProps) {
  const colors = POSITION_COLOR[cat];
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-[var(--radius-xl)] p-3 border text-center transition-all duration-150 active:scale-95",
        isActive
          ? colors.filter
          : "bg-card border-border hover:border-primary/30 hover:bg-muted/40",
      )}
    >
      <div className={cn("w-2 h-2 rounded-full mx-auto mb-1.5", colors.dot)} />
      <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1">{cat}</p>
      <p className="text-2xl font-black tabular-nums text-card-foreground leading-none">{count}</p>
    </button>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// メインページ
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function PlayerRosterContent() {
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

  // ━━ データ取得 ━━
  const fetchPlayers = useCallback(async (tid: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/teams/${tid}/players`);
      if (!res.ok) throw new Error();
      const data = await res.json() as Player[];
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

  // ━━ CRUD ━━
  const handleAdd = async (data: PlayerFormData) => {
    if (!teamId) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/teams/${teamId}/players`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
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
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
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
      const res = await fetch(`/api/teams/${teamId}/players/${deleteTarget.id}`, {
        method: "DELETE",
      });
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

  const FILTER_ITEMS: (PosCategory | "すべて")[] = ["すべて", "投手", "捕手", "内野手", "外野手"];

  const filtered = players.filter(p => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.uniformNumber.includes(searchQuery);
    const cat = getCategory(p.primaryPosition);
    return matchesSearch && (filter === "すべて" || cat === filter);
  });

  const counts = players.reduce<Record<string, number>>((acc, p) => {
    const cat = getCategory(p.primaryPosition);
    acc[cat] = (acc[cat] ?? 0) + 1;
    return acc;
  }, {});

  // ━━ ローディング ━━
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

        {/* ━━ ページヘッダー ━━ */}
        <div className="flex items-end justify-between gap-3">
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="inline-flex items-center gap-1 text-[10px] font-black text-primary uppercase tracking-[0.25em]">
                <Activity className="h-3 w-3" />
                選手管理
              </span>
            </div>
            <h1 className="text-[1.7rem] font-black tracking-tight leading-none">
              選手<span className="text-primary">名簿</span>
            </h1>
            <p className="text-xs font-bold text-muted-foreground mt-1 flex items-center gap-1">
              <Users className="h-3 w-3" />
              {players.length}名登録中
            </p>
          </div>
          <Button
            onClick={() => setIsAddOpen(true)}
            size="sm"
            className="h-10 px-4 rounded-[var(--radius-xl)] font-black gap-2 shadow-sm shrink-0"
          >
            <UserPlus className="h-4 w-4" strokeWidth={2.5} />
            選手追加
          </Button>
        </div>

        {/* ━━ カテゴリ別サマリー ━━ */}
        <div className="grid grid-cols-4 gap-2">
          {(["投手", "捕手", "内野手", "外野手"] as PosCategory[]).map(cat => (
            <SummaryCard
              key={cat}
              cat={cat}
              count={counts[cat] ?? 0}
              isActive={filter === cat}
              onClick={() => setFilter(filter === cat ? "すべて" : cat)}
            />
          ))}
        </div>

        {/* ━━ 検索 ━━ */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="名前・背番号で検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-11 pl-10 rounded-[var(--radius-xl)] font-medium bg-card border-border"
          />
        </div>

        {/* ━━ アクティブフィルター表示 ━━ */}
        {filter !== "すべて" && (
          <div className="flex items-center gap-2">
            <Shield className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <span className="text-sm font-bold text-muted-foreground">{filter}のみ表示</span>
            <button
              onClick={() => setFilter("すべて")}
              className="ml-auto text-[11px] font-black text-primary underline underline-offset-2"
            >
              クリア
            </button>
          </div>
        )}

        {/* ━━ 選手カードリスト ━━ */}
        {filtered.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-16 h-16 rounded-[var(--radius-2xl)] bg-muted/50 flex items-center justify-center mx-auto">
              <UserCircle className="h-8 w-8 text-muted-foreground/40" />
            </div>
            <p className="font-black text-base text-foreground/30 uppercase tracking-wider">
              {players.length === 0 ? "選手未登録" : "該当なし"}
            </p>
            <p className="text-sm font-bold text-muted-foreground/50">
              {players.length === 0
                ? "「選手追加」ボタンから登録しましょう"
                : "検索条件を変えてください"}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(player => (
              <PlayerCard
                key={player.id}
                player={player}
                teamId={teamId}
                onEdit={setEditTarget}
                onDelete={setDeleteTarget}
                onDetail={(p) => router.push(
                  `/players/detail?teamId=${teamId}&playerName=${encodeURIComponent(p.name)}&uniformNumber=${p.uniformNumber}`
                )}
              />
            ))}
          </div>
        )}
      </div>

      {/* ━━━ 選手追加モーダル ━━━ */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="rounded-[var(--radius-2xl)] max-w-sm w-full p-6">
          <div className="mb-3">
            <h2 className="text-lg font-black tracking-tight flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-primary" /> 選手を追加
            </h2>
          </div>
          <PlayerForm
            onSubmit={handleAdd}
            onCancel={() => setIsAddOpen(false)}
            isSubmitting={isSubmitting}
            submitLabel="登録"
          />
        </DialogContent>
      </Dialog>

      {/* ━━━ 選手編集モーダル ━━━ */}
      <Dialog open={!!editTarget} onOpenChange={(open) => !open && setEditTarget(null)}>
        <DialogContent className="rounded-[var(--radius-2xl)] max-w-sm w-full p-6">
          {editTarget && (
            <>
              <div className="mb-3">
                <h2 className="text-lg font-black tracking-tight flex items-center gap-2">
                  <Pencil className="h-4 w-4 text-primary" /> 選手を編集
                </h2>
                <p className="text-xs text-muted-foreground font-bold mt-0.5">
                  #{editTarget.uniformNumber} {editTarget.name}
                </p>
              </div>
              <PlayerForm
                initial={{
                  name: editTarget.name,
                  uniformNumber: editTarget.uniformNumber,
                  primaryPosition: editTarget.primaryPosition ?? "",
                  throws: editTarget.throws ?? "",
                  bats: editTarget.bats ?? "",
                }}
                onSubmit={handleEdit}
                onCancel={() => setEditTarget(null)}
                isSubmitting={isSubmitting}
                submitLabel="保存"
              />
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ━━━ 削除確認モーダル ━━━ */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="rounded-[var(--radius-2xl)] max-w-xs w-full p-6">
          {deleteTarget && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-black text-destructive flex items-center gap-2">
                  <Trash2 className="h-4 w-4" /> 選手を削除
                </h2>
                <p className="text-xs text-muted-foreground font-bold mt-0.5">この操作は取り消せません</p>
              </div>
              <div className="bg-destructive/5 border border-destructive/20 rounded-[var(--radius-xl)] p-3">
                <p className="font-black text-card-foreground">#{deleteTarget.uniformNumber} {deleteTarget.name}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setDeleteTarget(null)}
                  className="flex-1 rounded-[var(--radius-xl)] font-black"
                >
                  キャンセル
                </Button>
                <Button
                  onClick={handleDelete}
                  disabled={isSubmitting}
                  className="flex-1 rounded-[var(--radius-xl)] font-black bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                >
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "削除"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function PlayerRoster() {
  return (
    <Suspense fallback={
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="animate-spin text-primary h-8 w-8" />
      </div>
    }>
      <PlayerRosterContent />
    </Suspense>
  );
}
