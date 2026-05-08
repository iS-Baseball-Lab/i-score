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

  // すべての数字に適用する鉄の統一スタイル
  const numberStyle = "font-black tabular-nums tracking-tighter";

  return (
    <div className="w-full bg-background border-b border-border transition-colors">
      <div className="w-full px-1 py-1">
        <div className="overflow-hidden border border-border rounded-md shadow-sm overflow-x-auto">
          <table className="w-full border-collapse bg-card text-card-foreground min-w-[340px]">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="w-12 py-1 pl-2 text-left">
                  <button onClick={toggleStartingOrder} className="flex items-center gap-1 active:scale-95 text-muted-foreground hover:text-primary">
                    <span className="text-[8px] font-black uppercase tracking-widest">TEAM</span>
                    <ArrowLeftRight className="w-2 h-2" />
                  </button>
                </th>
                {innings.map(i => (
                  <th key={i} className={cn(
                    "py-1 text-base px-1",
                    numberStyle,
                    state.inning === i ? "bg-primary text-primary-foreground" : "text-muted-foreground/60"
                  )}>{i}</th>
                ))}
                <th className={cn("w-8 bg-muted border-l border-border/50 text-center text-base", numberStyle)}>R</th>
                <th className={cn("w-8 bg-muted/30 text-center text-base text-muted-foreground/60", numberStyle)}>H</th>
                <th className={cn("w-8 bg-muted/30 text-center text-base text-muted-foreground/60", numberStyle)}>E</th>
              </tr>
            </thead>
            <tbody>
              {/* GUEST */}
              <tr className={cn("border-b border-border/50", state.isTop ? "bg-primary/5" : "")}>
                <td className="pl-2 py-1">
                  <span className={cn("text-[10px] font-black uppercase", state.isTop ? "text-primary" : "text-foreground/70")}>GUEST</span>
                </td>
                {innings.map(i => (
                  <td key={i} className={cn(
                    "text-center text-lg px-0.5",
                    numberStyle,
                    state.inning === i && state.isTop ? "text-primary underline decoration-2 underline-offset-2" : "text-foreground/80",
                    (state.opponentInningScores[i - 1] === undefined && i > state.inning) && "opacity-10"
                  )}>
                    {state.opponentInningScores[i - 1] ?? (i <= state.inning ? "0" : "-")}
                  </td>
                ))}
                <td className={cn("text-center text-xl bg-muted/30 border-l border-border", numberStyle)}>{state.opponentScore}</td>
                <td className={cn("text-center text-lg text-muted-foreground/80", numberStyle)}>{state.opponentHits || 0}</td>
                <td className={cn("text-center text-lg text-muted-foreground/80", numberStyle)}>{state.opponentErrors || 0}</td>
              </tr>

              {/* HOME */}
              <tr className={cn(!state.isTop ? "bg-primary/5" : "")}>
                <td className="pl-2 py-1">
                  <span className={cn("text-[10px] font-black uppercase", !state.isTop ? "text-primary" : "text-foreground/70")}>HOME</span>
                </td>
                {innings.map(i => (
                  <td key={i} className={cn(
                    "text-center text-lg px-0.5",
                    numberStyle,
                    state.inning === i && !state.isTop ? "text-primary underline decoration-2 underline-offset-2" : "text-foreground/80",
                    (state.myInningScores[i - 1] === undefined && i >= state.inning && !(state.isTop && i === state.inning)) && "opacity-10"
                  )}>
                    {state.myInningScores[i - 1] ?? (i <= state.inning && !(state.isTop === true && i === state.inning) ? "0" : "-")}
                  </td>
                ))}
                <td className={cn("text-center text-xl bg-primary/10 text-primary border-l border-border", numberStyle)}>{state.myScore}</td>
                <td className={cn("text-center text-lg text-muted-foreground/80", numberStyle)}>{state.myHits || 0}</td>
                <td className={cn("text-center text-lg text-muted-foreground/80", numberStyle)}>{state.myErrors || 0}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 🚀 下段：BSO & イニング表示（囲みなし・余白調整版） */}
        <div className="flex items-center justify-between px-2 mt-2 h-8">
          <div className="flex gap-5">
            {[
              { label: 'B', color: 'bg-emerald-500 shadow-[0_0_10px_#10b981]', count: state.balls, max: 3, textColor: 'text-emerald-600' },
              { label: 'S', color: 'bg-amber-400 shadow-[0_0_10px_#fbbf24]', count: state.strikes, max: 2, textColor: 'text-amber-600' },
              { label: 'O', color: 'bg-rose-500 shadow-[0_0_10px_#f43f5e]', count: state.outs, max: 2, textColor: 'text-rose-600' }
            ].map(type => (
              <div key={type.label} className="flex items-center gap-2">
                <span className={cn("text-lg font-black italic", type.textColor)}>{type.label}</span>
                <div className="flex gap-1.5">
                  {Array.from({ length: type.max }).map((_, i) => (
                    <div key={i} className={cn(
                      "w-4 h-4 rounded-full border border-border/40 transition-all duration-300",
                      i < type.count ? type.color : "bg-muted shadow-inner"
                    )} />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* 🌟 囲みを削除し、数字と「回」の間にスペース(mx-1)を確保 */}
          <div className="flex items-center text-primary pr-1">
            <span className={cn("text-lg", numberStyle)}>{state.inning}</span>
            <span className="text-[11px] font-black mx-1">回</span>
            <span className="text-[11px] font-black">{state.isTop ? "オモテ" : "ウラ"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
