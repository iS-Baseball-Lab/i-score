// filepath: `src/app/(protected)/matches/score/page.tsx`
"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ScoreProvider, useScore } from "@/contexts/ScoreContext";
import { Scoreboard } from "@/components/score/Scoreboard";
import { ControlPanel } from "@/components/score/ControlPanel";
import { PlayArea } from "@/components/score/PlayArea";
import { PlayLog } from "@/components/score/PlayLog";

function ScorePageContent() {
  const searchParams = useSearchParams();
  const matchId = searchParams.get("id");
  const { initMatch } = useScore();

  // 💡 アニメーション発火用のステート
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (matchId) initMatch(matchId);
    document.body.style.overflow = 'hidden';

    // 💡 マウント後、一瞬待ってからアニメーションを開始（ブラウザに確実に描画させる）
    const timer = setTimeout(() => setIsReady(true), 50);

    return () => {
      document.body.style.overflow = 'unset';
      clearTimeout(timer);
    };
  }, [matchId, initMatch]);

  return (
    <div className="fixed inset-0 z-[100] bg-background h-[100dvh] w-full flex flex-col overflow-hidden select-none">

      {/* 💡 掲示板：isReadyがtrueになると -translate-y-full から 0 へ動く */}
      <header className={`
        h-[22%] shrink-0 z-30 transition-transform duration-700 ease-[0.22,1,0.36,1]
        ${isReady ? "translate-y-0" : "-translate-y-full"}
      `}>
        <Scoreboard />
      </header>

      {/* 💡 フィールド：ふわっと浮き上がる演出 */}
      <main className={`
        flex-1 relative flex flex-col items-center justify-center z-10 transition-all duration-1000 delay-300
        ${isReady ? "opacity-100 scale-110" : "opacity-0 scale-95"}
      `}>
        <div className="w-full max-w-[300px] aspect-square">
          <PlayArea />
        </div>
        <div className="absolute bottom-4 w-full px-12 opacity-40">
          <PlayLog limit={1} />
        </div>
      </main>

      {/* 💡 コントロール：下からせり上がる */}
      <footer className={`
        h-[25%] shrink-0 z-30 bg-card/80 backdrop-blur-3xl border-t border-border/40 px-4 pt-3 pb-8 
        transition-transform duration-700 ease-[0.22,1,0.36,1]
        ${isReady ? "translate-y-0" : "translate-y-full"}
      `}>
        <div className="max-w-md mx-auto h-full">
          <ControlPanel />
        </div>
      </footer>
    </div>
  );
}

export default function ScorePage() {
  return (
    <Suspense fallback={<div className="h-screen bg-background" />}>
      <ScoreProvider>
        <ScorePageContent />
      </ScoreProvider>
    </Suspense>
  );
}