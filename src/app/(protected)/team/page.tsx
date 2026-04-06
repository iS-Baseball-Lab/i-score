"use client";

import React, { useEffect, useState } from "react";
import { Users, MapPin, Calendar, Shield, Trophy, Loader2, Camera, Settings, Crown, UserCircle, Info, ChevronRight, BarChart3 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";

interface Team {
  id: string;
  name: string;
  orgName?: string;
  description?: string;
  category?: string;
  homeGround?: string;
  managerName?: string;
  year: number | null;
  tier: string | null;
  teamType: string | null;
  myRole: string;
  isFounder: boolean;
}

interface TeamStats {
  totalGames: number;
  wins: number;
  draws: number;
  losses: number;
  winRate: number;
  avgRuns: number;
  teamAvg: string;
  teamHR: string;
}

export default function TeamProfilePage() {
  const router = useRouter();
  const [team, setTeam] = useState<Team | null>(null);
  const [memberCount, setMemberCount] = useState<number>(0);
  const [stats, setStats] = useState<TeamStats>({ totalGames: 0, wins: 0, draws: 0, losses: 0, winRate: 0, avgRuns: 0, teamAvg: ".000", teamHR: "0" });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        const activeTeamId = localStorage.getItem("iScore_selectedTeamId");
        if (!activeTeamId) { setIsLoading(false); return; }

        // 1. チーム基本情報
        const teamsResponse = await fetch("/api/teams", { cache: "no-store" });
        if (!teamsResponse.ok) throw new Error("取得失敗");
        const teamsData: Team[] = await teamsResponse.json();
        const currentTeam = teamsData.find(t => t.id === activeTeamId);

        if (currentTeam) {
          setTeam(currentTeam);

          // 2. メンバー数
          const playersResponse = await fetch(`/api/teams/${activeTeamId}/players`, { cache: "no-store" });
          if (playersResponse.ok) {
            const playersData = (await playersResponse.json()) as any[];
            setMemberCount(playersData.length || 0);
          }

          // 3. 試合結果（勝敗・得点）の集計
          const matchesRes = await fetch(`/api/teams/${activeTeamId}/recent-matches`, { cache: "no-store" });
          let wins = 0, losses = 0, draws = 0, totalRuns = 0, totalGames = 0;
          if (matchesRes.ok) {
            const matchesData = await matchesRes.json() as any[];
            totalGames = matchesData.length;
            matchesData.forEach(m => {
              if (m.myScore > m.opponentScore) wins++;
              else if (m.myScore < m.opponentScore) losses++;
              else draws++;
              totalRuns += m.myScore;
            });
          }

          // 4. 打撃成績の集計
          const statsRes = await fetch(`/api/teams/${activeTeamId}/stats`, { cache: "no-store" });
          let teamAvg = ".000", teamHR = "0";
          if (statsRes.ok) {
            const statsData = await statsRes.json() as any[];
            let totalAB = 0, totalHits = 0, totalHR = 0;
            statsData.forEach(p => {
              totalAB += p.atBats || 0;
              totalHits += p.hits || 0;
              totalHR += p.homeRuns || 0;
            });
            teamAvg = totalAB > 0 ? (totalHits / totalAB).toFixed(3).replace(/^0+/, '') : ".000";
            teamHR = totalHR.toString();
          }

          setStats({
            totalGames, wins, draws, losses,
            winRate: (wins + losses) > 0 ? Math.round((wins / (wins + losses)) * 100) : 0,
            avgRuns: totalGames > 0 ? Number((totalRuns / totalGames).toFixed(1)) : 0,
            teamAvg, teamHR
          });
        }
      } catch (error) {
        toast.error("データの読み込みに失敗しました");
      } finally {
        setIsLoading(false);
      }
    };
    fetchTeamData();
  }, []);

  if (isLoading) return <div className="flex h-[60vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!team) return <div className="p-20 text-center text-muted-foreground">チームが選択されていません</div>;

  const canManage = team.myRole === 'ADMIN' || team.myRole === 'MANAGER' || team.isFounder;

  return (
    <div className="w-full animate-in fade-in duration-500 bg-transparent">

      {/* 1. ヒーローセクション */}
      <div className="relative w-full aspect-[21/9] lg:aspect-[4/1] bg-muted overflow-hidden border-b border-border/40">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('/team-cover.webp')` }} />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">

        {/* 2. プロフィールヘッダー */}
        <div className="relative -mt-16 sm:-mt-20 flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-6 mb-8 sm:mb-12">
          <div className="relative group shrink-0 self-start sm:self-auto">
            <Avatar className="h-28 w-28 sm:h-36 sm:w-36 border-4 border-background shadow-xl bg-white dark:bg-zinc-900">
              <AvatarFallback className="text-4xl sm:text-5xl font-black text-primary bg-primary/5">
                {(team.orgName || team.name || "T").slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {canManage && (
              <button className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 p-2.5 sm:p-3 bg-primary text-primary-foreground rounded-full shadow-lg hover:scale-110 active:scale-95 transition-transform border-2 border-background cursor-pointer">
                <Camera className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            )}
          </div>

          <div className="flex flex-col flex-1 pb-1">
            <h2 className="text-sm sm:text-base font-black text-primary mb-1">
              {team.orgName || "所属組織なし"}
            </h2>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground leading-tight mb-3">
              {team.name || "チーム名未設定"}
            </h1>

            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className="flex items-center gap-1.5 text-[10px] sm:text-xs font-bold bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                <Trophy className="h-3.5 w-3.5" />
                {team.teamType === 'regular' ? '一般チーム' : team.teamType || "TEAM"}
              </span>
              {team.year && (
                <span className="flex items-center gap-1.5 text-[10px] sm:text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full shadow-sm">
                  <Calendar className="h-3.5 w-3.5" /> Est. {team.year}
                </span>
              )}
              {team.tier && (
                <span className="flex items-center gap-1.5 text-[10px] sm:text-xs font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                  <Shield className="h-3.5 w-3.5" /> Tier: {team.tier}
                </span>
              )}
              {team.isFounder && (
                <span className="flex items-center gap-1.5 text-[10px] sm:text-xs font-black bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 px-3 py-1 rounded-full shadow-sm">
                  <Crown className="h-3.5 w-3.5" /> FOUNDER
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 🌟 3. メインコンテンツ（2カラム構成） */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* 左側（7カラム分）: チームインテル（勝率＆理念） */}
          <div className="lg:col-span-7 space-y-8">

            {/* 移植！シーズン勝率＆打撃成績カード */}
            <Card className="p-0 gap-0 bg-white/90 dark:bg-card/30 backdrop-blur-xl border-border/40 rounded-[40px] overflow-hidden shadow-sm hover:shadow-md dark:shadow-none transition-all hover:border-primary/30">
              <CardContent className="p-8 sm:p-10 flex flex-col items-center text-center space-y-8">

                {/* 勝率サークル */}
                <div className="relative w-40 h-40 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" className="stroke-muted/20 fill-none" strokeWidth="8" />
                    <circle cx="50" cy="50" r="45" className="stroke-primary fill-none transition-all duration-1000 ease-out" strokeWidth="8" strokeDasharray={283} strokeDashoffset={283 - (283 * stats.winRate) / 100} strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-black tabular-nums tracking-tighter text-foreground">{stats.winRate}%</span>
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60">Win Rate</span>
                  </div>
                </div>

                {/* 統計スタッツ */}
                <div className="grid grid-cols-4 w-full pt-4 border-t border-border/40">
                  <div className="text-center pt-4">
                    <p className="text-lg font-black text-foreground">{stats.wins} <span className="text-xs text-muted-foreground">-</span> {stats.losses}</p>
                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">W-L</p>
                  </div>
                  <div className="text-center border-l border-border/40 pt-4">
                    <p className="text-lg font-black text-foreground">{stats.avgRuns}</p>
                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Avg Runs</p>
                  </div>
                  <div className="text-center border-l border-border/40 pt-4">
                    <p className="text-lg font-black text-primary">{stats.teamAvg}</p>
                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Team AVG</p>
                  </div>
                  <div className="text-center border-l border-border/40 pt-4">
                    <p className="text-lg font-black text-foreground">{stats.teamHR}</p>
                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Team HR</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* チーム理念（スローガン＆拠点） */}
            <div className="p-8 rounded-[40px] bg-muted/30 border border-border/40 shadow-sm space-y-6">
              <h3 className="text-xs font-black flex items-center gap-2 text-muted-foreground uppercase tracking-wider">
                <Info className="h-4 w-4" /> Club Identity
              </h3>

              {team.description ? (
                <p className="text-lg font-bold text-foreground leading-relaxed italic border-l-4 border-primary pl-4">
                  「{team.description}」
                </p>
              ) : (
                <p className="text-sm font-medium text-muted-foreground italic border-l-4 border-muted pl-4">
                  チームのスローガンや紹介文が未設定です。
                </p>
              )}

              <div className="flex flex-col sm:flex-row gap-6 pt-4">
                <div>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">Home Ground</span>
                  <p className="text-sm font-semibold flex items-center">
                    <MapPin className="h-4 w-4 mr-1.5 text-primary" /> {team.homeGround || "未設定"}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">Manager</span>
                  <p className="text-sm font-semibold flex items-center">
                    <UserCircle className="h-4 w-4 mr-1.5 text-primary" /> {team.managerName || "未設定"}
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* 右側（5カラム分）: 管理・名簿メニュー */}
          <div className="lg:col-span-5 space-y-6">

            {/* ロースター（人数） */}
            <div className="p-8 rounded-[40px] bg-primary/5 border border-primary/20 shadow-sm group">
              <span className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-1 block">Active Roster</span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-5xl font-black text-primary">{memberCount}</span>
                <span className="text-sm font-bold text-primary/80">選手</span>
              </div>
            </div>

            {/* クイックメニュー（ナビゲーション） */}
            <div className="space-y-3">
              <button onClick={() => router.push('/team/players')} className="flex items-center gap-5 p-6 rounded-[32px] bg-white/90 dark:bg-card/20 border border-border/40 hover:bg-card/40 hover:border-primary/40 transition-all group shadow-sm text-left w-full">
                <div className="p-4 rounded-2xl bg-muted/40 group-hover:bg-primary/10 group-hover:text-primary transition-colors shrink-0">
                  <Users className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-black uppercase tracking-widest text-foreground">選手名簿</p>
                  <p className="text-[9px] font-bold text-muted-foreground/60 uppercase">Squad List</p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground/20 group-hover:text-primary transition-all group-hover:translate-x-1" />
              </button>

              <button onClick={() => router.push('/team/stats')} className="flex items-center gap-5 p-6 rounded-[32px] bg-white/90 dark:bg-card/20 border border-border/40 hover:bg-card/40 hover:border-primary/40 transition-all group shadow-sm text-left w-full">
                <div className="p-4 rounded-2xl bg-muted/40 group-hover:bg-primary/10 group-hover:text-primary transition-colors shrink-0">
                  <BarChart3 className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-black uppercase tracking-widest text-foreground">通算成績</p>
                  <p className="text-[9px] font-bold text-muted-foreground/60 uppercase">Team Analytics</p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground/20 group-hover:text-primary transition-all group-hover:translate-x-1" />
              </button>

              {canManage && (
                <button onClick={() => router.push('/team/settings')} className="flex items-center gap-5 p-6 rounded-[32px] bg-white/90 dark:bg-card/20 border border-border/40 hover:bg-card/40 hover:border-primary/40 transition-all group shadow-sm text-left w-full">
                  <div className="p-4 rounded-2xl bg-muted/40 group-hover:bg-primary/10 group-hover:text-primary transition-colors shrink-0">
                    <Settings className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-black uppercase tracking-widest text-foreground">チーム設定</p>
                    <p className="text-[9px] font-bold text-muted-foreground/60 uppercase">Management</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground/20 group-hover:text-primary transition-all group-hover:translate-x-1" />
                </button>
              )}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}