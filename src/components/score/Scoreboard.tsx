// filepath: `src/components/score/Scoreboard.tsx`
import { useScore } from "@/contexts/ScoreContext";
import { cn } from "@/lib/utils";

export function Scoreboard() {
  const { state } = useScore();
  const innings = Array.from({ length: 9 }, (_, i) => i + 1);

  return (
    <div className="w-full h-full bg-zinc-950 flex flex-col justify-center px-2">
      {/* 🚀 イニングスコア表：ここが戦場 */}
      <div className="w-full overflow-hidden border border-zinc-800 rounded-lg">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-zinc-900/50 border-b border-zinc-800">
              <th className="w-16 py-1 text-[10px] font-black text-zinc-500 text-left pl-3">TEAM</th>
              {innings.map(i => (
                <th key={i} className={cn(
                  "py-1 text-[12px] font-black transition-all duration-300",
                  state.inning === i ? "text-primary bg-primary/10" : "text-zinc-600"
                )}>
                  {i}
                </th>
              ))}
              <th className="w-14 bg-zinc-800/50 text-[10px] font-black text-zinc-400">R</th>
            </tr>
          </thead>
          <tbody className="bg-zinc-950">
            {/* GUEST (先攻) */}
            <tr className={cn(
              "border-b border-zinc-900 transition-colors",
              !state.isTop && state.inning <= 9 ? "bg-primary/5" : ""
            )}>
              <td className="pl-3 py-3">
                <span className="text-[11px] font-black text-zinc-400 block leading-none">GUEST</span>
                <span className="text-[8px] font-bold text-zinc-600 block mt-1 uppercase">Away</span>
              </td>
              {innings.map(i => (
                <td key={i} className={cn(
                  "text-center text-2xl font-black tabular-nums tracking-tighter",
                  state.inning === i && !state.isTop ? "text-primary" : "text-white/80",
                  (state.opponentInningScores[i - 1] === undefined && i > state.inning) && "opacity-10"
                )}>
                  {state.opponentInningScores[i - 1] ?? (i <= state.inning ? "0" : "-")}
                </td>
              ))}
              {/* 合計得点 (R) */}
              <td className="text-center text-3xl font-black italic bg-zinc-800/30 text-white border-l border-zinc-800">
                {state.opponentScore}
              </td>
            </tr>

            {/* HOME (後攻/自チーム) */}
            <tr className={cn(
              "transition-colors",
              state.isTop ? "bg-primary/5" : ""
            )}>
              <td className="pl-3 py-3">
                <span className="text-[11px] font-black text-primary block leading-none">HOME</span>
                <span className="text-[8px] font-bold text-primary/60 block mt-1 uppercase">Local</span>
              </td>
              {innings.map(i => (
                <td key={i} className={cn(
                  "text-center text-2xl font-black tabular-nums tracking-tighter",
                  state.inning === i && state.isTop ? "text-primary" : "text-white/80",
                  (state.myInningScores[i - 1] === undefined && i >= state.inning && !(!state.isTop && i === state.inning)) && "opacity-10"
                )}>
                  {state.myInningScores[i - 1] ?? (i <= state.inning && !(state.isTop === false && i === state.inning) ? "0" : "-")}
                </td>
              ))}
              {/* 合計得点 (R) */}
              <td className="text-center text-3xl font-black italic bg-primary/20 text-primary border-l border-zinc-800">
                {state.myScore}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 🚀 下段：BSO / アウトカウントだけをミニマルに */}
      <div className="flex items-center justify-between mt-2 px-2">
        <div className="flex gap-4">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-black text-amber-500">B</span>
            <div className="flex gap-1">
              {[1, 2, 3].map(i => (
                <div key={i} className={cn("w-3 h-3 rounded-full border border-white/5", i <= state.balls ? "bg-amber-500 shadow-[0_0_8px_#f59e0b]" : "bg-zinc-800")} />
              ))}
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-black text-blue-400">S</span>
            <div className="flex gap-1">
              {[1, 2].map(i => (
                <div key={i} className={cn("w-3 h-3 rounded-full border border-white/5", i <= state.strikes ? "bg-blue-400 shadow-[0_0_8px_#3b82f6]" : "bg-zinc-800")} />
              ))}
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-black text-rose-500">O</span>
            <div className="flex gap-1">
              {[1, 2].map(i => (
                <div key={i} className={cn("w-3 h-3 rounded-full border border-white/5", i <= state.outs ? "bg-rose-500 shadow-[0_0_8px_#f43f5e]" : "bg-zinc-800")} />
              ))}
            </div>
          </div>
        </div>
        
        {/* 現在のイニング・攻撃チーム明示 */}
        <div className="bg-primary/10 px-3 py-1 rounded border border-primary/20">
          <span className="text-[10px] font-black text-primary tracking-tighter italic">
            {state.inning}回{state.isTop ? "表 攻撃中" : "裏 攻撃中"}
          </span>
        </div>
      </div>
    </div>
  );
}
