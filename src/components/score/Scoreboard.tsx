// filepath: `src/components/score/Scoreboard.tsx`
"use client";

import { useState, useRef } from "react";
import { useScore } from "@/contexts/ScoreContext";
import { cn } from "@/lib/utils";

export function Scoreboard() {
  const { state, updateMatchSettings } = useScore();
  const [dragWidth, setDragWidth] = useState(0);
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
    if (move > 0) setDragWidth(Math.min(move, 150)); 
  };

  const handleTouchEnd = () => {
    if (dragWidth >= 80) {
      updateMatchSettings?.({ isGuestFirst: !state.isGuestFirst });
    }
    setDragWidth(0); // 幕を引っ込める
  };

  const numberStyle = "font-black tabular-nums tracking-tighter";

  return (
    <div className="w-full bg-background select-none font-sans p-1">
      {/* 🚀 コンテナ (1px の zinc-300 でシャープに) */}
      <div className="flex flex-col rounded-lg overflow-hidden border border-zinc-300 dark:border-zinc-700 shadow-sm">
        
        {/* 🚀 ヘッダー */}
        <div className="flex items-center justify-between px-3 py-1.5 border-b border-zinc-300 dark:border-zinc-700 bg-muted/40 text-[9px] font-black text-zinc-500 uppercase tracking-widest">
          <div className="flex-1 truncate text-left">{state.tournamentName || "OFFICIAL GAME"}</div>
          <div className="flex-none px-4 text-xs font-black text-foreground italic">vs {state.opponentTeamName || "相手チーム"}</div>
          <div className="flex-1 truncate text-right">{state.venueName || "BASEBALL FIELD"}</div>
        </div>

        {/* 🚀 メイン掲示板 (1枚板でスライド幕を上に乗せる) */}
        <div 
          className="relative overflow-hidden bg-card border-b border-zinc-300 dark:border-zinc-700"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* 🌟 攻守切替幕 (最前面 z-30 に伸びてくる) */}
          <div 
            className="absolute left-0 top-0 bottom-0 bg-primary z-30 flex items-center justify-center transition-all duration-200 ease-out"
            style={{ 
              width: `${dragWidth}px`,
              opacity: dragWidth > 0 ? 1 : 0,
            }}
          >
            <span className={cn(
              "font-black text-white whitespace-nowrap tracking-widest text-sm",
              dragWidth < 60 && "opacity-0"
            )}>
              攻守切替
            </span>
          </div>

          {/* テーブル本体 */}
          <table className="w-full border-collapse text-card-foreground min-w-[340px]">
            <thead>
              <tr className="bg-muted/30 border-b border-border text-muted-foreground/60">
                <th className="w-12 py-1 text-center">
                  <div className="flex flex-col items-center leading-none py-1">
                    <span className="relative flex h-2 w-2 mb-0.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-600"></span>
                    </span>
                    <span className="text-[8px] font-black text-rose-600 tracking-tighter">LIVE</span>
                  </div>
                </th> 
                {innings.map(i => (
                  <th key={i} className={cn("py-2 text-base px-1", numberStyle, state.inning === i ? "bg-primary text-primary-foreground" : "")}>{i}</th>
                ))}
                <th className={cn("w-8 bg-muted/50 text-center text-base", numberStyle)}>R</th>
                <th className={cn("w-8 bg-muted/20 text-center text-xs opacity-50", numberStyle)}>H</th>
                <th className={cn("w-8 bg-muted/20 text-center text-xs opacity-50", numberStyle)}>E</th>
              </tr>
            </thead>
            <tbody>
              {/* 先攻行 */}
              <tr className={cn("border-b border-border/50 h-10", state.isTop ? "bg-primary/5" : "")}>
                <td className="text-center font-black text-[13px]">
                  <span className={state.isTop ? "text-primary" : "text-foreground/40"}>先</span>
                </td>
                {innings.map(i => (
                  <td key={i} className={cn("text-center text-lg px-0.5", numberStyle, state.inning === i && state.isTop ? "text-primary font-bold underline underline-offset-4" : "text-foreground/80")}>
                    {state.opponentInningScores[i - 1] ?? (i <= state.inning && (state.isTop || i < state.inning) ? "0" : "-")}
                  </td>
                ))}
                <td className={cn("text-center text-xl bg-muted/40", numberStyle)}>{state.opponentScore}</td>
                <td className="text-center text-sm text-muted-foreground/40 font-bold tracking-tighter">{state.opponentHits || 0}</td>
                <td className="text-center text-sm text-muted-foreground/40 font-bold tracking-tighter">{state.opponentErrors || 0}</td>
              </tr>
              {/* 後攻行 */}
              <tr className={cn("h-10", !state.isTop ? "bg-primary/5" : "")}>
                <td className="text-center font-black text-[13px]">
                  <span className={!state.isTop ? "text-primary" : "text-foreground/40"}>後</span>
                </td>
                {innings.map(i => (
                  <td key={i} className={cn("text-center text-lg px-0.5", numberStyle, state.inning === i && !state.isTop ? "text-primary font-bold underline underline-offset-4" : "text-foreground/80")}>
                    {state.myInningScores[i - 1] ?? (i <= state.inning && (!state.isTop || i < state.inning) ? "0" : "-")}
                  </td>
                ))}
                <td className={cn("text-center text-xl bg-muted/40", numberStyle)}>{state.myScore}</td>
                <td className="text-center text-sm text-muted-foreground/40 font-bold tracking-tighter">{state.myHits || 0}</td>
                <td className="text-center text-sm text-muted-foreground/40 font-bold tracking-tighter">{state.myErrors || 0}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 🚀 下段 (バッジの上下余白を完全等間隔化) */}
        <div className="flex items-center justify-between px-4 h-16 bg-muted/5">
          <div className="flex items-center text-primary h-full">
            <div className="flex items-end pb-1">
              <span className={cn("text-4xl leading-none", numberStyle)}>{state.inning}</span>
              <div className="flex items-center gap-1 ml-2 mb-[3px]">
                <span className="text-[18px] font-black leading-none">回</span>
                <span className="text-[18px] font-black leading-none">{state.isTop ? "表" : "裏"}</span>
              </div>
            </div>
            <div className="mx-4 h-5 w-[1px] bg-muted-foreground/20" />
            
            {/* 🌟 バッジ：垂直中央配置を徹底 */}
            <div className="flex items-center h-full">
              <span className={cn(
                "text-[14px] font-black px-3 py-1.5 rounded-md shadow-sm transition-all duration-300 min-w-[65px] text-center tracking-widest leading-none flex items-center justify-center",
                isMyAttack ? "bg-primary text-primary-foreground" : "bg-zinc-800 text-zinc-100"
              )}>
                {attackStatusText}
              </span>
            </div>
          </div>

          <div className="flex gap-6 h-full items-center">
            {[
              { label: 'B', color: 'bg-emerald-500 shadow-[0_0_12px_#10b981]', count: state.balls, max: 3, textColor: 'text-emerald-600' },
              { label: 'S', color: 'bg-amber-400 shadow-[0_0_12px_#fbbf24]', count: state.strikes, max: 2, textColor: 'text-amber-600' },
              { label: 'O', color: 'bg-rose-500 shadow-[0_0_12px_#f43f5e]', count: state.outs, max: 2, textColor: 'text-rose-600' }
            ].map(type => (
              <div key={type.label} className="flex flex-col items-center gap-1.5">
                <span className={cn("text-sm font-black leading-none", type.textColor)}>{type.label}</span>
                <div className="flex gap-1.5">
                  {Array.from({ length: type.max }).map((_, i) => (
                    <div key={i} className={cn("w-4 h-4 rounded-full border transition-all duration-300", i < type.count ? type.color + " border-transparent" : "bg-zinc-900 border-zinc-800 shadow-inner")} />
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
