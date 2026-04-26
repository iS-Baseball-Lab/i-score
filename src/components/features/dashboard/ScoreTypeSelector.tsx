// filepath: `src/components/features/dashboard/ScoreTypeSelector.tsx`
"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Zap, PencilLine } from "lucide-react";
import { cn } from "@/lib/utils";

export const ScoreTypeSelector = () => {
  const router = useRouter();

  // 💡 カスタム指示に基づき、角丸はプロジェクト標準の rounded-3xl をベースに調整
  const cardStyle = "rounded-[24px] sm:rounded-[32px]"; 

  return (
    <div className="grid grid-cols-2 gap-4 px-1">
      {/* 🌟 MAIN: Real Score - 左側に配置 */}
      <button
        onClick={() => router.push('/matches/new')}
        className={cn(
          "relative group overflow-hidden flex flex-col items-center justify-center p-6 transition-all active:scale-[0.96]",
          "bg-primary text-primary-foreground shadow-lg shadow-primary/20 border border-white/10",
          cardStyle
        )}
      >
        {/* 背景の透かしアイコン：さりげない演出 */}
        <div className="absolute -right-2 -bottom-2 opacity-10 group-hover:scale-110 transition-transform duration-500">
          <PencilLine className="w-20 h-20 rotate-12" />
        </div>

        <div className="relative z-10 flex flex-col items-center text-center gap-3">
          {/* アイコンサイズ: 現場で見やすいサイズ */}
          <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl border border-white/20">
            <PencilLine className="h-7 w-7 text-white" />
          </div>
          
          <div className="space-y-1">
            <h3 className="text-base sm:text-lg font-black tracking-tighter uppercase leading-tight">
              Real Score
            </h3>
            {/* 説明文を1行に凝縮 & フォントサイズ調整 */}
            <p className="text-[10px] sm:text-xs font-bold text-primary-foreground/70 whitespace-nowrap">
              一球一球を本格的に記録
            </p>
          </div>
        </div>
      </button>

      {/* ⚡️ SUB: Quick Score - 右側に配置 */}
      <button
        onClick={() => router.push('/matches/create?mode=quick')}
        className={cn(
          "relative group overflow-hidden flex flex-col items-center justify-center p-6 transition-all active:scale-[0.96]",
          "bg-card border-[4px] border-primary text-foreground shadow-sm", // 💡 枠線をさらに太く(4px)
          cardStyle
        )}
      >
        <div className="relative z-10 flex flex-col items-center text-center gap-3">
          <div className="p-3 bg-amber-500/10 rounded-2xl border border-amber-500/20">
            <Zap className="h-7 w-7 text-amber-600" />
          </div>

          <div className="space-y-1">
            <h3 className="text-base sm:text-lg font-black tracking-tighter uppercase leading-tight">
              Quick Score
            </h3>
            <p className="text-[10px] sm:text-xs font-bold text-muted-foreground whitespace-nowrap">
              結果のみを爆速で記録
            </p>
          </div>
        </div>
      </button>
    </div>
  );
};
