// filepath: `src/components/score/Scoreboard.tsx`
/* 💡 現場視点：BSO・イニングのフォントを統一し、直感的なスライド操作で攻守交代を呼び出す。 */

"use client";

import { useState } from "react";
import { useScore } from "@/contexts/ScoreContext";
import { cn } from "@/lib/utils";
import { ChevronRight, RefreshCw } from "lucide-react";

export function Scoreboard() {
  const { state, changeInning } = useScore();
  const [offsetX, setOffsetX] = useState(0);

  // 💡 スライド操作の簡易実装（左にスライドすると交代ボタンが出現）
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (offsetX < -80) {
      // 80px以上スライドしたら交代（またはパネル固定）
    }
    setOffsetX(0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    const move = touch.clientX - (e.currentTarget as any)._startX;
    if (move < 0) setOffsetX(Math.max(move, -120)); // 最大120pxまでスライド
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    (e.currentTarget as any)._startX = e.touches[0].clientX;
  };

  return (
    <div className="relative overflow-hidden rounded-[32px] bg-zinc-950 shadow-2xl border border-white/10 h-[100px]">
      
      {/* 🚀 スライドするメインコンテンツ層 */}
      <div 
        className="absolute inset-0 flex transition-transform duration-300 ease-out z-10 bg-zinc-950"
        style={{ transform: `translateX(${offsetX}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* TEAM & SCORE */}
        <div className="flex-1 grid grid-cols-2 px-6 py-2">
          {/* Guest (Top) */}
          <div className={cn("flex flex-col justify-center", state.isTop && "border-l-4 border-primary pl-3")}>
            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Guest</span>
            <span className="text-3xl font-black tabular-nums leading-none">{state.myScore}</span>
          </div>
          {/* Home (Bottom) */}
          <div className={cn("flex flex-col justify-center items-end", !state.isTop && "border-r-4 border-primary pr-3")}>
            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest text-right">Home</span>
            <span className="text-3xl font-black tabular-nums leading-none">{state.opponentScore}</span>
          </div>
        </div>

        {/* ⚾️ INNING & BSO (フォント統一版) */}
        <div className="flex items-center gap-6 px-8 border-l border-white/5 bg-zinc-900/50">
          {/* INNING */}
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-black text-zinc-500 uppercase">Inning</span>
            <div className="flex items-baseline gap-0.5">
              <span className="text-3xl font-black tabular-nums">{state.inning}</span>
              <span className="text-xl font-black">{state.isTop ? "T" : "B"}</span>
            </div>
          </div>

          {/* BSO */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xl font-black w-4 text-emerald-500 leading-none">B</span>
              <div className="flex gap-1.5">
                {[1, 2, 3].map(i => (
                  <div key={i} className={cn("w-3 h-3 rounded-full border-2", i <= state.balls ? "bg-emerald-500 border-emerald-300 shadow-[0_0_10px_#10b981]" : "bg-zinc-800 border-zinc-700")} />
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black w-4 text-amber-400 leading-none">S</span>
              <div className="flex gap-1.5">
                {[1, 2].map(i => (
                  <div key={i} className={cn("w-3 h-3 rounded-full border-2", i <= state.strikes ? "bg-amber-400 border-amber-200 shadow-[0_0_10px_#fbbf24]" : "bg-zinc-800 border-zinc-700")} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* スライドを促すインジケーター */}
        <div className="flex items-center px-2 text-zinc-700">
          <ChevronRight className="h-4 w-4 animate-pulse" />
        </div>
      </div>

      {/* 🚀 背後に隠れている「交代ボタン」層 */}
      <button 
        onClick={() => {
          changeInning();
          setOffsetX(0);
        }}
        className="absolute right-0 top-0 bottom-0 w-[120px] bg-primary text-primary-foreground flex flex-col items-center justify-center gap-1 active:bg-primary/90"
      >
        <RefreshCw className="h-6 w-6" />
        <span className="text-[10px] font-black uppercase tracking-tighter">Change Inning</span>
      </button>

    </div>
  );
}
