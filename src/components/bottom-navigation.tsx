// src/components/bottom-navigation.tsx
"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Trophy, Users2, Users, Menu } from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomNavigationProps {
  activeTab: string;
  onNavigate: (path: string, id: string) => void;
  onOpenDrawer: () => void;
}

export function BottomNavigation({ activeTab, onNavigate, onOpenDrawer }: BottomNavigationProps) {
  const pathname = usePathname();

  // 認証系の画面ではボトムナビを非表示にする
  if (pathname?.startsWith('/login') || pathname?.startsWith('/register')) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background/80 backdrop-blur-2xl border-t border-border/40 pb-safe-area-inset-bottom">
      <div className="flex items-center justify-between h-16 px-4 relative">

        {/* 左側：チーム, 選手名簿 */}
        <div className="flex w-[40%] justify-around h-full">
          {/* 🔥 遷移先を先ほど作った '/team' に修正！ */}
          <button
            onClick={() => onNavigate('/team', 'team')}
            className={cn("flex flex-col items-center justify-center w-full h-full gap-1 transition-all", activeTab === 'team' ? "text-primary scale-105" : "text-muted-foreground opacity-50")}
          >
            <Users className={cn("h-5 w-5", activeTab === 'team' ? "stroke-[2.5px]" : "stroke-[2px]")} />
            <span className="text-[9px] font-black tracking-tighter">チーム</span>
          </button>

          <button
            onClick={() => onNavigate('/players', 'players')}
            className={cn("flex flex-col items-center justify-center w-full h-full gap-1 transition-all", activeTab === 'players' ? "text-primary scale-105" : "text-muted-foreground opacity-50")}
          >
            <Users2 className={cn("h-5 w-5", activeTab === 'players' ? "stroke-[2.5px]" : "stroke-[2px]")} />
            <span className="text-[9px] font-black tracking-tighter">選手名簿</span>
          </button>
        </div>

        {/* 🌟 センター：アプリアイコン (ダッシュボード) */}
        <div className="absolute left-1/2 -translate-x-1/2 -top-6">
          <button
            onClick={() => onNavigate('/dashboard', 'dashboard')}
            className="relative group flex items-center justify-center"
          >
            <div className={cn(
              "absolute inset-0 rounded-full blur-xl group-active:scale-90 transition-all duration-500",
              activeTab === "dashboard" ? "bg-primary/30" : "bg-transparent"
            )} />
            <div className={cn(
              "relative flex items-center justify-center h-16 w-16 rounded-full border-[3px] border-background bg-card backdrop-blur-md transition-all duration-300 active:scale-95 overflow-hidden shadow-sm",
              activeTab === "dashboard" ? "ring-2 ring-primary/50" : "opacity-90 hover:opacity-100"
            )}>
              <img
                src="/logo.webp"
                alt="iScore"
                className={cn("h-10 w-10 object-contain transition-transform duration-500", activeTab !== "dashboard" && "grayscale opacity-70")}
              />
            </div>
          </button>
        </div>

        {/* 右側：大会マップ, その他 */}
        <div className="flex w-[40%] justify-around h-full">
          <button
            onClick={() => onNavigate('/tournaments/map', 'map')}
            className={cn("flex flex-col items-center justify-center w-full h-full gap-1 transition-all", activeTab === 'map' ? "text-primary scale-105" : "text-muted-foreground opacity-50")}
          >
            <Trophy className={cn("h-5 w-5", activeTab === 'map' ? "stroke-[2.5px]" : "stroke-[2px]")} />
            <span className="text-[9px] font-black tracking-tighter">大会マップ</span>
          </button>

          <button
            onClick={onOpenDrawer}
            className="flex flex-col items-center justify-center w-full h-full gap-1 text-muted-foreground opacity-50"
          >
            <div className="relative">
              <Menu className="h-5 w-5" />
              <div className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-red-500 animate-pulse border border-background" />
            </div>
            <span className="text-[9px] font-black tracking-tighter">その他</span>
          </button>
        </div>

      </div>
    </nav>
  );
}