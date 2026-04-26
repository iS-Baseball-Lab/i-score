// filepath: `src/components/features/dashboard/ScoreTypeSelector.tsx`
"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Zap, PencilLine, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export const ScoreTypeSelector = () => {
  const router = useRouter();

  const menuItems = [
    {
      title: "Quick Score",
      description: "試合結果・イニングスコアのみを素早く記録",
      icon: <Zap className="h-6 w-6 text-amber-500" />,
      href: "/matches/quick",
      color: "bg-amber-500/10 border-amber-500/20 text-amber-700",
    },
    {
      title: "Real Score",
      description: "一球ごとの詳細、打席結果を本格的に記録",
      icon: <PencilLine className="h-6 w-6 text-blue-500" />,
      href: "/matches/new", // 💡 Real Scoreの開始ページへ
      color: "bg-blue-500/10 border-blue-500/20 text-blue-700",
      isPrimary: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 p-4">
      {menuItems.map((item) => (
        <button
          key={item.title}
          onClick={() => router.push(item.href)}
          className={cn(
            "relative flex items-center gap-4 p-5 rounded-[24px] border transition-all active:scale-[0.98]",
            "bg-card shadow-sm hover:shadow-md text-left overflow-hidden",
            item.isPrimary ? "border-primary/30 ring-1 ring-primary/5" : "border-border/50"
          )}
        >
          {/* アイコン部分 */}
          <div className={cn("p-3 rounded-2xl shrink-0", item.color)}>
            {item.icon}
          </div>

          {/* テキスト部分 */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-black tracking-tight text-foreground">
              {item.title}
            </h3>
            <p className="text-xs font-medium text-muted-foreground line-clamp-1">
              {item.description}
            </p>
          </div>

          <ChevronRight className="h-5 w-5 text-muted-foreground/30" />
          
          {/* 💡 現場至上主義：Real Scoreの方に「推奨」や「本格」を感じさせるさりげない装飾 */}
          {item.isPrimary && (
            <div className="absolute top-0 right-0 px-3 py-1 bg-primary text-[10px] font-black text-white rounded-bl-xl uppercase">
              Main
            </div>
          )}
        </button>
      ))}
    </div>
  );
};
