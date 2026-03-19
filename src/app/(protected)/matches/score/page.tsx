// src/app/(protected)/matches/score/page.tsx
import { Scoreboard } from "@/components/score/Scoreboard";
import { PlayArea } from "@/components/score/PlayArea";
import { PlayLog } from "@/components/score/PlayLog";
import { ControlPanel } from "@/components/score/ControlPanel";
import { ScoreProvider } from "@/contexts/ScoreContext";

export default function ScorePage() {
    return (
        <ScoreProvider>
            <div className="min-h-screen bg-background text-foreground pb-[220px] sm:pb-[260px] relative selection:bg-primary/20">

                {/* 💡 メインコンテンツ領域。幅を制限(max-w-5xl)し、中央寄せにします。 */}
                <main className="px-4 sm:px-6 max-w-5xl mx-auto w-full pt-4 sm:pt-6 relative z-10 flex flex-col gap-2">

                    {/* 1. 電光掲示板 (イニング・RHEの表示) */}
                    <Scoreboard />

                    {/* 2. 現在の状況 (ランナー・BSOカウント・対戦カード) */}
                    <PlayArea />

                    {/* 3. プレイの履歴 (実況タイムライン) */}
                    <PlayLog />

                </main>

                {/* 4. アクションボタン群 & モーダル群 (画面下部固定) */}
                <ControlPanel />

            </div>
        </ScoreProvider>
    );
}