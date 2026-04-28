// filepath: `src/components/score/Scoreboard.tsx`
import { useScore } from "@/contexts/ScoreContext";
import { cn } from "@/lib/utils";

interface ScoreboardProps {
  variant?: "default" | "compact";
}

export function Scoreboard({ variant = "default" }: ScoreboardProps) {
  const { state } = useScore();

  // 💡 コンパクトモード用のスタイル分岐
  const isCompact = variant === "compact";
  const lampBaseClass = cn(
    "rounded-full border transition-all duration-300 relative overflow-hidden",
    isCompact ? "w-3.5 h-3.5 sm:w-4 sm:h-4" : "w-4 h-4 sm:w-5 sm:h-5"
  );

  const LedTexture = () => (
    <div className="absolute inset-0 opacity-30 pointer-events-none"
      style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '3px 3px' }} />
  );

  return (
    <div className={cn(
      "bg-card/50 border-2 border-border/40 backdrop-blur-md transition-all duration-500",
      isCompact ? "rounded-[24px] p-4" : "rounded-[32px] p-6 shadow-sm"
    )}>
      <div className={cn(
        "flex items-center justify-between gap-4",
        isCompact ? "flex-row" : "flex-col sm:flex-row"
      )}>

        {/* --- 🔢 スコア表示エリア：数字を主役に --- */}
        <div className="flex items-center gap-4 sm:gap-8 px-2">
          <div className="flex flex-col items-center">
            <span className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-tighter">GUEST</span>
            <p className={cn("font-black italic tracking-tighter tabular-nums leading-none", isCompact ? "text-4xl" : "text-5xl")}>
              {state.opponentScore}
            </p>
          </div>

          <div className="text-xl font-black text-muted-foreground/10 italic mt-4 px-1">-</div>

          <div className="flex flex-col items-center">
            <span className="text-[9px] font-black text-primary/60 uppercase tracking-tighter">HOME</span>
            <p className={cn("font-black italic tracking-tighter tabular-nums leading-none text-primary", isCompact ? "text-4xl" : "text-5xl")}>
              {state.myScore}
            </p>
          </div>
        </div>

        {/* --- 💡 BSO ランプセクション：徹底的に凝縮 --- */}
        <div className={cn(
          "flex flex-col gap-2 bg-black/30 dark:bg-black/50 border border-white/5 shadow-inner",
          isCompact ? "p-3 rounded-xl" : "p-4 rounded-2xl"
        )}>
          {/* BALL */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black w-2.5 text-amber-500 italic">B</span>
            <div className="flex gap-1.5">
              {[...Array(3)].map((_, i) => (
                <div key={i} className={cn(
                  lampBaseClass,
                  i < state.balls
                    ? "bg-amber-500 border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.5)]"
                    : "bg-zinc-800 border-zinc-700 opacity-20 shadow-none"
                )}>
                  <LedTexture />
                </div>
              ))}
            </div>
          </div>

          {/* STRIKE */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black w-2.5 text-blue-500 italic">S</span>
            <div className="flex gap-1.5">
              {[...Array(2)].map((_, i) => (
                <div key={i} className={cn(
                  lampBaseClass,
                  i < state.strikes
                    ? "bg-blue-500 border-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.5)]"
                    : "bg-zinc-800 border-zinc-700 opacity-20 shadow-none"
                )}>
                  <LedTexture />
                </div>
              ))}
            </div>
          </div>

          {/* OUT */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black w-2.5 text-rose-500 italic">O</span>
            <div className="flex gap-1.5">
              {[...Array(2)].map((_, i) => (
                <div key={i} className={cn(
                  lampBaseClass,
                  i < state.outs
                    ? "bg-rose-500 border-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.5)]"
                    : "bg-zinc-800 border-zinc-700 opacity-20 shadow-none"
                )}>
                  <LedTexture />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 💡 イニング情報をコンパクトに下部へ配置 */}
      <div className="mt-3 pt-2 border-t border-border/20 flex justify-center">
        <div className="px-3 py-0.5 bg-primary/10 rounded-full border border-primary/20">
          <span className="text-[10px] font-black italic text-primary uppercase tracking-[0.2em]">
            {state.inning}th / {state.isTop ? "Top" : "Bottom"}
          </span>
        </div>
      </div>
    </div>
  );
}