"use client";

import React, { useEffect, useState, Suspense } from "react";
/**
 * 💡 型安全プロトコル:
 * 1. 環境依存を排除するため、ナビゲーションには window.location を使用。
 * 2. shadcn/ui コンポーネントと Lucide アイコンを組み合わせ、影を抑えたフラットな質感を追求。
 */
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
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
  CalendarDays,
  Activity,
  Settings,
  ShieldCheck,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ⚾️ 型定義 (Schema Protocol)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface Match {
  id: string;
  opponentName: string;
  date: string;
  status: 'scheduled' | 'ongoing' | 'finished';
  myScore: number;
  opponentScore: number;
  venue?: string;
  inning?: string;
}

interface DashboardData {
  success: boolean;
  matches: Match[];
  stats: {
    totalGames: number;
    wins: number;
    draws: number;
    losses: number;
    winRate: number;
    avgRuns: number;
  };
}

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
 * ⚾️ プロフェッショナル・ダッシュボード
 * 全画面の背景を同期し、影を抑えたクリーンかつ高密度な司令塔。
 */
function DashboardContent() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiTip, setAiTip] = useState<string | null>(null);

  // 💡 安全なナビゲーション関数
  const navigateTo = (path: string) => {
    if (typeof window !== "undefined") {
      window.location.href = path;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/dashboard/summary');
        // 💡 型アサーションにより unknown 型エラーを防止
        const result = (await res.json()) as DashboardData;
        if (result.success) {
          setData(result);
        } else {
          setMockData();
        }
      } catch (e) {
        setMockData();
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const setMockData = () => {
    setData({
      success: true,
      matches: [
        { id: "m1", opponentName: "ライオンズ", date: "MAR 27", status: 'ongoing', myScore: 5, opponentScore: 3, venue: "第一球場", inning: "7回裏" },
        { id: "m2", opponentName: "タイガース", date: "MAR 24", status: 'finished', myScore: 2, opponentScore: 1, venue: "市民球場" },
        { id: "m3", opponentName: "ホークス", date: "APR 02", status: 'scheduled', myScore: 0, opponentScore: 0, venue: "河川敷A" },
      ],
      stats: { totalGames: 12, wins: 8, draws: 1, losses: 3, winRate: 67, avgRuns: 4.5 }
    });
  };

  const generateAiTip = async () => {
    setIsAnalyzing(true);
    try {
      const apiKey = ""; // Canvasにより自動提供
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: "野球チームの監督に、次の勝利に向けた短い戦術的な一言を日本語で生成してください。" }] }],
          systemInstruction: { parts: [{ text: "あなたはプロ野球の敏腕監督です。短く、情熱的で、かつ戦術的な助言を行ってください。" }] }
        })
      });
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
        <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-500 relative pb-20 overflow-x-hidden">

      {/* 💡 背景グラデーション: TeamPage/ScorePageと完全に統一（5%濃度） */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(var(--primary),0.05),transparent)] pointer-events-none -z-10" />

      {/* 🏟 メインレイアウト */}
      <main className="max-w-7xl mx-auto px-6 py-10 space-y-12 animate-in fade-in duration-1000">

        {/* 1. HERO HEADER: 司令塔の風格 */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 border-b border-border pb-10">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="border-primary/30 text-primary bg-primary/5 rounded-full px-4 py-1 text-[10px] font-black tracking-[0.2em] uppercase">
                Tactical Command
              </Badge>
              <div className="flex items-center gap-1.5 text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-40">
                <ShieldCheck className="h-3 w-3" /> System Verified
              </div>
            </div>
            <h1 className="text-5xl sm:text-7xl font-black tracking-tighter italic uppercase leading-none text-foreground">
              Manager <span className="text-primary">Suite</span>
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => navigateTo('/settings')}
              className="rounded-2xl h-16 w-16 border-border bg-background/50 hover:bg-muted p-0 shadow-sm"
            >
              <Settings className="h-6 w-6 text-muted-foreground" />
            </Button>
            <Button
              onClick={() => navigateTo('/matches/create')}
              className="rounded-2xl h-16 px-10 bg-primary text-primary-foreground font-black text-xl shadow-md shadow-primary/10 hover:bg-primary/90 transition-all flex items-center gap-3 active:scale-95"
            >
              <Plus className="h-6 w-6 stroke-[3px]" /> NEW MATCH
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">

          {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
              LEFT: TEAM INTEL (4 columns)
              ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          <div className="xl:col-span-4 space-y-10">

            {/* Season Progress Circle */}
            <Card className="bg-card/30 backdrop-blur-sm border-border rounded-[40px] overflow-hidden shadow-sm hover:border-primary/20 transition-colors">
              <CardContent className="p-10 flex flex-col items-center text-center space-y-8">
                <div className="relative w-44 h-44 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90">
                    <circle cx="88" cy="88" r="78" className="stroke-muted fill-none" strokeWidth="10" />
                    <circle
                      cx="88" cy="88" r="78"
                      className="stroke-primary fill-none transition-all duration-1000 ease-out"
                      strokeWidth="10"
                      strokeDasharray={490}
                      strokeDashoffset={490 - (490 * data.stats.winRate) / 100}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-5xl font-black tabular-nums tracking-tighter text-foreground">{data.stats.winRate}%</span>
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Victory Rate</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 w-full border-t border-border pt-8">
                  <div className="text-center">
                    <p className="text-xl font-black text-foreground">{data.stats.wins}</p>
                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Won</p>
                  </div>
                  <div className="text-center border-x border-border">
                    <p className="text-xl font-black text-foreground">{data.stats.losses}</p>
                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Lost</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-black text-foreground">{data.stats.avgRuns}</p>
                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Avg Runs</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Access Menu */}
            <div className="grid grid-cols-1 gap-4">
              {[
                { label: "Player Roster", icon: Users, path: "/players", desc: "選手名簿とステータス管理" },
                { label: "Tournament Map", icon: Trophy, path: "/tournaments", desc: "大会状況とトーナメント表" },
                { label: "Team Statistics", icon: BarChart3, path: "/stats/season", desc: "シーズン全成績の分析" },
              ].map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => navigateTo(item.path)}
                  className="flex items-center gap-5 p-6 rounded-[32px] bg-card/30 border border-border hover:bg-card/60 hover:border-primary/30 transition-all group shadow-sm text-left"
                >
                  <div className="p-4 rounded-2xl bg-muted group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                    <item.icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-black uppercase tracking-widest text-foreground">{item.label}</p>
                    <p className="text-[10px] font-bold text-muted-foreground">{item.desc}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground/30 group-hover:text-primary transition-transform group-hover:translate-x-1" />
                </button>
              ))}
            </div>
          </div>

          {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
              RIGHT: MATCH OPS (8 columns)
              ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          <div className="xl:col-span-8 space-y-10">

            {/* AI COACH: STRATEGIC INSIGHT */}
            <section
              className="cursor-pointer group relative"
              onClick={!aiTip ? generateAiTip : undefined}
            >
              <div className="absolute inset-0 bg-primary/5 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <Card className="relative bg-primary/5 border-primary/10 rounded-[32px] overflow-hidden shadow-none hover:bg-primary/10 transition-colors border-dashed">
                <CardContent className="p-8 flex flex-col sm:flex-row items-center gap-8">
                  <div className="relative shrink-0">
                    <div className="h-20 w-20 rounded-3xl bg-primary flex items-center justify-center text-primary-foreground">
                      {isAnalyzing ? (
                        <Loader2 className="h-10 w-10 animate-spin" />
                      ) : (
                        <Sparkles className="h-10 w-10" />
                      )}
                    </div>
                  </div>
                  <div className="flex-1 space-y-2 text-center sm:text-left">
                    <div className="flex items-center justify-center sm:justify-start gap-2">
                      <Badge className="bg-primary text-primary-foreground font-black text-[9px] uppercase px-2">AI Manager</Badge>
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60">Strategic Advisory</span>
                    </div>
                    <h3 className="text-xl font-bold leading-relaxed text-foreground italic">
                      {aiTip ? `"${aiTip}"` : "現在の戦績に基づき、チームへの新たな戦略指南をAIが生成します。タップして開始。"}
                    </h3>
                  </div>
                  <Zap className="h-6 w-6 text-primary/30 group-hover:text-primary transition-colors shrink-0 hidden sm:block" />
                </CardContent>
              </Card>
            </section>

            {/* LIVE & RECENT REPORTS */}
            <div className="space-y-6">
              <div className="flex items-center justify-between px-4">
                <h2 className="text-xs font-black uppercase tracking-[0.4em] text-muted-foreground flex items-center gap-2">
                  <Activity className="h-4 w-4" /> Live & Recent Matches
                </h2>
                <Button variant="ghost" className="text-[10px] font-black uppercase tracking-widest text-primary/60 hover:text-primary">View History</Button>
              </div>

              <div className="space-y-5">
                {data.matches.map((match) => (
                  <Card
                    key={match.id}
                    onClick={() => navigateTo(match.status === 'finished' ? `/matches/result?id=${match.id}` : `/matches/score?id=${match.id}`)}
                    className={cn(
                      "bg-card/40 dark:bg-zinc-900/10 border-border rounded-[40px] overflow-hidden transition-all duration-300 group hover:bg-card/80 hover:border-primary/30 cursor-pointer shadow-sm",
                      match.status === 'ongoing' ? "ring-1 ring-primary/40 bg-card/60" : ""
                    )}
                  >
                    <CardContent className="p-0">
                      <div className="flex flex-col sm:flex-row items-stretch">

                        {/* Status Section */}
                        <div className={cn(
                          "w-full sm:w-28 flex flex-col items-center justify-center p-6 border-b sm:border-b-0 sm:border-r border-border gap-2",
                          match.status === 'ongoing' ? "bg-primary text-primary-foreground" : "bg-muted/30"
                        )}>
                          {match.status === 'ongoing' ? (
                            <>
                              <div className="relative flex h-4 w-4">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-4 w-4 bg-white"></span>
                              </div>
                              <span className="text-[11px] font-black uppercase tracking-widest tabular-nums">{match.inning}</span>
                            </>
                          ) : (
                            <>
                              <CalendarDays className="h-6 w-6 opacity-30" />
                              <span className="text-[10px] font-black opacity-40 uppercase tabular-nums">{match.date}</span>
                            </>
                          )}
                        </div>

                        {/* Details Section */}
                        <div className="flex-1 p-8 flex items-center justify-between gap-6">
                          <div className="space-y-1">
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60">Matchup</p>
                            <h3 className="text-3xl font-black italic text-foreground group-hover:text-primary transition-colors">
                              vs {match.opponentName}
                            </h3>
                            <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                              <Target className="h-3 w-3" />
                              <span>{match.venue}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-10">
                            <div className="text-center space-y-1">
                              <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em]">Live Score</p>
                              <div className="flex items-center gap-4">
                                <span className={cn(
                                  "text-4xl font-black tabular-nums tracking-tighter",
                                  match.myScore > match.opponentScore ? "text-primary" : "text-foreground"
                                )}>{match.myScore}</span>
                                <div className="h-8 w-px bg-border rotate-[20deg]" />
                                <span className="text-4xl font-black tabular-nums tracking-tighter text-muted-foreground">
                                  {match.opponentScore}
                                </span>
                              </div>
                            </div>

                            <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center border border-border group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all shadow-inner">
                              {match.status === 'finished' ? (
                                <History className="h-6 w-6" />
                              ) : (
                                <Play className="h-6 w-6 fill-current" />
                              )}
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
        </div>
      </main>

      {/* 🏛 FOOTER: 品位あるフィニッシュ */}
      <footer className="mt-20 py-12 border-t border-border text-center relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-6 bg-background">
          <Activity className="h-8 w-8 text-muted-foreground/20" />
        </div>
        <p className="text-[10px] font-black tracking-[0.8em] text-muted-foreground/30 uppercase">
          Tactical Excellence • Integrity • Precision Analytics
        </p>
      </footer>
    </div>
  );
}

/**
 * ⚾️ ページエクスポート
 */
export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center bg-background"><Loader2 className="animate-spin text-primary" /></div>}>
      <DashboardContent />
    </Suspense>
  );
}