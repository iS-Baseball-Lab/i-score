// filepath: `src/components/score/ControlPanel.tsx`
"use client";

import React, { useState } from "react";
import { useScore } from "@/contexts/ScoreContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { RotateCcw, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner"; // 💡 ここを追加

export function ControlPanel() {
  const router = useRouter();

  // 💡 Context から recordPitch, finishMatch 等を抽出
  const { state, recordPitch, finishMatch } = useScore();

  const [flashColor, setFlashColor] = useState<string | null>(null);

  // 💡 タクタイル・フラッシュの実行
  const triggerFlash = (color: string) => {
    setFlashColor(color);
    setTimeout(() => setFlashColor(null), 300);
  };

  return (
    <div className="space-y-4 relative">

      {/* 💡 タクタイル・フラッシュ・オーバーレイ */}
      {flashColor && (
        <div
          className={cn(
            "fixed inset-0 pointer-events-none z-50 transition-opacity duration-300 animate-in fade-in fill-mode-forwards",
            flashColor === "amber" && "shadow-[inset_0_0_100px_rgba(245,158,11,0.2)] bg-amber-500/5",
            flashColor === "blue" && "shadow-[inset_0_0_100px_rgba(59,130,246,0.2)] bg-blue-500/5",
            flashColor === "rose" && "shadow-[inset_0_0_100px_rgba(244,63,94,0.2)] bg-rose-500/5"
          )}
        />
      )}

      {/* 1. 主要カウントボタン (recordPitch に連動) */}
      <div className="grid grid-cols-4 gap-3">
        <Button
          variant="outline"
          className="h-16 rounded-2xl border-2 border-amber-500/20 bg-amber-500/5 text-amber-600 font-black text-lg active:scale-95 transition-all shadow-sm"
          onClick={() => {
            recordPitch("ball");
            triggerFlash("amber");
          }}
        >
          BALL
        </Button>

        <Button
          variant="outline"
          className="h-16 rounded-2xl border-2 border-blue-500/20 bg-blue-500/5 text-blue-600 font-black text-lg active:scale-95 transition-all shadow-sm"
          onClick={() => {
            recordPitch("strike");
            triggerFlash("blue");
          }}
        >
          STR
        </Button>

        <Button
          variant="outline"
          className="h-16 rounded-2xl border-2 border-rose-500/20 bg-rose-500/5 text-rose-600 font-black text-lg col-span-2 active:scale-95 transition-all shadow-sm"
          onClick={() => {
            // 現在の Context に recordOut がないため、視覚的フィードバックのみ実行
            triggerFlash("rose");
            toast.info("アウトの直接記録は調整中です。三振やインプレイ結果で自動更新されます。");
          }}
        >
          OUT
        </Button>
      </div>

      {/* 2. プレイ結果ボタン */}
      <div className="grid grid-cols-3 gap-3">
        <Button className="h-16 rounded-2xl bg-foreground text-background font-black shadow-sm active:scale-95 transition-all">HIT</Button>
        <Button className="h-16 rounded-2xl bg-primary text-primary-foreground font-black shadow-sm active:scale-95 transition-all">BUNT</Button>
        <Button variant="outline" className="h-16 rounded-2xl border-2 font-black shadow-sm active:scale-95 transition-all">ERROR</Button>
      </div>

      {/* 3. 補助ボタン・試合終了 */}
      <div className="flex justify-between items-center px-2">
        <Button
          variant="ghost"
          className="text-muted-foreground gap-2 font-bold"
          onClick={() => {
            toast.info("Undo機能は現在調整中です");
          }}
        >
          <RotateCcw className="h-4 w-4" /> Undo
        </Button>

        <Button
          onClick={async () => {
            await finishMatch();
            router.push(`/matches/result?id=${state.matchId}`);
          }}
          className="bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-2xl px-6 h-12 shadow-sm shadow-emerald-500/20 active:scale-95 transition-all"
        >
          Finish Match
          <CheckCircle2 className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}