"use client";

import React, { useEffect, useState, Suspense } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  Trophy,
  Target,
  Zap,
  Sparkles,
  Loader2,
  TrendingUp,
  User
} from "lucide-react";
import { toast } from "sonner";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ⚾️ 型定義（型安全プロトコル適用）
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface PlayerStats {
  id: string;
  name: string;
  number: string;
  // 打撃成績
  atBats: number;
  runs: number;
  hits: number;
  rbi: number;
  strikeouts: number;
  walks: number;
  avg: string;
  // 投手成績 (オプション)
  inningsPitched?: number;
  earnedRuns?: number;
  pitchCount?: number;
}

interface StatsResponse {
  success: boolean;
  stats: PlayerStats[];
  matchInfo?: {
    opponentName: string;
    finalScore: string;
  };
  error?: string;
}

// Gemini API レスポンスの構造定義
interface GeminiAnalysisResponse {
  candidates?: {
    content?: {
      parts?: {
        text?: string;
      }[];
    };
  }[];
  error?: {
    message: string;
  };
}

/**
 * ⚾️ 選手成績ページ・メインコンテンツ
 */
function StatsPageContent() {
  // 環境によって next/navigation が解決できない場合があるため、window.location を使用したフォールバックを実装
  const [matchId, setMatchId] = useState<string | null>(null);

  const [stats, setStats] = useState<PlayerStats[]>([]);
  const [matchInfo, setMatchInfo] = useState<{ opponentName: string; finalScore: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);

  useEffect(() => {
    // 検索パラメータの取得
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      setMatchId(params.get("id"));
    }
  }, []);

  // 💡 データの取得
  useEffect(() => {
    if (!matchId) return;

    const fetchStats = async () => {
      try {
        const res = await fetch(`/api/matches/${matchId}/stats`);
        // 型アサーションにより unknown 型エラーを回避
        const data = (await res.json()) as StatsResponse;

        if (data.success) {
          setStats(data.stats);
          if (data.matchInfo) setMatchInfo(data.matchInfo);
        } else {
          toast.error("成績データの取得に失敗しました");
        }
      } catch (e) {
        console.error("Fetch error:", e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [matchId]);

  // 💡 Gemini によるパフォーマンス分析
  const analyzePerformance = async () => {
    if (stats.length === 0) return;

    setIsAnalyzing(true);
    setAiAnalysis(null);

    try {
      const statsSummary = stats.map(p => `${p.name}(#${p.number}): ${p.hits}安打 ${p.rbi}打点`).join(", ");
      const prompt = `
        以下の野球の試合結果（個人成績）を分析し、今日のMVP候補を1人選び、その理由とチーム全体への総評を短くドラマチックに述べてください。
        対戦相手: ${matchInfo?.opponentName || "不明"}
        成績: ${statsSummary}
      `;

      const apiKey = ""; // Canvasで自動提供
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          systemInstruction: {
            parts: [{ text: "あなたはプロ野球の敏腕アナリストです。情熱的かつ的確に分析してください。レスポンスは日本語で行ってください。" }]
          }
        })
      });

      // 型アサーションによりレスポンスの安全性を確保
      const result = (await res.json()) as GeminiAnalysisResponse;
      const analysisText = result.candidates?.[0]?.content?.parts?.[0]?.text;

      if (analysisText) {
        setAiAnalysis(analysisText.trim());
      } else {
        throw new Error("Analysis text not found");
      }
    } catch (e) {
      console.error("AI Analysis error:", e);
      toast.error("AI分析中にエラーが発生しました");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleBack = () => {
    if (typeof window !== "undefined") {
      window.history.back();
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-950">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-zinc-500 font-bold animate-pulse">統計データを集計中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-20">
      <main className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6">

        {/* ヘッダーエリア */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="rounded-full pl-2 pr-4 font-bold hover:bg-zinc-900 text-zinc-400"
          >
            <ChevronLeft className="h-5 w-5 mr-1" /> 戻る
          </Button>
          <Badge variant="outline" className="px-4 py-1 rounded-full border-primary/30 text-primary font-black bg-primary/5">
            MATCH STATS
          </Badge>
        </div>

        {/* 試合サマリーセクション */}
        <div className="space-y-2 border-l-4 border-primary pl-4">
          <h1 className="text-4xl font-black tracking-tighter uppercase italic">Player Performance</h1>
          <p className="text-zinc-500 font-bold flex items-center gap-2">
            vs <span className="text-zinc-200">{matchInfo?.opponentName || "Unknown Team"}</span>
            <span className="w-1 h-1 bg-zinc-700 rounded-full" />
            <span className="text-primary">{matchInfo?.finalScore || "Score Pending"}</span>
          </p>
        </div>

        {/* ✨ AI パフォーマンス分析カード */}
        <Card className="border-primary/20 bg-zinc-900/50 backdrop-blur-sm rounded-[32px] overflow-hidden shadow-2xl">
          <CardContent className="p-6 space-y-4">
            {!aiAnalysis ? (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-primary/20 rounded-2xl text-primary animate-pulse shadow-[0_0_20px_rgba(var(--primary),0.3)]">
                    <Sparkles className="h-7 w-7" />
                  </div>
                  <div>
                    <p className="font-black text-lg">AI パフォーマンス分析</p>
                    <p className="text-xs text-zinc-500 font-bold">今日のMVPと勝因をAIがプロ視点で分析します</p>
                  </div>
                </div>
                <Button
                  onClick={analyzePerformance}
                  disabled={isAnalyzing}
                  className="w-full sm:w-auto rounded-2xl font-black px-10 h-14 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all active:scale-95"
                >
                  {isAnalyzing ? (
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  ) : (
                    <TrendingUp className="h-5 w-5 mr-2" />
                  )}
                  分析を開始する
                </Button>
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-top-4 duration-700">
                <div className="flex items-center gap-2 mb-4 border-b border-primary/10 pb-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="text-[10px] font-black uppercase text-primary tracking-widest">AI Analyst Insight</span>
                </div>
                <div className="relative">
                  <div className="absolute -left-2 top-0 bottom-0 w-1 bg-primary rounded-full" />
                  <p className="text-base font-bold leading-relaxed italic text-zinc-100 pl-4 py-2">
                    {aiAnalysis}
                  </p>
                </div>
                <div className="flex justify-end mt-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setAiAnalysis(null)}
                    className="text-[10px] font-black text-zinc-500 hover:text-white"
                  >
                    分析結果を閉じる
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 成績データタブ */}
        <Tabs defaultValue="batting" className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-14 rounded-2xl bg-zinc-900 p-1.5 border border-zinc-800">
            <TabsTrigger
              value="batting"
              className="rounded-xl font-black text-xs tracking-widest data-[state=active]:bg-zinc-800 data-[state=active]:text-primary"
            >
              <Target className="h-4 w-4 mr-2" /> BATTING
            </TabsTrigger>
            <TabsTrigger
              value="pitching"
              className="rounded-xl font-black text-xs tracking-widest data-[state=active]:bg-zinc-800 data-[state=active]:text-primary"
            >
              <Zap className="h-4 w-4 mr-2" /> PITCHING
            </TabsTrigger>
          </TabsList>

          {/* 打撃成績タブ */}
          <TabsContent value="batting" className="mt-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <Card className="rounded-[32px] border-zinc-800 bg-zinc-900/30 overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-zinc-900">
                    <TableRow className="border-zinc-800 hover:bg-transparent">
                      <TableHead className="w-[150px] font-black text-[10px] text-zinc-500 uppercase tracking-widest">Player</TableHead>
                      <TableHead className="text-center font-black text-[10px] text-zinc-500 uppercase tracking-widest">AB</TableHead>
                      <TableHead className="text-center font-black text-[10px] text-zinc-500 uppercase tracking-widest">H</TableHead>
                      <TableHead className="text-center font-black text-[10px] text-zinc-500 uppercase tracking-widest">RBI</TableHead>
                      <TableHead className="text-center font-black text-[10px] text-zinc-500 uppercase tracking-widest">R</TableHead>
                      <TableHead className="text-center font-black text-[10px] text-zinc-500 uppercase tracking-widest">K/BB</TableHead>
                      <TableHead className="text-right font-black text-[10px] text-primary uppercase tracking-widest">AVG</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-20 text-zinc-600 font-bold">
                          データがありません
                        </TableCell>
                      </TableRow>
                    ) : (
                      stats.map((player) => (
                        <TableRow key={player.id} className="border-zinc-800/50 hover:bg-zinc-800/30 transition-colors group">
                          <TableCell className="font-bold py-4">
                            <div className="flex items-center gap-3">
                              <span className="text-[10px] font-black text-zinc-600 w-6">#{player.number}</span>
                              <span className="truncate group-hover:text-primary transition-colors">{player.name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center tabular-nums text-zinc-400 font-bold">{player.atBats}</TableCell>
                          <TableCell className="text-center tabular-nums font-black text-zinc-100">{player.hits}</TableCell>
                          <TableCell className="text-center tabular-nums font-black text-zinc-100">{player.rbi}</TableCell>
                          <TableCell className="text-center tabular-nums text-zinc-400 font-bold">{player.runs}</TableCell>
                          <TableCell className="text-center text-[10px] text-zinc-500 font-bold tabular-nums">
                            {player.strikeouts} / {player.walks}
                          </TableCell>
                          <TableCell className="text-right tabular-nums font-black text-primary text-base">
                            {player.avg}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </TabsContent>

          {/* 投手成績タブ */}
          <TabsContent value="pitching" className="mt-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <Card className="rounded-[32px] border-zinc-800 bg-zinc-900/30 overflow-hidden py-20">
              <div className="flex flex-col items-center space-y-4 opacity-20">
                <Zap className="h-16 w-12 text-zinc-400" />
                <p className="font-black tracking-widest uppercase text-sm">No Pitching Data Recorded</p>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* フッター情報 */}
        <div className="flex justify-center pt-10">
          <div className="flex items-center gap-2 px-6 py-2 rounded-full bg-zinc-900 border border-zinc-800">
            <User className="h-3 w-3 text-zinc-600" />
            <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">
              Generated by iScore Analytics
            </span>
          </div>
        </div>

      </main>
    </div>
  );
}

export default function StatsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-zinc-950">
          <Loader2 className="animate-spin text-primary h-8 w-8" />
        </div>
      }
    >
      <StatsPageContent />
    </Suspense>
  );
}