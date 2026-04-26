// filepath: `src/components/features/dashboard/ScoreTypeSelector.tsx`
"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Zap, PencilLine } from "lucide-react";
import { cn } from "@/lib/utils";

export const ScoreTypeSelector = () => {
  const router = useRouter();

  return (
    <div className="grid grid-cols-2 gap-3 px-1">
      {/* 🌟 MAIN: Real Score - 左側に配置し、塗り（Solid）で圧倒的な存在感 */}
      <button
        onClick={() => router.push('/matches/new')}
        className={cn(
          "relative group overflow-hidden flex flex-col items-center justify-center p-5 transition-all active:scale-[0.96]",
          "bg-primary text-primary-foreground shadow-lg shadow-primary/20 border border-white/10",
          "rounded-[inherit]" // 💡 親の角丸設定（Dashboard側のウィジェット等）を継承
        )}
      >
        {/* 背景の透かしアイコン */}
        <div className="absolute -right-2 -bottom-2 opacity-10 group-hover:scale-110 transition-transform duration-500">
          <PencilLine className="w-20 h-20 rotate-12" />
        </div>

        <div className="relative z-10 flex flex-col items-center text-center gap-3">
          {/* アイコンサイズを統一 (h-6 w-6) */}
          <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl border border-white/20">
            <PencilLine className="h-6 w-6 text-white" />
          </div>
          
          <div>
            <h3 className="text-sm sm:text-base font-black tracking-tighter uppercase leading-none mb-1">
              Real Score
            </h3>
            <p className="text-[9px] font-bold text-primary-foreground/60 leading-tight">
              一球一球を<br/>本格的に記録
            </p>
          </div>
        </div>
      </button>

      {/* ⚡️ SUB: Quick Score - 右側に配置し、太い枠線（2px）でスマートに存在感 */}
      <button
        onClick={() => router.push('/matches/create?mode=quick')}
        className={cn(
          "relative group overflow-hidden flex flex-col items-center justify-center p-5 transition-all active:scale-[0.96]",
          "bg-card border-[3px] border-primary text-foreground shadow-sm", // 💡 枠線を太く(3px)して存在感を強調
          "rounded-[inherit]" // 💡 角丸を統一
        )}
      >
        <div className="relative z-10 flex flex-col items-center text-center gap-3">
          {/* アイコンサイズ・スタイルをRealと統一 */}
          <div className="p-3 bg-amber-500/10 rounded-2xl border border-amber-500/20">
            <Zap className="h-6 w-6 text-amber-600" />
          </div>

          <div>
            <h3 className="text-sm sm:text-base font-black tracking-tighter uppercase leading-none mb-1">
              Quick Score
            </h3>
            <p className="text-[9px] font-bold text-muted-foreground leading-tight">
              結果のみを<br/>爆速で記録
            </p>
          </div>
        </div>
      </button>
    </div>
  );
};
