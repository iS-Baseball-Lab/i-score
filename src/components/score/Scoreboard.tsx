// filepath: `src/components/score/Scoreboard.tsx`
/* 💡 伝統的RHE形式の完成形。スコアボード本体に薄い影(shadow-md)を適用。
   スライド切替のシャドウ付き中央配置、漢字表記、BSOコントラストをすべて統合。 */

"use client";

import { useState, useRef } from "react";
import { useScore } from "@/contexts/ScoreContext";
import { cn } from "@/lib/utils";

export function Scoreboard() {
  const { state, updateMatchSettings } = useScore();
  const [offsetX, setOffsetX] = useState(0);
  const startX = useRef(0);
  
  const displayInningsCount = Math.max(state.maxInnings || 9, state.inning);
  const innings = Array.from({ length: displayInningsCount }, (_, i) => i + 1);

  const isPreGame = state.inning === 1 && state.isTop && 
                    state.myScore === 0 && state.opponentScore === 0 &&
                    state.outs === 0 && state.balls === 0 && state.strikes === 0;

  const isMyAttack = (state.isTop && state.isGuestFirst) || (!state.isTop && !state.isGuestFirst);
  const attackStatusText = isMyAttack ? "攻撃" : "守備";

  const topLabel = state.isGuestFirst ? "HOME" : "GUEST";
  const bottomLabel = state.isGuestFirst ? "GUEST" : "HOME";

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isPreGame) return;
    startX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPreGame) return;
    const move = e.touches[0].clientX - startX.current;
    if (move > 0) setOffsetX(Math.min(move, 100)); 
  };

  const handleTouchEnd = () => {
    if (offsetX >= 60) {
      updateMatchSettings?.({ isGuestFirst: !state.isGuestFirst });
    }
    setOffsetX(0);
  };

  const numberStyle = "font-black tabular-nums tracking-tighter";
  const labelBaseStyle = "text-[13px] font-black leading-none tracking-tight";

  return (
    <div className="w-full bg-background border-b border-border transition-colors select-none font-sans">
      <div className="w-full px-1 py-1">
        
        {/* 🚀 ヘッダー */}
        <div className="flex items-center justify-between px-3 py-1.5 border-x border-t border-border rounded-t-md bg-muted/30">
          <div className="flex-1 truncate text-left text-[10px] font-black text-zinc-500 uppercase tracking-widest">
            {state.tournamentName || "OFFICIAL GAME"}
          </div>
          <div className="flex-none px-4 text-sm font-black text-foreground tracking-widest italic">
            vs {state.opponentTeamName || "相手チーム"}
          </div>
          <div className="flex-1 truncate text-right text-[10px] font-black text-zinc-500 uppercase tracking-widest">
            {state.venueName || "BASEBALL FIELD"}
          </div>
        </div>

        {/* 🚀 メイン掲示板コンテナ：🌟 shadow-md を追加して浮き上がりを演出 */}
        <div className="relative overflow-hidden border border-border bg-card shadow-md">
          
          {/* スライド背景：攻守切替テキスト */}
          <div 
            className="absolute inset-0 flex items-center justify-center bg-primary z-0 pointer-events-none transition-opacity duration-150"
            style={{ opacity: offsetX > 5 ? 1 : 0 }}
          >
            <span className="text-[15px] font-black text-white tracking-[0.5em] ml-[0.5em] drop-shadow-[0_2px_2px_rgba(0,0,0,0.4)]">
              攻守切替
            </span>
          </div>

          <div 
            className="relative z-10 bg-card transition-transform duration-200 ease-out"
            style={{ transform: `translateX(${offsetX}px)` }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <table className="w-full border-collapse text-card-foreground min-w-[340px]">
              <thead>
                <tr className="bg-muted/50 border-b border-border text-muted-foreground/60">
                  <th className="w-14 py-2 pl-2 text-left">
                    <span className="text-[13px] font-black tracking-tighter opacity-80">攻守</span>
                  </th>
                  {innings.map(i => (
                    <th key={i} className={cn(
                      "py-2 text-base px-1",
                      numberStyle,
                      state.inning === i ? "bg-primary text-primary-foreground" : ""
                    )}>{i}</th>
                  ))}
                  <th className={cn("w-8 bg-muted text-center text-base", numberStyle)}>R</th>
                  <th className={cn("w-8 bg-muted/30 text-center text-base", numberStyle)}>H</th>
                  <th className={cn("w-8 bg-muted/30 text-center text-base", numberStyle)}>E</th>
                </tr>
              </thead>
              <tbody>
                <tr className={cn("border-b border-border/50 h-10 transition-colors", state.isTop ? "bg-primary/10" : "")}>
                  <td className="pl-2 py-1">
                    <span className={cn(labelBaseStyle, state.isTop ? "text-primary" : "text-foreground/70")}>先攻</span>
                  </td>
                  {innings.map(i => (
                    <td key={i} className={cn(
                      "text-center text-lg px-0.5",
                      numberStyle,
                      state.inning === i && state.isTop ? "text-primary font-black underline decoration-2 underline-offset-2" : "text-foreground/80",
                      (state.opponentInningScores[i - 1] === undefined && i > state.inning) && "opacity-10"
                    )}>
                      {state.opponentInningScores[i - 1] ?? (i <= state.inning && (state.isTop || i < state.inning) ? "0" : "-")}
                    </td>
                  ))}
                  <td className={cn("text-center text-xl", numberStyle, state.isTop ? "bg-primary/15 text-primary" : "bg-muted/30")}>
                    {state.opponentScore}
                  </td>
                  <td className={cn("text-center text-lg text-muted-foreground/80", numberStyle)}>{state.opponentHits || 0}</td>
                  <td className={cn("text-center text-lg text-muted-foreground/80", numberStyle)}>{state.opponentErrors || 0}</td>
                </tr>

                <tr className={cn("h-10 transition-colors", !state.isTop ? "bg-primary/10" : "")}>
                  <td className="pl-2 py-1">
                    <span className={cn(labelBaseStyle, !state.isTop ? "text-primary" : "text-foreground/70")}>後攻</span>
                  </td>
                  {innings.map(i => (
                    <td key={i} className={cn(
                      "text-center text-lg px-0.5",
                      numberStyle,
                      state.inning === i && !state.isTop ? "text-primary font-black underline decoration-2 underline-offset-2" : "text-foreground/80",
                      (state.myInningScores[i - 1] === undefined && i >= state.inning && !(state.isTop && i === state.inning)) && "opacity-10"
                    )}>
                      {state.myInningScores[i - 1] ?? (i <= state.inning && (!state.isTop || i < state.inning) ? "0" : "-")}
                    </td>
                  ))}
                  <td className={cn("text-center text-xl", numberStyle, !state.isTop ? "bg-primary/15 text-primary" : "bg-muted/30")}>
                    {state.myScore}
                  </td>
                  <td className={cn("text-center text-lg text-muted-foreground/80", numberStyle)}>{state.myHits || 0}</td>
                  <td className={cn("text-center text-lg text-muted-foreground/80", numberStyle)}>{state.myErrors || 0}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 🚀 下段：🌟 ここも shadow-sm を加えて一体感を出す */}
        <div className="flex items-center justify-between px-3 h-14 border-x border-b border-border rounded-b-md bg-muted/10 shadow-sm">
          
          <div className="flex items-end text-primary pb-1">
            <span className={cn("text-[32px] leading-none", numberStyle)}>{state.inning}</span>
            <div className="flex items-center gap-1 ml-1.5 mb-[3px]">
              <span className="text-[16px] font-black leading-none">回</span>
              <span className="text-[16px] font-black leading-none">{state.isTop ? "表" : "裏"}</span>
            </div>
            <div className="mx-3 mb-[6px] h-3 w-[1px] bg-muted-foreground/30" />
            
            <span className={cn(
              "text-[13px] font-black px-2 py-1 rounded-sm mb-[2px] shadow-sm transition-colors min-w-[42px] text-center",
              isMyAttack 
                ? "bg-primary text-primary-foreground" 
                : "bg-zinc-800 text-zinc-100" 
            )}>
              {attackStatusText}
            </span>
          </div>

          {/* BSO */}
          <div className="flex gap-5">
            {[
              { label: 'B', color: 'bg-emerald-500 shadow-[0_0_10px_#10b981]', count: state.balls, max: 3, textColor: 'text-emerald-600' },
              { label: 'S', color: 'bg-amber-400 shadow-[0_0_10px_#fbbf24]', count: state.strikes, max: 2, textColor: 'text-amber-600' },
              { label: 'O', color: 'bg-rose-500 shadow-[0_0_10px_#f43f5e]', count: state.outs, max: 2, textColor: 'text-rose-600' }
            ].map(type => (
              <div key={type.label} className="flex items-center gap-2">
                <span className={cn("text-xl font-black leading-none", type.textColor)}>{type.label}</span>
                <div className="flex gap-1.5">
                  {Array.from({ length: type.max }).map((_, i) => (
                    <div key={i} className={cn(
                      "w-4 h-4 rounded-full border transition-all duration-300",
                      i < type.count ? type.color + " border-transparent" : "bg-zinc-900 border-zinc-700 shadow-inner"
                    )} />
                  ))}
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
