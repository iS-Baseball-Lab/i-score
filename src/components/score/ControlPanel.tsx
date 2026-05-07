// filepath: `src/components/score/ControlPanel.tsx`
"use client";

import { useEffect } from "react";
import { useScore } from "@/contexts/ScoreContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ControlPanel() {
  const { state, recordPitch, recordInPlay, changeInning, isSyncing } = useScore();

  // 🌟 FAB（フローティングボタン）を強制非表示にするクラス制御
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
    // 💡 h-full w-full で親の footer (32dvh) をすべて使い切る
    <div className="h-full w-full flex flex-col gap-2 p-0 select-none items-stretch">
      
      {/* 🚀 1段目：BSO（Footerの約45%を占拠する巨大ボタン） */}
      <div className="grid grid-cols-3 gap-2 h-[45%] shrink-0">
        {/* Ball */}
        <button 
          type="button"
          onClick={() => recordPitch("ball")}
          disabled={isSyncing}
          className="h-full w-full flex flex-col items-center justify-center gap-2 bg-zinc-100 dark:bg-zinc-900 border-2 border-amber-600/30 rounded-[32px] active:bg-amber-600 active:text-white transition-all disabled:opacity-50 shadow-sm"
        >
          <div className="flex gap-2">
            {[1, 2, 3].map(i => (
              <div key={i} className={cn(
                "w-4 h-4 rounded-full border-2",
                i <= state.balls ? "bg-amber-500 border-amber-400 shadow-[0_0_15px_#f59e0b]" : "bg-transparent border-zinc-300 dark:border-zinc-700"
              )} />
            ))}
          </div>
          <span className="text-4xl font-black italic leading-none">B</span>
          <span className="text-[10px] font-black opacity-40 tracking-widest uppercase">Ball</span>
        </button>

        {/* Strike */}
        <button 
          type="button"
          onClick={() => recordPitch("strike")}
          disabled={isSyncing}
          className="h-full w-full flex flex-col items-center justify-center gap-2 bg-zinc-100 dark:bg-zinc-900 border-2 border-blue-600/30 rounded-[32px] active:bg-blue-600 active:text-white transition-all disabled:opacity-50 shadow-sm"
        >
          <div className="flex gap-2">
            {[1, 2].map(i => (
              <div key={i} className={cn(
                "w-4 h-4 rounded-full border-2",
                i <= state.strikes ? "bg-blue-500 border-blue-400 shadow-[0_0_15px_#3b82f6]" : "bg-transparent border-zinc-300 dark:border-zinc-700"
              )} />
            ))}
          </div>
          <span className="text-4xl font-black italic leading-none">S</span>
          <span className="text-[10px] font-black opacity-40 tracking-widest uppercase">Strike</span>
        </button>

        {/* Out */}
        <button 
          type="button"
          onClick={() => recordPitch("in_play")} 
          disabled={isSyncing}
          className="h-full w-full flex flex-col items-center justify-center gap-2 bg-zinc-100 dark:bg-zinc-900 border-2 border-rose-600/30 rounded-[32px] active:bg-rose-600 active:text-white transition-all disabled:opacity-50 shadow-sm"
        >
          <div className="flex gap-2">
            {[1, 2].map(i => (
              <div key={i} className={cn(
                "w-4 h-4 rounded-full border-2",
                i <= state.outs ? "bg-rose-500 border-rose-400 shadow-[0_0_15px_#f43f5e]" : "bg-transparent border-zinc-300 dark:border-zinc-700"
              )} />
            ))}
          </div>
          <span className="text-4xl font-black italic leading-none">O</span>
          <span className="text-[10px] font-black opacity-40 tracking-widest uppercase">Out</span>
        </button>
      </div>

      {/* 🚀 2段目：打球結果（HIT & SCORE を巨大化） */}
      <div className="grid grid-cols-4 gap-2 h-[35%] shrink-0">
        <button 
          type="button"
          onClick={() => recordInPlay("単打", 0, [])}
          disabled={isSyncing}
          className="col-span-2 h-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black rounded-[28px] flex flex-col items-center justify-center active:scale-95 transition-all disabled:opacity-50"
        >
          <span className="text-3xl font-black italic">HIT</span>
          <span className="text-[10px] font-black opacity-40 uppercase">Single / Advance</span>
        </button>

        <button 
          type="button"
          onClick={() => recordInPlay("得点", 1, [])}
          disabled={isSyncing}
          className="col-span-2 h-full bg-emerald-600 text-white rounded-[28px] flex flex-col items-center justify-center active:scale-95 transition-all disabled:opacity-50 shadow-lg"
        >
          <span className="text-2xl font-black italic leading-none">SCORE</span>
          <span className="text-3xl font-black mt-1">+1</span>
        </button>
      </div>

      {/* 🚀 3段目：チェンジ・特殊（残りのスペースを埋め尽くす） */}
      <div className="flex-1 grid grid-cols-4 gap-2 min-h-0">
        <button 
          onClick={() => recordInPlay("ファウル", 0, [])}
          className="h-full rounded-2xl border-2 border-zinc-300 dark:border-zinc-700 font-black text-[10px] uppercase"
        >
          Foul
        </button>
        <button 
          onClick={() => recordInPlay("エラー", 0, [])}
          className="h-full rounded-2xl border-2 border-zinc-300 dark:border-zinc-700 font-black text-[10px] uppercase"
        >
          Error
        </button>
        <button 
          onClick={changeInning} 
          disabled={isSyncing}
          className="col-span-2 h-full bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-2xl text-[12px] font-black uppercase tracking-[0.3em] disabled:opacity-50"
        >
          Change
        </button>
      </div>
    </div>
  );
}
