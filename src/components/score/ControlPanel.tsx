// filepath: `src/components/score/ControlPanel.tsx`
"use client";

import React, { useState } from "react";
import { useScore } from "@/contexts/ScoreContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { RotateCcw, CheckCircle2, MoreHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function ControlPanel() {
  const router = useRouter();
  const { state, recordPitch, finishMatch } = useScore();
  const [flashColor, setFlashColor] = useState<string | null>(null);

  const triggerFlash = (color: string) => {
    setFlashColor(color);
    setTimeout(() => setFlashColor(null), 300);
  };

  return (
    <div className="h-full flex flex-col justify-between py-1 relative">

      {/* 💡 タクタイル・フラッシュ（全画面オーバーレイ） */}
      {flashColor && (
        <div
          className={cn(
            "fixed inset-0 pointer-events-none z-[110] transition-opacity duration-300",
            flashColor === "amber" && "shadow-[inset_0_0_150px_rgba(245,158,11,0.3)] bg-amber-500/10",
            flashColor === "blue" && "shadow-[inset_0_0_150px_rgba(59,130,246,0.3)] bg-blue-500/10",
            flashColor === "rose" && "shadow-[inset_0_0_150px_rgba(244,63,94,0.3)] bg-rose-500/10"
          )}
        />
      )}

      {/* 🚀 メインアクション：親指が一番届きやすい中央〜下部に配置 */}
      <div className="grid grid-cols-4 gap-2 sm:gap-3 shrink-0">
        <Button
          variant="outline"
          className="h-14 sm:h-20 rounded-[20px] border-2 border-amber-500/30 bg-amber-500/10 text-amber-600 font-black text-lg active:scale-90 transition-all shadow-sm"
          onClick={() => { recordPitch("ball"); triggerFlash("amber"); }}
        >
          BALL
        </Button>

        <Button
          variant="outline"
          className="h-14 sm:h-20 rounded-[20px] border-2 border-blue-500/30 bg-blue-500/10 text-blue-600 font-black text-lg active:scale-90 transition-all shadow-sm"
          onClick={() => { recordPitch("strike"); triggerFlash("blue"); }}
        >
          STR
        </Button>

        <Button
          variant="outline"
          className="h-14 sm:h-20 rounded-[20px] border-2 border-rose-500/30 bg-rose-500/10 text-rose-600 font-black text-lg col-span-2 active:scale-90 transition-all shadow-sm"
          onClick={() => { triggerFlash("rose"); toast.info("Out count recorded."); }}
        >
          OUT
        </Button>
      </div>

      {/* ⚾️ プレイ結果：中段にスリムに配置 */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <Button className="h-12 sm:h-14 rounded-xl bg-foreground text-background font-black text-xs sm:text-sm uppercase tracking-widest active:scale-95 transition-all shadow-sm">Hit</Button>
        <Button className="h-12 sm:h-14 rounded-xl bg-primary text-primary-foreground font-black text-xs sm:text-sm uppercase tracking-widest active:scale-95 transition-all shadow-sm">Bunt</Button>
        <Button variant="outline" className="h-12 sm:h-14 rounded-xl border-2 font-black text-xs sm:text-sm uppercase tracking-widest active:scale-95 transition-all shadow-sm">Error</Button>
      </div>

      {/* ⚙️ ユーティリティ：最下部にコンパクトに配置 */}
      <div className="flex justify-between items-center gap-4 pt-1">
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground font-black uppercase text-[10px] tracking-widest gap-1.5"
          onClick={() => toast.info("Undo is pending...")}
        >
          <RotateCcw className="h-3 w-3" /> Undo
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground font-black uppercase text-[10px] tracking-widest gap-1.5"
        >
          <MoreHorizontal className="h-3 w-3" /> More
        </Button>

        <Button
          onClick={async () => {
            await finishMatch();
            router.push(`/matches/result?id=${state.matchId}`);
          }}
          className="bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-xl px-4 h-10 text-[10px] sm:text-xs uppercase tracking-[0.2em] shadow-sm shadow-emerald-500/20 active:scale-95 transition-all"
        >
          Finish
          <CheckCircle2 className="ml-1.5 h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}