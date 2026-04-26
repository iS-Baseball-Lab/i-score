// src/app/(protected)/matches/score/page.tsx
"use client";

import React, { useEffect, Suspense } from "react";
/**
 * 💡 試合スコア入力：究極のフィールド・インターフェース
 * 1. 意匠: 背景を bg-transparent に設定し、Stadium Sync グラデーションを透過。
 * 2. 構造: ScoreProvider で状態を管理し、全パーツを角丸40pxのグリッドで配置。
 * 3. 整理: モバイルでの操作性を最優先し、アクションボタンを「親指ゾーン」に集約。
 * 4. 規則: 影なし (No Shadow)、境界線 border-border/40。
 */
import { useSearchParams } from "next/navigation";
import { ScoreProvider, useScore } from "@/contexts/ScoreContext";
import { Scoreboard } from "@/components/score/Scoreboard";
import { ControlPanel } from "@/components/score/ControlPanel";
import { PlayArea } from "@/components/score/PlayArea";
import { PlayLog } from "@/components/score/PlayLog";
import { AIAssistant } from "@/components/score/AIAssistant";
import { Loader2, AlertCircle, ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

function ScorePageContent() {
  const searchParams = useSearchParams();
  const matchId = searchParams.get("id");
  const { initMatch, isLoading, state } = useScore();

  useEffect(() => {
    if (matchId) initMatch(matchId);
  }, [matchId, initMatch]);

  if (!matchId) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center p-6">
        <Card className="max-w-md w-full border-red-500/20 bg-red-500/5 rounded-[40px] shadow-none backdrop-blur-xl">
          <CardContent className="pt-10 flex flex-col items-center text-center space-y-4">
            <AlertCircle className="h-16 w-16 text-red-500/50" />
            <h2 className="text-2xl font-black text-foreground italic uppercase tracking-tighter">Match ID Missing</h2>
            <p className="text-sm text-muted-foreground font-bold leading-relaxed">
              正しい試合データを選択してください。<br />ダッシュボードへ戻り、試合を再開してください。
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading && !state.matchId) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center space-y-6">
          <Loader2 className="h-12 w-12 animate-spin text-primary/30 mx-auto" />
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] animate-pulse">Entering Stadium...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent space-y-8 animate-in fade-in duration-1000 pb-20 md:pb-10">

      {/* 🏟 ステータスヘッダー */}
      <div className="flex items-center justify-between px-4 sm:px-2 border-b border-border/20 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-primary/30 text-primary bg-primary/5 rounded-full px-3 py-0.5 text-[9px] font-black tracking-widest uppercase">
              Live Scoring
            </Badge>
            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-40 flex items-center gap-1">
              <ShieldCheck className="h-3 w-3" /> Encrypted Link
            </span>
          </div>
          <h2 className="text-3xl font-black italic tracking-tighter text-foreground uppercase leading-none">
            Field <span className="text-primary">Operations</span>
          </h2>
        </div>
      </div>

      {/* 1. 究極のスコアボードセクション */}
      <section className="animate-in slide-in-from-top-4 duration-700">
        <Scoreboard />
      </section>

      {/* 2. AI アシスタント：戦術アドバイス */}
      <AIAssistant />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* 3. プレイエリア：ダイヤモンド表示 (7カラム) */}
        <div className="lg:col-span-7">
          <PlayArea />
        </div>

        {/* 4. 実況ログ：履歴表示 (5カラム) */}
        <div className="lg:col-span-5">
          <PlayLog />
        </div>
      </div>

      {/* 5. 究極のアクションコントロール (最下部固定または末尾) */}
      <div className="sticky bottom-6 z-30 md:relative md:bottom-0">
        <ControlPanel />
      </div>

      <footer className="pt-10 text-center opacity-20">
        <p className="text-[10px] font-black tracking-[0.8em] text-muted-foreground uppercase">
          Tactical Edge • iScore System
        </p>
      </footer>
    </div>
  );
}

export default function ScorePage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>}>
      <ScoreProvider>
        <ScorePageContent />
      </ScoreProvider>
    </Suspense>
  );
}