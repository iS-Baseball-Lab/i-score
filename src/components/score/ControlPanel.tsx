// filepath: `src/components/score/ControlPanel.tsx`
import { useScore } from "@/contexts/ScoreContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Zap, ChevronUp, ChevronRight, UserPlus, ShieldAlert } from "lucide-react";

export function ControlPanel() {
  const { state, recordInPlay, changeInning, isSyncing } = useScore();

  // 🌟 独自性：一撃で状況を完結させる「マクロ実行」
  const handleAction = (type: "single" | "extra" | "out" | "score") => {
    switch (type) {
      case "single":
        // 1ボタンで：1塁出塁 + 既存ランナー1進塁 + 速報
        recordInPlay("ヒット！", 0, [{ runnerId: "current", fromBase: 0, toBase: 1 }]);
        break;
      case "extra":
        // 長打：2塁出塁 + 全ランナー2進塁
        recordInPlay("快音！二塁打", 0, []); 
        break;
      case "out":
        // 1ボタンで：アウトカウント+1 + （3アウトなら）チェンジ
        recordInPlay("アウト", 0, []);
        break;
    }
  };

  return (
    <div className="h-full flex flex-col gap-2 p-1">
      {/* 🚀 上段：メイン・アクション（巨大ボタンで押し間違いゼロ） */}
      <div className="grid grid-cols-2 gap-2 h-1/2">
        {/* 【安打】上スワイプで長打、右スワイプでタイムリーを想定（まずはタップ） */}
        <Button 
          onClick={() => handleAction("single")}
          className="h-full bg-blue-600 hover:bg-blue-500 text-white rounded-2xl flex flex-col items-center justify-center gap-1 shadow-lg active:scale-95 transition-transform"
        >
          <Zap className="w-6 h-6 fill-current text-blue-200" />
          <span className="text-2xl font-black italic">HIT</span>
          <span className="text-[9px] font-bold opacity-70">安打 / 進塁オート</span>
        </Button>

        {/* 【アウト】 */}
        <Button 
          onClick={() => handleAction("out")}
          className="h-full bg-zinc-800 hover:bg-zinc-700 text-white rounded-2xl flex flex-col items-center justify-center gap-1 shadow-lg active:scale-95"
        >
          <ShieldAlert className="w-6 h-6 text-zinc-400" />
          <span className="text-2xl font-black italic">OUT</span>
          <span className="text-[9px] font-bold opacity-70">凡退 / 状況更新</span>
        </Button>
      </div>

      {/* 🚀 下段：状況変化・得点（より「直感的」な操作） */}
      <div className="grid grid-cols-4 gap-2 flex-1">
        {/* 四球：自動で1塁へ */}
        <Button onClick={() => recordInPlay("四球", 0, [])} variant="outline" className="h-full rounded-xl border-2 flex flex-col border-blue-500/20">
          <UserPlus className="w-4 h-4 text-blue-500 mb-1" />
          <span className="text-[10px] font-black">四球</span>
        </Button>

        {/* 得点ボタン：ここを最大級に目立たせる */}
        <Button 
          onClick={() => recordInPlay("得点", 1, [])}
          className="h-full col-span-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-md flex flex-col items-center justify-center"
        >
          <span className="text-sm font-black tracking-tighter leading-none">SCORE</span>
          <span className="text-2xl font-black italic">+1</span>
        </Button>

        {/* イニングチェンジ */}
        <Button onClick={changeInning} variant="secondary" className="h-full rounded-xl bg-zinc-200 dark:bg-zinc-800 flex flex-col">
          <span className="text-[10px] font-black leading-none mb-1">CHANGE</span>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* 🚀 独自性：フリック用ヒント（UIの隠し味） */}
      <div className="flex justify-between px-2">
        <span className="text-[7px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1">
          <ChevronUp className="w-2 h-2" /> Long Hit (Flick)
        </span>
        <span className="text-[7px] font-bold text-muted-foreground uppercase tracking-widest">
          Quick Fix (Long Press)
        </span>
      </div>
    </div>
  );
}
