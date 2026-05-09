// filepath: `src/components/score/Scoreboard.tsx`
/* 💡 120点満点の超進化版。
   スコアボードを最前面に配置し、背後から攻守切替が覗くリッチな階層。
   「LIVE」演出と強化されたボーダーで、プロ用ツールとしての威厳を確立。 */

"use client";

import { useState, useRef, useEffect } from "react";
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

  const [previewIsGuestFirst, setPreviewIsGuestFirst] = useState(state.isGuestFirst);
  
  useEffect(() => {
    setPreviewIsGuestFirst(state.isGuestFirst);
  }, [state.isGuestFirst]);

  const isMyAttack = (state.isTop && previewIsGuestFirst) || (!state.isTop && !previewIsGuestFirst);
  const attackStatusText = isMyAttack ? "攻撃" : "守備";

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isPreGame) return;
    startX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPreGame) return;
    const move = e.touches[0].clientX - startX.current;
    if (move > 0) {
      const clampedMove = Math.min(move, 120);
      setOffsetX(clampedMove);
      if (clampedMove > 60) {
        setPreviewIsGuestFirst(!state.isGuestFirst);
      } else {
        setPreviewIsGuestFirst(state.isGuestFirst);
      }
    }
  };

  const handleTouchEnd = () => {
    if (offsetX >= 60) {
      updateMatchSettings?.({ isGuestFirst: !state.isGuestFirst });
    }
    setOffsetX(0);
  };

  const numberStyle = "font-black tabular-nums tracking-tighter";

  return (
    <div className="w-full bg-background select-none font-sans p-1">
      {/* 🚀 全体を囲むコンテナ (ボーダーを zinc-300 で強化) */}
      <div className="flex flex-col rounded-lg overflow-hidden border-2 border-zinc-300 dark:border-zinc-700 shadow-md">
        
        {/* 🚀 ヘッダー */}
        <div className="flex items-center justify-between px-3 py-1.5 border-b-2 border-zinc-300 dark:border-zinc-700 bg-muted/40">
          {/* 🌟 ライブ中インジケーター */}
          <div className="flex-1 flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-600"></span>
            </span>
            <span className="text-[10px] font-black text-rose-600 tracking-tighter uppercase">LIVE</span>
          </div>
          <div className="flex-none px-4 text-xs font-black text-foreground tracking-widest">
            vs {state.opponentTeamName || "相手チーム"}
          </div>
          <div className="flex-1 truncate text-right text-[9px] font-black text-zinc-500 uppercase tracking-widest">
            {state.venueName || "BASEBALL FIELD"}
          </div>
        </div>

        {/* 🚀 メイン掲示板 (階層を逆転: Z-20がボード、Z-10が切替幕) */}
        <div className="relative overflow-hidden bg-card border-b-2 border-zinc-300 dark:border-zinc-700">
          
          {/* 🌟 攻守切替オーバーレイ (背面に配置) */}
          <div 
            className="absolute left-0 top-0 bottom-0 bg-primary z-10 flex items-center"
            style={{ 
              width: `${offsetX}px`,
              opacity: offsetX > 5 ? 1 : 0 
            }}
          >
            <div className="w-full flex justify-center">
               <span className="text-[14px] font-black text-white tracking-[0.4em] ml-[0.4em] whitespace-nowrap">
                攻守切替
              </span>
            </div>
          </div>

          {/* 🌟 スコアボード本体 (最前面 z-20) */}
          <div 
            className="relative z-20 bg-card shadow-[-8px_0_15px_rgba(0,0,0,0.1)] transition-transform duration-300 cubic-bezier(0.2, 0.8, 0.2, 1)"
            style={{ transform: `translateX(${offsetX}px)` }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <table className="w-full border-collapse text-card-foreground min-w-[340px]">
              <thead>
                <tr className="bg-muted/30 border-b border-border text-muted-foreground/60">
                  <th className="w-10 py-2"></th> 
                  {innings.map(i => (
                    <th key={i} className={cn(
                      "py-2 text-base px-1",
                      numberStyle,
                      state.inning === i ? "bg-primary text-primary-foreground" : ""
                    )}>{i}</th>
                  ))}
                  <th className={cn("w-8 bg-muted/50 text-center text-base", numberStyle)}>R</th>
                  <th className={cn("w-8 bg-muted/20 text-center text-base", numberStyle)}>H</th>
                  <th className={cn("w-8 bg-muted/20 text-center text-base", numberStyle)}>E</th>
                </tr>
              </thead>
              <tbody>
                <tr className={cn("border-b border-border/50 h-10 transition-colors duration-300", isMyAttack ? "" : "bg-primary/5")}>
                  <td className="text-center">
                    <span className={cn("text-[13px] font-black", !isMyAttack ? "text-primary" : "text-foreground/50")}>先</span>
                  </td>
                  {innings.map(i => (
                    <td key={i} className={cn(
                      "text-center text-lg px-0.5",
                      numberStyle,
                      state.inning === i && state.isTop ? "text-primary font-bold underline" : "text-foreground/80"
                    )}>
                      {state.opponentInningScores[i - 1] ?? (i <= state.inning && (state.isTop || i < state.inning) ? "0" : "-")}
                    </td>
                  ))}
                  <td className={cn("text-center text-xl bg-muted/30", numberStyle)}>
                    {state.opponentScore}
                  </td>
                  <td className={cn("text-center text-lg text-muted-foreground/50", numberStyle)}>{state.opponentHits || 0}</td>
                  <td className={cn("text-center text-lg text-muted-foreground/50", numberStyle)}>{state.opponentErrors || 0}</td>
                </tr>

                <tr className={cn("h-10 transition-colors duration-300", isMyAttack ? "bg-primary/5" : "")}>
                  <td className="text-center">
                    <span className={cn("text-[13px] font-black", isMyAttack ? "text-primary" : "text-foreground/50")}>後</span>
                  </td>
                  {innings.map(i => (
                    <td key={i} className={cn(
                      "text-center text-lg px-0.5",
                      numberStyle,
                      state.inning === i && !state.isTop ? "text-primary font-bold underline" : "text-foreground/80"
                    )}>
                      {state.myInningScores[i - 1] ?? (i <= state.inning && (!state.isTop || i < state.inning) ? "0" : "-")}
                    </td>
                  ))}
                  <td className={cn("text-center text-xl bg-muted/30", numberStyle)}>
                    {state.myScore}
                  </td>
                  <td className={cn("text-center text-lg text-muted-foreground/50", numberStyle)}>{state.myHits || 0}</td>
                  <td className={cn("text-center text-lg text-muted-foreground/50", numberStyle)}>{state.myErrors || 0}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 🚀 下段 */}
        <div className="flex items-center justify-between px-4 h-16 bg-muted/5">
          <div className="flex items-end text-primary pb-1">
            <span className={cn("text-4xl leading-none", numberStyle)}>{state.inning}</span>
            <div className="flex items-center gap-1.5 ml-2 mb-[4px]">
              <span className="text-[18px] font-black leading-none">回</span>
              <span className="text-[18px] font-black leading-none">{state.isTop ? "表" : "裏"}</span>
            </div>
            <div className="mx-4 mb-[8px] h-4 w-[2px] bg-muted-foreground/20" />
            
            <span className={cn(
              "text-[14px] font-black px-3 py-1.5 rounded-md mb-[2px] shadow-sm transition-all duration-300 min-w-[60px] text-center tracking-widest",
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
