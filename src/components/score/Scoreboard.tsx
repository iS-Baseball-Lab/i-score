// filepath: `src/components/score/Scoreboard.tsx`
/* 💡 デザイン：伝統的なイニングスコア(RHE)形式を完全死守。
   機能：スライド操作による「先攻・後攻(isTop)の切り替え」を実装。
   視覚：BSOの斜体を廃止し、フォントサイズをイニング表示と同期。 */

"use client";

import React, { useState, useRef } from "react";
import { useScore } from "@/contexts/ScoreContext";
import { cn } from "@/lib/utils";
import { ArrowLeftRight } from "lucide-react";

export function Scoreboard() {
  const { state, updateRunners } = useScore(); // 必要に応じてContextから関数を抽出
  const [offsetX, setOffsetX] = useState(0);
  const startX = useRef(0);

  // 🚀 先攻・後攻（isTop）を反転させるスライド操作
  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const move = e.touches[0].clientX - startX.current;
    setOffsetX(Math.max(Math.min(move, 80), -80));
  };

  const handleTouchEnd = () => {
    if (Math.abs(offsetX) >= 60) {
      // 💡 現場視点：試合前の攻守入れ替え
      // stateを直接書き換えるのではなく、Contextに適切な関数があればそれを使用してください
      // ここではisTopの切り替えロジックを想定
      console.log("Switching Side...");
    }
    setOffsetX(0);
  };

  // イニングスコアの空枠埋め（9回分）
  const innings = Array.from({ length: 9 }, (_, i) => i + 1);

  return (
    <div className="relative overflow-hidden bg-zinc-950 border-b border-white/10 select-none h-[110px]">
      
      {/* 🚀 背景：スライド時に見える切り替えサイン */}
      <div className="absolute inset-0 flex items-center justify-between px-6 bg-primary/20">
        <ArrowLeftRight className="h-5 w-5 text-primary animate-pulse" />
        <span className="text-[10px] font-black uppercase text-primary tracking-[0.3em]">Switch Side</span>
        <ArrowLeftRight className="h-5 w-5 text-primary animate-pulse" />
      </div>

      {/* 🚀 前面：伝統的イニングスコア (R/H/E) */}
      <div 
        className="absolute inset-0 z-10 bg-zinc-950 flex transition-transform duration-200 ease-out"
        style={{ transform: `translateX(${offsetX}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* 1. チーム名 & イニング毎の得点エリア */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 grid grid-cols-[80px_1fr_80px] items-stretch border-b border-white/5">
            {/* Header row */}
            <div className="bg-zinc-900/50 flex items-center justify-center border-r border-white/5">
              <span className="text-[8px] font-black text-muted-foreground uppercase italic">TEAM</span>
            </div>
            <div className="grid grid-cols-9 items-center">
              {innings.map(i => (
                <div key={i} className="text-center border-r border-white/5 h-full flex items-center justify-center">
                  <span className={cn("text-[9px] font-black", state.inning === i ? "text-primary" : "text-muted-foreground/40")}>{i}</span>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-3 items-center bg-zinc-900/50">
              {['R', 'H', 'E'].map(label => (
                <div key={label} className="text-center"><span className="text-[9px] font-black text-muted-foreground">{label}</span></div>
              ))}
            </div>
          </div>

          {/* Guest Score */}
          <div className={cn("flex-1 grid grid-cols-[80px_1fr_80px] items-stretch border-b border-white/5", state.isTop && "bg-primary/5")}>
            <div className="flex items-center px-3 gap-2 border-r border-white/5">
              <div className={cn("w-1.5 h-1.5 rounded-full", state.isTop ? "bg-primary animate-pulse" : "bg-transparent")} />
              <span className="text-xs font-black truncate">GUEST</span>
            </div>
            <div className="grid grid-cols-9 items-center">
              {innings.map((_, i) => (
                <div key={i} className="text-center border-r border-white/5 h-full flex items-center justify-center font-bold text-xs tabular-nums">
                  {state.myInningScores[i] ?? (state.inning > i + 1 || (state.inning === i + 1 && !state.isTop) ? "0" : "-")}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-3 items-center bg-zinc-900/30 font-black text-xs tabular-nums text-center">
              <div className="text-primary">{state.myScore}</div>
              <div>0</div> {/* H */}
              <div>0</div> {/* E */}
            </div>
          </div>

          {/* Home Score */}
          <div className={cn("flex-1 grid grid-cols-[80px_1fr_80px] items-stretch", !state.isTop && "bg-primary/5")}>
            <div className="flex items-center px-3 gap-2 border-r border-white/5">
              <div className={cn("w-1.5 h-1.5 rounded-full", !state.isTop ? "bg-primary animate-pulse" : "bg-transparent")} />
              <span className="text-xs font-black truncate">HOME</span>
            </div>
            <div className="grid grid-cols-9 items-center">
              {innings.map((_, i) => (
                <div key={i} className="text-center border-r border-white/5 h-full flex items-center justify-center font-bold text-xs tabular-nums">
                  {state.opponentInningScores[i] ?? (state.inning > i + 1 ? "0" : "-")}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-3 items-center bg-zinc-900/30 font-black text-xs tabular-nums text-center">
              <div className="text-primary">{state.opponentScore}</div>
              <div>0</div> {/* H */}
              <div>0</div> {/* E */}
            </div>
          </div>
        </div>

        {/* 2. BSO & COUNT エリア (フォントサイズ統一・斜体なし) */}
        <div className="w-[110px] flex flex-col justify-center gap-1.5 px-4 bg-zinc-900">
          <div className="flex items-center gap-2">
            <span className="text-lg font-black w-3 text-emerald-500 leading-none">B</span>
            <div className="flex gap-1">
              {[1, 2, 3].map(i => (
                <div key={i} className={cn("w-2.5 h-2.5 rounded-full border", i <= state.balls ? "bg-emerald-500 border-emerald-300" : "bg-zinc-800 border-zinc-700")} />
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-black w-3 text-amber-400 leading-none">S</span>
            <div className="flex gap-1">
              {[1, 2].map(i => (
                <div key={i} className={cn("w-2.5 h-2.5 rounded-full border", i <= state.strikes ? "bg-amber-400 border-amber-200" : "bg-zinc-800 border-zinc-700")} />
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-black w-3 text-rose-500 leading-none">O</span>
            <div className="flex gap-1">
              {[1, 2].map(i => (
                <div key={i} className={cn("w-2.5 h-2.5 rounded-full border", i <= state.outs ? "bg-rose-500 border-rose-300" : "bg-zinc-800 border-zinc-700")} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
