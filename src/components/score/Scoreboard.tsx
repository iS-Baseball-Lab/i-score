// filepath: `src/components/score/Scoreboard.tsx`
/* 💡 伝統的なRHEイニングスコア形式を完全復旧。
   スライド操作は「試合前の先攻・後攻(isTop)の切り替え」に限定。
   BSOの斜体を廃止し、フォントウェイトを統一。 */

"use client";

import React, { useState, useRef } from "react";
import { useScore } from "@/contexts/ScoreContext";
import { cn } from "@/lib/utils";
import { ArrowLeftRight } from "lucide-react";

export function Scoreboard() {
  const { state } = useScore();
  const [offsetX, setOffsetX] = useState(0);
  const startX = useRef(0);

  // 🚀 スライド操作：試合前の先攻・後攻入れ替え
  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const move = e.touches[0].clientX - startX.current;
    // 左右80pxまで遊びを持たせる
    setOffsetX(Math.max(Math.min(move, 80), -80));
  };

  const handleTouchEnd = () => {
    // 60px以上スライドしたら state.isTop を反転させる（Context側で対応が必要）
    if (Math.abs(offsetX) >= 60) {
      console.log("🔥 先攻・後攻を切り替えます");
      // 実際には Context に toggleIsTop のような関数を実装して呼ぶのが理想です
    }
    setOffsetX(0);
  };

  const innings = Array.from({ length: 9 }, (_, i) => i + 1);

  return (
    <div className="relative overflow-hidden bg-zinc-950 border-b border-white/10 select-none h-[110px]">
      
      {/* 🚀 背景：スライド時にのみ見える「サイド切替」のサイン */}
      <div className="absolute inset-0 flex items-center justify-between px-10 bg-primary/20">
        <ArrowLeftRight className="h-6 w-6 text-primary animate-pulse" />
        <span className="text-[10px] font-black uppercase text-primary tracking-[0.3em]">Switch Side</span>
        <ArrowLeftRight className="h-6 w-6 text-primary animate-pulse" />
      </div>

      {/* 🚀 前面：【完全復旧】RHE イニングスコアデザイン */}
      <div 
        className="absolute inset-0 z-10 bg-zinc-950 flex transition-transform duration-200 ease-out"
        style={{ transform: `translateX(${offsetX}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* メインのスコアグリッド */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* ヘッダー：イニング番号 1~9 */}
          <div className="h-7 grid grid-cols-[80px_1fr_80px] items-stretch border-b border-white/5">
            <div className="bg-zinc-900/50 flex items-center justify-center border-r border-white/5">
              <span className="text-[8px] font-black text-muted-foreground italic uppercase">Team</span>
            </div>
            <div className="grid grid-cols-9 items-center">
              {innings.map(i => (
                <div key={i} className="text-center border-r border-white/5 h-full flex items-center justify-center">
                  <span className={cn("text-[10px] font-black", state.inning === i ? "text-primary" : "text-muted-foreground/30")}>
                    {i}
                  </span>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-3 items-center bg-zinc-900/50">
              {['R', 'H', 'E'].map(l => (
                <div key={l} className="text-center text-[9px] font-black text-muted-foreground">{l}</div>
              ))}
            </div>
          </div>

          {/* Guest (先攻) 行 */}
          <div className={cn("flex-1 grid grid-cols-[80px_1fr_80px] items-stretch border-b border-white/5", state.isTop && "bg-primary/5")}>
            <div className="flex items-center px-3 gap-2 border-r border-white/5">
              <div className={cn("w-1.5 h-1.5 rounded-full", state.isTop ? "bg-primary animate-pulse" : "bg-transparent")} />
              <span className="text-[11px] font-black truncate">GUEST</span>
            </div>
            <div className="grid grid-cols-9 items-center">
              {innings.map((_, i) => (
                <div key={i} className="text-center border-r border-white/5 h-full flex items-center justify-center text-[11px] font-bold tabular-nums">
                  {state.myInningScores[i] ?? (state.inning > i + 1 || (state.inning === i + 1 && !state.isTop) ? "0" : "-")}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-3 items-center bg-zinc-900/30 text-center font-black text-[11px] tabular-nums">
              <div className="text-primary">{state.myScore}</div>
              <div className="opacity-40">0</div>
              <div className="opacity-40">0</div>
            </div>
          </div>

          {/* Home (後攻) 行 */}
          <div className={cn("flex-1 grid grid-cols-[80px_1fr_80px] items-stretch", !state.isTop && "bg-primary/5")}>
            <div className="flex items-center px-3 gap-2 border-r border-white/5">
              <div className={cn("w-1.5 h-1.5 rounded-full", !state.isTop ? "bg-primary animate-pulse" : "bg-transparent")} />
              <span className="text-[11px] font-black truncate">HOME</span>
            </div>
            <div className="grid grid-cols-9 items-center">
              {innings.map((_, i) => (
                <div key={i} className="text-center border-r border-white/5 h-full flex items-center justify-center text-[11px] font-bold tabular-nums">
                  {state.opponentInningScores[i] ?? (state.inning > i + 1 ? "0" : "-")}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-3 items-center bg-zinc-900/30 text-center font-black text-[11px] tabular-nums">
              <div className="text-primary">{state.opponentScore}</div>
              <div className="opacity-40">0</div>
              <div className="opacity-40">0</div>
            </div>
          </div>
        </div>

        {/* BSO カウント：斜体を廃止し、フォントウェイトを font-black で統一 */}
        <div className="w-[110px] flex flex-col justify-center gap-1.5 px-4 bg-zinc-900 shadow-[-10px_0_20px_rgba(0,0,0,0.5)]">
          <div className="flex items-center gap-2">
            <span className="text-lg font-black w-3 text-emerald-500 leading-none">B</span>
            <div className="flex gap-1">
              {[1, 2, 3].map(i => (
                <div key={i} className={cn("w-2.5 h-2.5 rounded-full border", i <= state.balls ? "bg-emerald-500 border-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-zinc-800 border-zinc-700")} />
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-black w-3 text-amber-400 leading-none">S</span>
            <div className="flex gap-1">
              {[1, 2].map(i => (
                <div key={i} className={cn("w-2.5 h-2.5 rounded-full border", i <= state.strikes ? "bg-amber-400 border-amber-200 shadow-[0_0_8px_rgba(251,191,36,0.5)]" : "bg-zinc-800 border-zinc-700")} />
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-black w-3 text-rose-500 leading-none">O</span>
            <div className="flex gap-1">
              {[1, 2].map(i => (
                <div key={i} className={cn("w-2.5 h-2.5 rounded-full border", i <= state.outs ? "bg-rose-500 border-rose-300 shadow-[0_0_8px_rgba(244,63,94,0.5)]" : "bg-zinc-800 border-zinc-700")} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
