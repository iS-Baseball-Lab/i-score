// src/components/features/players/PlayerCard.tsx
"use client";
/* 💡 選手一覧のカードUIコンポーネント */

import React from "react";
import { Pencil, Trash2, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Player, PositionKey } from "@/types/player";
import { getCategory, POSITION_COLOR, POSITION_LABELS } from "./constants";

interface PlayerCardProps {
  player: Player;
  teamId: string;
  onEdit: (p: Player) => void;
  onDelete: (p: Player) => void;
  onDetail: (p: Player) => void;
}

export function PlayerCard({ player, onEdit, onDelete, onDetail }: PlayerCardProps) {
  const category = getCategory(player.primaryPosition);
  const colors = POSITION_COLOR[category];
  const posLabel = player.primaryPosition
    ? POSITION_LABELS[player.primaryPosition as PositionKey] ?? player.primaryPosition
    : null;
  const isActive = player.isActive === 1 || player.isActive === true;

  const throwsLabel = player.throws === "R" ? "右" : player.throws === "L" ? "左" : null;
  const batsLabel = player.bats === "R" ? "右" : player.bats === "L" ? "左" : player.bats === "B" ? "両" : null;

  return (
    <div className={cn(
      "group relative bg-card border border-border overflow-hidden",
      "rounded-[var(--radius-2xl)]",
      "transition-all duration-200 hover:shadow-md hover:shadow-black/5 dark:hover:shadow-black/20",
      "hover:-translate-y-0.5",
      !isActive && "opacity-60",
    )}>
      <div className="flex items-stretch">
        {/* 背番号エリア */}
        <div className={cn("flex flex-col items-center justify-center w-[4.5rem] shrink-0 py-4 gap-1", colors.accent)}>
          <span className={cn("text-3xl font-black italic tabular-nums leading-none tracking-tighter", colors.accentText)}>
            {player.uniformNumber}
          </span>
          {player.primaryPosition && (
            <span className={cn("text-[9px] font-black uppercase tracking-wider leading-none opacity-80", colors.accentText)}>
              {player.primaryPosition}
            </span>
          )}
        </div>

        {/* 選手情報 */}
        <div className="flex-1 px-3.5 py-3 min-w-0 flex flex-col justify-center gap-0.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={cn("inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-md border", colors.badge)}>
              <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", colors.dot)} />
              {posLabel ?? "ポジション未設定"}
            </span>
            {!isActive && (
              <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground border border-border">
                非アクティブ
              </span>
            )}
          </div>
          <p className="text-[1.05rem] font-black tracking-tight text-card-foreground leading-snug truncate">
            {player.name}
          </p>
          {(throwsLabel || batsLabel) && (
            <p className="text-[10px] font-bold text-muted-foreground leading-none">
              {throwsLabel && `投：${throwsLabel}`}{throwsLabel && batsLabel && "　"}{batsLabel && `打：${batsLabel}`}
            </p>
          )}
        </div>

        {/* アクションボタン */}
        <div className="flex flex-col items-center justify-center gap-0.5 px-2 py-2 border-l border-border/40 shrink-0 bg-muted/20">
          <button onClick={(e) => { e.stopPropagation(); onEdit(player); }} className="w-9 h-9 flex items-center justify-center rounded-[var(--radius-lg)] text-muted-foreground hover:text-primary hover:bg-primary/10 active:scale-90 transition-all duration-150" title="編集">
            <Pencil className="h-[15px] w-[15px]" strokeWidth={2.2} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); onDelete(player); }} className="w-9 h-9 flex items-center justify-center rounded-[var(--radius-lg)] text-muted-foreground hover:text-destructive hover:bg-destructive/10 active:scale-90 transition-all duration-150" title="削除">
            <Trash2 className="h-[15px] w-[15px]" strokeWidth={2.2} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); onDetail(player); }} className="w-9 h-9 flex items-center justify-center rounded-[var(--radius-lg)] text-muted-foreground hover:text-card-foreground hover:bg-muted active:scale-90 transition-all duration-150" title="詳細">
            <ChevronRight className="h-[15px] w-[15px]" strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
}
