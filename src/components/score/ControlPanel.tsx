// filepath: `src/components/score/ControlPanel.tsx`
import { useScore } from "@/contexts/ScoreContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ControlPanel() {
  const { state, recordPitch, recordInPlay, changeInning } = useScore();

  return (
    <div className="h-full flex flex-col gap-2 p-1 bg-background">
      
      {/* 🚀 1段目：BSO入力（ここがメイン！） */}
      <div className="grid grid-cols-3 gap-2 h-1/3">
        {/* Ball ボタン */}
        <Button 
          onClick={() => recordPitch("ball")}
          className="h-full flex flex-col items-center justify-between py-2 bg-amber-600/10 border-2 border-amber-600/30 text-amber-600 rounded-2xl active:bg-amber-600 active:text-white"
        >
          <span className="text-[10px] font-black tracking-[0.2em]">BALL</span>
          <div className="flex gap-1.5">
            {[1, 2, 3].map(i => (
              <div key={i} className={cn("w-3.5 h-3.5 rounded-full border border-amber-600/30", i <= state.balls ? "bg-amber-500 shadow-[0_0_8px_#f59e0b]" : "bg-transparent")} />
            ))}
          </div>
          <span className="text-xl font-black italic">B</span>
        </Button>

        {/* Strike ボタン */}
        <Button 
          onClick={() => recordPitch("strike")}
          className="h-full flex flex-col items-center justify-between py-2 bg-blue-600/10 border-2 border-blue-600/30 text-blue-600 rounded-2xl active:bg-blue-600 active:text-white"
        >
          <span className="text-[10px] font-black tracking-[0.2em]">STRIKE</span>
          <div className="flex gap-1.5">
            {[1, 2].map(i => (
              <div key={i} className={cn("w-3.5 h-3.5 rounded-full border border-blue-600/30", i <= state.strikes ? "bg-blue-500 shadow-[0_0_8px_#3b82f6]" : "bg-transparent")} />
            ))}
          </div>
          <span className="text-xl font-black italic">S</span>
        </Button>

        {/* Out ボタン */}
        <Button 
          onClick={() => recordPitch("in_play")} // ここでは「打球結果入力へ」のトリガー等
          className="h-full flex flex-col items-center justify-between py-2 bg-rose-600/10 border-2 border-rose-600/30 text-rose-600 rounded-2xl active:bg-rose-600 active:text-white"
        >
          <span className="text-[10px] font-black tracking-[0.2em]">OUT</span>
          <div className="flex gap-1.5">
            {[1, 2].map(i => (
              <div key={i} className={cn("w-3.5 h-3.5 rounded-full border border-rose-600/30", i <= state.outs ? "bg-rose-500 shadow-[0_0_8px_#f43f5e]" : "bg-transparent")} />
            ))}
          </div>
          <span className="text-xl font-black italic">O</span>
        </Button>
      </div>

      {/* 🚀 2段目：打球結果（BSOのすぐ下に配置） */}
      <div className="grid grid-cols-4 gap-2 flex-1">
        <Button 
          onClick={() => recordInPlay("単打", 0, [])}
          className="col-span-2 h-full bg-zinc-900 text-white rounded-xl flex flex-col items-center justify-center border border-zinc-700"
        >
          <span className="text-lg font-black italic">HIT</span>
          <span className="text-[8px] font-bold opacity-50 uppercase">Single / Advance</span>
        </Button>

        <Button 
          onClick={() => recordInPlay("得点", 1, [])}
          className="col-span-2 h-full bg-emerald-600 text-white rounded-xl flex flex-col items-center justify-center shadow-lg"
        >
          <span className="text-lg font-black italic">SCORE +1</span>
          <span className="text-[8px] font-bold opacity-70 uppercase">Home In / RBI</span>
        </Button>
      </div>

      {/* 🚀 3段目：特殊・チェンジ */}
      <div className="grid grid-cols-3 gap-2 h-[18%]">
        <Button variant="outline" className="text-[10px] font-black rounded-lg border-2">Foul</Button>
        <Button variant="outline" className="text-[10px] font-black rounded-lg border-2">Bunt</Button>
        <Button onClick={changeInning} className="bg-zinc-200 dark:bg-zinc-800 text-[10px] font-black rounded-lg uppercase tracking-widest">Change</Button>
      </div>
    </div>
  );
}
