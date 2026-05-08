// filepath: `src/components/score/Scoreboard.tsx`
"use client";

import { useScore } from "@/contexts/ScoreContext";
import { cn } from "@/lib/utils";

export function Scoreboard() {
  const { state } = useScore();

  return (
    <div className="w-full bg-zinc-950 text-white p-4 shadow-2xl border-b border-zinc-800">
      <div className="max-w-md mx-auto flex flex-col gap-4">
        
        {/* --- 上段：イニングと得点 --- */}
        <div className="flex justify-between items-center px-2">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Inning</span>
            <span className="text-2xl font-black italic italic">
              {state.inning}
              <span className="text-sm ml-1">{state.isTop ? "▲" : "▼"}</span>
            </span>
          </div>
          
          <div className="flex gap-8 items-center bg-zinc-900 px-6 py-2 rounded-2xl border border-zinc-800">
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-black text-zinc-500 uppercase">Guest</span>
              <span className="text-3xl font-black tabular-nums">{state.guestScore}</span>
            </div>
            <div className="text-zinc-700 font-black text-xl">:</div>
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-black text-zinc-500 uppercase">Home</span>
              <span className="text-3xl font-black tabular-nums">{state.homeScore}</span>
            </div>
          </div>
        </div>

        {/* --- 下段：BSOインジケーター (日本式カラー) --- */}
        <div className="flex flex-col gap-2 bg-black/40 p-3 rounded-xl border border-white/5">
          
          {/* Ball (Green) */}
          <div className="flex items-center gap-3">
            <span className="w-4 text-sm font-black italic text-emerald-500">B</span>
            <div className="flex gap-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={cn(
                    "w-4 h-4 rounded-full border-2 transition-all duration-300",
                    i <= state.balls 
                      ? "bg-emerald-500 border-emerald-400 shadow-[0_0_12px_#10b981]" // 🌟 緑に発光
                      : "bg-zinc-900 border-zinc-800"
                  )}
                />
              ))}
            </div>
          </div>

          {/* Strike (Yellow) */}
          <div className="flex items-center gap-3">
            <span className="w-4 text-sm font-black italic text-amber-400">S</span>
            <div className="flex gap-2">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className={cn(
                    "w-4 h-4 rounded-full border-2 transition-all duration-300",
                    i <= state.strikes 
                      ? "bg-amber-400 border-amber-300 shadow-[0_0_12px_#fbbf24]" // 🌟 黄に発光
                      : "bg-zinc-900 border-zinc-800"
                  )}
                />
              ))}
            </div>
          </div>

          {/* Out (Red) */}
          <div className="flex items-center gap-3">
            <span className="w-4 text-sm font-black italic text-rose-500">O</span>
            <div className="flex gap-2">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className={cn(
                    "w-4 h-4 rounded-full border-2 transition-all duration-300",
                    i <= state.outs 
                      ? "bg-rose-600 border-rose-500 shadow-[0_0_12px_#f43f5e]" // 🌟 赤に発光
                      : "bg-zinc-900 border-zinc-800"
                  )}
                />
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
