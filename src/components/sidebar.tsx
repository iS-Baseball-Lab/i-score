// src/components/sidebar.tsx
"use client";

import React, { useState, useEffect } from "react";
/**
 * 💡 PC用サイドバー・コンポーネント
 * 1. 構成: 上段にメイン5項目、下段に管理系3項目、最下部にアカウント。
 * 2. 機能: 既存の開閉トグルボタンを完備。D1データベースからユーザー情報を取得。
 * 3. 意匠: 選択枠を rounded-full にし、影を排した透過UI。行間を極限まで詰めた高密度設計。
 * 4. 連携: 参加申請の保留件数をAPIから取得し、バッジに反映。
 */
import {
    Trophy,
    Users2,
    History,
    Settings,
    UserCheck,
    ChevronRight,
    ChevronLeft,
    User,
    LogOut,
    LayoutGrid,
    PlusSquare,
    Users
} from "lucide-react";
import { RiTeamFill } from "react-icons/ri";
import { cn } from "@/lib/utils";

// --- 型定義 ---
interface UserProfile {
    name: string;
    role: string;
    avatarUrl?: string;
}

interface NavItem {
    id: string;
    label: string;
    icon: React.ElementType;
    path: string;
    badgeCount?: number;
    hasBadge?: boolean;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ⚾️ メニュー定義
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const mainNavItems: NavItem[] = [
    { id: "dashboard", label: "ダッシュボード", icon: LayoutGrid, path: "/dashboard" },
    { id: "team", label: "チーム", icon: Users, path: "/teams/profile" },
    { id: "players", label: "選手名簿", icon: Users2, path: "/players" },
    { id: "map", label: "大会マップ", icon: Trophy, path: "/tournaments/map" },
    { id: "history", label: "試合記録", icon: History, path: "/matches/history" },
];

const adminNavItems: NavItem[] = [
    { id: "register", label: "大会管理", icon: PlusSquare, path: "/tournaments/register" },
    { id: "requests", label: "参加申請", icon: UserCheck, path: "/teams/requests", hasBadge: true },
    { id: "settings", label: "設定", icon: Settings, path: "/settings" },
];

interface SidebarProps {
    activeTab: string;
    onNavigate: (path: string, id: string) => void;
}

export function Sidebar({ activeTab, onNavigate }: SidebarProps) {
    const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
    const [user, setUser] = useState<UserProfile | null>(null);
    const [pendingRequests, setPendingRequests] = useState<number>(0);

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🚀 D1データベース連携 (API Fetch)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    useEffect(() => {
        const fetchSidebarData = async () => {
            try {
                // 1. ユーザープロフィールの取得
                const userRes = await fetch("/api/user/profile");
                if (userRes.ok) {
                    // 💡 明示的なキャストによる型安全の確保
                    const userData = (await userRes.json()) as UserProfile;
                    setUser(userData);
                }

                // 2. 参加申請の保留件数を取得
                const requestRes = await fetch("/api/teams/requests/count?status=pending");
                if (requestRes.ok) {
                    // 💡 レスポンスの型を厳密に指定
                    const { count } = (await requestRes.json()) as { count: number };
                    setPendingRequests(count);
                }
            } catch (error) {
                console.error("サイドバーのデータ取得に失敗しました:", error);
            }
        };

        fetchSidebarData();
    }, []);

    const renderButton = (item: NavItem) => {
        const isActive = activeTab === item.id;
        const Icon = item.icon;

        // 💡 hasBadgeプロパティに基づく安全なバッジ件数の算出
        const currentBadgeCount = item.hasBadge && item.id === "requests" ? pendingRequests : 0;

        return (
            <button
                key={item.id}
                onClick={() => onNavigate(item.path, item.id)}
                className={cn(
                    "flex items-center gap-3 w-full p-2.5 transition-all duration-200 group/btn",
                    isActive
                        ? "bg-primary/10 text-primary border border-primary/20 rounded-full"
                        : "text-muted-foreground hover:bg-muted/40 border border-transparent rounded-full",
                    isCollapsed && "justify-center px-0"
                )}
                title={isCollapsed ? item.label : undefined}
            >
                <div className="relative">
                    <Icon className={cn("h-4.5 w-4.5 shrink-0 transition-transform group-hover/btn:scale-110", isActive && "stroke-[2.5px]")} />
                    {isCollapsed && currentBadgeCount > 0 && (
                        <div className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                    )}
                </div>

                {!isCollapsed && (
                    <span className={cn("font-bold text-[13px] whitespace-nowrap", isActive && "font-black")}>
                        {item.label}
                    </span>
                )}

                {!isCollapsed && currentBadgeCount > 0 && (
                    <div className="ml-auto px-1.5 py-0.5 rounded-full bg-red-500 text-[9px] font-black text-white animate-in zoom-in duration-300">
                        {currentBadgeCount}
                    </div>
                )}
            </button>
        );
    };

    return (
        <nav className={cn(
            "fixed left-0 top-0 bottom-0 z-50 hidden md:flex flex-col bg-background/40 backdrop-blur-3xl border-r border-border/40 transition-all duration-300",
            isCollapsed ? "w-16" : "w-56"
        )}>
            {/* 開閉トグルボタン */}
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
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

            {/* 上段：メインメニュー (閲覧・活動系) */}
            <div className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto scrollbar-hide">
                {mainNavItems.map(renderButton)}
            </div>

            {/* 下段：管理・設定メニュー (Management) */}
            <div className="px-2 py-3 space-y-0.5 border-t border-border/40 bg-muted/5">
                {!isCollapsed && (
                    <p className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-[0.2em] px-3 mb-1.5">Management</p>
                )}
                {adminNavItems.map(renderButton)}
            </div>

            {/* アカウント表示 (D1データ反映済) */}
            <div className="p-2 border-t border-border/40 bg-muted/10">
                <button className={cn(
                    "flex items-center gap-3 w-full p-1.5 rounded-full hover:bg-muted/50 transition-colors text-left group/account",
                    isCollapsed && "justify-center p-1"
                )}>
                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0 border border-primary/30 text-primary overflow-hidden">
                        {user?.avatarUrl ? (
                            <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" />
                        ) : (
                            <User className="h-4 w-4" />
                        )}
                    </div>
                    {!isCollapsed && (
                        <div className="flex-1 overflow-hidden">
                            <p className="text-[12px] font-black truncate text-foreground leading-none">
                                {user?.name || "ゲスト"}
                            </p>
                            <p className="text-[9px] font-bold text-muted-foreground uppercase mt-1">
                                {user?.role || "Member"}
                            </p>
                        </div>
                    )}
                    {!isCollapsed && <LogOut className="h-3.5 w-3.5 text-muted-foreground opacity-30 group-hover/account:opacity-100 transition-opacity" />}
                </button>
            </div>
        </nav>
    );
}