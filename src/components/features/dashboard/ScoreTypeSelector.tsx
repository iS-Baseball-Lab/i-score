// filepath: `src/components/features/dashboard/ScoreTypeSelector.tsx`
"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Zap, PencilLine, ChevronRight, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

export const ScoreTypeSelector = () => {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-4 p-1">
      {/* 🌟 MAIN: Real Score - 情熱のプライマリーボタン */}
      <button
        onClick={() => router.push('/matches/new')}
        className={cn(
          "relative group overflow-hidden flex items-center gap-5 p-6 rounded-[32px] transition-all active:scale-[0.97]",
          "bg-primary text-primary-foreground shadow-xl shadow-primary/20 border border-white/10"
        )}
      >
        {/* 背景の光彩エフェクト */}
        <div className="absolute -right-8 -bottom-8 opacity-20 group-hover:scale-125 transition-transform duration-700">
          <PencilLine className="w-40 h-40 rotate-12" />
        </div>

        {/* アイコン：白背景で際立たせる */}
        <div className="relative z-10 p-4 bg-white/20 backdrop-blur-md rounded-2xl shadow-inner border border-white/30">
          <PencilLine className="h-7 w-7 text-white" />
        </div>

        {/* テキスト：力強く */}
        <div className="relative z-10 flex-1 text-left">
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="text-xl font-black tracking-tighter uppercase">Real Score</h3>
            <span className="px-2 py-0.5 bg-white text-primary text-[9px] font-black rounded-full uppercase tracking-tighter">
              Recommend
            </span>
          </div>
          <p className="text-xs font-bold text-primary-foreground/70 leading-relaxed">
            一球一球のドラマを刻む、本格的スコアリング
          </p>
        </div>

        <ChevronRight className="relative z-10 h-6 w-6 text-white/50 group-hover:translate-x-1 transition-transform" />
      </button>

      {/* ⚡️ SUB: Quick Score - スマートなアウトラインボタン */}
      <button
        onClick={() => router.push('/matches/create?mode=quick')}
        className={cn(
          "relative group flex items-center gap-4 p-5 rounded-[28px] transition-all active:scale-[0.98]",
          "bg-card border-2 border-primary/20 hover:border-primary/40 text-left shadow-sm"
        )}
      >
        <div className="p-3 bg-amber-500/10 rounded-2xl border border-amber-500/20">
          <Zap className="h-6 w-6 text-amber-600" />
        </div>

        <div className="flex-1">
          <h3 className="text-base font-black text-foreground tracking-tight flex items-center gap-2">
            Quick Score
          </h3>
          <p className="text-[11px] font-bold text-muted-foreground">
            試合結果のみを最短10秒でスピード記録
          </p>
        </div>

        <ChevronRight className="h-5 w-5 text-muted-foreground/30" />
      </button>
    </div>
  );
};
