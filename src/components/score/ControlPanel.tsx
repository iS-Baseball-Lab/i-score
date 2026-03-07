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
        <footer className="bg-background/95 backdrop-blur-xl border-t border-border/40 p-3 sm:p-5 pb-8 shrink-0 space-y-3 z-10 relative">
            
            {/* 💡 究極UI: Apple純正アプリのような洗練されたフラットデザイン＆流体スケール */}
            <div className="grid grid-cols-4 gap-2 sm:gap-3">
                <button 
                    className="flex flex-col items-center justify-center h-16 sm:h-[84px] rounded-[24px] bg-[#10b981] text-white hover:bg-[#059669] active:scale-[0.92] transition-all duration-200 shadow-sm touch-manipulation" 
                    onClick={() => { haptic(40); handleBall(); }}
                >
                    <span className="font-black text-3xl sm:text-4xl tracking-tighter">B</span>
                </button>
                <button 
                    className="flex flex-col items-center justify-center h-16 sm:h-[84px] rounded-[24px] bg-[#eab308] text-white hover:bg-[#ca8a04] active:scale-[0.92] transition-all duration-200 shadow-sm touch-manipulation" 
                    onClick={() => { haptic(40); handleStrike(); }}
                >
                    <span className="font-black text-3xl sm:text-4xl tracking-tighter">S</span>
                </button>
                <button 
                    className="flex flex-col items-center justify-center h-16 sm:h-[84px] rounded-[24px] bg-[#ef4444] text-white hover:bg-[#dc2626] active:scale-[0.92] transition-all duration-200 shadow-sm touch-manipulation" 
                    onClick={() => { haptic(80); handleManualOut(); }}
                >
                    <span className="font-black text-3xl sm:text-4xl tracking-tighter">O</span>
                </button>
                <button 
                    onClick={() => { haptic(30); handleUndo(); }} 
                    disabled={!canUndo} 
                    className="flex flex-col items-center justify-center h-16 sm:h-[84px] rounded-[24px] bg-muted/50 border border-border/50 text-muted-foreground hover:bg-muted active:scale-[0.92] transition-all duration-200 shadow-sm disabled:opacity-30 touch-manipulation"
                >
                    <RotateCcw className="h-5 w-5 sm:h-6 sm:w-6 mb-1" />
                    <span className="text-[10px] sm:text-xs font-bold">1球戻る</span>
                </button>
            </div>

            {/* 💡 サブボタンも丸みを帯びたモダンなスタイルに統一 */}
            <div className="grid grid-cols-4 gap-2">
                <Button onClick={() => { haptic(80); initiateHit(1); }} variant="outline" className="h-11 sm:h-12 rounded-[16px] border-border/50 bg-background font-bold hover:bg-[#2563eb] hover:text-white active:scale-95 text-xs sm:text-sm transition-all shadow-sm">単打</Button>
                <Button onClick={() => { haptic(80); initiateHit(2); }} variant="outline" className="h-11 sm:h-12 rounded-[16px] border-border/50 bg-background font-bold hover:bg-[#2563eb] hover:text-white active:scale-95 text-xs sm:text-sm transition-all shadow-sm">二塁打</Button>
                <Button onClick={() => { haptic(80); initiateHit(3); }} variant="outline" className="h-11 sm:h-12 rounded-[16px] border-border/50 bg-background font-bold hover:bg-[#2563eb] hover:text-white active:scale-95 text-xs sm:text-sm transition-all shadow-sm">三塁打</Button>
                <Button onClick={() => { haptic(120); initiateHit(4); }} variant="outline" className="h-11 sm:h-12 rounded-[16px] border-[#f97316]/30 text-[#f97316] bg-[#f97316]/5 font-black hover:bg-[#f97316] hover:text-white active:scale-95 text-xs sm:text-sm transition-all shadow-sm">本塁打</Button>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
                <Button onClick={() => { haptic(60); handleWalk(); }} variant="outline" className="h-11 sm:h-12 rounded-[16px] border-border/50 bg-background font-bold active:scale-95 text-xs sm:text-sm transition-all shadow-sm">四死球</Button>
                <Button onClick={() => { haptic(40); initiateSubstitution(); }} variant="outline" className="h-11 sm:h-12 rounded-[16px] border-[#2563eb]/30 text-[#2563eb] bg-[#2563eb]/5 font-bold hover:bg-[#2563eb] hover:text-white active:scale-95 text-xs sm:text-sm transition-all shadow-sm">選手交代</Button>
                <Button onClick={() => { haptic(40); initiateAdvance(); }} variant="outline" className="h-11 sm:h-12 rounded-[16px] border-primary/30 text-primary bg-primary/5 font-bold hover:bg-primary hover:text-primary-foreground active:scale-95 text-xs sm:text-sm transition-all shadow-sm">盗塁/進塁</Button>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
                <Button onClick={() => { haptic(80); initiateInPlayOut('groundout'); }} variant="outline" className="h-11 sm:h-12 rounded-[16px] border-[#ef4444]/20 text-[#ef4444] font-bold hover:bg-[#ef4444] hover:text-white active:scale-95 text-xs sm:text-sm transition-all shadow-sm">ゴロアウト</Button>
                <Button onClick={() => { haptic(80); initiateInPlayOut('flyout'); }} variant="outline" className="h-11 sm:h-12 rounded-[16px] border-[#ef4444]/20 text-[#ef4444] font-bold hover:bg-[#ef4444] hover:text-white active:scale-95 text-xs sm:text-sm transition-all shadow-sm">フライ/直直</Button>
                <Button onClick={() => { haptic(100); initiateInPlayOut('double_play'); }} variant="outline" className="h-11 sm:h-12 rounded-[16px] border-[#ef4444]/40 bg-[#ef4444]/10 text-[#dc2626] font-black hover:bg-[#ef4444] hover:text-white active:scale-95 text-xs sm:text-sm transition-all shadow-sm">併殺打(ゲッツー)</Button>
            </div>
        </footer>
    );
}
