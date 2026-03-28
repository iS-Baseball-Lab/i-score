// src/components/mobile-drawer.tsx
"use client";

import React, { useState, useEffect } from "react";
/**
 * 💡 モバイル用管理ドロワー・コンポーネント
 * 1. 役割: ボトムナビゲーションの「その他」ボタンから展開される、高機能ナビゲーション。
 * 2. 連携: /api/teams/requests/count から D1 データベースの保留件数をリアルタイム取得。
 * 3. 意匠: 影を排した透過デザイン (backdrop-blur-3xl)、カプセル型 (rounded-full) パーツ。
 * 4. 安定性: MobileDrawerProps に onNavigate を含め、layout.tsx との型安全を確保。
 */
import {
    X,
    History,
    PlusSquare,
    UserCheck,
    Settings,
    ChevronRight,
    User,
    LogOut,
    Shield,
    Activity
} from "lucide-react";
import { cn } from "@/lib/utils";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ⚾️ 型定義 (Strict Schema)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export interface MobileDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    onNavigate: (path: string) => void;
}

export function MobileDrawer({ isOpen, onClose, onNavigate }: MobileDrawerProps) {
    const [pendingCount, setPendingCount] = useState<number>(0);

    /**
     * 🚀 D1 データベース連携 (実データフェッチ)
     * 参加申請の保留件数を取得し、管理メニューに通知バッジとして表示します。
     */
    useEffect(() => {
        if (!isOpen) return;

        const fetchRequestCount = async () => {
            try {
                const res = await fetch("/api/teams/requests/count?status=pending");
                if (res.ok) {
                    const { count } = (await res.json()) as { count: number };
                    setPendingCount(count);
                }
            } catch (error) {
                console.error("D1: 申請件数の取得に失敗しました", error);
            }
        };

        fetchRequestCount();
    }, [isOpen]);

    if (!isOpen) return null;

    // メニューアイテムの定義 (管理セクション)
    const adminItems = [
        { id: "register", name: "大会管理", href: "/tournaments/register", icon: PlusSquare, sub: "Tournament Mgmt" },
        { id: "requests", name: "参加申請", href: "/teams/requests", icon: UserCheck, sub: "Pending Approval", badge: pendingCount },
        { id: "settings", name: "チーム設定", href: "/settings", icon: Settings, sub: "Preferences" },
    ];

    return (
        <div className="fixed inset-0 z-[110] md:hidden bg-background/95 backdrop-blur-3xl animate-in fade-in duration-300">
            <div className="p-6 flex flex-col h-full max-w-lg mx-auto">

                {/* 1. ヘッダー：ブランド & クローズ */}
                <div className="flex justify-between items-center mb-10 border-b border-border/40 pb-6">
                    <div className="flex flex-col">
                        <h2 className="text-3xl font-black italic uppercase tracking-tighter text-foreground">i-Score</h2>
                        <div className="flex items-center gap-1.5 opacity-60">
                            <Activity className="h-3 w-3 text-primary animate-pulse" />
                            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Management Hub</span>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-3 bg-muted/40 rounded-full active:scale-90 transition-all hover:bg-muted border border-border/40"
                        aria-label="Close"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <div className="space-y-10 overflow-y-auto scrollbar-hide flex-1 pb-10">

                    {/* 2. ナビゲーションセクション：データアーカイブ */}
                    <div className="space-y-4">
                        <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.3em] px-4">Match Operations</p>
                        <button
                            onClick={() => { onNavigate('/matches/history'); onClose(); }}
                            className="flex items-center gap-5 w-full p-4 rounded-full bg-card/10 border border-border/40 hover:bg-card/40 active:bg-primary/5 transition-all group"
                        >
                            <div className="p-3.5 rounded-2xl bg-muted/50 text-muted-foreground border border-border/30 group-hover:text-primary group-hover:border-primary/30 transition-all">
                                <History className="h-7 w-7" />
                            </div>
                            <div className="flex-1 text-left">
                                <p className="text-xl font-black tracking-tighter text-foreground leading-tight">試合記録</p>
                                <p className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">Match Intelligence</p>
                            </div>
                            <ChevronRight className="h-5 w-5 mr-2 text-muted-foreground/20 group-hover:translate-x-1 group-hover:text-primary transition-all" />
                        </button>
                    </div>

                    {/* 3. 管理セクション：組織運営 */}
                    <div className="space-y-4">
                        <p className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.3em] px-4">Administration</p>
                        <div className="grid grid-cols-1 gap-2.5">
                            {adminItems.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => { onNavigate(item.href); onClose(); }}
                                    className="flex items-center gap-5 w-full p-4 rounded-full bg-card/10 border border-border/40 hover:bg-card/40 active:bg-primary/5 transition-all group"
                                >
                                    <div className={cn(
                                        "p-3.5 rounded-2xl border border-border/30 transition-all",
                                        item.id === 'requests' && pendingCount > 0
                                            ? "bg-primary/20 text-primary border-primary/40"
                                            : "bg-muted/50 text-muted-foreground group-hover:text-primary group-hover:border-primary/30"
                                    )}>
                                        <item.icon className="h-7 w-7" />
                                    </div>
                                    <div className="flex-1 text-left">
                                        <div className="flex items-center gap-3">
                                            <p className="text-xl font-black tracking-tighter text-foreground leading-tight">{item.name}</p>
                                            {item.badge && item.badge > 0 ? (
                                                <div className="px-2.5 py-0.5 rounded-full bg-red-500 text-[10px] font-black text-white animate-in zoom-in duration-500">
                                                    {item.badge}
                                                </div>
                                            ) : null}
                                        </div>
                                        <p className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">{item.sub}</p>
                                    </div>
                                    <ChevronRight className="h-5 w-5 mr-2 text-muted-foreground/20 group-hover:translate-x-1 group-hover:text-primary transition-all" />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 4. アカウントエリア：最下部固定 */}
                <div className="mt-auto pt-8 border-t border-border/40 space-y-6">
                    <div className="flex items-center gap-4 w-full p-4 rounded-[32px] bg-primary/5 border border-primary/10 relative overflow-hidden group">
                        {/* 💡 STADIUM SYNC: 究極の光彩背景 */}
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(var(--primary),0.08),transparent)]" />

                        <div className="h-14 w-14 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30 text-primary shrink-0 relative z-10 overflow-hidden">
                            <User className="h-8 w-8" />
                        </div>
                        <div className="flex-1 min-w-0 relative z-10">
                            <p className="font-black text-foreground text-xl italic leading-none truncate tracking-tighter">山田 監督</p>
                            <div className="flex items-center gap-2 mt-1.5 opacity-60">
                                <Shield className="h-3 w-3 text-primary" />
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Head of Operations</p>
                            </div>
                        </div>
                        <button
                            className="p-3.5 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-full transition-all relative z-10 active:scale-90"
                            aria-label="Logout"
                        >
                            <LogOut className="h-7 w-7" />
                        </button>
                    </div>

                    <div className="flex flex-col items-center gap-1 opacity-20 pb-4">
                        <p className="text-[9px] font-black tracking-[0.6em] text-muted-foreground uppercase">
                            i-Score OS v2.5 • Tactical Engine
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}