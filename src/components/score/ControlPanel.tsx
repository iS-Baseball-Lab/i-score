// filepath: `src/components/score/ControlPanel.tsx`
import { useEffect } from "react";
import { useScore } from "@/contexts/ScoreContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ControlPanel() {
  const { state, recordPitch, recordInPlay, changeInning } = useScore();

  // 🌟 FAB強制非表示
  useEffect(() => {
    const className = "hide-global-fab";
    document.body.classList.add(className);
    return () => document.body.classList.remove(className);
  }, []);

  return (
    <div className="h-full flex flex-col gap-2 p-1 bg-background select-none">
      
      {/* 🚀 1段目：BSO入力（ボタン自体の色とドットの視認性を極限まで強化） */}
      <div className="grid grid-cols-3 gap-2 h-[45%]">
        {/* Ball */}
        <Button 
          onClick={() => recordPitch("ball")}
          className="h-full flex flex-col items-center justify-between py-4 bg-zinc-100 dark:bg-zinc-900 border-2 border-amber-600/20 rounded-3xl active:bg-amber-600 active:text-white transition-all shadow-sm"
        >
          <div className="flex gap-2">
            {[1, 2, 3].map(i => (
              <div key={i} className={cn(
                "w-4 h-4 rounded-full border-2",
                i <= state.balls ? "bg-amber-500 border-amber-400 shadow-[0_0_12px_#f59e0b]" : "bg-transparent border-zinc-300 dark:border-zinc-700"
              )} />
            )}
          </div>
          <span className="text-3xl font-black italic tracking-tighter">B</span>
          <span className="text-[10px] font-black opacity-50">BALL</span>
        </Button>

        {/* Strike */}
        <Button 
          onClick={() => recordPitch("strike")}
          className="h-full flex flex-col items-center justify-between py-4 bg-zinc-100 dark:bg-zinc-900 border-2 border-blue-600/20 rounded-3xl active:bg-blue-600 active:text-white transition-all shadow-sm"
        >
          <div className="flex gap-2">
            {[1, 2].map(i => (
              <div key={i} className={cn(
                "w-4 h-4 rounded-full border-2",
                i <= state.strikes ? "bg-blue-500 border-blue-400 shadow-[0_0_12px_#3b82f6]" : "bg-transparent border-zinc-300 dark:border-zinc-700"
              )} />
            )}
          </div>
          <span className="text-3xl font-black italic tracking-tighter">S</span>
          <span className="text-[10px] font-black opacity-50">STRIKE</span>
        </Button>

        {/* Out */}
        <Button 
          onClick={() => recordPitch("in_play")} // 暫定的にアウトカウント追加
          className="h-full flex flex-col items-center justify-between py-4 bg-zinc-100 dark:bg-zinc-900 border-2 border-rose-600/20 rounded-3xl active:bg-rose-600 active:text-white transition-all shadow-sm"
        >
          <div className="flex gap-2">
            {[1, 2].map(i => (
              <div key={i} className={cn(
                "w-4 h-4 rounded-full border-2",
                i <= state.outs ? "bg-rose-500 border-rose-400 shadow-[0_0_12px_#f43f5e]" : "bg-transparent border-zinc-300 dark:border-zinc-700"
              )} />
            )}
          </div>
          <span className="text-3xl font-black italic tracking-tighter">O</span>
          <span className="text-[10px] font-black opacity-50">OUT</span>
        </Button>
      </div>

      {/* 🚀 2段目：打球結果（HITを最大化） */}
      <div className="grid grid-cols-4 gap-2 h-[35%]">
        <Button 
          onClick={() => recordInPlay("単打", 0, [])}
          className="col-span-2 h-full bg-zinc-900 dark:bg-white dark:text-black text-white rounded-3xl flex flex-col items-center justify-center active:scale-95 transition-transform"
        >
          <span className="text-2xl font-black italic">HIT</span>
          <span className="text-[9px] font-black opacity-50">SINGLE</span>
        </Button>

        <Button 
          onClick={() => recordInPlay("得点", 1, [])}
          className="col-span-2 h-full bg-emerald-600 text-white rounded-3xl flex flex-col items-center justify-center active:scale-95 transition-transform"
        >
          <span className="text-xl font-black italic">SCORE</span>
          <span className="text-lg font-black">+1</span>
        </Button>
      </div>

      {/* 🚀 3段目：チェンジ・その他 */}
      <div className="flex-1 grid grid-cols-4 gap-2">
        <Button variant="outline" className="h-full rounded-2xl text-[10px] font-black">Foul</Button>
        <Button variant="outline" className="h-full rounded-2xl text-[10px] font-black">Error</Button>
        <Button 
          onClick={changeInning} 
          className="col-span-2 h-full bg-zinc-100 dark:bg-zinc-800 rounded-2xl text-[10px] font-black uppercase tracking-widest"
        >
          Change
        </Button>
      </div>
    </div>
  );
}
