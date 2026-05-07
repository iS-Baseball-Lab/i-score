// src/components/score/ControlPanel.tsx

import { useScore } from "@/contexts/ScoreContext";
import { Button } from "@/components/ui/button";
import { Loader2, Plus } from "lucide-react";

export function ControlPanel() {
  const { state, recordInPlay, isSyncing } = useScore();

  return (
    <div className="flex flex-col gap-4">
      {/* 🌟 状況に応じたクイックアクション */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {["単打", "二塁打", "本塁打", "犠飛", "エラー"].map((label) => (
          <Button
            key={label}
            variant="secondary"
            size="sm"
            className="rounded-full px-6 font-black italic text-[10px] shrink-0 border border-primary/20"
            onClick={() => recordInPlay(label, 0, [])} // 点数は後で調整
          >
            {label}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 h-24">
        {/* 🌟 巨大な得点ボタン：isSyncing で状態を表示 */}
        <Button 
          disabled={isSyncing}
          onClick={() => recordInPlay("適時打", 1, [])}
          className="h-full rounded-[30px] bg-emerald-600 relative overflow-hidden active:scale-95 transition-all shadow-lg shadow-emerald-900/20"
        >
          <div className="flex flex-col items-center">
            {isSyncing ? (
              <Loader2 className="w-8 h-8 animate-spin opacity-50" />
            ) : (
              <>
                <span className="text-[10px] font-black uppercase tracking-widest mb-1">Score +1</span>
                <Plus className="w-8 h-8" />
              </>
            )}
          </div>
        </Button>
        
        {/* ... 他のコントロール ... */}
      </div>
    </div>
  );
}
