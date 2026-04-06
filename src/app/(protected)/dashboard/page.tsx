"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Play, History, Activity, CalendarDays, Target, Zap, Clock, CloudSun, Wind, Flame, Sparkles, Loader2, Crosshair } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { MatchModeDialog } from "@/components/matches/match-mode-dialog";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ⚾️ 型定義
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
interface Match {
  id: string;
  opponentName: string;
  date: string;
  status: 'scheduled' | 'ongoing' | 'finished';
  myScore: number;
  opponentScore: number;
  venue: string;
  inning?: string;
}

interface GeminiAnalysisResponse {
  candidates?: { content?: { parts?: { text?: string; }[]; }; }[];
  error?: { message: string };
}

function DashboardContent() {
  const router = useRouter();

  const [matches, setMatches] = useState<Match[]>([]);
  const [teamName, setTeamName] = useState<string>("TEAM");
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiTip, setAiTip] = useState<string | null>(null);

  // リアルタイム時計用
  const [mounted, setMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const activeTeamId = localStorage.getItem("iScore_selectedTeamId");
        if (!activeTeamId) {
          setIsLoading(false);
          return;
        }

        // チーム名の取得（ヘッダー表示用）
        const teamsRes = await fetch("/api/teams", { cache: "no-store" });
        if (teamsRes.ok) {
          const teamsData = await teamsRes.json() as any[];
          const current = teamsData.find(t => t.id === activeTeamId);
          if (current) setTeamName(current.name);
        }

        // 試合一覧の取得
        const matchesRes = await fetch(`/api/teams/${activeTeamId}/recent-matches`, { cache: "no-store" });
        if (!matchesRes.ok) throw new Error("試合取得失敗");
        const matchesData = await matchesRes.json() as any[];

        const formattedMatches: Match[] = matchesData.map(m => ({
          id: m.id,
          opponentName: m.opponent,
          date: m.date,
          status: m.status,
          myScore: m.myScore,
          opponentScore: m.opponentScore,
          venue: m.matchType === 'official' ? "公式戦" : "練習試合",
          inning: "終了"
        }));

        setMatches(formattedMatches);
      } catch (e) {
        toast.error("試合データの取得に失敗しました");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const generateAiTip = async () => {
    setIsAnalyzing(true);
    try {
      const apiKey = ""; // ※ 本番では環境変数から読み込む
      if (!apiKey) {
        toast.error("APIキーが設定されていません。");
        setIsAnalyzing(false);
        return;
      }
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
      const prompt = "野球チームの監督に、次の試合の勝利に向けた短い戦術的な一言を、プロの視点で日本語で生成してください。";

      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          systemInstruction: { parts: [{ text: "あなたはプロ野球の敏腕監督です。短く、情熱的で、かつ戦術的な助言を行ってください。" }] }
        })
      });
      const result = (await res.json()) as GeminiAnalysisResponse;
      const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        setAiTip(text.trim());
        toast.success("AI監督からの助言を受信しました");
      }
    } catch (e) {
      toast.error("AI分析に失敗しました");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const formattedTime = currentTime.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  // 🦴 スケルトンUI
  if (isLoading) {
    return (
      <div className="min-h-screen bg-transparent p-3 sm:p-6 md:p-10 space-y-8 md:space-y-12">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 border-b border-border/40 pb-8 md:pb-10">
          <Skeleton className="h-20 w-64 rounded-lg bg-white/5" />
          <Skeleton className="h-16 w-full sm:w-96 rounded-[24px] bg-white/5" />
        </div>
        <Skeleton className="h-32 w-full rounded-[32px] bg-white/5" />
        <div className="space-y-4 pt-8">
          <Skeleton className="h-[140px] w-full rounded-[40px] bg-white/5" />
          <Skeleton className="h-[140px] w-full rounded-[40px] bg-white/5" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent p-3 sm:p-6 md:p-10 space-y-8 md:space-y-12 animate-in fade-in duration-1000">

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          1. フロントライン・ヘッダー
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 border-b border-border/40 pb-8 md:pb-10">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="border-primary/30 text-primary bg-primary/5 rounded-full px-4 py-1 text-[10px] font-black tracking-[0.2em] uppercase">
              Match Center
            </Badge>
            <div className="flex items-center gap-1.5 text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-40">
              <Crosshair className="h-3 w-3" /> Live Operations
            </div>
          </div>
          <h1 className="text-5xl sm:text-7xl font-black tracking-tighter italic uppercase text-foreground leading-none">
            {teamName} <span className="text-primary underline decoration-primary/20 underline-offset-8">Score</span>
          </h1>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 w-full lg:w-auto">
          {/* コンディション・ウィジェット */}
          <div className="flex items-center justify-center sm:justify-start w-full sm:w-auto gap-3 sm:gap-5 font-bold sm:font-medium text-foreground/90 sm:text-foreground/80 bg-white/90 dark:bg-background/40 backdrop-blur-xl border border-white/10 rounded-[20px] sm:rounded-2xl px-3 py-4 sm:px-5 sm:py-2.5 shadow-sm">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Clock className="w-5 h-5 sm:w-4 sm:h-4 text-primary" />
              <span className="tabular-nums tracking-wider text-base sm:text-sm">
                {mounted ? `${formattedTime}` : "--:--:--"}
              </span>
            </div>
            <div className="w-px h-6 sm:h-4 bg-white/20"></div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <CloudSun className="w-5 h-5 sm:w-4 sm:h-4 text-orange-400" />
              <span className="text-base sm:text-sm">22°C</span>
            </div>
            <div className="w-px h-6 sm:h-4 bg-white/20"></div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Wind className="w-5 h-5 sm:w-4 sm:h-4 text-sky-400" />
              <span className="text-base sm:text-sm whitespace-nowrap">南 5m/s</span>
            </div>
          </div>

          {/* 🌟 修正: 巨大な NEW MATCH ボタンを Dialog コンポーネントでラップする */}
          <MatchModeDialog>
            <Button
              className="rounded-[24px] h-14 sm:h-14 px-8 bg-primary text-primary-foreground font-black text-xl sm:text-lg shadow-none border border-primary/20 hover:border-primary/40 hover:bg-primary/90 transition-all flex items-center gap-2 active:scale-95 w-full sm:w-auto justify-center shrink-0"
            >
              <Plus className="h-6 w-6 sm:h-5 sm:w-5 stroke-[3px]" /> NEW MATCH
            </Button>
          </MatchModeDialog>        </div>
      </div>

      <div className="max-w-6xl mx-auto space-y-10">

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            2. AI戦術指南（全画面幅の特等席！）
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section className="p-0 gap-0 cursor-pointer group relative" onClick={!aiTip ? generateAiTip : undefined}>
          <div className="absolute inset-0 bg-primary/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
          <Card className="relative bg-primary/5 border-primary/20 rounded-[32px] overflow-hidden border-dashed border-2 hover:bg-primary/10 transition-colors shadow-sm hover:shadow-md dark:shadow-none">
            <CardContent className="p-6 sm:p-10 flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
              <div className="relative shrink-0">
                <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-3xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
                  {isAnalyzing ? <Loader2 className="h-8 w-8 sm:h-10 sm:w-10 animate-spin" /> : <Sparkles className="h-8 w-8 sm:h-10 sm:w-10" />}
                </div>
              </div>
              <div className="flex-1 space-y-2 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <Badge className="bg-primary text-primary-foreground font-black text-[9px] uppercase px-2 rounded-md">AI Manager</Badge>
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-40">Tactical Briefing</span>
                </div>
                <h3 className="text-lg sm:text-2xl font-bold leading-relaxed text-foreground italic border-l-2 border-primary/20 pl-4">
                  {aiTip ? `"${aiTip}"` : "タップして、グラウンドの風向きと直近のスコアデータからAI監督の戦術指南を受け取る。"}
                </h3>
              </div>
              <Zap className="h-6 w-6 text-primary/30 group-hover:text-primary transition-colors hidden sm:block shrink-0" />
            </CardContent>
          </Card>
        </section>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            3. スコアボード一覧（主役エリア）
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section className="space-y-6">
          <div className="flex items-center justify-between px-2 sm:px-4">
            <h2 className="text-xs sm:text-sm font-black uppercase tracking-[0.3em] text-muted-foreground flex items-center gap-2">
              <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-primary" /> Scoreboards
            </h2>
            <Button variant="ghost" onClick={() => router.push('/matches')} className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-primary/60 hover:text-primary">
              View All History
            </Button>
          </div>

          <div className="space-y-4">
            {matches.length > 0 ? (
              matches.map((match) => (
                <Card
                  key={match.id}
                  onClick={() => router.push(match.status === 'finished' ? `/matches/result?id=${match.id}` : `/matches/score?id=${match.id}`)}
                  className={cn(
                    "p-0 gap-0",
                    "bg-white/90 dark:bg-card/20 dark:bg-zinc-900/10 backdrop-blur-md border-border/40 rounded-[32px] sm:rounded-[40px] overflow-hidden transition-all duration-300 group hover:bg-card/40 hover:border-primary/30 cursor-pointer shadow-sm hover:shadow-md dark:shadow-none",
                    match.status === 'ongoing' ? "ring-1 ring-primary/40 bg-card/40" : ""
                  )}
                >
                  <CardContent className="p-0">
                    <div className="flex flex-col sm:flex-row items-stretch">

                      {/* ステータスバッジ（左側） */}
                      <div className={cn(
                        "w-full sm:w-32 flex flex-col items-center justify-center p-4 sm:p-6 border-b sm:border-b-0 sm:border-r border-border/40 gap-2 shrink-0 transition-colors",
                        match.status === 'ongoing' ? "bg-primary text-primary-foreground" : "bg-muted/30 group-hover:bg-muted/50"
                      )}>
                        {match.status === 'ongoing' ? (
                          <>
                            <div className="relative h-4 w-4">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-4 w-4 bg-white"></span>
                            </div>
                            <span className="text-[11px] font-black uppercase tracking-widest tabular-nums">{match.inning}</span>
                          </>
                        ) : (
                          <>
                            <CalendarDays className="h-5 w-5 sm:h-6 sm:w-6 opacity-30" />
                            <span className="text-[10px] font-black opacity-50 uppercase tabular-nums tracking-widest">{match.date}</span>
                          </>
                        )}
                      </div>

                      {/* 試合情報とスコア（右側） */}
                      <div className="flex-1 p-5 sm:p-8 flex items-center justify-between gap-4 sm:gap-6">
                        <div className="space-y-1 overflow-hidden">
                          <p className="text-[9px] sm:text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-50">Matchup</p>
                          <h3 className="text-2xl sm:text-4xl font-black italic text-foreground group-hover:text-primary transition-colors leading-none tracking-tighter truncate">
                            vs {match.opponentName}
                          </h3>
                          <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-bold text-muted-foreground pt-1 sm:pt-2">
                            <Target className="h-3 w-3 sm:h-4 sm:w-4 text-primary/50 shrink-0" />
                            <span className="truncate">{match.venue}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-6 sm:gap-12 shrink-0">
                          {/* スコア表示（スマホでは少し小さく、PCでは巨大に） */}
                          <div className="text-center space-y-1 hidden sm:block">
                            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-50">Final Score</p>
                            <div className="flex items-center gap-4">
                              <span className={cn(
                                "text-4xl sm:text-5xl font-black tabular-nums tracking-tighter",
                                match.myScore > match.opponentScore ? "text-primary" : "text-foreground"
                              )}>{match.myScore}</span>
                              <div className="h-8 sm:h-10 w-px bg-border/40 rotate-[20deg]" />
                              <span className="text-4xl sm:text-5xl font-black tabular-nums tracking-tighter text-muted-foreground/40">
                                {match.opponentScore}
                              </span>
                            </div>
                          </div>

                          {/* アクションボタン */}
                          <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-muted/40 flex items-center justify-center border border-border/40 group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all shadow-inner shrink-0">
                            {match.status === 'finished' ? (
                              <History className="h-5 w-5 sm:h-7 sm:w-7" />
                            ) : (
                              <Play className="h-5 w-5 sm:h-7 sm:w-7 fill-current ml-1" />
                            )}
                          </div>
                        </div>
                      </div>

                      {/* スマホ用スコア表示（モバイルのみ表示） */}
                      <div className="sm:hidden px-5 pb-5 pt-0 flex justify-between items-center border-t border-border/20 mt-2">
                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Score</span>
                        <div className="flex items-center gap-3">
                          <span className={cn("text-2xl font-black tabular-nums tracking-tighter", match.myScore > match.opponentScore ? "text-primary" : "text-foreground")}>{match.myScore}</span>
                          <span className="text-muted-foreground/40">-</span>
                          <span className="text-2xl font-black tabular-nums tracking-tighter text-muted-foreground/40">{match.opponentScore}</span>
                        </div>
                      </div>

                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              // 試合データが空の場合
              <div className="flex flex-col items-center justify-center p-12 sm:p-20 border-2 border-dashed border-border/40 rounded-[32px] sm:rounded-[40px] bg-white/50 dark:bg-zinc-900/10 backdrop-blur-sm transition-all hover:bg-muted/20">
                <Target className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground/30 mb-4 sm:mb-6" />
                <p className="text-xl sm:text-2xl font-black text-foreground">試合データがありません</p>
                <p className="text-sm sm:text-base font-bold text-muted-foreground mt-2 text-center max-w-sm">右上の「NEW MATCH」ボタンから、新しい試合のスコア記録を開始しましょう！</p>
              </div>
            )}
          </div>
        </section>

      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>}>
      <DashboardContent />
    </Suspense>
  );
}