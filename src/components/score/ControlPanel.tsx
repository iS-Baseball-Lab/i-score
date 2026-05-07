// filepath: `src/components/score/ControlPanel.tsx`
"use client";

import { useEffect } from "react";
import { useScore } from "@/contexts/ScoreContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ControlPanel() {
  // 🌟 useScore から必要な機能をすべて引き出す
  const { state, recordPitch, recordInPlay, changeInning, isSyncing } = useScore();

  // 🌟 FAB強制非表示（ブラウザ環境でのみ実行されるよう useEffect で完結）
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
    <div className="h-full flex flex-col gap-2 p-1 bg-background select-none">
      
      {/* 🚀 1段目：BSO（ボタン自体がインジケーター） */}
      <div className="grid grid-cols-3 gap-2 h-[45%]">
        {/* Ball */}
        <button 
          type="button"
          onClick={() => recordPitch("ball")}
          disabled={isSyncing}
          className="h-full flex flex-col items-center justify-between py-4 bg-zinc-100 dark:bg-zinc-900 border-2 border-amber-600/20 rounded-3xl active:bg-amber-600 active:text-white transition-all shadow-sm disabled:opacity-50"
        >
          <div className="flex gap-2">
            {[1, 2, 3].map(i => (
              <div key={i} className={cn(
                "w-4 h-4 rounded-full border-2",
                i <= state.balls ? "bg-amber-500 border-amber-400 shadow-[0_0_12px_#f59e0b]" : "bg-transparent border-zinc-300 dark:border-zinc-700"
              )} />
            ))}
          </div>
          <span className="text-4xl font-black italic tracking-tighter">B</span>
          <span className="text-[10px] font-black opacity-40">BALL</span>
        </button>

        {/* Strike */}
        <button 
          type="button"
          onClick={() => recordPitch("strike")}
          disabled={isSyncing}
          className="h-full flex flex-col items-center justify-between py-4 bg-zinc-100 dark:bg-zinc-900 border-2 border-blue-600/20 rounded-3xl active:bg-blue-600 active:text-white transition-all shadow-sm disabled:opacity-50"
        >
          <div className="flex gap-2">
            {[1, 2].map(i => (
              <div key={i} className={cn(
                "w-4 h-4 rounded-full border-2",
                i <= state.strikes ? "bg-blue-500 border-blue-400 shadow-[0_0_12px_#3b82f6]" : "bg-transparent border-zinc-300 dark:border-zinc-700"
              )} />
            ))}
          </div>
          <span className="text-4xl font-black italic tracking-tighter">S</span>
          <span className="text-[10px] font-black opacity-40">STRIKE</span>
        </button>

        {/* Out */}
        <button 
          type="button"
          onClick={() => recordPitch("in_play")} 
          disabled={isSyncing}
          className="h-full flex flex-col items-center justify-between py-4 bg-zinc-100 dark:bg-zinc-900 border-2 border-rose-600/20 rounded-3xl active:bg-rose-600 active:text-white transition-all shadow-sm disabled:opacity-50"
        >
          <div className="flex gap-2">
            {[1, 2].map(i => (
              <div key={i} className={cn(
                "w-4 h-4 rounded-full border-2",
                i <= state.outs ? "bg-rose-500 border-rose-400 shadow-[0_0_12px_#f43f5e]" : "bg-transparent border-zinc-300 dark:border-zinc-700"
              )} />
            ))}
          </div>
          <span className="text-4xl font-black italic tracking-tighter">O</span>
          <span className="text-[10px] font-black opacity-40">OUT</span>
        </button>
      </div>

      {/* 🚀 2段目：打球結果（HITを最大化） */}
      <div className="grid grid-cols-4 gap-2 h-[35%]">
        <button 
          type="button"
          onClick={() => recordInPlay("単打", 0, [])}
          disabled={isSyncing}
          className="col-span-2 h-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black rounded-3xl flex flex-col items-center justify-center active:scale-95 transition-transform disabled:opacity-50"
        >
          <span className="text-2xl font-black italic">HIT</span>
          <span className="text-[9px] font-black opacity-50">SINGLE</span>
        </button>

        <button 
          type="button"
          onClick={() => recordInPlay("得点", 1, [])}
          disabled={isSyncing}
          className="col-span-2 h-full bg-emerald-600 text-white rounded-3xl flex flex-col items-center justify-center active:scale-95 transition-transform disabled:opacity-50"
        >
          <span className="text-xl font-black italic leading-none">SCORE</span>
          <span className="text-2xl font-black mt-0.5">+1</span>
        </button>
      </div>

      {/* 🚀 3段目：チェンジ・その他（微調整） */}
      <div className="flex-1 grid grid-cols-4 gap-2">
        <Button variant="outline" className="h-full rounded-2xl text-[10px] font-black" onClick={() => recordInPlay("ファウル", 0, [])}>Foul</Button>
        <Button variant="outline" className="h-full rounded-2xl text-[10px] font-black" onClick={() => recordInPlay("エラー", 0, [])}>Error</Button>
        <Button 
          onClick={changeInning} 
          disabled={isSyncing}
          className="col-span-2 h-full bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-2xl text-[10px] font-black uppercase tracking-widest disabled:opacity-50"
        >
          Change
        </Button>
      </div>
    </div>
  );
}
