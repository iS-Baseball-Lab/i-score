// filepath: `src/app/(protected)/matches/score/page.tsx`
"use client";

import React, { useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ScoreProvider, useScore } from "@/contexts/ScoreContext";
import { Scoreboard } from "@/components/score/Scoreboard";
import { ControlPanel } from "@/components/score/ControlPanel";
import { PlayArea } from "@/components/score/PlayArea";
import { PlayLog } from "@/components/score/PlayLog";
import { Loader2 } from "lucide-react";

function ScorePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const matchId = searchParams.get("id");
  const { initMatch, isLoading, state } = useScore();

  useEffect(() => {
    if (matchId) initMatch(matchId);

    // 💡 Pixel 10 Proでの没入感を高めるため、スクロールを完全にロック
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, [matchId, initMatch]);

  if (isLoading && !state.matchId) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    /**
     * 💡 フルスクリーン・コックピット
     * - z-50 で既存のヘッダー/ナビの上に被せる
     * - h-[100dvh] でモバイルブラウザのツールバーを考慮した全画面
     */
    <div className="fixed inset-0 z-[100] bg-background h-[100dvh] w-full flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-500 ease-out">

      {/* 1. 上部：コンパクト・スコアボード (25%) */}
      <header className="h-[22%] shrink-0 flex items-end px-4 pb-2 bg-gradient-to-b from-muted/50 to-transparent">
        <div className="w-full">
          <Scoreboard variant="compact" />
        </div>
      </header>

      {/* 2. 中央：タクティカル・フィールド (53%) */}
      <main className="flex-1 relative flex flex-col items-center justify-center overflow-hidden">
        {/* 背景の装飾的なフィールドライン */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
          <div className="h-full w-full border-[100px] border-white rounded-full scale-150" />
        </div>

        <div className="w-full max-w-[320px] aspect-square scale-110 sm:scale-125">
          <PlayArea />
        </div>

        {/* 最新ログの1件のみをフィールド下にフローティング */}
        <div className="absolute bottom-4 w-full px-10 text-center">
          <PlayLog limit={1} />
        </div>
      </main>

      {/* 3. 下部：プロ・コントロールパネル (25%) */}
      {/* 💡 ボトムナビの位置からせり上がってくるアニメーションを想定 */}
      <footer className="h-[25%] shrink-0 bg-card/80 backdrop-blur-xl border-t-2 border-border/40 px-4 pt-4 pb-8 shadow-[0_-10px_40px_rgba(0,0,0,0.2)]">
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