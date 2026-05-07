// filepath: src/app/(protected)/matches/score/page.tsx
"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ScoreProvider, useScore } from "@/contexts/ScoreContext";
import { Scoreboard } from "@/components/score/Scoreboard";
import { ControlPanel } from "@/components/score/ControlPanel";
import { PlayArea } from "@/components/score/PlayArea";
import { PlayLog } from "@/components/score/PlayLog";

/**
 * 🏟️ メインコンテンツ：Pixel 10 Pro 没入型レイアウト
 */
function ScorePageContent() {
  const searchParams = useSearchParams();
  const matchId = searchParams.get("id");
  const { initMatch, state, isSyncing } = useScore();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (matchId) initMatch(matchId);
    
    // スクロールを禁止し、1枚の「ボード」として固定
    document.body.style.overflow = 'hidden';
    const timer = setTimeout(() => setIsReady(true), 100);
    
    return () => { 
      document.body.style.overflow = 'unset';
      clearTimeout(timer);
    };
  }, [matchId, initMatch]);

  return (
    <div className="fixed inset-0 z-[100] bg-background h-[100dvh] w-full flex flex-col overflow-hidden select-none">
      
      {/* 1. 【上部：掲示板】スタジアムの迫力を再現 */}
      <header className={`
        h-[22%] shrink-0 z-30 transition-transform duration-1000 cubic-bezier(0.22, 1, 0.36, 1)
        ${isReady ? "translate-y-0" : "-translate-y-full"}
      `}>
        <Scoreboard />
      </header>

      {/* 2. 【中央：フィールド】直感的なランナー操作 & 1行速報 */}
      <main className={`
        flex-1 relative flex flex-col items-center justify-center z-10 transition-all duration-1000 delay-300
        ${isReady ? "opacity-100 scale-100" : "opacity-0 scale-95"}
      `}>
        {/* フィールドの奥行きを出すグラデーション */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.05)_0%,transparent_70%)] pointer-events-none" />
        
        {/* ダイヤモンドエリア */}
        <div className="w-full max-w-[300px] aspect-square">
          <PlayArea />
        </div>

        {/* 1行速報ログ：フィールドのすぐ下にカプセル型で表示 */}
        <div className="absolute bottom-6 w-full px-8 opacity-90 transition-all duration-500">
          <PlayLog limit={1} />
        </div>

        {/* 通信中のグローエフェクト */}
        {isSyncing && (
          <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1 bg-primary/20 rounded-full animate-pulse border border-primary/30">
            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
            <span className="text-[8px] font-black text-primary tracking-widest uppercase">Syncing</span>
          </div>
        )}
      </main>

      {/* 3. 【下部：操作パネル】重戦車級の入力インターフェース */}
      <footer className={`
        h-[26%] shrink-0 z-30 bg-card/90 backdrop-blur-3xl border-t border-border/40 px-4 pt-4 pb-8 shadow-[0_-20px_60px_rgba(0,0,0,0.2)]
        transition-transform duration-1000 cubic-bezier(0.22, 1, 0.36, 1)
        ${isReady ? "translate-y-0" : "translate-y-full"}
      `}>
        <div className="max-w-md mx-auto h-full">
          <ControlPanel />
        </div>
      </footer>

      {/* 全画面サヨナラ勝ち演出（ボーナスエフェクト用のオーバーレイ） */}
      {state.status === 'finished' && (
        <div className="absolute inset-0 z-[200] bg-primary/20 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-1000">
          <div className="flex flex-col items-center gap-4">
             <div className="text-6xl font-black italic text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.5)] animate-bounce">
               WALK-OFF!
             </div>
             <p className="text-white/80 font-bold tracking-[0.5em] uppercase">Game Finished</p>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * 💡 デフォルトエクスポート：Suspense & Provider で保護
 */
export default function ScorePage() {
  return (
    <Suspense fallback={
      <div className="h-screen bg-background flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Preparing Field...</p>
      </div>
    }>
      <ScoreProvider>
        <ScorePageContent />
      </ScoreProvider>
    </Suspense>
  );
}
