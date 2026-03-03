// src/components/score/ControlPanel.tsx
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";

interface ControlPanelProps {
    handleBall: () => void;
    handleStrike: () => void;
    handleManualOut: () => void;
    handleUndo: () => void;
    canUndo: boolean;
    initiateHit: (bases: 1 | 2 | 3 | 4) => void;
    handleWalk: () => void;
    initiateInPlayOut: (outType: 'groundout' | 'flyout' | 'double_play') => void;
    initiateAdvance: () => void;
    initiateSubstitution: () => void; // 💡 追加
}

export function ControlPanel({
    handleBall, handleStrike, handleManualOut, handleUndo, canUndo,
    initiateHit, handleWalk, initiateInPlayOut, initiateAdvance, initiateSubstitution // 💡 追加
}: ControlPanelProps) {
    return (
        <footer className="bg-muted/20 border-t border-border p-3 sm:p-5 pb-6 shrink-0 space-y-2 z-10 relative">
            <div className="grid grid-cols-4 gap-2">
                <Button className="flex flex-col h-14 sm:h-16 rounded-xl bg-muted/50 hover:bg-muted border-none group" onClick={handleBall}><span className="text-green-500 font-black text-xl group-active:scale-125 transition-transform">B</span></Button>
                <Button className="flex flex-col h-14 sm:h-16 rounded-xl bg-muted/50 hover:bg-muted border-none group" onClick={handleStrike}><span className="text-yellow-500 font-black text-xl group-active:scale-125 transition-transform">S</span></Button>
                <Button className="flex flex-col h-14 sm:h-16 rounded-xl bg-muted/50 hover:bg-muted border-none group" onClick={handleManualOut}><span className="text-red-500 font-black text-xl group-active:scale-125 transition-transform">O</span></Button>
                <Button onClick={handleUndo} disabled={!canUndo} className="flex flex-col h-14 sm:h-16 rounded-xl bg-muted/50 border border-border hover:bg-muted text-foreground font-black shadow-sm disabled:opacity-40 transition-all active:scale-95">
                    <RotateCcw className="h-4 w-4 mb-0.5" /><span className="text-[10px]">1球戻る</span>
                </Button>
            </div>
            <div className="grid grid-cols-4 gap-2">
                <Button onClick={() => initiateHit(1)} variant="outline" className="h-10 sm:h-12 rounded-lg border-border bg-background font-bold hover:bg-blue-600 hover:text-white active:scale-95 text-xs sm:text-sm">単打</Button>
                <Button onClick={() => initiateHit(2)} variant="outline" className="h-10 sm:h-12 rounded-lg border-border bg-background font-bold hover:bg-blue-600 hover:text-white active:scale-95 text-xs sm:text-sm">二塁打</Button>
                <Button onClick={() => initiateHit(3)} variant="outline" className="h-10 sm:h-12 rounded-lg border-border bg-background font-bold hover:bg-blue-600 hover:text-white active:scale-95 text-xs sm:text-sm">三塁打</Button>
                <Button onClick={() => initiateHit(4)} variant="outline" className="h-10 sm:h-12 rounded-lg border-orange-500/50 text-orange-500 font-black hover:bg-orange-600 hover:text-white active:scale-95 text-xs sm:text-sm shadow-[0_0_10px_rgba(249,115,22,0.1)]">本塁打</Button>
            </div>
            <div className="grid grid-cols-3 gap-2">
                <Button onClick={handleWalk} variant="outline" className="h-10 sm:h-12 rounded-lg border-border bg-background font-bold active:scale-95 text-xs sm:text-sm">四死球</Button>

                {/* 💡 ここを「選手交代」ボタンに変更 */}
                <Button onClick={initiateSubstitution} variant="outline" className="h-10 sm:h-12 rounded-lg border-blue-500/50 text-blue-600 bg-blue-50 font-bold hover:bg-blue-600 hover:text-white active:scale-95 text-xs sm:text-sm shadow-sm dark:bg-blue-900/20 dark:text-blue-400">選手交代</Button>

                <Button onClick={initiateAdvance} variant="outline" className="h-10 sm:h-12 rounded-lg border-primary/50 text-primary bg-primary/5 font-black hover:bg-primary hover:text-primary-foreground active:scale-95 text-xs sm:text-sm shadow-sm">盗塁 / 進塁</Button>
            </div>
            <div className="grid grid-cols-3 gap-2">
                <Button onClick={() => initiateInPlayOut('groundout')} variant="outline" className="h-10 sm:h-12 rounded-lg border-red-900/30 text-red-500 font-bold hover:bg-red-900/20 active:scale-95 text-xs sm:text-sm">ゴロアウト</Button>
                <Button onClick={() => initiateInPlayOut('flyout')} variant="outline" className="h-10 sm:h-12 rounded-lg border-red-900/30 text-red-500 font-bold hover:bg-red-900/20 active:scale-95 text-xs sm:text-sm">フライ/直直</Button>
                <Button onClick={() => initiateInPlayOut('double_play')} variant="outline" className="h-10 sm:h-12 rounded-lg border-red-900/50 bg-red-950/20 text-red-500 font-black hover:bg-red-900 hover:text-white active:scale-95 text-xs sm:text-sm">併殺打(ゲッツー)</Button>
            </div>
        </footer>
    );
}