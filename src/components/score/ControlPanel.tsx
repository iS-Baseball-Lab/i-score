// filepath: `src/components/score/ControlPanel.tsx`
import { useEffect } from "react";
import { useScore } from "@/contexts/ScoreContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ControlPanel() {
  const { state, recordPitch, recordInPlay, changeInning } = useScore();

  // 🌟 独自性：このコンポーネントがマウントされている間、
  // アプリ全体のフローティングボタンを強制非表示にする
  useEffect(() => {
    const fab = document.getElementById("global-fab"); // FABのIDを想定
    if (fab) fab.style.display = "none";
    return () => {
      if (fab) fab.style.display = "flex";
    };
  }, []);

  return (
    <div className="h-full flex flex-col gap-2 p-1 bg-background select-none">
      
      {/* 🚀 1段目：BSO入力（ボタン内のドットをより強調） */}
      <div className="grid grid-cols-3 gap-2 h-[42%]">
        {/* Ball */}
        <Button 
          onClick={() => recordPitch("ball")}
          className="h-full flex flex-col items-center justify-around py-3 bg-zinc-100 dark:bg-zinc-900 border-b-4 border-amber-600 rounded-2xl active:translate-y-1 active:border-b-0 transition-all shadow-md"
        >
          <span className="text-[10px] font-black text-amber-600 tracking-widest">BALL</span>
          <div className="flex gap-2">
            {[1, 2, 3].map(i => (
              <div key={i} className={cn(
                "w-4 h-4 rounded-full border-2 transition-all duration-200",
                i <= state.balls 
                  ? "bg-amber-500 border-amber-400 shadow-[0_0_12px_#f59e0b]" 
                  : "bg-transparent border-zinc-300 dark:border-zinc-700"
              )} />
            ))}
          </div>
          <span className="text-2xl font-black italic text-zinc-800 dark:text-zinc-100">B</span>
        </Button>

        {/* Strike */}
        <Button 
          onClick={() => recordPitch("strike")}
          className="h-full flex flex-col items-center justify-around py-3 bg-zinc-100 dark:bg-zinc-900 border-b-4 border-blue-600 rounded-2xl active:translate-y-1 active:border-b-0 transition-all shadow-md"
        >
          <span className="text-[10px] font-black text-blue-600 tracking-widest">STRIKE</span>
          <div className="flex gap-2">
            {[1, 2].map(i => (
              <div key={i} className={cn(
                "w-4 h-4 rounded-full border-2 transition-all duration-200",
                i <= state.strikes 
                  ? "bg-blue-500 border-blue-400 shadow-[0_0_12px_#3b82f6]" 
                  : "bg-transparent border-zinc-300 dark:border-zinc-700"
              )} />
            ))}
          </div>
          <span className="text-2xl font-black italic text-zinc-800 dark:text-zinc-100">S</span>
        </Button>

        {/* Out */}
        <Button 
          onClick={() => recordPitch("out")} // マニュアルでのアウト追加用
          className="h-full flex flex-col items-center justify-around py-3 bg-zinc-100 dark:bg-zinc-900 border-b-4 border-rose-600 rounded-2xl active:translate-y-1 active:border-b-0 transition-all shadow-md"
        >
          <span className="text-[10px] font-black text-rose-600 tracking-widest">OUT</span>
          <div className="flex gap-2">
            {[1, 2].map(i => (
              <div key={i} className={cn(
                "w-4 h-4 rounded-full border-2 transition-all duration-200",
                i <= state.outs 
                  ? "bg-rose-500 border-rose-400 shadow-[0_0_12px_#f43f5e]" 
                  : "bg-transparent border-zinc-300 dark:border-zinc-700"
              )} />
            ))}
          </div>
          <span className="text-2xl font-black italic text-zinc-800 dark:text-zinc-100">O</span>
        </Button>
      </div>

      {/* 🚀 2段目：打球結果（より大きな「HIT」を配置） */}
      <div className="grid grid-cols-4 gap-2 flex-1">
        <Button 
          onClick={() => recordInPlay("単打", 0, [])}
          className="col-span-2 h-full bg-blue-600 hover:bg-blue-500 text-white rounded-2xl flex flex-col items-center justify-center shadow-lg active:scale-95"
        >
          <span className="text-2xl font-black italic tracking-tighter">HIT</span>
          <span className="text-[8px] font-black opacity-70 uppercase tracking-[0.2em]">Single</span>
        </Button>

        <Button 
          onClick={() => recordInPlay("得点", 1, [])}
          className="col-span-2 h-full bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl flex flex-col items-center justify-center shadow-lg active:scale-95"
        >
          <span className="text-xl font-black italic tracking-tighter leading-none">SCORE</span>
          <span className="text-sm font-black mt-1">+1 pt</span>
        </Button>
      </div>

      {/* 🚀 3段目：チェンジ（誤操作防止のため、ここだけ少し質感を分ける） */}
      <div className="grid grid-cols-4 gap-2 h-[15%]">
        <Button variant="outline" className="text-[10px] font-black rounded-xl">Foul</Button>
        <Button variant="outline" className="text-[10px] font-black rounded-xl">Error</Button>
        <Button 
          onClick={changeInning} 
          className="col-span-2 bg-zinc-800 dark:bg-zinc-200 dark:text-zinc-900 text-white text-[10px] font-black rounded-xl uppercase tracking-[0.3em]"
        >
          Change
        </Button>
      </div>
    </div>
  );
}
