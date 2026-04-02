// src/components/layout/header.tsx
/* 💡 究極のヘッダー (R2アバターキャッシュ・API連携完全版✨)
 * 1. 取得: Cloudflare Workers APIからユーザー情報を取得。
 * 2. 画像: Hono+R2で構築された /api/images/ 経由の avatarUrl を表示。
 * 3. 意匠: チームバッジに「チーム名 + 権限」を表示し、現場での事故を防止。
 * ※ 後日 src/components/layout/ へ移動予定
 */
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, Shield, Zap, LogOut, Settings, Users } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { ThemeSwitcher } from "./theme-switcher";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserSession } from "@/types/auth"; // src/types/auth.ts で定義

interface AuthResponse {
  success: boolean;
  data: UserSession;
}

export function Header() {
  const router = useRouter();
  const [user, setUser] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ユーザー情報の取得
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/auth/me");
        if (!response.ok) throw new Error("Failed to fetch user");

        const json = await response.json();
        const result = json as AuthResponse;

        if (result.success) {
          setUser(result.data);
        }
      } catch (error) {
        console.error("User fetch error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    console.log("Logging out...");
    // 現場至上主義: window.locationを使わずルーターで安全に遷移
    router.push("/login");
  };

  // 現在のアクティブチームを特定
  const activeTeam = user?.memberships.find(m => m.teamId === user.currentTeamId)
    || user?.memberships.find(m => m.isMainTeam)
    || user?.memberships[0];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-background/60 backdrop-blur-xl border-b border-border/40 transition-colors duration-200">
      <div className="flex h-16 items-center justify-between px-4 sm:px-8">

        {/* 左側: モバイルロゴ & アプリタイトル */}
        <div className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt="i-Score Logo"
            className="md:hidden h-9 w-9 object-contain shrink-0 drop-shadow-sm"
          />
          <div className="flex flex-col justify-center">
            <h1 className="text-xl sm:text-2xl font-black italic tracking-tighter text-foreground leading-none">
              i-Score
            </h1>
            <div className="flex items-center gap-1 mt-0.5 opacity-60 md:hidden">
              <Zap className="h-2.5 w-2.5 text-primary fill-primary" />
              <span className="text-[9px] font-bold tracking-widest text-muted-foreground whitespace-nowrap">
                野球の「今」を次世代の形へ
              </span>
            </div>
          </div>
        </div>

        {/* 右側: ツールエリア */}
        <div className="flex items-center gap-1 sm:gap-2">

          <div className="hidden lg:block mr-2">
            <ThemeSwitcher variant="dropdown" />
          </div>

          {/* PC版：所属チームバッジ＆役割表示 */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 dark:bg-primary/5 border border-primary/20 text-primary mr-1 shadow-sm dark:shadow-none">
            <Shield className="h-3 w-3" />
            <div className="flex flex-col">
              <span className="text-[10px] font-black tracking-widest uppercase whitespace-nowrap leading-tight">
                {activeTeam?.teamName || "NO TEAM"}
              </span>
              {activeTeam?.roleLabel && (
                <span className="text-[7px] font-bold text-muted-foreground uppercase leading-none mt-0.5">
                  {activeTeam.roleLabel}
                </span>
              )}
            </div>
          </div>

          <ThemeToggle variant="icon" />

          {/* 通知ベル */}
          <button className="relative p-2 sm:p-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-muted/50 text-muted-foreground transition-all group active:scale-90">
            <Bell className="h-5 w-5 group-hover:scale-110 transition-transform" />
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 border-2 border-white dark:border-background animate-pulse" />
          </button>

          {/* アバタードロップダウンメニュー (R2完全対応) */}
          <div className="ml-1 sm:ml-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="rounded-full outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-background transition-transform active:scale-95">
                  <Avatar className="h-9 w-9 sm:h-10 sm:w-10 border-2 border-white shadow-sm hover:scale-105 dark:border-border/50 bg-white">
                    {!isLoading && user ? (
                      <>
                        <AvatarImage src={user.avatarUrl || ""} alt={user.name} className="object-cover" />
                        <AvatarFallback className="bg-primary/10 text-primary font-black text-xs sm:text-sm">
                          {user.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </>
                    ) : (
                      <AvatarFallback className="bg-muted text-muted-foreground font-bold">
                        {isLoading ? "..." : "?"}
                      </AvatarFallback>
                    )}
                  </Avatar>
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-64 rounded-xl border-border/50 bg-white/95 dark:bg-background/95 backdrop-blur-xl">
                {user && (
                  <>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-bold leading-none">{user.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-border/50" />

                    {activeTeam && (
                      <div className="px-2 py-1.5 text-xs">
                        <span className="font-semibold text-primary">{activeTeam.teamName}</span>
                        <span className="ml-2 text-muted-foreground">({activeTeam.roleLabel})</span>
                      </div>
                    )}
                    <DropdownMenuSeparator className="bg-border/50" />
                  </>
                )}

                <DropdownMenuItem className="cursor-pointer gap-2 rounded-lg" onClick={() => router.push("/profile")}>
                  <Settings className="h-4 w-4" />
                  <span>アカウント設定</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer gap-2 rounded-lg" onClick={() => router.push("/teams")}>
                  <Users className="h-4 w-4" />
                  <span>チーム切り替え・管理</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator className="bg-border/50" />

                <DropdownMenuItem
                  className="cursor-pointer gap-2 text-red-500 focus:text-red-500 rounded-lg"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4" />
                  <span>ログアウト</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

        </div>
      </div>
      <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-primary/10 to-transparent" />
    </header>
  );
}
