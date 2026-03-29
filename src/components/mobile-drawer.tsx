// src/components/mobile-drawer.tsx
"use client";

import React from "react";
/**
 * 💡 モバイルドロワー (カラーテーマ統合版)
 * 1. 修正: 「App Appearance」セクションにカラーテーマグリッドを追加。
 * 2. 意匠: ライト/ダークの切り替えと、色の選択を上下に並べることで、設定の一貫性を強調。
 */
import { X, History, PlusSquare, UserCheck, Settings, ChevronRight, LogOut, User, Palette } from "lucide-react";
import { MobileDrawerProps } from "@/types/navigation";
import { ThemeToggle } from "./theme-toggle";
import { ThemeSwitcher } from "./theme-switcher";

export function MobileDrawer({ isOpen, onClose, onNavigate }: MobileDrawerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] md:hidden bg-background/95 backdrop-blur-3xl animate-in fade-in duration-300">
      <div className="p-6 flex flex-col h-full max-w-lg mx-auto">

        {/* ヘッダー */}
        <div className="flex justify-between items-center mb-8 border-b border-border/40 pb-6">
          <div className="flex flex-col">
            <h2 className="text-3xl font-black italic uppercase tracking-tighter text-foreground">i-Score</h2>
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60">Management Hub</span>
          </div>
          <button onClick={onClose} className="p-3 bg-muted/50 rounded-full active:scale-90 transition-transform">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-8 overflow-y-auto scrollbar-hide flex-1 pb-10">

          {/* 🌗 究極UI: モバイル版外観設定 */}
          <div className="space-y-4 px-2">
            <p className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.2em] px-2 flex items-center gap-2">
              App Appearance
            </p>
            <div className="space-y-4">
              <ThemeToggle variant="segmented" />
              <div className="space-y-2">
                <div className="flex items-center gap-2 px-2 text-muted-foreground/40">
                  <Palette className="h-3 w-3" />
                  <span className="text-[9px] font-black uppercase tracking-widest">Team Accent Color</span>
                </div>
                <ThemeSwitcher variant="grid" />
              </div>
            </div>
          </div>

          {/* メインアクション */}
          <div className="space-y-3">
            <p className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.2em] px-4">Match Archives</p>
            <button
              onClick={() => onNavigate('/matches/history')}
              className="flex items-center gap-5 w-full p-4 rounded-[32px] bg-card/20 border border-border/40 hover:bg-card/40 active:bg-primary/5 transition-all group"
            >
              <div className="p-3 rounded-2xl bg-muted/50 text-muted-foreground border border-border/30">
                <History className="h-6 w-6" />
              </div>
              <p className="text-lg font-black tracking-tight">試合記録</p>
              <ChevronRight className="h-5 w-5 ml-auto text-muted-foreground/30" />
            </button>
          </div>

          {/* 管理セクション */}
          <div className="space-y-3">
            <p className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.2em] px-4">Administration</p>
            <div className="grid grid-cols-1 gap-2">
              {[
                { name: "大会管理", href: "/tournaments/register", icon: PlusSquare },
                { name: "参加申請", href: "/teams/requests", icon: UserCheck },
                { name: "設定", href: "/settings", icon: Settings },
              ].map((item) => (
                <button
                  key={item.href}
                  onClick={() => onNavigate(item.href)}
                  className="flex items-center gap-5 w-full p-4 rounded-[32px] bg-card/20 border border-border/40 hover:bg-card/40 active:bg-primary/5 transition-all group"
                >
                  <div className="p-3 rounded-2xl bg-muted/50 text-muted-foreground border border-border/30 group-hover:text-primary">
                    <item.icon className="h-6 w-6" />
                  </div>
                  <p className="text-lg font-black tracking-tight">{item.name}</p>
                  <ChevronRight className="h-5 w-5 ml-auto text-muted-foreground/30" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* アカウント */}
        <div className="mt-auto py-8 border-t border-border/40">
          <div className="flex items-center gap-3 w-full p-3 rounded-full bg-muted/20">
            <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30 text-primary">
              <User className="h-6 w-6" />
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="font-black text-foreground italic leading-none truncate">山田 監督</p>
              <p className="text-[10px] font-bold text-muted-foreground uppercase mt-1">Administrator</p>
            </div>
            <button className="p-3 text-muted-foreground hover:text-red-500 transition-colors">
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}