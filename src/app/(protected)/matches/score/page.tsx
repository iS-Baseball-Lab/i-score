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
 * 🏟️ iScoreCloud 究極の試合入力画面
 * レイアウト比率:
 * - Scoreboard: 18% (状況把握)
 * - PlayArea: 自由 (メインフィールド)
 * - PlayLog: 110px 固定 (確認用スリムログ)
 * - ControlPanel: 240px 固定 (爆速操作パネル)
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
    // 専用端末化：スクロール禁止 & 100dvh 固定
    document.body.style.overflow = "hidden";
    const timer = setTimeout(() => setIsReady(true), 100);
    
    return () => {
      document.body.style.overflow = "unset";
      clearTimeout(timer);
    };
  }, [matchId, initMatch]);

  return (
    <div className="fixed inset-0 z-[50] bg-background h-[100dvh] w-full flex flex-col overflow-hidden select-none">
      
      {/* 1. 【上部：掲示板】スリム & 高視認性 */}
      <header className={cn(
        "shrink-0 z-30 transition-transform duration-700 ease-out",
        isReady ? "translate-y-0" : "-translate-y-full"
      )}>
        <Scoreboard />
      </header>

      {/* 2. 【中央：メインエリア】 */}
      <main className={cn(
        "flex-1 relative flex flex-col items-center justify-start z-10 transition-all duration-1000 delay-150 px-4",
        isReady ? "opacity-100 scale-100" : "opacity-0 scale-98"
      )}>
        {/* フィールドの奥行きを出すエフェクト */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(var(--primary-rgb),0.02)_0%,transparent_70%)] pointer-events-none" />
        
        {/* ⚾️ ダイヤモンド (PlayArea)
            flex-1 を与えることで、画面中央の空きスペースを最大活用 */}
        <div className="w-full flex-1 flex items-center justify-center min-h-[250px]">
          <div className="w-full max-w-[300px] aspect-square drop-shadow-2xl">
            <PlayArea />
          </div>
        </div>

        {/* 📝 🌟 常設プレイログ (スリム・固定デザイン)
            下半分を占拠させないよう、高さを 110px に制限 */}
        <div className="w-full shrink-0 h-[110px] mb-3 z-20">
          <div className="h-full bg-muted/20 backdrop-blur-md rounded-[28px] border border-border/30 p-2.5 shadow-inner overflow-hidden">
            <div className="flex items-center justify-between mb-1.5 px-2">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-primary/60" />
                <span className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
                  Live Stream
                </span>
              </div>
              {isSyncing && (
                <div className="flex items-center gap-1">
                  <Loader2 className="w-2.5 h-2.5 animate-spin text-primary/60" />
                  <span className="text-[7px] font-bold text-primary/60 uppercase">Syncing</span>
                </div>
              )}
            </div>
            
            {/* ログ本体：高さを固定して直近3件を凝縮 */}
            <div className="h-[70px] overflow-hidden">
              <PlayLog limit={3} />
            </div>
          </div>
        </div>
      </main>

      {/* 3. 【下部：操作パネル】絶対的な押しやすさを確保 */}
      <footer className={cn(
        "shrink-0 z-30 bg-card border-t border-border px-3 pt-2 pb-6 shadow-[0_-15px_50px_rgba(0,0,0,0.15)]",
        isReady ? "translate-y-0" : "translate-y-full transition-none",
        "h-[250px] transition-transform duration-700 ease-out delay-100"
      )}>
        <div className="max-w-md mx-auto h-full">
          <ControlPanel />
        </div>
      </footer>

      {/* ゲームセット演出 */}
      {state.status === 'finished' && (
        <div className="absolute inset-0 z-[200] bg-background/90 backdrop-blur-xl flex items-center justify-center animate-in fade-in duration-700">
          <div className="text-center animate-in zoom-in-95 duration-500 delay-200">
            <h2 className="text-5xl font-black italic tracking-tighter mb-4 text-primary">GAME SET</h2>
            <div className="h-1 w-20 bg-primary mx-auto mb-6" />
            <p className="text-muted-foreground font-bold uppercase tracking-[0.3em] text-xs">Official Record Confirmed</p>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * 💡 ページエントリーポイント
 */
export default function ScorePage() {
  return (
    <Suspense fallback={
      <div className="h-screen w-full bg-background flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin stroke-[3px]" />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground animate-pulse">
          Initializing Stadium...
        </p>
      </div>
    }>
      <ScoreProvider>
        <ScorePageContent />
      </ScoreProvider>
    </Suspense>
  );
}
