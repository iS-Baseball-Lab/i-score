// filepath: `src/components/features/dashboard/ScoreTypeSelector.tsx`
"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Zap, PencilLine } from "lucide-react";
import { cn } from "@/lib/utils";

export const ScoreTypeSelector = () => {
  const router = useRouter();

  // 💡 本日のダッシュボード修正に合わせた「環境ウィジェット連動」の角丸設定
  // ユーザー設定やウィジェットと統一感が出るように rounded-3xl を適用
  const cardStyle = "rounded-3xl";

  return (
    <div className="grid grid-cols-2 gap-4 px-1">
      {/* 🌟 MAIN: Real Score - 左側に配置（塗り） */}
      <button
        onClick={() => router.push('/matches/new')}
        className={cn(
          "relative group overflow-hidden flex flex-col items-center justify-center p-6 sm:p-8 transition-all active:scale-[0.96]",
          "bg-primary text-primary-foreground shadow-lg shadow-primary/20 border border-white/10",
          cardStyle
        )}
      >
        {/* 背景の透かしアイコン */}
        <div className="absolute -right-2 -bottom-2 opacity-10 group-hover:scale-110 transition-transform duration-500">
          <PencilLine className="w-24 h-24 rotate-12" />
        </div>

        <div className="relative z-10 flex flex-col items-center text-center gap-4">
          {/* アイコンサイズ: 現場視認性重視 (h-8 w-8) */}
          <div className="p-3.5 bg-white/20 backdrop-blur-md rounded-2xl border border-white/20">
            <PencilLine className="h-8 w-8 text-white" />
          </div>

          <div className="space-y-1.5">
            <h3 className="text-xl sm:text-2xl font-black tracking-tighter uppercase leading-none">
              Real Score
            </h3>
            <p className="text-xs sm:text-sm font-bold text-primary-foreground/70 whitespace-nowrap">
              一球一球を本格的に記録
            </p>
          </div>
        </div>
      </button>

      {/* ⚡️ SUB: Quick Score - 右側に配置（極太枠） */}
      <button
        onClick={() => router.push('/matches/create?mode=quick')}
        className={cn(
          "relative group overflow-hidden flex flex-col items-center justify-center p-6 sm:p-8 transition-all active:scale-[0.96]",
          "bg-card border-[4px] border-primary text-foreground shadow-sm",
          cardStyle
        )}
      >
        <div className="relative z-10 flex flex-col items-center text-center gap-4">
          <div className="p-3.5 bg-amber-500/10 rounded-2xl border border-amber-500/20">
            <Zap className="h-8 w-8 text-amber-600" />
          </div>

          <div className="space-y-1.5">
            <h3 className="text-xl sm:text-2xl font-black tracking-tighter uppercase leading-none">
              Quick Score
            </h3>
            <p className="text-xs sm:text-sm font-bold text-muted-foreground whitespace-nowrap">
              結果のみを爆速で記録
            </p>
          </div>
        </div>
      </button>
    </div>
  );
};