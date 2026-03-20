// src/app/(protected)/matches/score/page.tsx
"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Scoreboard } from "@/components/score/Scoreboard";
import { PlayArea } from "@/components/score/PlayArea";
import { PlayLog } from "@/components/score/PlayLog";
import { ControlPanel } from "@/components/score/ControlPanel";
import { ScoreProvider } from "@/contexts/ScoreContext";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 💡 1. 実際にスコア画面を描画するコンポーネント
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function ScoreContent() {
    const searchParams = useSearchParams();
    // 💡 URLの "?id=xxx" からIDを取得する！（無ければ仮のIDを入れる）
    const currentMatchId = searchParams.get("id") || "match_test_001";

    return (
        <ScoreProvider matchId={currentMatchId}>
            <div className="min-h-screen bg-background text-foreground pb-[220px] sm:pb-[260px] relative selection:bg-primary/20">
                <main className="px-4 sm:px-6 max-w-5xl mx-auto w-full pt-4 sm:pt-6 relative z-10 flex flex-col gap-2">
                    <Scoreboard />
                    <PlayArea />
                    <PlayLog />
                </main>
                <ControlPanel />
            </div>
        </ScoreProvider>
    );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 💡 2. Next.jsのルール対応（Suspenseで包む）
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export default function ScorePage() {
    return (
        // URLのパラメータを解析するまでの一瞬だけ表示されるローディング画面
        <Suspense fallback={<div className="flex justify-center items-center min-h-screen font-bold text-muted-foreground">試合データを読み込み中...</div>}>
            <ScoreContent />
        </Suspense>
    );
}