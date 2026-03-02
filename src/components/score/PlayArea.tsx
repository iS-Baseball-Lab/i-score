// src/components/score/PlayArea.tsx
import { cn } from "@/lib/utils";

interface PlayAreaProps {
    balls: number; strikes: number; outs: number;
    firstBase: boolean; secondBase: boolean; thirdBase: boolean;
    pitchX: number | null; pitchY: number | null;
    onZoneClick: (e: React.MouseEvent<HTMLDivElement>) => void;
}

export function PlayArea({
    balls, strikes, outs, firstBase, secondBase, thirdBase, pitchX, pitchY, onZoneClick
}: PlayAreaProps) {
    return (
        // 💡 修正1: p-4 を px-4 pb-4 pt-1 に変更し、上部の隙間をカット
        <main className="flex-1 relative px-4 pb-4 pt-1 flex flex-col items-center justify-center overflow-hidden min-h-[220px]">

            {/* 💡 修正2: top-4 を top-2 に変更し、カウント表示を少し上へ */}
            <div className="absolute top-2 left-4 space-y-3 z-10 bg-muted/30 p-3 rounded-xl backdrop-blur-sm border border-border shadow-sm">
                <div className="flex gap-1.5 items-center">
                    <span className="w-4 text-[10px] font-black text-muted-foreground">B</span>
                    {[...Array(3)].map((_, i) => <div key={i} className={cn("h-4 w-4 rounded-full border-2 border-border transition-colors", i < balls ? "bg-green-500 border-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" : "bg-background")} />)}
                </div>
                <div className="flex gap-1.5 items-center">
                    <span className="w-4 text-[10px] font-black text-muted-foreground">S</span>
                    {[...Array(2)].map((_, i) => <div key={i} className={cn("h-4 w-4 rounded-full border-2 border-border transition-colors", i < strikes ? "bg-yellow-500 border-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]" : "bg-background")} />)}
                </div>
                <div className="flex gap-1.5 items-center">
                    <span className="w-4 text-[10px] font-black text-muted-foreground">O</span>
                    {[...Array(2)].map((_, i) => <div key={i} className={cn("h-4 w-4 rounded-full border-2 border-border transition-colors", i < outs ? "bg-red-500 border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" : "bg-background")} />)}
                </div>
            </div>

            {/* 💡 修正3: こちらも top-4 を top-2 に変更 */}
            <div className="absolute top-2 right-4 z-10 bg-muted/30 p-4 rounded-xl backdrop-blur-sm border border-border shadow-sm flex items-center justify-center w-[100px] h-[100px]">
                <div className="relative w-12 h-12 rotate-45 border-[3px] border-border rounded-sm transition-all">
                    <div className={cn("absolute -top-1.5 -left-1.5 h-3 w-3 border-2 border-border rounded-sm -rotate-45 transition-all duration-300", secondBase ? "bg-yellow-400 border-yellow-300 shadow-[0_0_10px_rgba(250,204,21,0.5)] scale-150" : "bg-muted")} />
                    <div className={cn("absolute -bottom-1.5 -left-1.5 h-3 w-3 border-2 border-border rounded-sm -rotate-45 transition-all duration-300", thirdBase ? "bg-yellow-400 border-yellow-300 shadow-[0_0_10px_rgba(250,204,21,0.5)] scale-150" : "bg-muted")} />
                    <div className={cn("absolute -top-1.5 -right-1.5 h-3 w-3 border-2 border-border rounded-sm -rotate-45 transition-all duration-300", firstBase ? "bg-yellow-400 border-yellow-300 shadow-[0_0_10px_rgba(250,204,21,0.5)] scale-150" : "bg-muted")} />
                    <div className="absolute -bottom-2 -right-2 h-4 w-4 bg-primary/20 border-2 border-primary/50 -rotate-45 rounded-sm flex items-center justify-center">
                        <div className="w-1.5 h-1.5 bg-primary rounded-sm animate-pulse" />
                    </div>
                </div>
            </div>

            {/* 💡 修正4: 配球図の上の余白 mt-6 を mt-2 に減らす */}
            <div className="relative w-[75vw] max-w-[280px] aspect-[4/5] mt-2 mx-auto bg-muted/5 rounded-2xl cursor-crosshair touch-none overflow-hidden shadow-inner border-2 border-border/50" onClick={onZoneClick}>
                <div className="absolute top-[10%] bottom-[32%] left-[22%] right-[22%] border-2 border-foreground/50 grid grid-cols-3 grid-rows-3 pointer-events-none bg-primary/5 shadow-[0_0_15px_rgba(0,0,0,0.1)] dark:shadow-none">
                    {[...Array(9)].map((_, i) => <div key={i} className="border border-foreground/30" />)}
                </div>
                <div className="absolute top-[73%] left-[22%] right-[22%] pointer-events-none opacity-60">
                    <svg viewBox="0 0 100 30" className="w-full h-auto fill-background stroke-foreground/70 stroke-[2.5px] drop-shadow-sm">
                        <polygon points="2,2 98,2 98,12 50,28 2,12" />
                    </svg>
                </div>
                {pitchX !== null && pitchY !== null && (
                    <div className="absolute w-6 h-6 -ml-3 -mt-3 bg-yellow-400 rounded-full border-2 border-zinc-900 shadow-[0_0_15px_rgba(250,204,21,0.6)] z-20 flex items-center justify-center animate-in zoom-in pointer-events-none" style={{ left: `${pitchX * 100}%`, top: `${pitchY * 100}%` }}>
                        <div className="w-full h-[2px] bg-red-600/50 absolute rotate-45"></div>
                        <div className="w-full h-[2px] bg-red-600/50 absolute -rotate-45"></div>
                    </div>
                )}
                {pitchX === null && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                        <span className="text-xs font-bold text-muted-foreground bg-background/90 px-3 py-1.5 rounded-full backdrop-blur-md shadow-sm">
                            コースをタップ
                        </span>
                    </div>
                )}
            </div>
        </main>
    );
}