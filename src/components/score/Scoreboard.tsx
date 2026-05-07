// filepath: `src/components/score/Scoreboard.tsx`
import { useScore } from "@/contexts/ScoreContext";
import { cn } from "@/lib/utils";

export function Scoreboard() {
  const { state } = useScore();
  const innings = Array.from({ length: 9 }, (_, i) => i + 1);

  return (
    <div className="w-full bg-background border-b border-border transition-colors">
      <div className="w-full px-1 py-1">
        {/* 🚀 メイン・イニング表：高さを極限まで圧縮 */}
        <div className="overflow-hidden border border-border rounded-md shadow-sm">
          <table className="w-full border-collapse bg-card text-card-foreground">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="w-12 py-0.5 text-[8px] font-black text-muted-foreground pl-2 text-left">TEAM</th>
                {innings.map(i => (
                  <th key={i} className={cn(
                    "py-0.5 text-[10px] font-black transition-all",
                    state.inning === i ? "bg-primary text-primary-foreground" : "text-muted-foreground/60"
                  )}>
                    {i}
                  </th>
                ))}
                <th className="w-10 bg-muted text-[8px] font-black">R</th>
              </tr>
            </thead>
            <tbody>
              {/* GUEST (先攻) */}
              <tr className={cn(
                "border-b border-border/50",
                !state.isTop ? "bg-primary/5" : ""
              )}>
                <td className="pl-2 py-1">
                  <span className={cn("text-[10px] font-black leading-none", !state.isTop ? "text-primary" : "text-foreground/70")}>GUEST</span>
                </td>
                {innings.map(i => (
                  <td key={i} className={cn(
                    "text-center text-lg font-black tabular-nums tracking-tighter",
                    state.inning === i && !state.isTop ? "text-primary underline decoration-2 underline-offset-2" : "text-foreground/80",
                    (state.opponentInningScores[i - 1] === undefined && i > state.inning) && "opacity-10"
                  )}>
                    {state.opponentInningScores[i - 1] ?? (i <= state.inning ? "0" : "-")}
                  </td>
                ))}
                <td className="text-center text-xl font-black bg-muted/30 border-l border-border">{state.opponentScore}</td>
              </tr>

              {/* HOME (後攻) */}
              <tr className={cn(state.isTop ? "bg-primary/5" : "")}>
                <td className="pl-2 py-1">
                  <span className={cn("text-[10px] font-black leading-none", state.isTop ? "text-primary" : "text-foreground/70")}>HOME</span>
                </td>
                {innings.map(i => (
                  <td key={i} className={cn(
                    "text-center text-lg font-black tabular-nums tracking-tighter",
                    state.inning === i && state.isTop ? "text-primary underline decoration-2 underline-offset-2" : "text-foreground/80",
                    (state.myInningScores[i - 1] === undefined && i >= state.inning && !(!state.isTop && i === state.inning)) && "opacity-10"
                  )}>
                    {state.myInningScores[i - 1] ?? (i <= state.inning && !(state.isTop === false && i === state.inning) ? "0" : "-")}
                  </td>
                ))}
                <td className="text-center text-xl font-black bg-primary/10 text-primary border-l border-border">{state.myScore}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 🚀 下段：BSO（高さを詰め、アイコンを小ぶりに） */}
        <div className="flex items-center justify-between px-1 mt-1">
          <div className="flex gap-3">
            {[
              { label: 'B', color: 'bg-amber-500', count: state.balls, max: 3 },
              { label: 'S', color: 'bg-blue-500', count: state.strikes, max: 2 },
              { label: 'O', color: 'bg-rose-500', count: state.outs, max: 2 }
            ].map(type => (
              <div key={type.label} className="flex items-center gap-1">
                <span className={cn("text-[9px] font-black", type.label === 'B' ? 'text-amber-600' : type.label === 'S' ? 'text-blue-600' : 'text-rose-600')}>
                  {type.label}
                </span>
                <div className="flex gap-0.5">
                  {Array.from({ length: type.max }).map((_, i) => (
                    <div key={i} className={cn(
                      "w-2.5 h-2.5 rounded-full border border-border/20 transition-colors",
                      i < type.count ? type.color : "bg-muted shadow-inner"
                    )} />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* 試合進行状況のバッジもシンプルに */}
          <div className="px-2 py-0.5 rounded-full bg-muted border border-border">
            <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">
              {state.inning}{state.isTop ? "TOP" : "BOT"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
