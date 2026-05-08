// filepath: `src/components/score/ControlPanel.tsx`
"use client";

import { useEffect } from "react";
import { useScore } from "@/contexts/ScoreContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ControlPanel() {
  const { state, recordPitch, recordInPlay, changeInning, isSyncing } = useScore();

  useEffect(() => {
    const className = "hide-global-fab";
    if (typeof document !== "undefined") {
      document.body.classList.add(className);
    }
    return () => {
      if (typeof document !== "undefined") {
        document.body.classList.remove(className);
      }
    };
  }, []);

  return (
    <div className="h-full w-full flex flex-col gap-2 p-0 select-none items-stretch">
      
      {/* 🚀 1段目：BSO（枠線を太く、背景を薄く着色） */}
      <div className="grid grid-cols-3 gap-2 h-[46%] shrink-0">
        {/* Ball */}
        <button 
          type="button"
          onClick={() => recordPitch("ball")}
          disabled={isSyncing}
          className={cn(
            "h-full w-full flex flex-col items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-sm",
            "border-4 border-amber-600/40 bg-amber-50/50 dark:bg-amber-950/20", // 🌟 太枠線 & 薄い背景
            "active:bg-amber-600 active:text-white active:border-amber-400",
            "rounded-3xl" // 🌟 スタイルが反映される角丸設定
          )}
        >
          <div className="flex gap-2">
            {[1, 2, 3].map(i => (
              <div key={i} className={cn(
                "w-4 h-4 rounded-full border-2",
                i <= state.balls ? "bg-amber-500 border-amber-400 shadow-[0_0_15px_#f59e0b]" : "bg-transparent border-amber-600/20"
              )} />
            ))}
          </div>
          <span className="text-4xl font-black italic leading-none text-amber-700 dark:text-amber-500">B</span>
          <span className="text-[10px] font-black opacity-60 tracking-widest uppercase text-amber-700 dark:text-amber-500">Ball</span>
        </button>

        {/* Strike */}
        <button 
          type="button"
          onClick={() => recordPitch("strike")}
          disabled={isSyncing}
          className={cn(
            "h-full w-full flex flex-col items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-sm",
            "border-4 border-blue-600/40 bg-blue-50/50 dark:bg-blue-950/20", // 🌟 太枠線 & 薄い背景
            "active:bg-blue-600 active:text-white active:border-blue-400",
            "rounded-3xl"
          )}
        >
          <div className="flex gap-2">
            {[1, 2].map(i => (
              <div key={i} className={cn(
                "w-4 h-4 rounded-full border-2",
                i <= state.strikes ? "bg-blue-500 border-blue-400 shadow-[0_0_15px_#3b82f6]" : "bg-transparent border-blue-600/20"
              )} />
            ))}
          </div>
          <span className="text-4xl font-black italic leading-none text-blue-700 dark:text-blue-500">S</span>
          <span className="text-[10px] font-black opacity-60 tracking-widest uppercase text-blue-700 dark:text-blue-500">Strike</span>
        </button>

        {/* Out */}
        <button 
          type="button"
          onClick={() => recordPitch("out")} 
          disabled={isSyncing}
          className={cn(
            "h-full w-full flex flex-col items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-sm",
            "border-4 border-rose-600/40 bg-rose-50/50 dark:bg-rose-950/20", // 🌟 太枠線 & 薄い背景
            "active:bg-rose-600 active:text-white active:border-rose-400",
            "rounded-3xl"
          )}
        >
          <div className="flex gap-2">
            {[1, 2].map(i => (
              <div key={i} className={cn(
                "w-4 h-4 rounded-full border-2",
                i <= state.outs ? "bg-rose-500 border-rose-400 shadow-[0_0_15px_#f43f5e]" : "bg-transparent border-rose-600/20"
              )} />
            ))}
          </div>
          <span className="text-4xl font-black italic leading-none text-rose-700 dark:text-rose-500">O</span>
          <span className="text-[10px] font-black opacity-60 tracking-widest uppercase text-rose-700 dark:text-rose-500">Out</span>
        </button>
      </div>

      {/* 🚀 2段目：HIT & SCORE（より洗練された角丸と配色） */}
      <div className="grid grid-cols-4 gap-2 h-[35%] shrink-0">
        <button 
          type="button"
          onClick={() => recordInPlay("単打", 0, [{ runnerId: "current", fromBase: 0, toBase: 1 }])}
          className="col-span-2 h-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black rounded-3xl flex flex-col items-center justify-center active:scale-95 transition-all"
        >
          <span className="text-3xl font-black italic">HIT</span>
          <span className="text-[9px] font-black opacity-50 uppercase tracking-tighter">Single / Advance</span>
        </button>

        <button 
          type="button"
          onClick={() => recordInPlay("得点", 1, [])}
          className="col-span-2 h-full bg-emerald-600 text-white rounded-3xl flex flex-col items-center justify-center active:scale-95 transition-all shadow-lg border-b-4 border-emerald-800"
        >
          <span className="text-xl font-black italic leading-none">SCORE</span>
          <span className="text-3xl font-black mt-1">+1</span>
        </button>
      </div>

      {/* 🚀 3段目：Change 他（一回り小さくしてスペース効率化） */}
      <div className="flex-1 grid grid-cols-4 gap-2 min-h-0">
        <button className="h-full rounded-2xl border-2 border-zinc-200 dark:border-zinc-800 font-black text-[10px] text-muted-foreground active:bg-zinc-100">FOUL</button>
        <button className="h-full rounded-2xl border-2 border-zinc-200 dark:border-zinc-800 font-black text-[10px] text-muted-foreground active:bg-zinc-100">ERROR</button>
        <button 
          onClick={changeInning} 
          className="col-span-2 h-full bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-2xl text-[12px] font-black uppercase tracking-[0.3em] active:bg-zinc-300 dark:active:bg-zinc-700"
        >
          Change
        </button>
      </div>
    </div>
  );
}
