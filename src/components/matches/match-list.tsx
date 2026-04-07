// src/components/matches/match-list.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Edit2, Calendar, MapPin, Trophy, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Match {
  id: string;
  opponent: string;
  tournamentName?: string;
  date: string;
  myScore: number;
  opponentScore: number;
  matchType: 'official' | 'practice';
  battingOrder: 'first' | 'second';
  surfaceDetails?: string;
  innings?: number; // 🌟 追加：イニング数
  myInningScores?: number[];
  opponentInningScores?: number[];
}

interface MatchListProps {
  matches: Match[];
  isLoading: boolean;
  onDelete?: (id: string) => void;
}

export function MatchList({ matches, isLoading, onDelete }: MatchListProps) {
  const router = useRouter();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [swipeId, setSwipeId] = useState<string | null>(null);
  const [startX, setStartX] = useState(0);
  const [offsetX, setOffsetX] = useState(0);

  const [teamFullName, setTeamFullName] = useState("");
  useEffect(() => {
    const fetchTeamName = async () => {
      const teamId = localStorage.getItem("iScore_selectedTeamId");
      if (!teamId) return;
      const teamRes = await fetch("/api/auth/me");
      if (teamRes.ok) {
        const res = (await teamRes.json()) as { data: { memberships: any[] } };
        const currentMembership = res.data.memberships.find((m: any) => m.teamId === teamId);
        if (currentMembership) {
          setTeamFullName(`${currentMembership.organizationName} ${currentMembership.teamName}`);
        }
      }
    };
    fetchTeamName();
  }, []);

  if (isLoading) return <div className="space-y-3">{[1, 2, 3].map((i) => (<div key={i} className="h-28 w-full rounded-2xl bg-muted/50 animate-pulse" />))}</div>;

  const handleTouchStart = (e: React.TouchEvent, id: string) => {
    setStartX(e.touches[0].clientX);
    setSwipeId(id);
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    const currentX = e.touches[0].clientX;
    const diff = currentX - startX;
    if (Math.abs(diff) < 100) setOffsetX(diff);
  };
  const handleTouchEnd = () => {
    if (offsetX > 50) setOffsetX(80);
    else if (offsetX < -50) setOffsetX(-80);
    else { setOffsetX(0); setSwipeId(null); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("本当にこの試合を削除しますか？")) return;
    try {
      const res = await fetch(`/api/matches/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success("試合を削除しました");
        if (onDelete) onDelete(id);
        else window.location.reload();
      } else {
        toast.error("削除に失敗しました");
      }
    } catch (error) {
      toast.error("エラーが発生しました");
    }
  };

  if (matches.length === 0) {
    return (
      <div className="text-center py-10 px-4 rounded-3xl border-2 border-dashed border-border/50 bg-white/20 dark:bg-zinc-900/20 backdrop-blur-sm">
        <p className="text-sm font-bold text-muted-foreground">試合データがありません</p>
      </div>
    );
  }

  return (
    // 🌟 修正：枠線が切れないように overflow-hidden を overflow-x-hidden に変更し、少しパディングを持たせる
    <div className="space-y-3 overflow-x-hidden px-1 pb-1">
      {matches.map((match) => {
        const isWin = match.myScore > match.opponentScore;
        const isLoss = match.myScore < match.opponentScore;
        const isDraw = match.myScore === match.opponentScore;
        const isExpanded = expandedId === match.id;
        const isSwiping = swipeId === match.id;

        const firstScore = match.battingOrder === 'first' ? match.myScore : match.opponentScore;
        const secondScore = match.battingOrder === 'first' ? match.opponentScore : match.myScore;

        // 🌟 修正：試合の設定されたイニング数（未設定ならデフォルト7）
        const inningCount = match.innings || 7;

        return (
          <div key={match.id} className="relative">
            {/* 🌟 修正：背面の「編集・削除」ボタンをクールなデザインに！文字も追加！ */}
            <div className="absolute inset-0 flex items-center justify-between px-1">
              <button
                onClick={() => router.push(`/matches/edit?id=${match.id}`)}
                className="flex flex-col items-center justify-center w-16 h-[calc(100%-8px)] bg-blue-500 hover:bg-blue-600 text-white rounded-xl shadow-inner transition-all active:scale-95"
              >
                <Edit2 className="h-5 w-5 mb-1" />
                <span className="text-[10px] font-black tracking-widest">編集</span>
              </button>
              <button
                onClick={() => handleDelete(match.id)}
                className="flex flex-col items-center justify-center w-16 h-[calc(100%-8px)] bg-red-500 hover:bg-red-600 text-white rounded-xl shadow-inner transition-all active:scale-95"
              >
                <Trash2 className="h-5 w-5 mb-1" />
                <span className="text-[10px] font-black tracking-widest">削除</span>
              </button>
            </div>

            {/* --- カード本体 --- */}
            <div
              onTouchStart={(e) => handleTouchStart(e, match.id)}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              style={{ transform: isSwiping ? `translateX(${offsetX}px)` : 'translateX(0)' }}
              className={cn(
                // 🌟 修正：すりガラス効果（backdrop-blur）と、選択時の枠線（border-primary）の最適化
                "relative z-10 rounded-2xl bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl border transition-all duration-200 ease-out",
                isExpanded ? "border-primary shadow-md" : "border-border/50 shadow-sm hover:border-border"
              )}
            >
              <div
                className="p-4 sm:p-5 cursor-pointer"
                onClick={() => {
                  if (Math.abs(offsetX) < 10) setExpandedId(isExpanded ? null : match.id);
                  setOffsetX(0); setSwipeId(null);
                }}
              >
                <div className="flex items-center justify-between gap-4">

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={cn(
                        "w-16 text-center text-[10px] sm:text-xs font-black px-1.5 py-0.5 rounded shadow-sm",
                        match.matchType === 'official' ? "bg-amber-500/10 text-amber-600 border border-amber-500/20" : "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                      )}>
                        {match.matchType === 'official' ? '公式戦' : '練習試合'}
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" /> {match.date}
                      </span>
                    </div>

                    <h3 className="text-lg sm:text-xl font-black truncate text-foreground mb-1">vs {match.opponent}</h3>

                    {match.matchType === 'official' && (
                      <p className="text-xs font-bold text-amber-600 flex items-center gap-1 mt-0.5 truncate">
                        <Trophy className="h-3.5 w-3.5 shrink-0" /> {match.tournamentName || "大会名未登録"}
                      </p>
                    )}

                    <p className="text-xs font-bold text-muted-foreground flex items-center gap-1 mt-1 truncate">
                      <MapPin className="h-3.5 w-3.5 shrink-0" /> {match.surfaceDetails || "球場未設定"}
                    </p>
                  </div>

                  <div className="flex flex-col items-center gap-1.5 shrink-0">
                    <div className="w-14 text-center">
                      {isWin && <span className="block w-full bg-blue-600 text-white text-[11px] font-black py-0.5 rounded shadow-sm">WIN</span>}
                      {isLoss && <span className="block w-full bg-red-600 text-white text-[11px] font-black py-0.5 rounded shadow-sm">LOSE</span>}
                      {isDraw && <span className="block w-full bg-zinc-500 text-white text-[11px] font-black py-0.5 rounded shadow-sm">DRAW</span>}
                    </div>

                    {/* 🌟 修正：くぼみを無くし、薄いプライマリカラーのフラットな背景に */}
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/5 dark:bg-primary/10 rounded-xl border border-primary/20">
                      <div className="text-center w-7">
                        <p className="text-[9px] font-black text-primary/70 uppercase leading-none">先</p>
                        <span className="text-xl font-black tabular-nums leading-none text-foreground">{firstScore}</span>
                      </div>
                      <span className="text-sm font-black text-primary/30">-</span>
                      <div className="text-center w-7">
                        <p className="text-[9px] font-black text-primary/70 uppercase leading-none">後</p>
                        <span className="text-xl font-black tabular-nums leading-none text-foreground">{secondScore}</span>
                      </div>
                    </div>
                    {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground/50 mt-1" /> : <ChevronDown className="h-4 w-4 text-muted-foreground/50 mt-1" />}
                  </div>
                </div>

                {/* 🌟 展開時：イニングスコア */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-border/50 animate-in fade-in slide-in-from-top-2">
                    {/* 🌟 修正：くぼみ（shadow-inner）を削除し、フラットなすりガラスに */}
                    <div className="bg-white/40 dark:bg-zinc-800/40 backdrop-blur-sm rounded-xl p-3 overflow-x-auto border border-border/30">
                      <table className="w-full text-center">
                        <thead>
                          <tr className="text-[9px] sm:text-[10px] font-black text-muted-foreground uppercase border-b border-border/50">
                            <th className="text-left font-bold pb-1 w-20">TEAM</th>
                            {/* 🌟 修正：9回固定ではなく、inningsカラムの値（デフォルト7）で回数を描画 */}
                            {Array.from({ length: inningCount }).map((_, i) => <th key={i} className="w-6 pb-1">{i + 1}</th>)}
                            <th className="w-8 text-primary pb-1">R</th>
                          </tr>
                        </thead>
                        <tbody className="text-xs sm:text-sm font-black tabular-nums">
                          <tr className="border-b border-border/30">
                            <td className="text-left py-1.5 pr-2">
                              <div className="w-20 truncate text-muted-foreground text-[10px] sm:text-xs">
                                {match.battingOrder === 'first' ? (teamFullName || "自チーム") : (match.opponent || "相手")}
                              </div>
                            </td>
                            {/* 🌟 修正：回数に合わせてダミーのスコアを描画 */}
                            {Array.from({ length: inningCount }).map((_, i) => <td key={i}>{match.battingOrder === 'first' ? "0" : "0"}</td>)}
                            <td className="text-primary">{firstScore}</td>
                          </tr>
                          <tr>
                            <td className="text-left py-1.5 pr-2">
                              <div className="w-20 truncate text-muted-foreground text-[10px] sm:text-xs">
                                {match.battingOrder === 'second' ? (teamFullName || "自チーム") : (match.opponent || "相手")}
                              </div>
                            </td>
                            {Array.from({ length: inningCount }).map((_, i) => <td key={i}>{match.battingOrder === 'second' ? "0" : "0"}</td>)}
                            <td className="text-primary">{secondScore}</td>
                          </tr>
                        </tbody>
                      </table>
                      {/* 🌟 注意書き（不要とのことなので削除しました） */}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}