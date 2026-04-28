// filepath: `src/components/score/Scoreboard.tsx`
import { useScore } from "@/contexts/ScoreContext";
import { cn } from "@/lib/utils";

export function Scoreboard() {
  const { state } = useScore();

  // 💡 ランプの共通スタイル定義
  const lampBaseClass = "w-4 h-4 sm:w-5 sm:h-5 rounded-full border transition-all duration-300 relative overflow-hidden";

  // 💡 LEDドットを再現するためのオーバーレイレイヤー
  const LedTexture = () => (
    <div className="absolute inset-0 opacity-30 pointer-events-none"
      style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '3px 3px' }} />
  );

  return (
    <div className="bg-card/50 border-2 border-border/40 rounded-[32px] p-6 shadow-sm backdrop-blur-md">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6">

        {/* --- スコア表示エリア --- */}
        <div className="flex items-center gap-8 px-4">
          <div className="text-center">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Guest</p>
            <p className="text-4xl font-black italic tracking-tighter tabular-nums">{state.opponentScore}</p>
          </div>
          <div className="text-xl font-black text-muted-foreground/20 italic mt-4">VS</div>
          <div className="text-center">
            <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Home</p>
            <p className="text-4xl font-black italic tracking-tighter tabular-nums text-primary">{state.myScore}</p>
          </div>
        </div>

        {/* --- 💡 BSO ランプセクション（エラー修正済み） --- */}
        <div className="flex flex-col gap-3 bg-black/20 dark:bg-black/40 p-4 rounded-2xl border border-white/5 shadow-inner">

          {/* BALL ランプ (Amber) */}
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-black w-3 text-amber-500 italic">B</span>
            <div className="flex gap-2.5">
              {[...Array(3)].map((_, i) => (
                <div key={i} className={cn(
                  lampBaseClass,
                  // ballCount -> balls に修正
                  i < state.balls
                    ? "bg-amber-500 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.6)]"
                    : "bg-zinc-800 border-zinc-700 opacity-40 shadow-none"
                )}>
                  <LedTexture />
                </div>
              ))}
            </div>
          </div>

          {/* STRIKE ランプ (Blue) */}
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-black w-3 text-blue-500 italic">S</span>
            <div className="flex gap-2.5">
              {[...Array(2)].map((_, i) => (
                <div key={i} className={cn(
                  lampBaseClass,
                  // strikeCount -> strikes に修正
                  i < state.strikes
                    ? "bg-blue-500 border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.6)]"
                    : "bg-zinc-800 border-zinc-700 opacity-40 shadow-none"
                )}>
                  <LedTexture />
                </div>
              ))}
            </div>
          </div>

          {/* OUT ランプ (Rose) */}
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-black w-3 text-rose-500 italic">O</span>
            <div className="flex gap-2.5">
              {[...Array(2)].map((_, i) => (
                <div key={i} className={cn(
                  lampBaseClass,
                  i < state.outs
                    ? "bg-rose-500 border-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.6)]"
                    : "bg-zinc-800 border-zinc-700 opacity-40 shadow-none"
                )}>
                  <LedTexture />
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}