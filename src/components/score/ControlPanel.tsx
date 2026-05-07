// src/components/score/ControlPanel.tsx
/* 💡 究極の現場改修：
   1. ボタンのヒットエリアを最大化し、マージンを極限まで調整。
   2. 点数を入れた瞬間に、裏側で update-score API を叩く連携を強化。 */

import { useScore } from "@/contexts/ScoreContext";
import { Button } from "@/components/ui/button";
import { Plus, MessageSquare } from "lucide-react";

export function ControlPanel() {
  const { score, updateScore, isPending } = useScore();

  return (
    <div className="grid grid-cols-2 gap-4 h-full items-center">
      {/* 自チーム得点：圧倒的な存在感 */}
      <Button 
        onClick={() => updateScore("my", 1, "タイムリーヒット！🔥")}
        disabled={isPending}
        className="group relative h-20 rounded-[28px] bg-emerald-600 hover:bg-emerald-500 shadow-[0_10px_40px_-10px_rgba(16,185,129,0.5)] transition-all active:scale-90"
      >
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-black uppercase tracking-widest opacity-70">My Score</span>
          <Plus className="w-8 h-8 mt-1 group-active:rotate-90 transition-transform" />
        </div>
        {/* 送信中パルス */}
        {isPending && (
          <span className="absolute inset-0 rounded-[28px] border-2 border-white animate-ping opacity-20" />
        )}
      </Button>

      {/* 自由入力速報：キーボード立ち上げをスムーズに */}
      <div className="relative h-20">
        <Button 
          variant="outline"
          className="w-full h-full rounded-[28px] border-2 border-border/60 bg-background/50 flex flex-col items-center justify-center gap-1"
          onClick={() => {/* 短評入力ダイアログ or Input展開 */}}
        >
          <MessageSquare className="w-6 h-6 opacity-60" />
          <span className="text-[10px] font-black uppercase opacity-60">Flash Report</span>
        </Button>
      </div>
    </div>
  );
}
