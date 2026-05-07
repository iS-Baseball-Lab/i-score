// filepath: `src/components/score/Scoreboard.tsx`
import { useScore } from "@/contexts/ScoreContext";
import { cn } from "@/lib/utils";

export function Scoreboard() {
  const { state } = useScore();
  // 試合の規定回数（innings）を 7 または 9 で動的に変えられるようにしておくと尚良し
  const innings = Array.from({ length: 9 }, (_, i) => i + 1);

  return (
    <div className="h-full w-full bg-card/80 backdrop-blur-3xl flex flex-col border-b border-border/40 shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
      
      {/* 1. 最上段：大会名（より没入感を高めるスリムなデザイン） */}
      <div className="h-5 flex items-center justify-center bg-black/5 border-b border-border/10">
        <div className="flex items-center gap-2">
          <div className="w-1 h-1 rounded-full bg-rose-500 animate-pulse" />
          <span className="text-[7px] font-black text-muted-foreground uppercase tracking-[0.4em]">
            Live Match • 2026 Spring Regional
          </span>
        </div>
      </div>

      {/* 2. 中段：メインスコア & BSOランプ */}
      <div className="flex-1 flex items-center justify-between px-6 py-2">
        
        {/* スコア表示エリア */}
        <div className="flex items-center gap-4">
          {/* GUEST (Away) */}
          <div className={cn(
            "flex flex-col items-center transition-opacity duration-500",
            !state.isTop ? "opacity-100 scale-110" : "opacity-40"
          )}>
            <span className="text-[8px] font-black text-muted-foreground uppercase tracking-wider">GUEST</span>
            <p className="text-5xl font-black italic tracking-tighter leading-none tabular-nums text-foreground drop-shadow-sm">
              {state.opponentScore}
            </p>
          </div>

          <div className="text-lg font-black text-muted-foreground/20 italic mx-1">VS</div>

          {/* HOME (My Team) */}
          <div className={cn(
            "flex flex-col items-center transition-all duration-500",
            state.isTop ? "opacity-100 scale-110" : "opacity-40"
          )}>
            <span className="text-[8px] font-black text-primary uppercase tracking-wider">HOME</span>
            <p className="text-5xl font-black italic tracking-tighter leading-none tabular-nums text-primary drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]">
              {state.myScore}
            </p>
          </div>
        </div>

        {/* 🌟 究極のBSOランプ：発光感と緊迫感を強化 */}
        <div className="flex flex-col gap-2 bg-black/20 p-3 rounded-2xl border border-white/5 shadow-inner backdrop-blur-md">
          {['B', 'S', 'O'].map((label) => {
            const count = label === 'B' ? state.balls : label === 'S' ? state.strikes : state.outs;
            const max = label === 'B' ? 3 : 2;
            
            // 緊迫感の演出：フルカウントに近づくと色が変化
            const getColor = (idx: number) => {
              if (idx >= count) return "bg-zinc-800";
              if (label === 'B') return idx === 2 ? "bg-amber-400 shadow-[0_0_12px_#fbbf24]" : "bg-amber-500 shadow-[0_0_8px_#f59e0b]";
              if (label === 'S') return idx === 1 ? "bg-rose-500 shadow-[0_0_12px_#f43f5e]" : "bg-blue-500 shadow-[0_0_8px_#3b82f6]";
              return "bg-rose-600 shadow-[0_0_10px_#e11d48]";
            };

            return (
              <div key={label} className="flex items-center gap-3">
                <span className={cn(
                  "text-[10px] font-black w-3 italic text-center",
                  label === 'B' ? "text-amber-500" : label === 'S' ? "text-blue-400" : "text-rose-500"
                )}>{label}</span>
                <div className="flex gap-1.5">
                  {[...Array(max)].map((_, i) => (
                    <div key={i} className={cn(
                      "w-3.5 h-3.5 rounded-full border border-white/5 transition-all duration-500",
                      getColor(i)
                    )} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. 下段：イニングスコア表（現在回をハイライト） */}
      <div className="h-16 bg-black/5 flex items-center px-4 overflow-hidden border-t border-border/10">
        <table className="w-full text-center border-collapse">
          <thead>
            <tr className="text-[7px] font-black text-muted-foreground/40 uppercase tracking-widest">
              <th className="text-left w-12 pl-1">TEAM</th>
              {innings.map(i => (
                <th key={i} className={cn(
                  "w-6 transition-colors duration-500",
                  state.inning === i ? "text-primary scale-125" : ""
                )}>{i}</th>
              ))}
              <th className="w-10 border-l border-white/5 bg-black/10 font-bold text-primary/80">R</th>
            </tr>
          </thead>
          <tbody className="text-[12px] font-black italic tabular-nums leading-none">
            <tr className="h-5">
              <td className="text-left text-[8px] not-italic text-muted-foreground/60 uppercase pl-1">GUEST</td>
              {innings.map(i => (
                <td key={i} className={cn(
                  "transition-all duration-500",
                  state.inning === i ? "bg-white/5 rounded-t-sm" : "text-muted-foreground/20"
                )}>
                  {state.opponentInningScores[i - 1] ?? (i <= state.inning ? "0" : "-")}
                </td>
              ))}
              <td className="border-l border-white/5 bg-black/10 text-muted-foreground/80">{state.opponentScore}</td>
            </tr>
            <tr className="h-5">
              <td className="text-left text-[8px] not-italic text-primary/60 uppercase pl-1">HOME</td>
              {innings.map(i => (
                <td key={i} className={cn(
                  "transition-all duration-500",
                  state.inning === i ? "bg-primary/10 text-primary rounded-b-sm" : "text-muted-foreground/20"
                )}>
                  {state.myInningScores[i - 1] ?? (i <= state.inning && !(!state.isTop && i === state.inning) ? "0" : "-")}
                </td>
              ))}
              <td className="border-l border-white/5 bg-black/10 text-primary">{state.myScore}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
