// src/app/(protected)/dashboard/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Trophy, Users, PlayCircle, Plus, ChevronRight, Activity, CalendarDays, Swords } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MatchList } from "@/components/matches/match-list";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// 試合データの型定義
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

export default function DashboardPage() {
  const router = useRouter();
  const [matches, setMatches] = useState<Match[]>([]);
  const [teamName, setTeamName] = useState("Team");
  const [isLoading, setIsLoading] = useState(true);

  // 🌟 初期データの取得
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const teamId = localStorage.getItem("iScore_selectedTeamId");
        if (!teamId) {
          setIsLoading(false);
          return;
        }

        // 1. チーム情報の取得（名前を表示するため）
        const teamRes = await fetch("/api/teams");
        if (teamRes.ok) {
          const teamsData = await teamRes.json() as any[];
          const currentTeam = teamsData.find((t: any) => t.id === teamId);
          if (currentTeam) setTeamName(currentTeam.name);
        }

        // 2. 試合一覧の取得
        const matchRes = await fetch(`/api/matches?teamId=${teamId}`);
        if (matchRes.ok) {
          const matchData = await matchRes.json() as Match[];
          setMatches(matchData || []);
        }
      } catch (error) {
        toast.error("データの読み込みに失敗しました");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // 💡 簡易的な勝敗集計（表示用）
  const stats = matches.reduce(
    (acc, m) => {
      if (m.myScore > m.opponentScore) acc.wins++;
      else if (m.myScore < m.opponentScore) acc.losses++;
      else acc.draws++;
      return acc;
    },
    { wins: 0, losses: 0, draws: 0 }
  );

  return (
    // 🌟 背景は transparent にし、globals.css のグラデーションを活かす
    <div className="w-full animate-in fade-in duration-500 bg-transparent min-h-screen pb-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-8">

        {/* =========================================
            1. ヒーローセクション（挨拶と概要）
            ========================================= */}
        <section className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="text-sm font-black text-primary uppercase tracking-widest mb-1 flex items-center gap-2">
              <Activity className="h-4 w-4" /> Overview
            </h2>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground leading-tight">
              Welcome back,<br className="sm:hidden" /> {teamName}
            </h1>
          </div>

          {!isLoading && matches.length > 0 && (
            <div className="flex items-center gap-4 px-5 py-3 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md rounded-2xl border border-border/40 shadow-sm shrink-0">
              <div className="text-center">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Season</p>
                <p className="text-lg font-black text-foreground tabular-nums leading-none mt-1">
                  {matches.length}<span className="text-[10px] ml-0.5">G</span>
                </p>
              </div>
              <div className="h-8 w-[1px] bg-border/50" />
              <div className="text-center">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">W-L-D</p>
                <p className="text-lg font-black text-primary tabular-nums leading-none mt-1">
                  {stats.wins}-{stats.losses}{stats.draws > 0 ? `-${stats.draws}` : ''}
                </p>
              </div>
            </div>
          )}
        </section>

        {/* =========================================
            2. クイックアクション（特大ボタン）
            ========================================= */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* メインアクション：Quick Score入力 */}
          <button
            onClick={() => router.push('/matches/create?mode=quick')}
            className="col-span-2 lg:col-span-2 relative overflow-hidden flex flex-col items-start justify-between p-5 sm:p-6 rounded-3xl bg-primary text-primary-foreground shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all group border border-primary-foreground/10"
          >
            <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500">
              <PlayCircle className="w-32 h-32" />
            </div>
            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm mb-4">
              <Plus className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black tracking-tight mb-1">Quick Score</h3>
              <p className="text-xs sm:text-sm font-medium text-primary-foreground/80">試合結果を爆速で入力する</p>
            </div>
          </button>

          {/* サブアクション1：チーム名簿 */}
          <button
            onClick={() => router.push('/team/players')}
            className="flex flex-col items-start justify-between p-5 sm:p-6 rounded-3xl bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md border border-border/40 shadow-sm hover:shadow-md hover:border-primary/40 active:scale-[0.98] transition-all group"
          >
            <div className="p-3 bg-muted dark:bg-zinc-800 rounded-2xl group-hover:bg-primary/10 group-hover:text-primary transition-colors mb-4">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-foreground mb-1">選手名簿</h3>
              <p className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-widest">Roster</p>
            </div>
          </button>

          {/* サブアクション2：チーム成績 */}
          <button
            onClick={() => router.push('/team')}
            className="flex flex-col items-start justify-between p-5 sm:p-6 rounded-3xl bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md border border-border/40 shadow-sm hover:shadow-md hover:border-primary/40 active:scale-[0.98] transition-all group"
          >
            <div className="p-3 bg-muted dark:bg-zinc-800 rounded-2xl group-hover:bg-primary/10 group-hover:text-primary transition-colors mb-4">
              <Trophy className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-foreground mb-1">チーム成績</h3>
              <p className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-widest">Analytics</p>
            </div>
          </button>
        </section>

        {/* =========================================
            3. 最近の試合リスト
            ========================================= */}
        <section className="pt-4">
          <div className="flex items-center justify-between mb-4 px-1">
            <h2 className="text-xs sm:text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <Swords className="h-4 w-4" /> Recent Matches
            </h2>
            <Button variant="ghost" size="sm" onClick={() => router.push('/matches')} className="text-[10px] font-bold uppercase tracking-widest text-primary hover:bg-primary/10 rounded-full px-4">
              すべて見る <ChevronRight className="h-3 w-3 ml-1" />
            </Button>
          </div>

          {/* 🌟 先ほど作成した MatchList コンポーネントを配置 */}
          <MatchList matches={matches} isLoading={isLoading} />
        </section>

      </div>
    </div>
  );
}