// filepath: src/components/features/players/PlayerCard.tsx
"use client";
/* 💡 選手一覧のカードUIコンポーネント（スワイプ操作対応） */

import React, { useState, useRef } from "react";
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

  // ━━ スワイプ操作の状態管理 ━━
  const [offsetX, setOffsetX] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const isVerticalScroll = useRef(false);

  const MAX_SWIPE = -110; // 編集・削除ボタンの合計幅 (55px * 2)

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isVerticalScroll.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null || isVerticalScroll.current) return;

    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const diffX = currentX - touchStartX.current;
    const diffY = currentY - touchStartY.current;

    // 💡 縦方向の移動量が大きい場合はスクロールとみなし、スワイプをキャンセル
    if (Math.abs(diffY) > Math.abs(diffX) && Math.abs(diffY) > 5) {
      isVerticalScroll.current = true;
      setOffsetX(0);
      return;
    }

    // 左方向へのスワイプ（マイナス値）のみ許可
    if (diffX < 0) {
      setOffsetX(Math.max(diffX, MAX_SWIPE));
    } else if (offsetX < 0 && diffX > 0) {
      // 既に開いている状態から右へスワイプして閉じる
      setOffsetX(Math.min(0, offsetX + diffX));
    }
  };

  const handleTouchEnd = () => {
    touchStartX.current = null;
    touchStartY.current = null;

    // 半分以上スワイプされていたら全開、そうでなければ閉じる
    if (offsetX < MAX_SWIPE / 2) {
      setOffsetX(MAX_SWIPE);
    } else {
      setOffsetX(0);
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // 💡 スワイプが開いている時は、詳細に飛ばずに「閉じる」動作を優先
    if (offsetX !== 0) {
      e.preventDefault();
      e.stopPropagation();
      setOffsetX(0);
      return;
    }
    onDetail(player);
  };

  return (
    <div className={cn(
      "group relative overflow-hidden bg-card border border-border",
      "rounded-[var(--radius-2xl)]",
      "transition-all duration-200 hover:shadow-md hover:shadow-black/5 dark:hover:shadow-black/20",
      !isActive && "opacity-60",
    )}>
      {/* ━━ 背面：アクションボタン（スワイプで露出） ━━ */}
      <div className="absolute top-0 right-0 h-full flex items-center justify-end z-0">
        <button
          onClick={(e) => { e.stopPropagation(); onEdit(player); setOffsetX(0); }}
          className="h-full w-[55px] flex flex-col items-center justify-center gap-1 bg-primary/10 text-primary active:bg-primary/20 transition-colors"
        >
          <Pencil className="h-4 w-4" strokeWidth={2.5} />
          <span className="text-[9px] font-black uppercase tracking-wider">編集</span>
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(player); setOffsetX(0); }}
          className="h-full w-[55px] flex flex-col items-center justify-center gap-1 bg-destructive/10 text-destructive active:bg-destructive/20 transition-colors"
        >
          <Trash2 className="h-4 w-4" strokeWidth={2.5} />
          <span className="text-[9px] font-black uppercase tracking-wider">削除</span>
        </button>
      </div>

      {/* ━━ 前面：選手情報カード ━━ */}
      <div
        className="relative z-10 flex items-stretch h-full bg-card transition-transform duration-200 ease-out"
        style={{ transform: `translateX(${offsetX}px)`, touchAction: "pan-y" }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={handleCardClick}
      >
        {/* 左：背番号カラム */}
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

        {/* 中央：選手情報 */}
        <div className="flex-1 px-3.5 py-3 min-w-0 flex flex-col justify-center gap-0.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={cn("inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-md border", colors.badge)}>
              <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", colors.dot)} />
              {posLabel ?? "未設定"}
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

        {/* 右：詳細へ進むアイコン（常時表示） */}
        <div className="flex items-center justify-center px-3 shrink-0 text-muted-foreground/50 border-l border-border/40">
          <ChevronRight className="h-5 w-5" strokeWidth={2} />
        </div>
      </div>
    </div>
  );
}
