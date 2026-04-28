// filepath: `src/app/(protected)/matches/score/page.tsx`
"use client";

import React, { useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ScoreProvider, useScore } from "@/contexts/ScoreContext";
import { Scoreboard } from "@/components/score/Scoreboard";
import { ControlPanel } from "@/components/score/ControlPanel";
import { PlayArea } from "@/components/score/PlayArea";
import { PlayLog } from "@/components/score/PlayLog";

function ScorePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const matchId = searchParams.get("id");
  const { initMatch } = useScore();

  useEffect(() => {
    if (matchId) initMatch(matchId);
    // Pixel 10 Pro の大画面で誤操作を防ぎ、没入感を出すためスクロールをロック
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, [matchId, initMatch]);

  return (
    /**
     * 💡 Live Cockpit 2.0: 22/53/25 黄金比レイアウト
     */
    <div className="fixed inset-0 z-[100] bg-zinc-950 h-[100dvh] w-full flex flex-col overflow-hidden select-none">

      {/* 💡 上部固定：掲示板兼システムヘッダー (22%) */}
      <header className="h-[22%] shrink-0 z-30 animate-in slide-in-from-top duration-700 ease-[0.22,1,0.36,1]">
        <Scoreboard variant="cockpit-v2" />
      </header>

      {/* 💡 中央：タクティカル・フィールド (53%) */}
      <main className="flex-1 relative flex flex-col items-center justify-center z-10 animate-in fade-in zoom-in-95 duration-1000 delay-300">
        {/* 背景の芝生をイメージした微細なグラデーション */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.05)_0%,transparent_70%)] pointer-events-none" />

        <div className="w-full max-w-[300px] aspect-square scale-110">
          <PlayArea />
        </div>

        {/* ログをダイヤモンド直下に浮かせる */}
        <div className="absolute bottom-4 w-full px-12 opacity-40">
          <PlayLog limit={1} />
        </div>
      </main>

      {/* 💡 下部固定：プロ・コントロールパネル (25%) */}
      <footer className="h-[25%] shrink-0 z-30 bg-zinc-900/80 backdrop-blur-3xl border-t border-white/5 px-4 pt-3 pb-8 shadow-[0_-20px_50px_rgba(0,0,0,0.5)] animate-in slide-in-from-bottom duration-700 ease-[0.22,1,0.36,1]">
        <div className="max-w-md mx-auto h-full">
          <ControlPanel />
        </div>
      </footer>

    </div>
  );
}

export default function ScorePage() {
  return (
    <Suspense fallback={<div className="h-screen bg-black" />}>
      <ScoreProvider>
        <ScorePageContent />
      </ScoreProvider>
    </Suspense>
  );
}