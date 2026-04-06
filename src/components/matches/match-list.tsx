// src/components/matches/match-list.tsx
"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Edit2, Calendar, MapPin, Swords } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Match {
  id: string;
  opponent: string;
  date: string;
  myScore: number;
  opponentScore: number;
  status: string;
  matchType: string;
  battingOrder: 'first' | 'second'; // 🌟 先攻/後攻の判別に使用
  surfaceDetails?: string;
}

export function MatchList({ matches, isLoading }: { matches: Match[], isLoading: boolean }) {
  const router = useRouter();

  if (isLoading) {
    return <div className="space-y-3">{[1, 2, 3].map((i) => (<div key={i} className="h-24 w-full rounded-2xl bg-muted/50 animate-pulse" />))}</div>;
  }

  if (matches.length === 0) {
    return (
      <div className="text-center py-12 px-4 rounded-3xl border-2 border-dashed border-border/50">
        <Swords className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
        <p className="text-sm font-bold text-muted-foreground">試合データがまだありません</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {matches.map((match) => {
        // 🌟 勝敗判定
        const isWin = match.myScore > match.opponentScore;
        const isLoss = match.myScore < match.opponentScore;
        const isDraw = match.myScore === match.opponentScore;

        // 🌟 左側に「先攻」、右側に「後攻」のスコアを配置
        const firstScore = match.battingOrder === 'first' ? match.myScore : match.opponentScore;
        const secondScore = match.battingOrder === 'first' ? match.opponentScore : match.myScore;

        return (
          <div key={match.id} className="group relative overflow-hidden rounded-2xl bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md border border-border/40 p-4 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between gap-4">

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {/* 🌟 勝敗バッジの追加 */}
                  {isWin && <span className="bg-primary text-primary-foreground text-[9px] font-black px-1.5 py-0.5 rounded shadow-sm">WIN</span>}
                  {isLoss && <span className="bg-destructive text-destructive-foreground text-[9px] font-black px-1.5 py-0.5 rounded shadow-sm">LOSE</span>}
                  {isDraw && <span className="bg-muted text-muted-foreground text-[9px] font-black px-1.5 py-0.5 rounded shadow-sm">DRAW</span>}

                  <span className="text-[10px] font-bold text-muted-foreground flex items-center gap-1 ml-1">
                    <Calendar className="h-3 w-3" /> {match.date}
                  </span>
                </div>

                <h3 className="text-base font-black truncate text-foreground mb-1">
                  vs {match.opponent}
                </h3>

                <div className="flex items-center gap-3 text-[10px] font-bold text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {match.surfaceDetails || "球場未設定"}
                  </span>
                </div>
              </div>

              {/* 🌟 修正：左[先攻] - 右[後攻] のスコア表示 */}
              <div className="flex items-center gap-3 px-4 py-2 bg-muted/30 rounded-xl border border-border/20 shrink-0">
                <div className="text-center w-8">
                  <p className="text-[8px] font-black text-muted-foreground uppercase">先攻</p>
                  <p className="text-xl font-black tabular-nums mt-1">{firstScore}</p>
                </div>
                <div className="text-lg font-black text-muted-foreground/30 self-end mb-0.5 mx-1">-</div>
                <div className="text-center w-8">
                  <p className="text-[8px] font-black text-muted-foreground uppercase">後攻</p>
                  <p className="text-xl font-black tabular-nums mt-1">{secondScore}</p>
                </div>
              </div>

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