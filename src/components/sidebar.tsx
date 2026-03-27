// src/components/sidebar.tsx
"use client";

import React from "react";
/**
 * 💡 PC用サイドバー・コンポーネント (i-Score 最終統合版)
 * 1. 互換性: SidebarProps と NavItem の定義を既存プロジェクトの仕様に完全復元。
 * 2. 構成: プロパティ経由で渡される mainNavItems と bottomNavItems を上段・下段に表示。
 * 3. 意匠: 選択枠を rounded-full にし、space-y-0.5 の高密度レイアウトを適用。
 * 4. 機能: サイドバー開閉、アバタークリック、ログアウト処理をハンドラ経由で実行。
 */
import {
    ChevronRight,
    ChevronLeft,
    User,
    LogOut,
    Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ⚾️ 型定義 (既存プロジェクト仕様を厳守)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export interface NavItem {
    name: string;
    href: string;
    icon: React.ElementType;
    show: boolean;
    exact?: boolean;
    badge?: number; // 拡張：通知バッジ用
}

interface SidebarProps {
    session: any;
    pathname: string;
    isCollapsed: boolean;
    toggleSidebar: () => void;
    mainNavItems: NavItem[];
    bottomNavItems: NavItem[];
    onClickAvatar: () => void;
    isUploadingAvatar: boolean;
    onLogout: () => void;
}

export function Sidebar({
    session,
    pathname,
    isCollapsed,
    toggleSidebar,
    mainNavItems,
    bottomNavItems,
    onClickAvatar,
    isUploadingAvatar,
    onLogout
}: SidebarProps) {

    /**
     * 💡 ナビゲーションアイテムのレンダリング
     */
    const renderNavButton = (item: NavItem) => {
        if (!item.show) return null;

        // 現在のパスが active かどうか判定 (exactオプションを考慮)
        const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href) && (item.href !== "/dashboard" || pathname === "/dashboard");

        const Icon = item.icon;

        return (
            <button
                key={item.href}
                onClick={() => {
                    if (typeof window !== "undefined") {
                        window.location.href = item.href;
                    }
                }}
                className={cn(
                    "flex items-center gap-3 w-full p-2.5 transition-all duration-200 group/btn",
                    isActive
                        ? "bg-primary/10 text-primary border border-primary/20 rounded-full"
                        : "text-muted-foreground hover:bg-muted/40 border border-transparent rounded-full",
                    isCollapsed && "justify-center px-0"
                )}
                title={isCollapsed ? item.name : undefined}
            >
                <div className="relative">
                    <Icon className={cn("h-4.5 w-4.5 shrink-0 transition-transform group-hover/btn:scale-110", isActive && "stroke-[2.5px]")} />
                    {isCollapsed && item.badge && item.badge > 0 ? (
                        <div className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                    ) : null}
                </div>

                {!isCollapsed && (
                    <span className={cn("font-bold text-[13px] whitespace-nowrap", isActive && "font-black")}>
                        {item.name}
                    </span>
                )}

                {!isCollapsed && item.badge && item.badge > 0 ? (
                    <div className="ml-auto px-1.5 py-0.5 rounded-full bg-red-500 text-[9px] font-black text-white animate-in zoom-in duration-300">
                        {item.badge}
                    </div>
                ) : null}
            </button>
        );
    };

    return (
        <nav className={cn(
            "fixed left-0 top-0 bottom-0 z-50 hidden md:flex flex-col bg-background/40 backdrop-blur-3xl border-r border-border/40 transition-all duration-300",
            isCollapsed ? "w-16" : "w-56"
        )}>
            {/* 💡 開閉トグルボタン */}
            <button
                onClick={toggleSidebar}
                className="absolute -right-3 top-8 flex items-center justify-center h-6 w-6 rounded-full border border-border/60 bg-background text-muted-foreground hover:text-primary transition-all z-10 shadow-sm"
            >
                {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
            </button>

            {/* ロゴエリア */}
            <div className={cn("p-4 pb-3 border-b border-border/40 flex items-center", isCollapsed ? "justify-center" : "gap-3")}>
                <div className="h-8 w-8 rounded-lg bg-card border border-border/50 flex items-center justify-center overflow-hidden shrink-0">
                    <img src="/logo.png" alt="logo" className="h-6 w-6 object-contain" />
                </div>
                {!isCollapsed && (
                    <span className="font-black text-lg italic tracking-tighter text-foreground">i-Score</span>
                )}
            </div>

            {/* 上段：メインメニュー (mainNavItems) */}
            <div className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto scrollbar-hide">
                {mainNavItems.map(renderNavButton)}
            </div>

            {/* 下段：管理・設定メニュー (bottomNavItems) */}
            <div className="px-2 py-3 space-y-0.5 border-t border-border/40 bg-muted/5">
                {!isCollapsed && (
                    <p className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-[0.2em] px-3 mb-1.5">Management</p>
                )}
                {bottomNavItems.map(renderNavButton)}
            </div>

            {/* 💡 アカウント表示エリア (sessionデータ反映) */}
            <div className="p-2 border-t border-border/40 bg-muted/10">
                <div className={cn(
                    "flex items-center gap-3 w-full p-1.5 rounded-full hover:bg-muted/50 transition-colors text-left group/account relative",
                    isCollapsed && "justify-center p-1"
                )}>
                    <button
                        onClick={onClickAvatar}
                        disabled={isUploadingAvatar}
                        className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0 border border-primary/30 text-primary overflow-hidden relative active:scale-95 transition-transform"
                    >
                        {isUploadingAvatar ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : session?.user?.image ? (
                            <img src={session.user.image} alt="" className="h-full w-full object-cover" />
                        ) : (
                            <User className="h-4 w-4" />
                        )}
                    </button>

                    {!isCollapsed && (
                        <div className="flex-1 overflow-hidden" onClick={onClickAvatar}>
                            <p className="text-[12px] font-black truncate text-foreground leading-none">
                                {session?.user?.name || "ゲスト"}
                            </p>
                            <p className="text-[9px] font-bold text-muted-foreground uppercase mt-1">
                                {session?.user?.role || "Admin"}
                            </p>
                        </div>
                    )}

                    {!isCollapsed && (
                        <button
                            onClick={onLogout}
                            className="p-1.5 rounded-full hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors"
                            title="ログアウト"
                        >
                            <LogOut className="h-3.5 w-3.5" />
                        </button>
                    )}
                </div>
            </div>
        </nav>
    );
}