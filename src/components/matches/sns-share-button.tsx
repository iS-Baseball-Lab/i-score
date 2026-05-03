// filepath: src/components/matches/sns-share-button.tsx
"use client";

import React from "react";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatMatchLineLog } from "@/lib/utils/format-sns";

/**
 * 💡 iScoreCloud 規約: Matchデータに基づくSNS共有
 * 現場でグローブを外した手でもタップしやすい h-14 サイズ。
 * unknown型を排除し、明示的な Props 定義を行う。
 */
interface SnsShareButtonProps {
  homeTeamName: string;
  awayTeamName: string;
  scores: { home: number; away: number };
  inning: string;
  lastAction: string;
  isWalkOff?: boolean;
}

export function SnsShareButton({
  homeTeamName,
  awayTeamName,
  scores,
  inning,
  lastAction,
  isWalkOff = false,
}: SnsShareButtonProps) {
  
  const handleLineShare = () => {
    const message = formatMatchLineLog(
      homeTeamName,
      awayTeamName,
      scores,
      inning,
      lastAction,
      isWalkOff
    );
    
    const lineUrl = `https://line.me/R/msg/text/?${message}`;

    // 💡 Web Share API が利用可能な場合はシステム共有、不可の場合はLINEアプリを直接起動
    if (navigator.share) {
      navigator.share({
        title: "iScoreCloud Match速報",
        text: decodeURIComponent(message),
      }).catch((err: unknown) => {
        // ユーザーキャンセル以外の場合にフォールバック
        console.error("Share failed:", err);
        window.open(lineUrl, "_blank");
      });
    } else {
      window.open(lineUrl, "_blank");
    }
  };

  return (
    <Button
      onClick={handleLineShare}
      className="w-full h-14 rounded-[20px] bg-[#06C755] hover:bg-[#05b34c] text-white font-black italic gap-3 shadow-lg shadow-green-500/20 active:scale-95 transition-transform"
    >
      <MessageCircle className="w-6 h-6 fill-white" />
      LINEでMatch速報を投稿
    </Button>
  );
}
