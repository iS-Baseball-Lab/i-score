// filepath: `src/components/features/dashboard/ScoreTypeSelector.tsx`
"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { PencilLine, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export const ScoreTypeSelector = () => {
  const router = useRouter();
  const cardStyle = "rounded-3xl"; 

  return (
    <div className="grid grid-cols-2 gap-4 px-1">
      {/* --- Real Score (本格記録) --- */}
      <button
        onClick={() => router.push('/matches/create?mode=real')}
        className={cn(
          "relative group overflow-hidden flex flex-col items-center justify-center p-7 sm:p-10 transition-all active:scale-[0.96]",
          "bg-primary text-primary-foreground shadow-xl shadow-primary/20 border border-white/10",
          cardStyle
        )}
      >
        <div className="absolute -right-2 -bottom-2 opacity-10 group-hover:scale-110 transition-transform duration-500">
          <PencilLine className="w-28 h-28 rotate-12" />
        </div>
        <div className="relative z-10 flex flex-col items-center text-center gap-5">
          <div className="p-4 bg-white/20 backdrop-blur-md rounded-2xl border border-white/20 shadow-inner">
            <PencilLine className="h-9 w-9 text-white" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl sm:text-3xl font-black tracking-tighter uppercase leading-none">
              Real
            </h3>
            <p className="text-[11px] sm:text-xs font-bold text-primary-foreground/70 uppercase tracking-widest whitespace-nowrap">
              本格記録
            </p>
          </div>
        </div>
      </button>

      {/* --- Quick Score (結果入力) --- */}
      <button
        onClick={() => router.push('/matches/create?mode=quick')}
        className={cn(
          "relative group overflow-hidden flex flex-col items-center justify-center p-7 sm:p-10 transition-all active:scale-[0.96]",
          "bg-card border-[5px] border-primary text-foreground shadow-sm",
          cardStyle
        )}
      >
        <div className="relative z-10 flex flex-col items-center text-center gap-5">
          <div className="p-4 bg-amber-500/10 rounded-2xl border border-amber-500/20">
            <Zap className="h-9 w-9 text-amber-600" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl sm:text-3xl font-black tracking-tighter uppercase leading-none">
              Quick
            </h3>
            <p className="text-[11px] sm:text-xs font-bold text-muted-foreground uppercase tracking-widest whitespace-nowrap">
              結果入力
            </p>
          </div>
        </div>
      </button>
    </div>
  );
};
