"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Play,
  Trophy,
  Users,
  ChevronRight,
  Sparkles,
  Loader2,
  TrendingUp,
  History,
  Target,
  BarChart3,
  Settings,
  Moon,
  Sun
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
// 💡 テーマ切り替え用のライブラリ（next-themes等）があることを想定
// もしない場合は標準のクラス制御として機能します

interface Match {
  id: string;
  opponentName: string;
  date: string;
  status: 'scheduled' | 'ongoing' | 'finished';
  myScore: number;
  opponentScore: number;
  venue?: string;
}

interface DashboardData {
  success: boolean;
  matches: Match[];
  stats: {
    totalGames: number;
    wins: number;
    draws: number;
    losses: number;
  };
}

// 💡 Gemini API レスポンスの型定義
interface GeminiAnalysisResponse {
  candidates?: {
    content?: {
      parts?: {
        text?: string;
      }[];
    };
  }[];
  error?: { message: string };
}

/**
 * ⚾️ プロフェッショナル・ハイブリッド・ダッシュボード
 * ライト/ダーク両モードで「プロの風格」を維持する、セマンティック・デザイン。
 */
export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiTip, setAiTip] = useState<string | null>(null);

  const navigateTo = (path: string) => {
    if (typeof window !== "undefined") {
      window.location.href = path;
    }
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await fetch('/api/dashboard/summary');
        // 💡 型安全プロトコル: キャストを行い 'unknown' エラーを防止
        const result = (await res.json()) as DashboardData;
        if (result.success) setData(result);
        else setMockData();
      } catch (e) {
        setMockData();
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const setMockData = () => {
    setData({
      success: true,
      matches: [
        { id: "m1", opponentName: "ライオンズ", date: "2024-03-27", status: 'ongoing', myScore: 5, opponentScore: 3, venue: "第一球場" },
        { id: "m2", opponentName: "タイガース", date: "2024-03-24", status: 'finished', myScore: 2, opponentScore: 1, venue: "市民球場" },
      ],
      stats: { totalGames: 12, wins: 8, draws: 1, losses: 3 }
    });
  };

  const generateAiTip = async () => {
    setIsAnalyzing(true);
    try {
      const apiKey = "";
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: "野球の監督として短い激励を。" }] }],
        })
      });
      // 💡 修正ポイント: 'unknown' 型エラーを回避するため、定義したインターフェースへキャスト
      const result = (await res.json()) as GeminiAnalysisResponse;
      const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) setAiTip(text.trim());
    } catch (e) {
      toast.error("AI分析に失敗しました");
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (isLoading || !data) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  const winRate = Math.round((data.stats.wins / data.stats.totalGames) * 100);

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-white transition-colors duration-500">

      {/* 💡 動的背景: モードによって色調が変化 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/10 blur-[100px] rounded-full dark:bg-primary/20" />
        <div className="absolute bottom-[10%] -right-[5%] w-[30%] h-[30%] bg-blue-500/5 blur-[80px] rounded-full dark:bg-blue-500/10" />
      </div>

      <main className="max-w-6xl mx-auto px-6 py-10 space-y-10">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-primary/50 text-primary bg-primary/5 rounded-full px-3 py-0.5 text-[10px] font-black tracking-widest uppercase">
                Team Control
              </Badge>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Analytics Ready</span>
            </div>
            <h1 className="text-5xl font-black tracking-tighter italic uppercase text-foreground drop-shadow-sm">
              I-SCORE <span className="text-primary underline decoration-primary/30 underline-offset-8">DASH</span>
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="rounded-2xl border-input bg-background hover:bg-accent h-14 w-14 p-0 shadow-sm"
              onClick={() => navigateTo('/settings')}
            >
              <Settings className="h-5 w-5 text-muted-foreground" />
            </Button>
            <Button
              onClick={() => navigateTo('/matches/create')}
              className="rounded-2xl h-14 px-8 bg-primary text-primary-foreground font-black text-lg shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-3"
            >
              <Plus className="h-6 w-6 stroke-[3px]" /> PLAY BALL
            </Button>
          </div>
        </div>

        {/* AI INSIGHT */}
        <section
          className="relative group cursor-pointer"
          onClick={!aiTip ? generateAiTip : undefined}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-blue-500/10 blur-xl opacity-30 group-hover:opacity-60 transition-opacity" />
          <Card className="relative border-border bg-card/60 dark:bg-zinc-900/40 backdrop-blur-md rounded-[32px] overflow-hidden shadow-sm">
            <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-6">
              <div className="relative">
                <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                  <Sparkles className={cn("h-8 w-8", isAnalyzing && "animate-spin")} />
                </div>
              </div>
              <div className="flex-1 space-y-1 text-center sm:text-left">
                <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Strategy Insight</p>
                <h3 className="text-xl font-bold leading-tight text-foreground">
                  {aiTip ? aiTip : "現在の戦績を分析し、今日の勝利への格言を提示します。"}
                </h3>
              </div>
            </CardContent>
          </Card>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* STATS */}
          <div className="lg:col-span-1 space-y-6">
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground pl-2">Season Stats</h2>

            <div className="grid grid-cols-1 gap-4">
              <Card className="bg-gradient-to-br from-card to-background dark:from-zinc-900 dark:to-black border-border rounded-[32px] overflow-hidden shadow-lg">
                <CardContent className="p-8 space-y-4">
                  <div className="flex items-center justify-between">
                    <Trophy className="h-8 w-8 text-yellow-500" />
                    <span className="text-[10px] font-black uppercase text-muted-foreground">Win Rate</span>
                  </div>
                  <div>
                    <span className="text-6xl font-black tabular-nums tracking-tighter text-foreground">{winRate}%</span>
                  </div>
                  <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${winRate}%` }} />
                  </div>
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground pt-2">
                    <span>{data.stats.wins} WINS</span>
                    <span>{data.stats.losses} LOSSES</span>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-card border-border rounded-3xl">
                  <CardContent className="p-5 space-y-1 text-center">
                    <p className="text-2xl font-black tabular-nums text-foreground">{data.stats.totalGames}</p>
                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Total</p>
                  </CardContent>
                </Card>
                <Card className="bg-card border-border rounded-3xl">
                  <CardContent className="p-5 space-y-1 text-center">
                    <p className="text-2xl font-black tabular-nums text-foreground">{data.stats.draws}</p>
                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Draws</p>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <Button
                variant="outline"
                onClick={() => navigateTo('/players')}
                className="h-16 rounded-2xl border-border bg-card hover:bg-primary hover:text-primary-foreground group transition-all shadow-sm"
              >
                <Users className="h-5 w-5 mr-3 text-muted-foreground group-hover:text-primary-foreground" />
                <span className="font-black text-xs uppercase tracking-widest">Player Roster</span>
                <ChevronRight className="ml-auto h-4 w-4 opacity-0 group-hover:opacity-100" />
              </Button>
              <Button
                variant="outline"
                onClick={() => navigateTo('/tournaments')}
                className="h-16 rounded-2xl border-border bg-card hover:bg-primary hover:text-primary-foreground group transition-all shadow-sm"
              >
                <BarChart3 className="h-5 w-5 mr-3 text-muted-foreground group-hover:text-primary-foreground" />
                <span className="font-black text-xs uppercase tracking-widest">Tournaments</span>
                <ChevronRight className="ml-auto h-4 w-4 opacity-0 group-hover:opacity-100" />
              </Button>
            </div>
          </div>

          {/* MATCH LIST */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground">Match History</h2>
              <Button variant="ghost" className="text-[10px] font-black uppercase text-muted-foreground hover:text-primary">More View</Button>
            </div>

            <div className="space-y-4">
              {data.matches.map((match) => (
                <Card
                  key={match.id}
                  className={cn(
                    "bg-card/40 dark:bg-zinc-900/30 border-border rounded-[32px] overflow-hidden transition-all duration-300 group hover:-translate-y-1 cursor-pointer shadow-sm",
                    match.status === 'ongoing' ? "ring-2 ring-primary/40 dark:ring-primary/20 shadow-xl" : "hover:bg-card dark:hover:bg-zinc-900/50"
                  )}
                  onClick={() => navigateTo(match.status === 'finished' ? `/matches/result?id=${match.id}` : `/matches/score?id=${match.id}`)}
                >
                  <CardContent className="p-0">
                    <div className="flex flex-col sm:flex-row items-stretch">
                      <div className={cn(
                        "w-full sm:w-24 flex items-center justify-center p-4 border-b sm:border-b-0 sm:border-r border-border transition-colors",
                        match.status === 'ongoing' ? "bg-primary/10" : "bg-muted/50"
                      )}>
                        {match.status === 'ongoing' ? (
                          <div className="flex flex-col items-center gap-1 animate-pulse">
                            <span className="relative flex h-3 w-3">
                              <span className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-75 animate-ping"></span>
                              <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                            </span>
                            <span className="text-[9px] font-black text-primary uppercase">Live</span>
                          </div>
                        ) : (
                          <History className="h-6 w-6 text-muted-foreground" />
                        )}
                      </div>

                      <div className="flex-1 p-6 flex items-center justify-between gap-6">
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold text-muted-foreground tracking-tight">{match.date} • {match.venue}</p>
                          <h3 className="text-2xl font-black italic text-foreground">
                            VS <span className="group-hover:text-primary transition-colors">{match.opponentName}</span>
                          </h3>
                        </div>

                        <div className="flex items-center gap-6">
                          <div className="text-center">
                            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Score</p>
                            <div className="flex items-center gap-2">
                              <span className={cn(
                                "text-3xl font-black tabular-nums tracking-tighter",
                                match.myScore > match.opponentScore ? "text-primary" : "text-foreground"
                              )}>{match.myScore}</span>
                              <span className="text-muted-foreground font-black">-</span>
                              <span className="text-3xl font-black tabular-nums tracking-tighter text-muted-foreground">{match.opponentScore}</span>
                            </div>
                          </div>
                          <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center border border-border group-hover:bg-primary group-hover:border-primary transition-all">
                            <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary-foreground" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>

      <footer className="mt-20 py-10 border-t border-border text-center">
        <p className="text-[10px] font-black tracking-[0.5em] text-muted-foreground uppercase">
          Precision Integrity Passion & Analytics
        </p>
      </footer>
    </div>
  );
}