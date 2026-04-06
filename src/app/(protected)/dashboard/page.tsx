// src/app/(protected)/dashboard/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
// 🌟 復活：時計と天気のアイコンを追加インポート
import { Trophy, Users, PlayCircle, Plus, ChevronRight, Activity, Swords, Clock, CloudSun, Navigation, Wind } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MatchList } from "@/components/matches/match-list";
import { toast } from "sonner";
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

export default function DashboardPage() {
  const router = useRouter();
  const [matches, setMatches] = useState<Match[]>([]);
  const [teamName, setTeamName] = useState("Team");
  const [isLoading, setIsLoading] = useState(true);

  // 🌟 復活：リアルタイム時計のステート
  const [currentTime, setCurrentTime] = useState(new Date());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // 1秒ごとに時計を更新
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const teamId = localStorage.getItem("iScore_selectedTeamId");
        if (!teamId) {
          setIsLoading(false);
          return;
        }

        const teamRes = await fetch("/api/teams");
        if (teamRes.ok) {
          const teamsData = (await teamRes.json()) as any[];
          const currentTeam = teamsData.find((t: any) => t.id === teamId);
          if (currentTeam) setTeamName(currentTeam.name);
        }

        const matchRes = await fetch(`/api/matches?teamId=${teamId}`);
        if (matchRes.ok) {
          const matchData = (await matchRes.json()) as Match[];
          setMatches(Array.isArray(matchData) ? matchData : []);
        }
      } catch (error) {
        toast.error("データの読み込みに失敗しました");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const stats = matches.reduce(
    (acc, m) => {
      if (m.myScore > m.opponentScore) acc.wins++;
      else if (m.myScore < m.opponentScore) acc.losses++;
      else acc.draws++;
      return acc;
    },
    { wins: 0, losses: 0, draws: 0 }
  );

  // 日付と時刻のフォーマット
  const timeString = currentTime.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
  const dateString = currentTime.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric', weekday: 'short' });

  return (
    <div className="w-full animate-in fade-in duration-500 bg-transparent min-h-screen pb-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6 sm:space-y-8">

        {/* =========================================
            1. ヒーローセクション
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
            🌟 1.5 復活の環境ウィジェット（時計・天気・風）
            ========================================= */}
        <section className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md border border-border/40 shadow-sm rounded-3xl p-4 sm:p-5">
          <div className="grid grid-cols-2 sm:flex sm:items-center sm:justify-between gap-4 sm:gap-6">

            {/* 🕰️ 時計 */}
            <div className="flex items-center gap-3">
              <div className="p-2 sm:p-2.5 bg-primary/10 rounded-xl text-primary shrink-0">
                <Clock className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div>
                <p className="text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase">{mounted ? dateString : "---"}</p>
                <p className="text-base sm:text-lg font-black text-foreground tabular-nums leading-none mt-0.5">{mounted ? timeString : "--:--"}</p>
              </div>
            </div>

            <div className="hidden sm:block h-8 w-px bg-border/50" />

            {/* ⛅️ 天気（※後日API連携を想定したモック） */}
            <div className="flex items-center gap-3">
              <div className="p-2 sm:p-2.5 bg-amber-500/10 rounded-xl text-amber-500 shrink-0">
                <CloudSun className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div>
                <p className="text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase">Weather</p>
                <p className="text-sm sm:text-base font-black text-foreground leading-none mt-0.5">晴れ <span className="text-muted-foreground text-xs ml-0.5">22°C</span></p>
              </div>
            </div>

            <div className="hidden sm:block h-8 w-px bg-border/50" />

            {/* 🧭 風向き */}
            <div className="flex items-center gap-3">
              <div className="p-2 sm:p-2.5 bg-blue-500/10 rounded-xl text-blue-500 shrink-0">
                <Navigation className="h-5 w-5 sm:h-6 sm:w-6 transform rotate-45" />
              </div>
              <div>
                <p className="text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase">Wind Dir</p>
                <p className="text-sm sm:text-base font-black text-foreground leading-none mt-0.5">南南西</p>
              </div>
            </div>

            <div className="hidden sm:block h-8 w-px bg-border/50" />

            {/* 💨 風速 */}
            <div className="flex items-center gap-3">
              <div className="p-2 sm:p-2.5 bg-teal-500/10 rounded-xl text-teal-500 shrink-0">
                <Wind className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div>
                <p className="text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase">Wind Spd</p>
                <p className="text-sm sm:text-base font-black text-foreground leading-none mt-0.5 tabular-nums">5 <span className="text-muted-foreground text-xs font-bold">m/s</span></p>
              </div>
            </div>

          </div>
        </section>

        {/* =========================================
            2. クイックアクション
            ========================================= */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
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

          <button
            onClick={() => router.push('/team/players')}
            className="flex flex-col items-start justify-between p-5 sm:p-6 rounded-3xl bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md border border-border/40 shadow-sm hover:shadow-md hover:border-primary/40 active:scale-[0.98] transition-all group"
          >
            <div className="p-3 bg-muted dark:bg-zinc-800 rounded-2xl group-hover:bg-primary/10 group-hover:text-primary transition-colors mb-4">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-foreground mb-1">選手名簿</h3>
              <p className="text-[9px] sm:text-xs font-bold text-muted-foreground uppercase tracking-widest">Roster</p>
            </div>
          </button>

          <button
            onClick={() => router.push('/team')}
            className="flex flex-col items-start justify-between p-5 sm:p-6 rounded-3xl bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md border border-border/40 shadow-sm hover:shadow-md hover:border-primary/40 active:scale-[0.98] transition-all group"
          >
            <div className="p-3 bg-muted dark:bg-zinc-800 rounded-2xl group-hover:bg-primary/10 group-hover:text-primary transition-colors mb-4">
              <Trophy className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-foreground mb-1">チーム成績</h3>
              <p className="text-[9px] sm:text-xs font-bold text-muted-foreground uppercase tracking-widest">Analytics</p>
            </div>
          </button>
        </section>

        {/* =========================================
            3. 最近の試合リスト
            ========================================= */}
        <section className="pt-2 sm:pt-4">
          <div className="flex items-center justify-between mb-4 px-1">
            <h2 className="text-xs sm:text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <Swords className="h-4 w-4" /> Recent Matches
            </h2>
            <Button variant="ghost" size="sm" onClick={() => router.push('/matches')} className="text-[10px] font-bold uppercase tracking-widest text-primary hover:bg-primary/10 rounded-full px-4">
              すべて見る <ChevronRight className="h-3 w-3 ml-1" />
            </Button>
          </div>

          <MatchList matches={matches} isLoading={isLoading} />
        </section>

      </div>
    </div>
  );
}