// src/components/mobile-drawer.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { LogoIcon } from "@/components/logo";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Button } from "@/components/ui/button";
import { UserCircle, LogOut, Camera, Loader2, X, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { NavItem } from "./sidebar";

interface MobileDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    session: any;
    pathname: string;
    mainNavItems: NavItem[];
    bottomNavItems: NavItem[];
    onClickAvatar: () => void;
    isUploadingAvatar: boolean;
    onLogout: () => void;
}

export function MobileDrawer({
    isOpen, onClose, session, pathname,
    mainNavItems, bottomNavItems, onClickAvatar,
    isUploadingAvatar, onLogout
}: MobileDrawerProps) {
    return (
        <>
            {isOpen && (
                <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm transition-opacity md:hidden" onClick={onClose} />
            )}
            <div className={cn(
                "fixed inset-y-0 left-0 z-[70] flex w-[300px] flex-col bg-card/95 backdrop-blur-xl border-r border-border/50 shadow-2xl transition-transform duration-300 ease-out md:hidden",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="flex h-16 items-center justify-between px-6 pt-2">
                    <div className="flex items-center gap-2">
                        <LogoIcon className="h-8 w-8" />
                        <span className="font-black italic text-xl tracking-tighter">i-Score</span>
                    </div>
                    <button onClick={onClose} className="p-2 -mr-2 rounded-full bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground transition-all active:scale-95">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="flex flex-1 flex-col overflow-y-auto py-6">
                    <nav className="flex flex-col gap-1 px-4">
                        <div className="px-4 mb-1 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Main Menu</div>
                        {mainNavItems.map((item) => {
                            if (!item.show) return null;
                            // 💡 exact 判定の適用
                            const isActive = item.exact
                                ? pathname === item.href
                                : (pathname === item.href || pathname?.startsWith(`${item.href}/`));

                            return (
                                <Link key={item.href} href={item.href} onClick={onClose} className={cn("flex items-center gap-3 rounded-[14px] px-4 py-3 text-base font-bold transition-all duration-200", isActive ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 transform scale-[1.02]" : "text-muted-foreground hover:bg-muted hover:text-foreground active:scale-[0.98]")}>
                                    <item.icon className={cn("h-5 w-5", isActive ? "text-primary-foreground" : "text-muted-foreground")} />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>

                    <nav className="flex flex-col gap-1 px-4 mt-auto pt-8">
                        <div className="px-4 mb-1 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Settings & Admin</div>
                        {bottomNavItems.map((item) => {
                            if (!item.show) return null;
                            // 💡 exact 判定の適用
                            const isActive = item.exact
                                ? pathname === item.href
                                : (pathname === item.href || pathname?.startsWith(`${item.href}/`));

                            return (
                                <Link key={item.href} href={item.href} onClick={onClose} className={cn("flex items-center gap-3 rounded-[14px] px-4 py-3 text-base font-bold transition-all duration-200", isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground active:scale-[0.98]")}>
                                    <item.icon className={cn("h-5 w-5", isActive ? "text-primary" : "text-muted-foreground")} />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                {session && (
                    <div className="p-4 pb-8 mt-auto border-t border-border/40 bg-muted/10">
                        <div className="rounded-[24px] bg-background border border-border/50 p-4 space-y-5 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="relative cursor-pointer shrink-0 active:scale-95 transition-transform" onClick={onClickAvatar}>
                                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-muted border border-border/50 text-foreground shadow-sm overflow-hidden relative">
                                        {isUploadingAvatar ? <Loader2 className="h-6 w-6 animate-spin text-primary" /> : session.user.image ? <img src={session.user.image} alt={session.user.name} className="h-full w-full object-cover" /> : <UserCircle className="h-8 w-8 text-muted-foreground" />}
                                    </div>
                                    {!isUploadingAvatar && <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground rounded-full p-1.5 shadow-md border-2 border-background"><Camera className="h-3.5 w-3.5" /></div>}
                                </div>
                                <div className="flex flex-col overflow-hidden">
                                    <span className="text-base font-black truncate">{session.user.name}</span>
                                    <span className="text-[10px] font-bold text-muted-foreground truncate uppercase tracking-widest">{session.user.email}</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-center bg-muted/30 rounded-[16px] p-3 border border-border/50"><ThemeSwitcher /></div>
                            <Button variant="outline" className="w-full rounded-[16px] h-12 border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white font-extrabold transition-colors" onClick={onLogout}><LogOut className="mr-2 h-4 w-4" />ログアウト</Button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
