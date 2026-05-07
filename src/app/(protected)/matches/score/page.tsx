// filepath: `src/app/(protected)/matches/score/page.tsx`
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
 * 🏟️ iScoreCloud 究極のフルスクリーン・レイアウト
 * 画面比率を厳格に管理し、ボタンを最大化します。
 */
function ScorePageContent() {
  const searchParams = useSearchParams();
  const matchId = searchParams.get("id");
  const { initMatch, state, isSyncing } = useScore();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (matchId) initMatch(matchId);
    document.body.style.overflow = "hidden";
    const timer = setTimeout(() => setIsReady(true), 100);
    return () => {
      document.body.style.overflow = "unset";
      clearTimeout(timer);
    };
  }, [matchId, initMatch]);

  return (
    <div className="fixed inset-0 z-[100] bg-background h-[100dvh] w-full flex flex-col overflow-hidden select-none">
      
      {/* 1. 【上部：掲示板】(約18%) */}
      <header className={cn(
        "shrink-0 z-30 transition-transform duration-700",
        isReady ? "translate-y-0" : "-translate-y-full"
      )}>
        <Scoreboard />
      </header>

      {/* 2. 【中央：メインエリア】(約50%) */}
      <main className={cn(
        "flex-1 relative flex flex-col items-center justify-between z-10 py-1 transition-all duration-1000",
        isReady ? "opacity-100 scale-100" : "opacity-0 scale-95"
      )}>
        {/* フィールド：アスペクト比を保ちつつ最大化 */}
        <div className="w-full flex-1 flex items-center justify-center min-h-0">
          <div className="h-full max-h-[260px] aspect-square">
            <PlayArea />
          </div>
        </div>

        {/* プレイログ：高さを100pxに抑え、フィールドとパネルの繋ぎ役に */}
        <div className="w-full px-4 shrink-0 h-[100px] mb-1">
          <div className="h-full bg-muted/20 backdrop-blur-md rounded-[24px] border border-border/30 p-2 shadow-inner flex flex-col">
            <div className="flex items-center gap-1.5 mb-1 px-1">
              <div className="w-1 h-1 rounded-full bg-primary/60" />
              <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/60">Recent Actions</span>
            </div>
            <div className="flex-1 overflow-hidden">
              <PlayLog limit={3} />
            </div>
          </div>
        </div>
      </main>

      {/* 3. 【下部：操作パネル】(約32%) 🌟 ここが戦場 🌟 */}
      <footer className={cn(
        "shrink-0 z-40 bg-card border-t border-border px-2 pt-2 pb-6 shadow-[0_-15px_50px_rgba(0,0,0,0.2)]",
        "h-[32dvh] min-h-[260px]", // Footerの高さをしっかり確保
        isReady ? "translate-y-0" : "translate-y-full transition-none",
        "transition-transform duration-700 ease-out"
      )}>
        <div className="max-w-md mx-auto h-full w-full">
          {/* 💡 ControlPanel 内で h-full を使い、ボタンを縦に引き伸ばす */}
          <ControlPanel />
        </div>
      </footer>

      {/* 勝利演出 */}
      {state.status === 'finished' && (
        <div className="absolute inset-0 z-[200] bg-background/90 backdrop-blur-xl flex items-center justify-center animate-in fade-in duration-500">
          <div className="text-center">
            <h2 className="text-5xl font-black italic text-primary animate-bounce">GAME SET</h2>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ScorePage() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center">Loading...</div>}>
      <ScoreProvider>
        <ScorePageContent />
      </ScoreProvider>
    </Suspense>
  );
}
