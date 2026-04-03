// src/components/layout/header.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes"; // 💡 テーマ切り替え用
import { BellRing, Shield, Zap, LogOut, Settings, Users, Crown, ChevronDown, Check, Plus, Sun, Moon, Monitor } from "lucide-react";
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

interface AuthResponse {
  success: boolean;
  data: UserSession;
}

export function Header() {
  const router = useRouter();
  const { theme, setTheme } = useTheme(); // 💡 3連ボタン用
  const [user, setUser] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [localActiveTeamId, setLocalActiveTeamId] = useState<string | null>(null);

  // 💡 仮の通知件数（将来的にAPIから取得）
  const unreadNotificationsCount = 3;

  useEffect(() => {
    setLocalActiveTeamId(localStorage.getItem("iScore_selectedTeamId"));

    const fetchUser = async () => {
      try {
        const response = await fetch("/api/auth/me", {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            "Pragma": "no-cache"
          }
        });

        if (!response.ok) throw new Error("Failed to fetch user");
        const json = await response.json() as AuthResponse;
        if (json.success) setUser(json.data);
      } catch (error) {
        console.error("User fetch error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => router.push("/login");

  const handleTeamSwitch = (teamId: string, orgId?: string) => {
    localStorage.setItem("iScore_selectedTeamId", teamId);
    if (orgId) localStorage.setItem("iScore_selectedOrgId", orgId);
    setLocalActiveTeamId(teamId);
    window.location.href = "/dashboard";
  };

  const activeTeam = user?.memberships?.find(m => m.teamId === localActiveTeamId)
    || user?.memberships?.find(m => m.teamId === user.currentTeamId)
    || user?.memberships?.find(m => m.isMainTeam)
    || user?.memberships?.[0];

  const isAdmin = (user as any)?.role === 'SYSTEM_ADMIN' || (user as any)?.systemRole === 'SYSTEM_ADMIN';

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-background/60 backdrop-blur-xl border-b border-border/40 transition-colors duration-200">
      <div className="flex h-16 items-center justify-between px-3 sm:px-8">

        {/* 左側: モバイルロゴ & アプリタイトル */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <img src="/logo.png" alt="i-Score Logo" className="md:hidden h-8 w-8 sm:h-9 sm:w-9 object-contain drop-shadow-sm cursor-pointer" onClick={() => router.push('/dashboard')} />
          <div className="flex flex-col justify-center cursor-pointer" onClick={() => router.push('/dashboard')}>
            <h1 className="text-lg sm:text-2xl font-black italic tracking-tighter text-foreground leading-none">i-Score</h1>
            <div className="flex items-center gap-1 mt-0.5 opacity-60 md:hidden">
              <Zap className="h-2.5 w-2.5 text-primary fill-primary hidden sm:block" />
              <span className="text-[8px] sm:text-[9px] font-bold tracking-widest text-muted-foreground whitespace-nowrap hidden min-[380px]:block">野球の今を、次世代へ。</span>
            </div>
          </div>
        </div>

        {/* 右側: ツールエリア（超絶スッキリ化！） */}
        <div className="flex items-center gap-2 sm:gap-3 pl-2 w-full justify-end">

          {/* SYS ADMIN */}
          {isAdmin && (
            <div className="hidden sm:flex items-center gap-1.5 sm:gap-2 pl-1 pr-2 sm:pr-3 py-1 sm:py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 shadow-sm select-none">
              <Avatar className="h-6 w-6 sm:h-7 sm:w-7 border border-amber-500/30 bg-amber-500/20 flex items-center justify-center shrink-0">
                <Crown className="h-3 w-3 sm:h-4 sm:w-4" />
              </Avatar>
              <div className="flex flex-col justify-center overflow-hidden">
                <span className="text-[8px] sm:text-[10px] font-black tracking-widest uppercase truncate leading-tight">SYS ADMIN</span>
                <span className="text-[6px] sm:text-[7px] font-bold opacity-80 uppercase truncate leading-none mt-0.5">運営管理者</span>
              </div>
            </div>
          )}

          {/* 🔥 チームバッジ（スペースが空いたので、スマホでもかなり広く表示可能に！） */}
          {activeTeam && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div
                  className="flex items-center gap-1.5 sm:gap-2 pl-1 pr-1.5 sm:pr-2 py-1.5 rounded-full bg-background/50 backdrop-blur-md border border-primary/40 text-foreground shadow-[0_2px_10px_-2px_rgba(var(--primary),0.1)] hover:bg-primary/5 hover:border-primary/60 transition-all cursor-pointer group flex-1 max-w-[200px] sm:max-w-[260px] outline-none"
                  title="チームを切り替える"
                >
                  <Avatar className="h-7 w-7 sm:h-8 sm:w-8 border border-primary/20 bg-primary/10 group-hover:bg-primary/20 transition-colors shrink-0">
                    <AvatarFallback className="text-primary font-black text-[10px] sm:text-[11px]">
                      {((activeTeam as any).organizationName || activeTeam.teamName || "T").slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col justify-center overflow-hidden flex-1">
                    <span className="text-[11px] sm:text-xs font-black tracking-widest uppercase truncate leading-tight group-hover:text-primary transition-colors">
                      {(activeTeam as any).organizationName || activeTeam.teamName}
                    </span>
                    <span className="text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase truncate leading-none mt-0.5">
                      {(activeTeam as any).organizationName ? (
                        <>{activeTeam.teamName} <span className="opacity-60">({activeTeam.roleLabel})</span></>
                      ) : activeTeam.roleLabel}
                    </span>
                  </div>
                  <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 text-primary/60 group-hover:text-primary ml-0.5 shrink-0 transition-transform group-data-[state=open]:rotate-180" />
                </div>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-64 sm:w-72 rounded-xl border-border/50 bg-white/95 dark:bg-background/95 backdrop-blur-xl p-2 shadow-lg">
                <DropdownMenuLabel className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-1">所属チーム・編成の切り替え</DropdownMenuLabel>
                {user?.memberships?.map((m) => {
                  const isCurrent = m.teamId === activeTeam.teamId;
                  return (
                    <DropdownMenuItem key={m.teamId} onClick={() => handleTeamSwitch(m.teamId, (m as any).organizationId)} className={`flex items-start gap-3 p-2.5 rounded-lg cursor-pointer transition-colors ${isCurrent ? 'bg-primary/10 text-primary focus:bg-primary/15' : 'hover:bg-muted focus:bg-muted'}`}>
                      <Avatar className={`h-8 w-8 border shrink-0 ${isCurrent ? 'border-primary/30 bg-primary/20' : 'border-border/50 bg-background'}`}>
                        <AvatarFallback className={`font-black text-[10px] ${isCurrent ? 'text-primary' : 'text-muted-foreground'}`}>{((m as any).organizationName || m.teamName || "T").slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col flex-1 overflow-hidden">
                        <span className="text-sm font-bold truncate leading-tight">{(m as any).organizationName || m.teamName}</span>
                        <span className="text-[10px] font-bold opacity-70 truncate mt-0.5">{(m as any).organizationName ? `${m.teamName} (${m.roleLabel})` : m.roleLabel}</span>
                      </div>
                      {isCurrent && <Check className="h-4 w-4 text-primary shrink-0 self-center" />}
                    </DropdownMenuItem>
                  );
                })}
                <DropdownMenuSeparator className="bg-border/50 my-2" />
                <DropdownMenuItem onClick={() => router.push('/teams')} className="cursor-pointer gap-2 p-2.5 rounded-lg text-primary hover:text-primary focus:text-primary font-bold">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0"><Plus className="h-4 w-4" /></div>
                  チーム・編成を管理する
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* 🔥 アバター（右上に通知の赤ポチを統合！） */}
          <div className="flex items-center shrink-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="relative flex items-center justify-center rounded-full outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-background transition-transform active:scale-95 group">
                  <Avatar className="h-9 w-9 border border-border/50 shadow-sm group-hover:border-primary/50 transition-colors bg-background">
                    {!isLoading && user ? (
                      <><AvatarImage src={user.avatarUrl || ""} alt={user.name || "User"} className="object-cover" /><AvatarFallback className="bg-primary/10 text-primary font-black text-xs">{(user.name || "U").slice(0, 2).toUpperCase()}</AvatarFallback></>
                    ) : <AvatarFallback className="bg-muted text-muted-foreground font-bold">?</AvatarFallback>}
                  </Avatar>
                  {/* 🔥 通知の赤ポチ（件数がある場合のみ表示） */}
                  {unreadNotificationsCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-red-500 border-2 border-white dark:border-background shadow-sm animate-pulse" />
                  )}
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-72 sm:w-64 rounded-xl border-border/50 bg-white/95 dark:bg-background/95 backdrop-blur-xl p-2 shadow-xl">
                {user && (
                  <>
                    <DropdownMenuLabel className="font-normal p-2">
                      <div className="flex flex-col space-y-1">
                        <p className="text-base sm:text-sm font-bold leading-none">{user.name}</p>
                        <p className="text-sm sm:text-xs leading-none text-muted-foreground mt-1">{user.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-border/50" />
                  </>
                )}

                {/* 🔥 お知らせ（通知）メニュー */}
                <DropdownMenuItem className="cursor-pointer flex items-center justify-between rounded-lg p-2.5 text-sm" onClick={() => console.log('通知画面へ')}>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <BellRing className="h-4 w-4 text-muted-foreground" />
                      {unreadNotificationsCount > 0 && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-500" />}
                    </div>
                    <span className="font-bold">お知らせ</span>
                  </div>
                  {unreadNotificationsCount > 0 && (
                    <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm">{unreadNotificationsCount}件</span>
                  )}
                </DropdownMenuItem>

                <DropdownMenuItem className="cursor-pointer gap-3 rounded-lg p-2.5 text-sm" onClick={() => router.push("/profile")}>
                  <Settings className="h-4 w-4 text-muted-foreground" />
                  <span className="font-bold">アカウント設定</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator className="bg-border/50" />

                {/* 🔥 3連アイコンのテーマスイッチャー */}
                <div className="px-2 py-1.5">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">テーマ設定</p>
                  <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg border border-border/50">
                    <button onClick={() => setTheme("light")} className={`flex-1 flex justify-center items-center py-1.5 rounded-md transition-all ${theme === 'light' ? 'bg-background shadow-sm text-foreground font-bold' : 'text-muted-foreground hover:text-foreground'}`}>
                      <Sun className="h-4 w-4" />
                    </button>
                    <button onClick={() => setTheme("dark")} className={`flex-1 flex justify-center items-center py-1.5 rounded-md transition-all ${theme === 'dark' ? 'bg-background shadow-sm text-foreground font-bold' : 'text-muted-foreground hover:text-foreground'}`}>
                      <Moon className="h-4 w-4" />
                    </button>
                    <button onClick={() => setTheme("system")} className={`flex-1 flex justify-center items-center py-1.5 rounded-md transition-all ${theme === 'system' ? 'bg-background shadow-sm text-foreground font-bold' : 'text-muted-foreground hover:text-foreground'}`}>
                      <Monitor className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <DropdownMenuSeparator className="bg-border/50" />

                <DropdownMenuItem className="cursor-pointer gap-3 text-red-500 focus:text-red-500 rounded-lg p-2.5 text-sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4" />
                  <span className="font-bold">ログアウト</span>
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
