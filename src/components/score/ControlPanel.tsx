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
    initiateSubstitution: () => void;
}

const haptic = (ms: number = 40) => {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate(ms);
    }
};

export function ControlPanel({
    handleBall, handleStrike, handleManualOut, handleUndo, canUndo,
    initiateHit, handleWalk, initiateInPlayOut, initiateAdvance, initiateSubstitution
}: ControlPanelProps) {
    return (
        <footer className="bg-background border-t border-border/50 p-3 sm:p-5 pb-8 shrink-0 space-y-3 z-10 relative shadow-[0_-4px_20px_rgba(0,0,0,0.03)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
            
            {/* 💡 影をマイルドに調整したBSOボタン */}
            <div className="grid grid-cols-4 gap-2 sm:gap-3">
                <button 
                    className="flex flex-col items-center justify-center h-16 sm:h-20 rounded-2xl bg-gradient-to-b from-green-400 to-green-600 border-b-[4px] border-green-800 active:border-b-0 active:translate-y-[4px] hover:brightness-110 shadow-md shadow-green-500/15 transition-all select-none" 
                    onClick={() => { haptic(40); handleBall(); }}
                >
                    <span className="text-white font-black text-3xl sm:text-4xl drop-shadow-sm">B</span>
                </button>
                <button 
                    className="flex flex-col items-center justify-center h-16 sm:h-20 rounded-2xl bg-gradient-to-b from-yellow-400 to-yellow-500 border-b-[4px] border-yellow-700 active:border-b-0 active:translate-y-[4px] hover:brightness-110 shadow-md shadow-yellow-500/15 transition-all select-none" 
                    onClick={() => { haptic(40); handleStrike(); }}
                >
                    <span className="text-white font-black text-3xl sm:text-4xl drop-shadow-sm">S</span>
                </button>
                <button 
                    className="flex flex-col items-center justify-center h-16 sm:h-20 rounded-2xl bg-gradient-to-b from-red-500 to-red-600 border-b-[4px] border-red-800 active:border-b-0 active:translate-y-[4px] hover:brightness-110 shadow-md shadow-red-500/15 transition-all select-none" 
                    onClick={() => { haptic(80); handleManualOut(); }}
                >
                    <span className="text-white font-black text-3xl sm:text-4xl drop-shadow-sm">O</span>
                </button>
                <button 
                    onClick={() => { haptic(30); handleUndo(); }} 
                    disabled={!canUndo} 
                    className="flex flex-col items-center justify-center h-16 sm:h-20 rounded-2xl bg-muted/80 border-b-[4px] border-border hover:bg-muted text-muted-foreground font-black shadow-sm disabled:opacity-40 transition-all active:border-b-0 active:translate-y-[4px] select-none"
                >
                    <RotateCcw className="h-5 w-5 sm:h-6 sm:w-6 mb-1" />
                    <span className="text-[10px] sm:text-xs">1球戻る</span>
                </button>
            </div>

            {/* サブボタンの影も全体的に控えめに */}
            <div className="grid grid-cols-4 gap-2">
                <Button onClick={() => { haptic(80); initiateHit(1); }} variant="outline" className="h-11 sm:h-12 rounded-xl border-border/60 bg-muted/10 font-extrabold hover:bg-blue-600 hover:text-white active:scale-95 text-xs sm:text-sm transition-all shadow-sm">単打</Button>
                <Button onClick={() => { haptic(80); initiateHit(2); }} variant="outline" className="h-11 sm:h-12 rounded-xl border-border/60 bg-muted/10 font-extrabold hover:bg-blue-600 hover:text-white active:scale-95 text-xs sm:text-sm transition-all shadow-sm">二塁打</Button>
                <Button onClick={() => { haptic(80); initiateHit(3); }} variant="outline" className="h-11 sm:h-12 rounded-xl border-border/60 bg-muted/10 font-extrabold hover:bg-blue-600 hover:text-white active:scale-95 text-xs sm:text-sm transition-all shadow-sm">三塁打</Button>
                <Button onClick={() => { haptic(120); initiateHit(4); }} variant="outline" className="h-11 sm:h-12 rounded-xl border-orange-500/50 text-orange-500 font-black hover:bg-gradient-to-br hover:from-orange-500 hover:to-orange-600 hover:text-white active:scale-95 text-xs sm:text-sm shadow-[0_0_8px_rgba(249,115,22,0.1)] transition-all">本塁打</Button>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
                <Button onClick={() => { haptic(60); handleWalk(); }} variant="outline" className="h-11 sm:h-12 rounded-xl border-border/60 bg-muted/10 font-extrabold active:scale-95 text-xs sm:text-sm transition-all shadow-sm">四死球</Button>
                <Button onClick={() => { haptic(40); initiateSubstitution(); }} variant="outline" className="h-11 sm:h-12 rounded-xl border-blue-500/30 text-blue-600 bg-blue-50/50 font-extrabold hover:bg-blue-600 hover:text-white active:scale-95 text-xs sm:text-sm shadow-sm dark:bg-blue-900/20 dark:text-blue-400 transition-all">選手交代</Button>
                <Button onClick={() => { haptic(40); initiateAdvance(); }} variant="outline" className="h-11 sm:h-12 rounded-xl border-primary/30 text-primary bg-primary/5 font-black hover:bg-primary hover:text-primary-foreground active:scale-95 text-xs sm:text-sm shadow-sm transition-all">盗塁/進塁</Button>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
                <Button onClick={() => { haptic(80); initiateInPlayOut('groundout'); }} variant="outline" className="h-11 sm:h-12 rounded-xl border-red-900/20 text-red-500 font-extrabold hover:bg-red-500 hover:text-white active:scale-95 text-xs sm:text-sm transition-all shadow-sm">ゴロアウト</Button>
                <Button onClick={() => { haptic(80); initiateInPlayOut('flyout'); }} variant="outline" className="h-11 sm:h-12 rounded-xl border-red-900/20 text-red-500 font-extrabold hover:bg-red-500 hover:text-white active:scale-95 text-xs sm:text-sm transition-all shadow-sm">フライ/直直</Button>
                <Button onClick={() => { haptic(100); initiateInPlayOut('double_play'); }} variant="outline" className="h-11 sm:h-12 rounded-xl border-red-900/40 bg-red-950/10 text-red-600 font-black hover:bg-red-600 hover:text-white active:scale-95 text-xs sm:text-sm transition-all shadow-sm">併殺打(ゲッツー)</Button>
            </div>
        </footer>
    );
}
