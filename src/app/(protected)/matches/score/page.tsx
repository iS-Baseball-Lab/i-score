// filepath: src/app/(protected)/matches/score/page.tsx
"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ScoreProvider, useScore } from "@/contexts/ScoreContext";
import { Scoreboard } from "@/components/score/Scoreboard";
import { ControlPanel } from "@/components/score/ControlPanel";
import { PlayArea } from "@/components/score/PlayArea";
import { PlayLog } from "@/components/score/PlayLog";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

/**
 * 🏟️ スコア入力メインコンテンツ
 * Pixel 10 Pro の縦長画面を活かし、
 * [掲示板 20%] -> [フィールド 35%] -> [常設ログ 15%] -> [操作パネル 30%]
 * の黄金比率で構成します。
 */
function ScorePageContent() {
  const searchParams = useSearchParams();
  const matchId = searchParams.get("id");
  const { initMatch, state, isSyncing } = useScore();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (matchId) {
      initMatch(matchId);
    }
    // ページ全体のスクロールを禁止し、専用端末化する
    document.body.style.overflow = "hidden";
    const timer = setTimeout(() => setIsReady(true), 100);
    
    return () => {
      document.body.style.overflow = "unset";
      clearTimeout(timer);
    };
  }, [matchId, initMatch]);

  return (
    <div className="fixed inset-0 z-[50] bg-background h-[100dvh] w-full flex flex-col overflow-hidden select-none">
      
      {/* 1. 【上部：掲示板】(約18-20%) 
          ライト/ダーク対応・スリム化した最新版 */}
      <header className={cn(
        "shrink-0 z-30 transition-transform duration-700 ease-out",
        isReady ? "translate-y-0" : "-translate-y-full"
      )}>
        <Scoreboard />
      </header>

      {/* 2. 【中央：フィールド & 常設ログ】(約50-55%) */}
      <main className={cn(
        "flex-1 relative flex flex-col items-center justify-between py-2 z-10 transition-all duration-1000 delay-150",
        isReady ? "opacity-100 scale-100" : "opacity-0 scale-98"
      )}>
        {/* 背景の微かなグラデーション（没入感用） */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(var(--primary-rgb),0.03)_0%,transparent_70%)] pointer-events-none" />
        
        {/* ⚾️ ダイヤモンド・プレイエリア (自動進塁対応想定) 
            高さを抑えてログのスペースを確保 */}
        <div className="w-full max-w-[260px] aspect-square flex-shrink-0 flex items-center justify-center">
          <PlayArea />
        </div>

        {/* 📝 🌟 常設プレイログエリア 
            「見えない」を解消するため、操作パネルのすぐ上に固定配置 */}
        <div className="w-full px-4 flex-1 flex flex-col justify-end pb-3">
          <div className="bg-muted/30 backdrop-blur-sm rounded-[24px] border border-border/40 p-3 shadow-inner">
            <div className="flex items-center justify-between mb-2 px-1">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/80">
                  Live Stream
                </span>
              </div>
              {isSyncing && (
                <div className="flex items-center gap-1">
                  <Loader2 className="w-2.5 h-2.5 animate-spin text-primary" />
                  <span className="text-[8px] font-bold text-primary uppercase">Sync</span>
                </div>
              )}
            </div>
            {/* 直近3件を表示し、入力ミスを即座に確認可能にする */}
            <PlayLog limit={3} />
          </div>
        </div>
      </main>

      {/* 3. 【下部：操作パネル】(約30%)
          BSOボタン主役・FABレスの究極パネル */}
      <footer className={cn(
        "shrink-0 z-30 bg-card border-t border-border px-3 pt-3 pb-8 shadow-[0_-10px_40px_rgba(0,0,0,0.1)]",
        isReady ? "translate-y-0" : "translate-y-full transition-none",
        "transition-transform duration-700 ease-out delay-100"
      )}>
        <div className="max-w-md mx-auto h-[220px]">
          <ControlPanel />
        </div>
      </footer>

      {/* 勝利・終了時のオーバーレイ演出（任意） */}
      {state.status === 'finished' && (
        <div className="absolute inset-0 z-[100] bg-background/80 backdrop-blur-md flex items-center justify-center animate-in fade-in duration-500">
          <div className="text-center">
            <h2 className="text-4xl font-black italic tracking-tighter mb-2">GAME OVER</h2>
            <p className="text-muted-foreground font-bold uppercase tracking-widest text-sm">Official Record Saved</p>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * 🏟️ ページエントリーポイント
 */
export default function ScorePage() {
  return (
    <Suspense fallback={
      <div className="h-screen w-full bg-background flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin stroke-[3px]" />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground animate-pulse">
          Opening Stadium...
        </p>
      </div>
    }>
      <ScoreProvider>
        <ScorePageContent />
      </ScoreProvider>
    </Suspense>
  );
}
