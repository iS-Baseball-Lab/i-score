// src/components/matches/match-list.tsx
"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Edit2, Trophy, Calendar, MapPin, ChevronRight, Swords } from "lucide-react";
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
  surfaceDetails?: string;
}

export function MatchList({ matches, isLoading }: { matches: Match[], isLoading: boolean }) {
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 w-full rounded-2xl bg-muted/50 animate-pulse" />
        ))}
      </div>
    );
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
      {matches.map((match) => (
        <div
          key={match.id}
          // 🌟 グラスモーフィズム & Styleテーマ対応の角丸
          className="group relative overflow-hidden rounded-2xl bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md border border-border/40 p-4 shadow-sm hover:shadow-md transition-all active:scale-[0.99]"
        >
          <div className="flex items-center justify-between gap-4">
            {/* 左側：試合情報 */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className={cn(
                  "text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider",
                  match.matchType === 'official' ? "bg-blue-500/10 text-blue-600 border border-blue-500/20" : "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                )}>
                  {match.matchType === 'official' ? '公式戦' : '練習試合'}
                </span>
                <span className="text-[10px] font-bold text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> {match.date.split(" ")[0]}
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

            {/* 中央：スコアボード風表示 */}
            <div className="flex items-center gap-3 px-4 py-2 bg-muted/30 rounded-xl border border-border/20 shrink-0">
              <div className="text-center">
                <p className="text-[8px] font-black text-muted-foreground uppercase">Own</p>
                <p className="text-xl font-black tabular-nums leading-none mt-1">{match.myScore}</p>
              </div>
              <div className="h-6 w-[1px] bg-border/50" />
              <div className="text-center">
                <p className="text-[8px] font-black text-muted-foreground uppercase">Opp</p>
                <p className="text-xl font-black tabular-nums leading-none mt-1">{match.opponentScore}</p>
              </div>
            </div>

            {/* 右側：編集アクション */}
            <Button
              variant="ghost"
              size="icon"
              // 🌟 修正：クエリパラメータでIDを渡す王道パターン
              onClick={() => router.push(`/matches/edit?id=${match.id}`)}
              className="h-10 w-10 rounded-full hover:bg-primary/10 hover:text-primary transition-colors shrink-0"
            >
              <Edit2 className="h-5 w-5" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}