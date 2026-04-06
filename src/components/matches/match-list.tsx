// src/components/matches/match-list.tsx
"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Edit2, Calendar, MapPin, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Match {
  id: string;
  opponent: string;
  tournamentName?: string;
  date: string;
  myScore: number;
  opponentScore: number;
  status: string;
  matchType: 'official' | 'practice';
  battingOrder: 'first' | 'second';
  surfaceDetails?: string;
}

export function MatchList({ matches, isLoading }: { matches: Match[], isLoading: boolean }) {
  const router = useRouter();

  if (isLoading) return <div className="space-y-3">{[1, 2, 3].map((i) => (<div key={i} className="h-24 w-full rounded-2xl bg-muted/50 animate-pulse" />))}</div>;

  return (
    <div className="space-y-3">
      {matches.map((match) => {
        const isWin = match.myScore > match.opponentScore;
        const isLoss = match.myScore < match.opponentScore;
        const isDraw = match.myScore === match.opponentScore;

        const firstScore = match.battingOrder === 'first' ? match.myScore : match.opponentScore;
        const secondScore = match.battingOrder === 'first' ? match.opponentScore : match.myScore;

        return (
          <div key={match.id} className="group relative overflow-hidden rounded-2xl bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md border border-border/40 p-4 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between gap-4">

              {/* --- 左側：基本情報セクション --- */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className={cn(
                    "text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider",
                    match.matchType === 'official' ? "bg-amber-500/10 text-amber-600 border border-amber-500/20" : "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                  )}>
                    {match.matchType === 'official' ? '公式戦' : '練習試合'}
                  </span>
                  <span className="text-[10px] font-bold text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> {match.date}
                  </span>
                </div>

                <h3 className="text-base font-black truncate text-foreground mb-0.5">
                  vs {match.opponent}
                </h3>

                {/* 🌟 公式戦の大会名表示（未登録時の対応） */}
                {match.matchType === 'official' && (
                  <p className={cn(
                    "text-[10px] font-bold flex items-center gap-1 mb-1 italic",
                    match.tournamentName ? "text-amber-600" : "text-muted-foreground/60"
                  )}>
                    <Trophy className="h-3 w-3" />
                    {match.tournamentName || "大会名未登録"}
                  </p>
                )}

                <div className="flex items-center gap-3 text-[10px] font-bold text-muted-foreground mt-1">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {match.surfaceDetails || "球場未設定"}
                  </span>
                </div>
              </div>

              {/* --- 右側：勝敗バッジ ＋ スコア（集約セクション） --- */}
              <div className="flex flex-col items-center gap-1.5 shrink-0">
                {/* 🌟 バッジをスコアの直上に配置（視線の動きを最小限に） */}
                <div className="flex justify-center w-full">
                  {isWin && <span className="w-full text-center bg-blue-600 text-white text-[10px] font-black py-0.5 rounded-sm shadow-sm ring-1 ring-blue-400/50">WIN</span>}
                  {isLoss && <span className="w-full text-center bg-red-600 text-white text-[10px] font-black py-0.5 rounded-sm shadow-sm ring-1 ring-red-400/50">LOSE</span>}
                  {isDraw && <span className="w-full text-center bg-zinc-500 text-white text-[10px] font-black py-0.5 rounded-sm">DRAW</span>}
                </div>

                <div className="flex items-center gap-3 px-4 py-2 bg-muted/40 rounded-xl border border-border/20">
                  <div className="text-center w-8">
                    <p className="text-[8px] font-black text-muted-foreground uppercase leading-none">先</p>
                    <p className="text-xl font-black tabular-nums mt-1">{firstScore}</p>
                  </div>
                  <div className="text-lg font-black text-muted-foreground/30 self-end mb-0.5">-</div>
                  <div className="text-center w-8">
                    <p className="text-[8px] font-black text-muted-foreground uppercase leading-none">後</p>
                    <p className="text-xl font-black tabular-nums mt-1">{secondScore}</p>
                  </div>
                </div>
              </div>

              {/* 編集ボタン */}
              <Button variant="ghost" size="icon" onClick={() => router.push(`/matches/edit?id=${match.id}`)} className="h-10 w-10 rounded-full hover:bg-primary/10 hover:text-primary transition-colors shrink-0">
                <Edit2 className="h-5 w-5" />
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}