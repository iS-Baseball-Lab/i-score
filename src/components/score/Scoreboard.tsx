// filepath: `src/components/score/Scoreboard.tsx`
"use client";

import { useScore } from "@/contexts/ScoreContext";
import { cn } from "@/lib/utils";
import { ArrowLeftRight } from "lucide-react";

export function Scoreboard() {
  const { state, updateMatchSettings } = useScore();
  
  const displayInningsCount = Math.max(state.maxInnings || 9, state.inning);
  const innings = Array.from({ length: displayInningsCount }, (_, i) => i + 1);

  const toggleStartingOrder = () => {
    if (confirm("先攻（GUEST）と後攻（HOME）の設定を入れ替えますか？")) {
      updateMatchSettings?.({ isGuestFirst: !state.isGuestFirst });
    }
  };

  return (
    <div className="w-full bg-background border-b border-border transition-colors">
      <div className="w-full px-1 py-1">
        <div className="overflow-hidden border border-border rounded-md shadow-sm overflow-x-auto">
          <table className="w-full border-collapse bg-card text-card-foreground min-w-[340px]">
            <thead>
              <tr className="bg-muted/50 border-b border-border text-[8px] font-black uppercase tracking-tighter">
                <th className="w-12 py-1 pl-2 text-left">
                  <button onClick={toggleStartingOrder} className="flex items-center gap-1 active:scale-95 text-muted-foreground hover:text-primary">
                    TEAM <ArrowLeftRight className="w-2 h-2" />
                  </button>
                </th>
                {/* 🌟 修正：イニング数字のフォントを RHE と同じ強さに統一 */}
                {innings.map(i => (
                  <th key={i} className={cn(
                    "py-1 text-base font-bold transition-all px-1 tabular-nums",
                    state.inning === i ? "bg-primary text-primary-foreground" : "text-muted-foreground/60"
                  )}>{i}</th>
                ))}
                <th className="w-8 bg-muted border-l border-border/50 text-center text-base font-bold">R</th>
                <th className="w-8 bg-muted/30 text-center text-base font-bold text-muted-foreground/60">H</th>
                <th className="w-8 bg-muted/30 text-center text-base font-bold text-muted-foreground/60">E</th>
              </tr>
            </thead>
            <tbody>
              {/* GUEST (先攻) */}
              <tr className={cn("border-b border-border/50", state.isTop ? "bg-primary/5" : "")}>
                <td className="pl-2 py-1">
                  <div className="flex flex-col leading-none gap-0.5">
                    <span className={cn("text-[10px] font-black", state.isTop ? "text-primary" : "text-foreground/70")}>GUEST</span>
                  </div>
                </td>
                {innings.map(i => (
                  <td key={i} className={cn(
                    "text-center text-lg font-bold tabular-nums tracking-tighter px-0.5",
                    state.inning === i && state.isTop ? "text-primary underline decoration-2 underline-offset-2" : "text-foreground/80",
                    (state.opponentInningScores[i - 1] === undefined && i > state.inning) && "opacity-10"
                  )}>
                    {state.opponentInningScores[i - 1] ?? (i <= state.inning ? "0" : "-")}
                  </td>
                ))}
                <td className="text-center text-xl font-black bg-muted/30 border-l border-border">{state.opponentScore}</td>
                <td className="text-center text-lg font-bold text-muted-foreground/80">{state.opponentHits || 0}</td>
                <td className="text-center text-lg font-bold text-muted-foreground/80">{state.opponentErrors || 0}</td>
              </tr>

              {/* HOME (後攻) */}
              <tr className={cn(!state.isTop ? "bg-primary/5" : "")}>
                <td className="pl-2 py-1">
                  <div className="flex flex-col leading-none gap-0.5">
                    <span className={cn("text-[10px] font-black", !state.isTop ? "text-primary" : "text-foreground/70")}>HOME</span>
                  </div>
                </td>
                {innings.map(i => (
                  <td key={i} className={cn(
                    "text-center text-lg font-bold tabular-nums tracking-tighter px-0.5",
                    state.inning === i && !state.isTop ? "text-primary underline decoration-2 underline-offset-2" : "text-foreground/80",
                    (state.myInningScores[i - 1] === undefined && i >= state.inning && !(state.isTop && i === state.inning)) && "opacity-10"
                  )}>
                    {state.myInningScores[i - 1] ?? (i <= state.inning && !(state.isTop === true && i === state.inning) ? "0" : "-")}
                  </td>
                ))}
                <td className="text-center text-xl font-black bg-primary/10 text-primary border-l border-border">{state.myScore}</td>
                <td className="text-center text-lg font-bold text-muted-foreground/80">{state.myHits || 0}</td>
                <td className="text-center text-lg font-bold text-muted-foreground/80">{state.myErrors || 0}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 🚀 下段：BSO & 日本語イニング */}
        <div className="flex items-center justify-between px-1 mt-1.5 h-7">
          <div className="flex gap-4">
            {[
              { label: 'B', color: 'bg-emerald-500 shadow-[0_0_8px_#10b981]', count: state.balls, max: 3, textColor: 'text-emerald-600' },
              { label: 'S', color: 'bg-amber-400 shadow-[0_0_8px_#fbbf24]', count: state.strikes, max: 2, textColor: 'text-amber-600' },
              { label: 'O', color: 'bg-rose-500 shadow-[0_0_8px_#f43f5e]', count: state.outs, max: 2, textColor: 'text-rose-600' }
            ].map(type => (
              <div key={type.label} className="flex items-center gap-1.5">
                {/* 🌟 修正：BSOのラベルとドットを大きく */}
                <span className={cn("text-sm font-black italic", type.textColor)}>{type.label}</span>
                <div className="flex gap-1">
                  {Array.from({ length: type.max }).map((_, i) => (
                    <div key={i} className={cn(
                      "w-3.5 h-3.5 rounded-full border border-border/30 transition-all duration-300",
                      i < type.count ? type.color : "bg-muted shadow-inner"
                    )} />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* 🌟 修正：イニング表記を「回 オモテ/ウラ」に変更 */}
          <div className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 shadow-sm">
            <span className="text-[10px] font-black text-primary tracking-tighter whitespace-nowrap">
              {state.inning}回 {state.isTop ? "オモテ" : "ウラ"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
