"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
// 🔥 Square, AppWindow, Circle を追加
import { BellRing, LogOut, Settings, Sun, Moon, Monitor, Square, AppWindow, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserSession } from "@/types/auth";

const THEMES = [
  { id: "blue", color: "#0284c7", label: "Blue" },
  { id: "red", color: "#e11d48", label: "Red" },
  { id: "green", color: "#16a34a", label: "Green" },
  { id: "orange", color: "#ea580c", label: "Orange" },
  { id: "teal", color: "#0d9488", label: "Teal" },
  { id: "purple", color: "#7c3aed", label: "Purple" },
  { id: "indigo", color: "#4338ca", label: "Indigo" },
];

// 🌟 デザイン（形状）の選択肢を追加
const DESIGNS = [
  { id: "sharp", icon: Square, label: "Sharp" },
  { id: "modern", icon: AppWindow, label: "Modern" },
  { id: "rounded", icon: Circle, label: "Rounded" },
];

interface UserProfileMenuProps {
  user: UserSession | null;
  isLoading: boolean;
  onLogout: () => void;
}

export function UserProfileMenu({ user, isLoading, onLogout }: UserProfileMenuProps) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  const [activeThemeColor, setActiveThemeColor] = useState<string>("blue");
  // 🌟 デザイン状態の管理を追加
  const [activeDesign, setActiveDesign] = useState<string>("modern");

  const unreadNotificationsCount = 3;

  useEffect(() => {
    // 💡 色とデザインの両方をlocalStorageから復元
    const savedColor = localStorage.getItem("i-score-color-theme") || "blue";
    const savedDesign = localStorage.getItem("i-score-design-theme") || "modern";

    setActiveThemeColor(savedColor);
    setActiveDesign(savedDesign);

    const root = document.documentElement;

    // 色のクラス適用
    THEMES.forEach((t) => root.classList.remove(`theme-${t.id}`));
    root.classList.add(`theme-${savedColor}`);

    // デザインのクラス適用
    DESIGNS.forEach((d) => root.classList.remove(`design-${d.id}`));
    root.classList.add(`design-${savedDesign}`);
  }, []);

  const applyColorTheme = (themeId: string) => {
    const root = document.documentElement;
    THEMES.forEach((t) => root.classList.remove(`theme-${t.id}`));
    root.classList.add(`theme-${themeId}`);
    localStorage.setItem("i-score-color-theme", themeId);
    setActiveThemeColor(themeId);
  };

  // 🌟 デザイン切替処理を追加
  const applyDesignTheme = (designId: string) => {
    const root = document.documentElement;
    DESIGNS.forEach((d) => root.classList.remove(`design-${d.id}`));
    root.classList.add(`design-${designId}`);
    localStorage.setItem("i-score-design-theme", designId);
    setActiveDesign(designId);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="relative flex items-center justify-center rounded-full outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-background transition-transform active:scale-95 group">
          <Avatar className="h-10 w-10 sm:h-11 sm:w-11 border-2 border-border/50 shadow-sm group-hover:border-primary/50 transition-colors bg-background">
            {!isLoading && user ? (
              <><AvatarImage src={user.avatarUrl || ""} alt={user.name || "User"} className="object-cover" /><AvatarFallback className="bg-primary/10 text-primary font-black text-xs sm:text-sm">{(user.name || "U").slice(0, 2).toUpperCase()}</AvatarFallback></>
            ) : <AvatarFallback className="bg-muted text-muted-foreground font-bold">?</AvatarFallback>}
          </Avatar>
          {unreadNotificationsCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-red-500 border-[2.5px] border-white dark:border-background shadow-sm animate-pulse" />
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-72 sm:w-80 rounded-2xl border-border/50 bg-white/95 dark:bg-background/95 backdrop-blur-xl p-2 shadow-2xl">
        {user && (
          <>
            <DropdownMenuLabel className="font-normal p-3">
              <div className="flex flex-col space-y-1">
                <p className="text-lg sm:text-base font-black leading-none">{user.name}</p>
                <p className="text-sm sm:text-xs leading-none text-muted-foreground mt-1.5">{user.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border/50" />
          </>
        )}

        <DropdownMenuItem className="cursor-pointer flex items-center justify-between rounded-xl p-3 text-sm hover:bg-muted/50 transition-colors" onClick={() => console.log('通知画面へ')}>
          <div className="flex items-center gap-3">
            <div className="relative">
              <BellRing className="h-5 w-5 text-muted-foreground" />
              {unreadNotificationsCount > 0 && <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-background" />}
            </div>
            <span className="font-bold text-base sm:text-sm">お知らせ</span>
          </div>
          {unreadNotificationsCount > 0 && (
            <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm">{unreadNotificationsCount}件</span>
          )}
        </DropdownMenuItem>

        <DropdownMenuItem className="cursor-pointer gap-3 rounded-xl p-3 text-sm hover:bg-muted/50 transition-colors" onClick={() => router.push("/profile")}>
          <Settings className="h-5 w-5 text-muted-foreground" />
          <span className="font-bold text-base sm:text-sm">アカウント設定</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-border/50 my-1" />

        <div className="px-3 py-2 bg-muted/20 rounded-xl border border-border/30 mx-1 my-2 shadow-inner">

          {/* 🎨 カラーテーマ */}
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3">Color Theme</p>
          <div className="flex items-center justify-between mb-4 px-1">
            {THEMES.map((t) => (
              <button
                key={t.id}
                onClick={(e) => {
                  e.preventDefault();
                  applyColorTheme(t.id);
                }}
                className={cn(
                  "h-6 w-6 rounded-full transition-all hover:scale-125 active:scale-90 relative",
                  activeThemeColor === t.id && "ring-2 ring-offset-2 ring-offset-background ring-primary scale-110"
                )}
                style={{ backgroundColor: t.color }}
                title={t.label}
              >
                {activeThemeColor === t.id && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-2 w-2 rounded-full bg-white shadow-sm" />
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* 📐 デザイン(角丸)テーマ */}
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 mt-4">Design Style</p>
          <div className="flex gap-1.5 mb-4">
            {DESIGNS.map((d) => {
              const Icon = d.icon;
              const isActive = activeDesign === d.id;
              return (
                <button
                  key={d.id}
                  onClick={(e) => { e.preventDefault(); applyDesignTheme(d.id); }}
                  className={cn(
                    "flex-1 flex flex-col items-center justify-center py-2 gap-1 rounded-lg border transition-all active:scale-95",
                    isActive
                      ? "bg-primary/10 border-primary/50 text-primary shadow-sm"
                      : "bg-background/50 border-border/50 text-muted-foreground hover:bg-muted"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-[10px] font-bold">{d.label}</span>
                </button>
              );
            })}
          </div>

          {/* 🌓 明暗モード */}
          <div className="flex items-center gap-1 bg-background/50 p-1 rounded-lg border border-border/50 shadow-sm mt-2">
            <button onClick={(e) => { e.preventDefault(); setTheme("light"); }} className={`flex-1 flex justify-center items-center py-2 rounded-md transition-all ${theme === 'light' ? 'bg-background shadow text-foreground font-black' : 'text-muted-foreground hover:text-foreground'}`}>
              <Sun className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
            <button onClick={(e) => { e.preventDefault(); setTheme("dark"); }} className={`flex-1 flex justify-center items-center py-2 rounded-md transition-all ${theme === 'dark' ? 'bg-background shadow text-foreground font-black' : 'text-muted-foreground hover:text-foreground'}`}>
              <Moon className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
            <button onClick={(e) => { e.preventDefault(); setTheme("system"); }} className={`flex-1 flex justify-center items-center py-2 rounded-md transition-all ${theme === 'system' ? 'bg-background shadow text-foreground font-black' : 'text-muted-foreground hover:text-foreground'}`}>
              <Monitor className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>
        </div>

        <DropdownMenuSeparator className="bg-border/50 my-1" />

        <DropdownMenuItem className="cursor-pointer gap-3 text-red-500 focus:text-red-500 rounded-xl p-3 text-sm hover:bg-red-500/10 transition-colors" onClick={onLogout}>
          <LogOut className="h-5 w-5" />
          <span className="font-bold text-base sm:text-sm">ログアウト</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}