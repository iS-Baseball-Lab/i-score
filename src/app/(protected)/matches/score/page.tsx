// filepath: `src/app/(protected)/matches/score/page.tsx`
"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ScoreProvider, useScore } from "@/contexts/ScoreContext";
import { Scoreboard } from "@/components/score/Scoreboard";
import { ControlPanel } from "@/components/score/ControlPanel";
import { PlayArea } from "@/components/score/PlayArea";
import { PlayLog } from "@/components/score/PlayLog";
import { TestDataGenerator } from "@/components/score/TestDataGenerator";

// 💡 1. 内部のコンテンツコンポーネント
// useSearchParamsを使用するため、Suspenseの内側に配置する必要があります
function ScorePageContent() {
  const searchParams = useSearchParams();
  const matchId = searchParams.get("id");
  const { initMatch } = useScore();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (matchId) initMatch(matchId);
    
    // Pixel 10 Pro 向けの没入設定
    document.body.style.overflow = 'hidden';
    
    // マウント後にアニメーションフラグをON
    const timer = setTimeout(() => setIsReady(true), 100);
    
    return () => { 
      document.body.style.overflow = 'unset';
      clearTimeout(timer);
    };
  }, [matchId, initMatch]);

  return (
    <div className="fixed inset-0 z-[100] bg-background h-[100dvh] w-full flex flex-col overflow-hidden select-none">
      
      {/* 🏟 上部：掲示板 */}
      <header className={`
        h-[22%] shrink-0 z-30 transition-transform duration-700 ease-[0.22,1,0.36,1]
        ${isReady ? "translate-y-0" : "-translate-y-full"}
      `}>
        <Scoreboard />
      </header>

      {/* 🏟 中央：フィールド */}
      <main className={`
        flex-1 relative flex flex-col items-center justify-center z-10 transition-all duration-1000 delay-300
        ${isReady ? "opacity-100 scale-110" : "opacity-0 scale-95"}
      `}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.08)_0%,transparent_70%)] pointer-events-none" />
        <div className="w-full max-w-[300px] aspect-square">
          <PlayArea />
        </div>
        <div className="absolute bottom-4 w-full px-12 opacity-50">
          <PlayLog limit={1} />
        </div>
      </main>

      {/* 🏟 下部：パネル */}
      <footer className={`
        h-[25%] shrink-0 z-30 bg-card/80 backdrop-blur-3xl border-t border-border/40 px-4 pt-3 pb-8 shadow-[0_-20px_50px_rgba(0,0,0,0.1)]
        transition-transform duration-700 ease-[0.22,1,0.36,1]
        ${isReady ? "translate-y-0" : "translate-y-full"}
      `}>
        <div className="max-w-md mx-auto h-full relative">
          <ControlPanel />
          
          {/* 💡 テストデータボタン：ここもSuspenseで保護 */}
          <div className="absolute -top-20 right-0">
            <Suspense fallback={null}>
              <TestDataGenerator />
            </Suspense>
          </div>
        </div>
      </footer>
    </div>
  );
}

// 💡 2. Next.jsが要求するデフォルトエクスポート
// これが「React Component」として認識される必要があります
const ScorePage = () => {
  return (
    <Suspense fallback={<div className="h-screen bg-background flex items-center justify-center text-muted-foreground">Loading Field...</div>}>
      <ScoreProvider>
        <ScorePageContent />
      </ScoreProvider>
    </Suspense>
  );
};

export default ScorePage;
