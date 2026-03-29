// src/components/header.tsx
"use client";

import React from "react";
/**
 * 💡 究極のヘッダー・コンポーネント (カラーテーマ対応版)
 * 1. 修正: テーマドット (ThemeSwitcher) を PC 版に統合。
 * 2. 意匠: ライト/ダークトグルの左隣に、直感的なカラーパレットを配置。
 */
import { usePathname } from "next/navigation";
import { Bell, Shield, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./theme-toggle";
import { ThemeSwitcher } from "./theme-switcher";

export function Header() {
  const pathname = usePathname() || "";

  const getPageTitle = () => {
    const segment = pathname.split("/").pop();
    if (!segment || segment === "(protected)" || segment === "protected") return "DASHBOARD";
    return segment.toUpperCase();
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-background/40 backdrop-blur-md border-b border-border/40">
      <div className="flex h-16 items-center justify-between px-6 sm:px-8">

        <div className="flex items-center gap-4">
          <div className="md:hidden h-9 w-9 rounded-xl bg-card border border-border/60 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
            <img src="/logo.png" alt="i-Score" className="h-6 w-6 object-contain" />
          </div>

          <div className="flex flex-col">
            <h1 className="text-xl font-black italic tracking-tighter text-foreground uppercase leading-none">
              {getPageTitle()}
            </h1>
            <div className="flex items-center gap-1 opacity-40 md:hidden">
              <Zap className="h-2.5 w-2.5 text-primary" />
              <span className="text-[8px] font-black uppercase tracking-widest">Tactical Hub</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">

          {/* PC版：カラーテーマ切り替え (究極の水平ドット) */}
          <div className="hidden lg:block mr-2">
            <ThemeSwitcher variant="dropdown" />
          </div>

          <div className="hidden sm:flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-primary/5 border border-primary/20 text-primary mr-2 transition-colors">
            <Shield className="h-3.5 w-3.5" />
            <span className="text-[10px] font-black tracking-[0.15em] uppercase whitespace-nowrap">Prime Bears</span>
          </div>

          <ThemeToggle variant="icon" />

          <button className="relative p-2.5 rounded-full hover:bg-muted/50 text-muted-foreground transition-all group active:scale-90">
            <Bell className="h-5 w-5 group-hover:scale-110 transition-transform" />
            <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-red-500 border-2 border-background animate-pulse" />
          </button>
        </div>
      </div>

      <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-primary/15 to-transparent opacity-50" />
    </header>
  );
}