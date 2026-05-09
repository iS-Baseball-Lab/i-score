// filepath: `src/components/score/Scoreboard.tsx`
/* 💡 スコアボードの視認性向上と、スライド操作による攻守交代(Change)の実装 */

"use client";

import React, { useState, useRef } from "react";
import { useScore } from "@/contexts/ScoreContext";
import { cn } from "@/lib/utils";
import { RefreshCw } from "lucide-react";

export function Scoreboard() {
  const { state, changeInning } = useScore();
  const [offsetX, setOffsetX] = useState(0);
  const startX = useRef(0);

  // 🚀 タッチ操作：スライド制御
  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const move = e.touches[0].clientX - startX.current;
    // 左方向へのスライドのみ許容（最大100px）
    if (move < 0) {
      setOffsetX(Math.max(move, -100));
    }
  };

  const handleTouchEnd = () => {
    // 80px以上スライドしていたら交代を実行、そうでなければ戻す
    if (offsetX <= -80) {
      changeInning();
    }
    setOffsetX(0);
  };

  return (
    <div className="relative overflow-hidden bg-zinc-950 border-b border-border/10 h-[100px] select-none">
      
      {/* 🚀 背後：交代ボタン（スライドした時だけ見える） */}
      <div className="absolute inset-y-0 right-0 w-[100px] bg-primary flex flex-col items-center justify-center gap-1 text-primary-foreground transition-opacity">
        <RefreshCw className={cn("h-6 w-6 animate-spin-slow", offsetX < -60 ? "opacity-100" : "opacity-30")} />
        <span className="text-[10px] font-black uppercase">Change</span>
      </div>

      {/* 🚀 前面：メインスコアボード */}
      <div 
        className="absolute inset-0 z-10 bg-zinc-950 flex items-center transition-transform duration-200 ease-out"
        style={{ transform: `translateX(${offsetX}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* 左側：得点表示 */}
        <div className="flex-1 grid grid-cols-2 px-6">
          <div className={cn("flex flex-col justify-center", state.isTop && "border-l-4 border-primary pl-2")}>
            <span className="text-[10px] font-black text-muted-foreground uppercase">Guest</span>
            <span className="text-4xl font-black tabular-nums leading-none">{state.myScore}</span>
          </div>
          <div className={cn("flex flex-col justify-center items-end", !state.isTop && "border-r-4 border-primary pr-2")}>
            <span className="text-[10px] font-black text-muted-foreground uppercase text-right">Home</span>
            <span className="text-4xl font-black tabular-nums leading-none">{state.opponentScore}</span>
          </div>
        </div>

        {/* 右側：イニング & BSO (フォント統一 & 斜体廃止) */}
        <div className="flex items-center gap-6 px-8 h-full bg-white/5 border-l border-white/5">
          {/* イニング：数値を3xl、文字を2xlで統一感を持たせる */}
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-black text-muted-foreground uppercase">Inning</span>
            <div className="flex items-center gap-0.5">
              <span className="text-3xl font-black tabular-nums leading-none">{state.inning}</span>
              <span className="text-2xl font-black leading-none">{state.isTop ? "T" : "B"}</span>
            </div>
          </div>

          {/* BSO：斜体(italic)を削除し、フォントウェイトと高さをイニングに合わせる */}
          <div className="flex flex-col gap-1.5 justify-center">
            <div className="flex items-center gap-2">
              <span className="text-xl font-black w-4 text-emerald-500 leading-none">B</span>
              <div className="flex gap-1.5">
                {[1, 2, 3].map(i => (
                  <div key={i} className={cn("w-3.5 h-3.5 rounded-full border-2", i <= state.balls ? "bg-emerald-500 border-emerald-300" : "bg-zinc-800 border-zinc-700")} />
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black w-4 text-amber-400 leading-none">S</span>
              <div className="flex gap-1.5">
                {[1, 2].map(i => (
                  <div key={i} className={cn("w-3.5 h-3.5 rounded-full border-2", i <= state.strikes ? "bg-amber-400 border-amber-200" : "bg-zinc-800 border-zinc-700")} />
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black w-4 text-rose-500 leading-none">O</span>
              <div className="flex gap-1.5">
                {[1, 2].map(i => (
                  <div key={i} className={cn("w-3.5 h-3.5 rounded-full border-2", i <= state.outs ? "bg-rose-500 border-rose-300" : "bg-zinc-800 border-zinc-700")} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
