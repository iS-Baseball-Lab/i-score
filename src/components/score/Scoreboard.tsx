// filepath: `src/components/score/Scoreboard.tsx`
/* 💡 デザインをイニングスコア形式に復旧。スライド操作は「先攻・後攻(isTop)の切り替え」として実装。 */

"use client";

import React, { useState, useRef } from "react";
import { useScore } from "@/contexts/ScoreContext";
import { cn } from "@/lib/utils";
import { ArrowLeftRight } from "lucide-react";

export function Scoreboard() {
  const { state, updateState } = useScore(); // updateStateはContextに定義されている想定
  const [offsetX, setOffsetX] = useState(0);
  const startX = useRef(0);

  // 🚀 スライド操作：先攻・後攻の入れ替え
  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const move = e.touches[0].clientX - startX.current;
    setOffsetX(Math.max(Math.min(move, 100), -100)); // 左右100pxまで
  };

  const handleTouchEnd = () => {
    // 80px以上スライドしたら先攻・後攻を反転
    if (Math.abs(offsetX) >= 80) {
      // 💡 Context側の state.isTop を反転させる処理
      // 既存の changeInning ではなく、isTopのみを切り替える
      state.isTop = !state.isTop; 
    }
    setOffsetX(0);
  };

  return (
    <div className="relative overflow-hidden bg-zinc-950 border-b border-border/10 h-[100px] select-none">
      
      {/* 🚀 背景：スライド時に見える「先攻・後攻切り替え」インジケーター */}
      <div className="absolute inset-0 flex items-center justify-between px-10 bg-primary/20">
        <ArrowLeftRight className="h-6 w-6 text-primary animate-pulse" />
        <span className="text-[10px] font-black uppercase text-primary">Switch Side</span>
        <ArrowLeftRight className="h-6 w-6 text-primary animate-pulse" />
      </div>

      {/* 🚀 前面：イニングスコア・デザイン（復旧版） */}
      <div 
        className="absolute inset-0 z-10 bg-zinc-950 flex items-center transition-transform duration-200 ease-out"
        style={{ transform: `translateX(${offsetX}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* 左側：得点とチーム（イニングスコア形式） */}
        <div className="flex-1 grid grid-rows-2 h-full border-r border-white/5">
          {/* Guest (先攻) */}
          <div className={cn(
            "flex items-center justify-between px-6 transition-colors",
            state.isTop ? "bg-primary/10" : "opacity-40"
          )}>
            <span className="text-[10px] font-black uppercase tracking-wider">Guest</span>
            <span className="text-3xl font-black tabular-nums">{state.myScore}</span>
          </div>
          {/* Home (後攻) */}
          <div className={cn(
            "flex items-center justify-between px-6 border-t border-white/5 transition-colors",
            !state.isTop ? "bg-primary/10" : "opacity-40"
          )}>
            <span className="text-[10px] font-black uppercase tracking-wider text-right">Home</span>
            <span className="text-3xl font-black tabular-nums">{state.opponentScore}</span>
          </div>
        </div>

        {/* 右側：イニング & BSO (フォント統一・斜体廃止) */}
        <div className="flex items-center gap-6 px-8 h-full">
          {/* イニング表示：フォント統一 */}
          <div className="flex flex-col items-center">
            <span className="text-[8px] font-black text-muted-foreground uppercase mb-1">Inning</span>
            <div className="flex items-center gap-0.5">
              <span className="text-3xl font-black tabular-nums leading-none">{state.inning}</span>
              <span className="text-2xl font-black leading-none">{state.isTop ? "T" : "B"}</span>
            </div>
          </div>

          {/* BSO：斜体なし・サイズ統一 */}
          <div className="flex flex-col gap-1.5 justify-center">
            <div className="flex items-center gap-2">
              <span className="text-lg font-black w-3 text-emerald-500 leading-none">B</span>
              <div className="flex gap-1">
                {[1, 2, 3].map(i => (
                  <div key={i} className={cn("w-3 h-3 rounded-full border-2", i <= state.balls ? "bg-emerald-500 border-emerald-300" : "bg-zinc-800 border-zinc-700")} />
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black w-3 text-amber-400 leading-none">S</span>
              <div className="flex gap-1">
                {[1, 2].map(i => (
                  <div key={i} className={cn("w-3 h-3 rounded-full border-2", i <= state.strikes ? "bg-amber-400 border-amber-200" : "bg-zinc-800 border-zinc-700")} />
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black w-3 text-rose-500 leading-none">O</span>
              <div className="flex gap-1">
                {[1, 2].map(i => (
                  <div key={i} className={cn("w-3 h-3 rounded-full border-2", i <= state.outs ? "bg-rose-500 border-rose-300" : "bg-zinc-800 border-zinc-700")} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
