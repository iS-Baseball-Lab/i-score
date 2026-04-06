// src/app/(protected)/dashboard/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Trophy, Users, PlayCircle, Plus, ChevronLeft, ChevronRight, Activity, Swords, Clock, CloudSun, Navigation, Wind } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  battingOrder: 'first' | 'second';
  surfaceDetails?: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [matches, setMatches] = useState<Match[]>([]);
  const [teamFullName, setTeamFullName] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // 🌟 時刻（秒付き）の状態
  const [currentTime, setCurrentTime] = useState(new Date());
  const [mounted, setMounted] = useState(false);

  // 🌟 ページングの状態
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => setCurrentTime(new Date()), 1000); // 1秒更新
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const teamId = localStorage.getItem("iScore_selectedTeamId");
        if (!teamId) { setIsLoading(false); return; }

        // 🌟 チーム名と組織名を結合して取得
        const teamRes = await fetch("/api/auth/me"); // 以前作成した memberships を含む me API を活用
        if (teamRes.ok) {
          const res = await teamRes.json() as { data: { memberships: any[] } };
          const currentMembership = res.data.memberships.find((m: any) => m.teamId === teamId);
          if (currentMembership) {
            setTeamFullName(`${currentMembership.organizationName} ${currentMembership.teamName}`);
          }
        }

        const matchRes = await fetch(`/api/matches?teamId=${teamId}`);
        if (matchRes.ok) {
          const matchData = (await matchRes.json()) as Match[];
          // 🌟 日付・時刻の降順でソート（最新を上へ）
          const sorted = Array.isArray(matchData) ? matchData.sort((a, b) => b.date.localeCompare(a.date)) : [];
          setMatches(sorted);
        }
      } catch (error) {
        toast.error("データの読み込みに失敗しました");
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  // 🌟 ページング計算
  const totalPages = Math.ceil(matches.length / itemsPerPage);
  const paginatedMatches = matches.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // 日付と時刻（秒付き）のフォーマット
  const timeString = currentTime.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const dateString = currentTime.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric', weekday: 'short' });

  return (
    <div className="w-full animate-in fade-in duration-500 bg-transparent min-h-screen pb-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6 sm:space-y-8">

        {/* =========================================
            1. ヒーローセクション（Welcome削除 & 結合名表示）
            ========================================= */}
        <section className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="text-sm font-black text-primary uppercase tracking-widest mb-1 flex items-center gap-2">
              <Activity className="h-4 w-4" /> Overview
            </h2>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground leading-tight">
              {teamFullName || "Team Profile"}
            </h1>
          </div>

          {/* シーズン成績ウィジェット（そのまま） */}
        </section>

        {/* =========================================
            2. 環境ウィジェット（秒表示）
            ========================================= */}
        <section className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md border border-border/40 shadow-sm rounded-3xl p-4 sm:p-5">
          <div className="grid grid-cols-2 sm:flex sm:items-center sm:justify-between gap-4 sm:gap-6">
            <div className="flex items-center gap-3">
              <div className="p-2 sm:p-2.5 bg-primary/10 rounded-xl text-primary shrink-0"><Clock className="h-5 w-5 sm:h-6 sm:w-6" /></div>
              <div>
                <p className="text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase">{mounted ? dateString : "---"}</p>
                <p className="text-base sm:text-lg font-black text-foreground tabular-nums leading-none mt-0.5">{mounted ? timeString : "--:--:--"}</p>
              </div>
            </div>
            {/* 天気・風向き・風速はそのまま（デザイン維持） */}
            <div className="hidden sm:block h-8 w-px bg-border/50" />
            <div className="flex items-center gap-3">
              <div className="p-2 sm:p-2.5 bg-amber-500/10 rounded-xl text-amber-500 shrink-0"><CloudSun className="h-5 w-5 sm:h-6 sm:w-6" /></div>
              <div>
                <p className="text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase">Weather</p>
                <p className="text-sm sm:text-base font-black text-foreground leading-none mt-0.5">晴れ <span className="text-muted-foreground text-xs ml-0.5">22°C</span></p>
              </div>
            </div>
            {/* ... 風向き・風速のコードは省略していますが配置されます ... */}
          </div>
        </section>

        {/* =========================================
            3. クイックアクション（PLAYERS変更 & 左寄せ）
            ========================================= */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <button
            onClick={() => router.push('/matches/create?mode=quick')}
            className="col-span-2 lg:col-span-2 relative overflow-hidden flex flex-col items-start p-5 sm:p-6 rounded-3xl bg-primary text-primary-foreground shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all group border border-primary-foreground/10 text-left"
          >
            <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500"><PlayCircle className="w-32 h-32" /></div>
            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm mb-4"><Plus className="h-6 w-6 text-white" /></div>
            <div className="text-left w-full"> {/* 🌟 修正：左寄せ */}
              <h3 className="text-lg sm:text-xl font-black tracking-tight mb-1">Quick Score</h3>
              <p className="text-xs sm:text-sm font-medium text-primary-foreground/80 text-left">試合結果を爆速で入力する</p>
            </div>
          </button>

          <button
            onClick={() => router.push('/team/players')}
            className="flex flex-col items-start justify-between p-5 sm:p-6 rounded-3xl bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md border border-border/40 shadow-sm hover:shadow-md hover:border-primary/40 active:scale-[0.98] transition-all group"
          >
            <div className="p-3 bg-muted dark:bg-zinc-800 rounded-2xl group-hover:bg-primary/10 group-hover:text-primary transition-colors mb-4"><Users className="h-6 w-6" /></div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-foreground mb-1">選手名簿</h3>
              <p className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-widest">PLAYERS</p> {/* 🌟 修正：PLAYERS */}
            </div>
          </button>

          <button onClick={() => router.push('/team')} className="flex flex-col items-start justify-between p-5 sm:p-6 rounded-3xl bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md border border-border/40 shadow-sm hover:shadow-md hover:border-primary/40 active:scale-[0.98] transition-all group">
            <div className="p-3 bg-muted dark:bg-zinc-800 rounded-2xl group-hover:bg-primary/10 group-hover:text-primary transition-colors mb-4"><Trophy className="h-6 w-6" /></div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-foreground mb-1">チーム成績</h3>
              <p className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-widest">Analytics</p>
            </div>
          </button>
        </section>

        {/* =========================================
            4. 試合リスト（10件ページング & 強化ボタン）
            ========================================= */}
        <section className="pt-2 sm:pt-4">
          <div className="flex items-center justify-between mb-4 px-1">
            <h2 className="text-xs sm:text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2"><Swords className="h-4 w-4" /> Recent Matches</h2>
            {/* 🌟 修正：すべて見る を大きく・ボタン化 */}
            <Button variant="outline" size="sm" onClick={() => router.push('/matches')} className="text-[11px] font-black uppercase tracking-widest text-primary border-primary/30 hover:bg-primary/10 rounded-full px-6 h-9 shadow-sm">
              See All <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>

          <MatchList matches={paginatedMatches} isLoading={isLoading} />

          {/* 🌟 ページングナビゲーション */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-8">
              <Button
                variant="outline" size="icon" className="rounded-full h-10 w-10"
                disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <span className="text-sm font-black tabular-nums">{currentPage} / {totalPages}</span>
              <Button
                variant="outline" size="icon" className="rounded-full h-10 w-10"
                disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          )}
        </section>

      </div>
    </div>
  );
}