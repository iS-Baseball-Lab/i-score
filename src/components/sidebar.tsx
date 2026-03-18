// src/components/sidebar.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { LogoIcon } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { UserCircle, LogOut, Camera, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface NavItem {
    name: string;
    href: string;
    icon: React.ElementType;
    show: boolean;
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
    session, pathname, isCollapsed, toggleSidebar,
    mainNavItems, bottomNavItems, onClickAvatar,
    isUploadingAvatar, onLogout
}: SidebarProps) {
    return (
        <aside className="hidden md:flex fixed inset-y-0 left-0 z-50 flex-col border-r border-border/50 bg-card/95 backdrop-blur-xl shadow-[4px_0_24px_rgba(0,0,0,0.02)] transition-[width] duration-300 ease-in-out w-[var(--sidebar-width,300px)]">

            <button
                onClick={toggleSidebar}
                className="absolute -right-3.5 top-10 bg-background border border-border/50 rounded-full p-1.5 shadow-sm text-muted-foreground hover:text-primary hover:scale-110 transition-all z-50 flex items-center justify-center"
            >
                {isCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
            </button>

            <div className={cn("h-20 flex items-center border-b border-border/40 shrink-0 transition-all duration-300", isCollapsed ? "justify-center px-0" : "px-8")}>
                <Link href="/" className="flex items-center gap-2 group transition-opacity hover:opacity-80">
                    <LogoIcon className={cn("transition-transform duration-300", isCollapsed ? "h-8 w-8" : "h-9 w-9 group-hover:scale-110")} />
                    {!isCollapsed && <span className="font-black italic text-2xl tracking-tighter text-foreground group-hover:text-primary transition-colors">i-Score</span>}
                </Link>
            </div>

            <div className={cn("flex-1 overflow-y-auto py-6 scrollbar-hide flex flex-col transition-all duration-300", isCollapsed ? "px-3" : "px-5")}>
                <nav className="flex flex-col gap-1">
                    {!isCollapsed && <div className="px-3 mb-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Main Menu</div>}
                    {mainNavItems.map((item) => {
                        if (!item.show) return null;
                        const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
                        return (
                            <Link
                                key={item.href} href={item.href} title={isCollapsed ? item.name : undefined}
                                className={cn(
                                    "flex items-center transition-all duration-300 group",
                                    isCollapsed ? "justify-center h-10 w-10 rounded-[14px] mx-auto" : "gap-3 px-4 py-2.5 rounded-[14px]",
                                    isActive ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 font-black scale-[1.02]" : "text-muted-foreground font-bold hover:bg-muted/80 hover:text-foreground active:scale-[0.98]"
                                )}
                            >
                                <item.icon className={cn("transition-transform duration-300", isCollapsed ? "h-[20px] w-[20px]" : "h-[18px] w-[18px]", isActive && !isCollapsed ? "scale-110" : "group-hover:scale-110")} />
                                {!isCollapsed && <span>{item.name}</span>}
                            </Link>
                        );
                    })}
                </nav>

                <nav className="flex flex-col gap-1 mt-auto pt-8">
                    {!isCollapsed && <div className="px-3 mb-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Settings & Admin</div>}
                    {bottomNavItems.map((item) => {
                        if (!item.show) return null;
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href} href={item.href} title={isCollapsed ? item.name : undefined}
                                className={cn(
                                    "flex items-center transition-all duration-300 group",
                                    isCollapsed ? "justify-center h-10 w-10 rounded-[14px] mx-auto" : "gap-3 px-4 py-2.5 rounded-[14px]",
                                    isActive ? "bg-primary/10 text-primary font-black" : "text-muted-foreground font-bold hover:bg-muted/80 hover:text-foreground active:scale-[0.98]"
                                )}
                            >
                                <item.icon className={cn("transition-transform duration-300", isCollapsed ? "h-[20px] w-[20px]" : "h-[18px] w-[18px]", isActive && !isCollapsed ? "scale-110" : "group-hover:scale-110")} />
                                {!isCollapsed && <span>{item.name}</span>}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className={cn("mt-auto border-t border-border/40 bg-muted/10 flex flex-col shrink-0 transition-all duration-300", isCollapsed ? "p-3 gap-4 items-center" : "p-5 gap-4")}>
                <div className={cn("flex items-center", isCollapsed ? "justify-center" : "gap-3")}>
                    <div
                        className="relative h-11 w-11 rounded-full border border-border/50 shadow-sm bg-background flex items-center justify-center overflow-hidden cursor-pointer group shrink-0 transition-transform hover:border-primary/50 active:scale-95"
                        onClick={onClickAvatar}
                        title={isCollapsed ? "プロフィール画像を変更" : undefined}
                    >
                        {isUploadingAvatar ? (
                            <Loader2 className="h-5 w-5 animate-spin text-primary" />
                        ) : session.user.image ? (
                            <img src={session.user.image} alt={session.user.name} className="h-full w-full object-cover" />
                        ) : (
                            <UserCircle className="h-7 w-7 text-muted-foreground" />
                        )}
                        {!isUploadingAvatar && (
                            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                                <Camera className="h-4 w-4 text-white" />
                            </div>
                        )}
                    </div>
                    {!isCollapsed && (
                        <div className="flex flex-col overflow-hidden">
                            <span className="text-sm font-black text-foreground truncate">{session.user.name}</span>
                            <span className="text-[10px] font-bold text-muted-foreground truncate uppercase tracking-widest">{session.user.email}</span>
                        </div>
                    )}
                </div>

                <div className={cn("flex items-center", isCollapsed ? "flex-col gap-3" : "gap-2")}>
                    <div className={cn("bg-background rounded-[12px] border border-border/50 shadow-sm flex items-center justify-center gap-2 transition-all", isCollapsed ? "h-11 w-11 p-0" : "flex-1 h-[42px] p-1")}>
                        <ThemeToggle />
                        {!isCollapsed && <span className="text-xs font-bold text-muted-foreground mr-2">テーマ</span>}
                    </div>
                    <Button variant="outline" size="icon" onClick={onLogout} className={cn("shrink-0 rounded-[12px] border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-colors shadow-sm", isCollapsed ? "h-11 w-11" : "h-[42px] w-[42px]")} title="ログアウト">
                        <LogOut className="h-[16px] w-[16px]" />
                    </Button>
                </div>
            </div>
        </aside>
    );
}