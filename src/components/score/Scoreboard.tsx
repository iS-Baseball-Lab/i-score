// filepath: `src/components/score/Scoreboard.tsx`
/* 💡 メイン掲示板をXSサイズに凝縮。
   全体を強固なボーダーで囲み、スライド時の「攻守切替」に強力なコントラストを適用。 */

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

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isPreGame) return;
    startX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPreGame) return;
    const move = e.touches[0].clientX - startX.current;
    if (move > 0) setOffsetX(Math.min(move, 120)); 
  };

  const handleTouchEnd = () => {
    if (offsetX >= 70) {
      updateMatchSettings?.({ isGuestFirst: !state.isGuestFirst });
    }
    setOffsetX(0);
  };

  const numberStyle = "font-black tabular-nums tracking-tighter";
  const labelBaseStyle = "text-[12px] font-black leading-none tracking-tight"; // 少し小さく

  return (
    <div className="w-full bg-background select-none font-sans p-1">
      {/* 🚀 全体を囲む強固なコンテナ (Shadow + Border) */}
      <div className="flex flex-col rounded-lg overflow-hidden border-2 border-border shadow-lg">
        
        {/* 🚀 ヘッダー (境界を明確化) */}
        <div className="flex items-center justify-between px-3 py-1.5 border-b-2 border-border bg-muted/40">
          <div className="flex-1 truncate text-left text-[9px] font-black text-zinc-500 uppercase tracking-widest">
            {state.tournamentName || "OFFICIAL GAME"}
          </div>
          <div className="flex-none px-4 text-xs font-black text-foreground tracking-widest italic">
            vs {state.opponentTeamName || "相手チーム"}
          </div>
          <div className="flex-1 truncate text-right text-[9px] font-black text-zinc-500 uppercase tracking-widest">
            {state.venueName || "BASEBALL FIELD"}
          </div>
        </div>

        {/* 🚀 メイン掲示板 (XSサイズに凝縮) */}
        <div className="relative overflow-hidden bg-card border-b-2 border-border">
          
          {/* 🌟 攻守切替オーバーレイ：絶対に隠れないように z-index と背景色を調整 */}
          <div 
            className="absolute inset-0 flex items-center justify-center bg-primary z-20 pointer-events-none transition-opacity duration-150"
            style={{ opacity: offsetX > 10 ? 1 : 0 }}
          >
            <span className="text-[16px] font-black text-white tracking-[0.8em] ml-[0.8em] drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
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
                <tr className="bg-muted/30 border-b border-border text-muted-foreground/60">
                  <th className="w-12 py-1 pl-2 text-left">
                    <span className="text-[10px] font-black tracking-tighter opacity-70">攻守</span>
                  </th>
                  {innings.map(i => (
                    <th key={i} className={cn(
                      "py-1 text-xs px-0.5",
                      numberStyle,
                      state.inning === i ? "bg-primary/20 text-primary" : ""
                    )}>{i}</th>
                  ))}
                  <th className={cn("w-7 bg-muted/50 text-center text-xs", numberStyle)}>R</th>
                  <th className={cn("w-7 bg-muted/20 text-center text-xs", numberStyle)}>H</th>
                  <th className={cn("w-7 bg-muted/20 text-center text-xs", numberStyle)}>E</th>
                </tr>
              </thead>
              <tbody>
                {/* 上段：先攻 (高さ h-7 で XS 化) */}
                <tr className={cn("border-b border-border/50 h-7", state.isTop ? "bg-primary/5" : "")}>
                  <td className="pl-2">
                    <span className={cn("text-[11px] font-black", state.isTop ? "text-primary" : "text-foreground/60")}>先攻</span>
                  </td>
                  {innings.map(i => (
                    <td key={i} className={cn(
                      "text-center text-xs px-0.5",
                      numberStyle,
                      state.inning === i && state.isTop ? "text-primary font-bold" : "text-foreground/70",
                      (state.opponentInningScores[i - 1] === undefined && i > state.inning) && "opacity-10"
                    )}>
                      {state.opponentInningScores[i - 1] ?? (i <= state.inning && (state.isTop || i < state.inning) ? "0" : "-")}
                    </td>
                  ))}
                  <td className={cn("text-center text-sm bg-muted/30", numberStyle)}>
                    {state.opponentScore}
                  </td>
                  <td className={cn("text-center text-xs text-muted-foreground/60", numberStyle)}>{state.opponentHits || 0}</td>
                  <td className={cn("text-center text-xs text-muted-foreground/60", numberStyle)}>{state.opponentErrors || 0}</td>
                </tr>

                {/* 下段：後攻 (高さ h-7) */}
                <tr className={cn("h-7", !state.isTop ? "bg-primary/5" : "")}>
                  <td className="pl-2">
                    <span className={cn("text-[11px] font-black", !state.isTop ? "text-primary" : "text-foreground/60")}>後攻</span>
                  </td>
                  {innings.map(i => (
                    <td key={i} className={cn(
                      "text-center text-xs px-0.5",
                      numberStyle,
                      state.inning === i && !state.isTop ? "text-primary font-bold" : "text-foreground/70",
                      (state.myInningScores[i - 1] === undefined && i >= state.inning && !(state.isTop && i === state.inning)) && "opacity-10"
                    )}>
                      {state.myInningScores[i - 1] ?? (i <= state.inning && (!state.isTop || i < state.inning) ? "0" : "-")}
                    </td>
                  ))}
                  <td className={cn("text-center text-sm bg-muted/30", numberStyle)}>
                    {state.myScore}
                  </td>
                  <td className={cn("text-center text-xs text-muted-foreground/60", numberStyle)}>{state.myHits || 0}</td>
                  <td className={cn("text-center text-xs text-muted-foreground/60", numberStyle)}>{state.myErrors || 0}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 🚀 下段 (ここを主役にするため h-16 へ) */}
        <div className="flex items-center justify-between px-4 h-16 bg-muted/5 shadow-inner">
          
          <div className="flex items-end text-primary pb-1">
            <span className={cn("text-4xl leading-none", numberStyle)}>{state.inning}</span>
            <div className="flex items-center gap-1.5 ml-2 mb-[4px]">
              <span className="text-[18px] font-black leading-none">回</span>
              <span className="text-[18px] font-black leading-none">{state.isTop ? "表" : "裏"}</span>
            </div>
            <div className="mx-4 mb-[8px] h-4 w-[2px] bg-muted-foreground/20" />
            
            <span className={cn(
              "text-[14px] font-black px-3 py-1.5 rounded-md mb-[2px] shadow-sm tracking-widest",
              isMyAttack 
                ? "bg-primary text-primary-foreground" 
                : "bg-zinc-800 text-zinc-100" 
            )}>
              {attackStatusText}
            </span>
          </div>

          <div className="flex gap-6">
            {[
              { label: 'B', color: 'bg-emerald-500 shadow-[0_0_12px_#10b981]', count: state.balls, max: 3, textColor: 'text-emerald-600' },
              { label: 'S', color: 'bg-amber-400 shadow-[0_0_12px_#fbbf24]', count: state.strikes, max: 2, textColor: 'text-amber-600' },
              { label: 'O', color: 'bg-rose-500 shadow-[0_0_12px_#f43f5e]', count: state.outs, max: 2, textColor: 'text-rose-600' }
            ].map(type => (
              <div key={type.label} className="flex flex-col items-center gap-1">
                <span className={cn("text-sm font-black leading-none", type.textColor)}>{type.label}</span>
                <div className="flex gap-1.5">
                  {Array.from({ length: type.max }).map((_, i) => (
                    <div key={i} className={cn(
                      "w-4 h-4 rounded-full border transition-all duration-300",
                      i < type.count ? type.color + " border-transparent" : "bg-zinc-900 border-zinc-800 shadow-inner"
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
