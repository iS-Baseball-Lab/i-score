// filepath: `src/components/score/Scoreboard.tsx`
/* 💡 伝統的RHE形式。フォントサイズを13pxで統一し、上下余白を黄金比で調整。
   ヘッダーのコントラストを上げ、視認性を極大化。 */

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

  // 試合開始前判定
  const isPreGame = state.inning === 1 && state.isTop && 
                    state.myScore === 0 && state.opponentScore === 0 &&
                    state.outs === 0 && state.balls === 0 && state.strikes === 0;

  // 自チームが攻撃中かどうかの判定
  const isMyAttack = (state.isTop && state.isGuestFirst) || (!state.isTop && !state.isGuestFirst);
  const attackStatusText = isMyAttack ? "攻撃" : "守備";

  // スライド制御
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isPreGame) return;
    startX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPreGame) return;
    const move = e.touches[0].clientX - startX.current;
    if (move > 0) setOffsetX(Math.min(move, 80)); 
  };

  const handleTouchEnd = () => {
    if (offsetX >= 60) {
      updateMatchSettings?.({ isGuestFirst: !state.isGuestFirst });
    }
    setOffsetX(0);
  };

  // 鉄の統一スタイル
  const numberStyle = "font-black tabular-nums tracking-tighter";
  const labelStyle = "text-[13px] font-black leading-none"; // 🌟 ここを統一

  return (
    <div className="w-full bg-background border-b border-border transition-colors select-none font-sans">
      <div className="w-full px-1 py-1">
        
        {/* 🚀 最上段：ヘッダー（コントラストを強化） */}
        <div className="flex items-center justify-between px-3 py-1.5 border-x border-t border-border rounded-t-md bg-muted/30">
          <div className="flex-1 truncate text-left text-[10px] font-black text-zinc-500 uppercase tracking-widest">
            {state.tournamentName || "OFFICIAL GAME"}
          </div>
          <div className="flex-none px-4 text-sm font-black text-foreground tracking-widest">
            vs {state.opponentTeamName || "相手チーム"}
          </div>
          <div className="flex-1 truncate text-right text-[10px] font-black text-zinc-500 uppercase tracking-widest">
            {state.venueName || "BASEBALL FIELD"}
          </div>
        </div>

        {/* 🚀 中段：掲示板本体 */}
        <div className="relative overflow-hidden border border-border bg-card">
          
          {/* スライド背景 */}
          <div 
            className="absolute inset-0 flex items-center px-6 bg-primary z-0 pointer-events-none transition-opacity"
            style={{ opacity: offsetX > 15 ? 1 : 0 }}
          >
            <span className="text-[12px] font-black text-primary-foreground tracking-[0.2em]">攻守切替</span>
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
                  <th className="w-14 py-1.5 pl-2 text-left">
                    <span className="text-[9px] font-black tracking-tighter opacity-80">攻守</span>
                  </th>
                  {innings.map(i => (
                    <th key={i} className={cn(
                      "py-1.5 text-base px-1",
                      numberStyle,
                      state.inning === i ? "bg-primary text-primary-foreground" : ""
                    )}>{i}</th>
                  ))}
                  <th className={cn("w-8 bg-muted border-l border-border/50 text-center text-base", numberStyle)}>R</th>
                  <th className={cn("w-8 bg-muted/30 text-center text-base", numberStyle)}>H</th>
                  <th className={cn("w-8 bg-muted/30 text-center text-base", numberStyle)}>E</th>
                </tr>
              </thead>
              <tbody>
                {/* 上段：先攻 */}
                <tr className={cn("border-b border-border/50 h-9", state.isTop ? "bg-primary/10" : "")}>
                  <td className="pl-2 py-1">
                    <span className={cn(labelStyle, state.isTop ? "text-primary" : "text-foreground/70")}>先攻</span>
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
                  <td className={cn("text-center text-xl border-l border-border", numberStyle, state.isTop ? "bg-primary/15 text-primary" : "bg-muted/30")}>
                    {state.opponentScore}
                  </td>
                  <td className={cn("text-center text-lg text-muted-foreground/80", numberStyle)}>{state.opponentHits || 0}</td>
                  <td className={cn("text-center text-lg text-muted-foreground/80", numberStyle)}>{state.opponentErrors || 0}</td>
                </tr>

                {/* 下段：後攻 */}
                <tr className={cn("h-9", !state.isTop ? "bg-primary/10" : "")}>
                  <td className="pl-2 py-1">
                    <span className={cn(labelStyle, !state.isTop ? "text-primary" : "text-foreground/70")}>後攻</span>
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
                  <td className={cn("text-center text-xl border-l border-border", numberStyle, !state.isTop ? "bg-primary/15 text-primary" : "bg-muted/30")}>
                    {state.myScore}
                  </td>
                  <td className={cn("text-center text-lg text-muted-foreground/80", numberStyle)}>{state.myHits || 0}</td>
                  <td className={cn("text-center text-lg text-muted-foreground/80", numberStyle)}>{state.myErrors || 0}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 🚀 下段：左右反転・余白調整版 (h-12 で垂直中央配置を安定化) */}
        <div className="flex items-center justify-between px-3 h-12 border-x border-b border-border rounded-b-md bg-muted/10">
          
          {/* 左側：イニング・攻守詳細 (フォントサイズを統一) */}
          <div className="flex items-center text-primary">
            <span className={cn("text-2xl leading-none", numberStyle)}>{state.inning}</span>
            <span className={cn(labelStyle, "mx-1")}>回</span>
            <span className={cn(labelStyle)}>{state.isTop ? "オモテ" : "ウラ"}</span>
            <span className="mx-2 text-muted-foreground/30 font-light">/</span>
            <span className={cn(
              labelStyle,
              "px-2 py-1 rounded-sm",
              isMyAttack ? "bg-primary text-primary-foreground" : "bg-zinc-200 text-zinc-500"
            )}>
              {attackStatusText}
            </span>
          </div>

          {/* 右側：BSOカウント */}
          <div className="flex gap-4">
            {[
              { label: 'B', color: 'bg-emerald-500 shadow-[0_0_8px_#10b981]', count: state.balls, max: 3, textColor: 'text-emerald-600' },
              { label: 'S', color: 'bg-amber-400 shadow-[0_0_8px_#fbbf24]', count: state.strikes, max: 2, textColor: 'text-amber-600' },
              { label: 'O', color: 'bg-rose-500 shadow-[0_0_8px_#f43f5e]', count: state.outs, max: 2, textColor: 'text-rose-600' }
            ].map(type => (
              <div key={type.label} className="flex items-center gap-1.5">
                <span className={cn("text-base font-black leading-none", type.textColor)}>{type.label}</span>
                <div className="flex gap-1">
                  {Array.from({ length: type.max }).map((_, i) => (
                    <div key={i} className={cn(
                      "w-3.5 h-3.5 rounded-full border border-border/40 transition-all duration-300",
                      i < type.count ? type.color : "bg-muted/50 shadow-inner"
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
