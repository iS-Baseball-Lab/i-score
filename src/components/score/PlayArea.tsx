// filepath: `src/components/score/PlayArea.tsx`
"use client";

import React from "react";
import { useScore } from "@/contexts/ScoreContext";
import { cn } from "@/lib/utils";
import { User } from "lucide-react";

export function PlayArea() {
  const { state } = useScore();
  const { runners } = state;

  // 💡 ベースの共通コンポーネント：パルスアニメーションと質感を注入
  const Base = ({ baseNum, isRunner }: { baseNum: 1 | 2 | 3; isRunner: boolean }) => {
    // ベースの位置計算（45度回転したダイヤモンド用）
    const positions = {
      1: "right-0 top-1/2 -translate-y-1/2 translate-x-1/2",
      2: "top-0 left-1/2 -translate-x-1/2 -translate-y-1/2",
      3: "left-0 top-1/2 -translate-y-1/2 -translate-x-1/2",
    };

    return (
      <div className={cn("absolute w-8 h-8 sm:w-10 sm:h-10 transition-all duration-700", positions[baseNum])}>
        {/* 💡 走者がいる時の脈動エフェクト */}
        {isRunner && (
          <div className="absolute inset-0 rounded-sm bg-primary/40 animate-ping" />
        )}

        {/* ベース本体 */}
        <div
          className={cn(
            "absolute inset-0 rotate-45 rounded-sm border-2 transition-all duration-500",
            isRunner
              ? "bg-primary border-primary shadow-[0_0_15px_rgba(var(--primary),0.5)] z-10 scale-110"
              : "bg-background border-border/40 z-0"
          )}
        >
          {/* ベースの厚み表現 */}
          <div className="absolute inset-[2px] border border-white/10 rounded-sm" />
        </div>
      </div>
    );
  };

  return (
    <div className="relative w-full max-w-[280px] aspect-square mx-auto">

      {/* 🏟 ダイヤモンド（土のライン） */}
      <div className="absolute inset-4 border-2 border-dashed border-border/20 rotate-45 rounded-sm" />

      {/* 1, 2, 3塁 */}
      <Base baseNum={1} isRunner={!!runners.base1} />
      <Base baseNum={2} isRunner={!!runners.base2} />
      <Base baseNum={3} isRunner={!!runners.base3} />

      {/* 🏠 ホームベース（五角形） */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-10 h-10 flex flex-col items-center">
        <div className="w-8 h-5 bg-background border-2 border-border/40" />
        <div className="w-0 h-0 border-l-[16px] border-l-transparent border-r-[16px] border-r-transparent border-t-[12px] border-t-background relative -mt-[2px]">
          <div className="absolute -top-[14px] -left-[18px] w-0 h-0 border-l-[18px] border-l-transparent border-r-[18px] border-r-transparent border-t-[14px] border-t-border/40 -z-10" />
        </div>
      </div>

      {/* 投球フォーカス：マウンド */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative group">
          <div className="absolute inset-0 bg-primary/5 rounded-full scale-[2] blur-xl opacity-50" />
          <div className="relative bg-card/80 backdrop-blur-md border border-border/40 rounded-2xl px-3 py-1.5 flex items-center gap-2 shadow-sm">
            <div className="w-2 h-2 rounded-full bg-primary/40" />
            <span className="text-[10px] font-black italic tracking-tighter uppercase opacity-60">Pitcher</span>
          </div>
        </div>
      </div>

      {/* 打者フォーカス：ホーム周辺 */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
        <div className="bg-primary/10 border border-primary/20 rounded-2xl px-4 py-2 flex items-center gap-2 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-700">
          <User className="w-3 h-3 text-primary" />
          <span className="text-[11px] font-black italic tracking-tighter uppercase text-primary">Batter</span>
        </div>
      </div>

    </div>
  );
}