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
        <main className="flex-1 relative px-4 pb-4 pt-1 flex flex-col items-center justify-center overflow-hidden min-h-[220px]">

            {/* 💡 究極UI: 高級スポーツカーのインパネのようなクリーンなインジケーター */}
            <div className="absolute top-2 left-4 space-y-3 z-10 bg-background/60 p-3.5 rounded-[20px] backdrop-blur-xl border border-border/30 shadow-sm">
                <div className="flex gap-2.5 items-center">
                    <span className="w-4 text-[11px] font-black text-muted-foreground tracking-tighter">B</span>
                    {[...Array(3)].map((_, i) => <div key={i} className={cn("h-3.5 w-3.5 rounded-full transition-all duration-300", i < balls ? "bg-[#10b981] scale-110 shadow-sm" : "bg-muted-foreground/20")} />)}
                </div>
                <div className="flex gap-2.5 items-center">
                    <span className="w-4 text-[11px] font-black text-muted-foreground tracking-tighter">S</span>
                    {[...Array(2)].map((_, i) => <div key={i} className={cn("h-3.5 w-3.5 rounded-full transition-all duration-300", i < strikes ? "bg-[#eab308] scale-110 shadow-sm" : "bg-muted-foreground/20")} />)}
                </div>
                <div className="flex gap-2.5 items-center">
                    <span className="w-4 text-[11px] font-black text-muted-foreground tracking-tighter">O</span>
                    {[...Array(2)].map((_, i) => <div key={i} className={cn("h-3.5 w-3.5 rounded-full transition-all duration-300", i < outs ? "bg-[#ef4444] scale-110 shadow-sm" : "bg-muted-foreground/20")} />)}
                </div>
            </div>

            {/* 💡 究極UI: 無駄な光をなくし、ソリッドな色で状態を示す塁 */}
            <div className="absolute top-2 right-4 z-10 bg-background/60 p-4 rounded-[20px] backdrop-blur-xl border border-border/30 shadow-sm flex items-center justify-center w-[100px] h-[100px]">
                <div className="relative w-12 h-12 rotate-45 border-[2px] border-border/50 rounded-sm transition-all">
                    <div className={cn("absolute -top-1.5 -left-1.5 h-3.5 w-3.5 rounded-sm -rotate-45 transition-all duration-300", secondBase ? "bg-[#eab308] border-[1.5px] border-background scale-125 z-10 shadow-sm" : "bg-muted-foreground/10")} />
                    <div className={cn("absolute -bottom-1.5 -left-1.5 h-3.5 w-3.5 rounded-sm -rotate-45 transition-all duration-300", thirdBase ? "bg-[#eab308] border-[1.5px] border-background scale-125 z-10 shadow-sm" : "bg-muted-foreground/10")} />
                    <div className={cn("absolute -top-1.5 -right-1.5 h-3.5 w-3.5 rounded-sm -rotate-45 transition-all duration-300", firstBase ? "bg-[#eab308] border-[1.5px] border-background scale-125 z-10 shadow-sm" : "bg-muted-foreground/10")} />
                    <div className="absolute -bottom-2 -right-2 h-4 w-4 bg-primary/10 border-[1.5px] border-primary/50 -rotate-45 rounded-sm flex items-center justify-center">
                        <div className="w-1.5 h-1.5 bg-primary rounded-sm" />
                    </div>
                </div>
            </div>

            {/* 配球図エリア */}
            <div className="relative w-[75vw] max-w-[280px] aspect-[4/5] mt-2 mx-auto bg-muted/5 rounded-[24px] cursor-crosshair touch-none overflow-hidden border border-border/50" onClick={onZoneClick}>
                <div className="absolute top-[10%] bottom-[32%] left-[22%] right-[22%] border-[1.5px] border-foreground/30 grid grid-cols-3 grid-rows-3 pointer-events-none bg-primary/5">
                    {[...Array(9)].map((_, i) => <div key={i} className="border border-foreground/10" />)}
                </div>
                <div className="absolute top-[73%] left-[22%] right-[22%] pointer-events-none opacity-40">
                    <svg viewBox="0 0 100 30" className="w-full h-auto fill-background stroke-foreground stroke-[2px]">
                        <polygon points="2,2 98,2 98,12 50,28 2,12" />
                    </svg>
                </div>
                {pitchX !== null && pitchY !== null && (
                    <div className="absolute w-7 h-7 -ml-3.5 -mt-3.5 bg-[#eab308] rounded-full border-[2px] border-background shadow-md z-20 flex items-center justify-center animate-in zoom-in-75 duration-200 pointer-events-none" style={{ left: `${pitchX * 100}%`, top: `${pitchY * 100}%` }}>
                        <div className="w-3.5 h-[2px] bg-background/80 absolute rotate-45 rounded-full"></div>
                        <div className="w-3.5 h-[2px] bg-background/80 absolute -rotate-45 rounded-full"></div>
                    </div>
                )}
                {pitchX === null && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                        <span className="text-xs font-bold text-muted-foreground bg-background/80 px-4 py-2 rounded-full backdrop-blur-md border border-border/30 tracking-wider">
                            コースをタップ
                        </span>
                    </div>
                )}
            </div>
        </main>
    );
}
