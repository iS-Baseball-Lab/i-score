// src/components/sidebar.tsx
"use client";

import React from "react";
/**
 * 💡 究極のサイドバー (チームスイッチャー統合版)
 * 1. 整理: 上部に「チームスイッチャー」を配置し、複数チームの掛け持ちに対応。
 * 2. 意匠: 影なし、0.5px境界線。現在のチームカラーに応じた発光。
 * 3. 視認: 自分の現在の「役割（Role）」をチーム名の下にバッジで表示。
 */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  ChevronDown, 
  LayoutGrid, 
  LogOut, 
  Settings, 
  ShieldCheck, 
  SwitchCamera,
  Users,
  Trophy,
  History,
  Menu
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NavItem, SidebarProps } from "@/types/navigation";
import { Badge } from "@/components/ui/badge";

export function Sidebar({ 
  session, 
  pathname, 
  isCollapsed, 
  toggleSidebar,
  mainNavItems,
  bottomNavItems,
  onLogout 
}: SidebarProps) {

  // 仮の現在のチーム情報（本来は session から取得）
  const currentTeam = {
    name: "Prime Bears",
    roleLabel: "監督",
    logo: "/logo.png"
  };

  const NavLink = ({ item }: { item: NavItem }) => {
    const isActive = pathname === item.href || (item.exact === false && pathname.startsWith(item.href));
    const Icon = item.icon;

    return (
      <Link
        href={item.href}
        className={cn(
          "flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 group relative",
          isActive 
            ? "bg-primary/10 text-primary" 
            : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
        )}
      >
        <Icon className={cn("h-5 w-5 shrink-0", isActive && "stroke-[2.5px]")} />
        {!isCollapsed && (
          <span className="text-sm font-black italic tracking-tight uppercase">{item.name}</span>
        )}
        {isActive && (
          <div className="absolute left-0 w-1 h-6 bg-primary rounded-r-full" />
        )}
      </Link>
    );
  };

  return (
    <aside className={cn(
      "fixed left-0 top-0 h-screen z-50 bg-background/40 backdrop-blur-3xl border-r border-border/40 transition-all duration-500 ease-in-out hidden md:flex flex-col",
      isCollapsed ? "w-20" : "w-64"
    )}>
      
      {/* 1. チームスイッチャーエリア */}
      <div className="p-4 border-b border-border/40">
        <button className={cn(
          "w-full flex items-center gap-3 p-2 rounded-2xl hover:bg-muted/50 transition-all active:scale-95 group",
          isCollapsed && "justify-center"
        )}>
          <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 shadow-inner">
            <img src={currentTeam.logo} alt="" className="h-6 w-6 object-contain" />
          </div>
          {!isCollapsed && (
            <div className="flex-1 text-left overflow-hidden">
              <p className="text-sm font-black italic text-foreground truncate uppercase leading-none">{currentTeam.name}</p>
              <div className="flex items-center gap-1.5 mt-1.5">
                <Badge variant="outline" className="text-[8px] px-1.5 py-0 rounded-md border-primary/30 text-primary bg-primary/5 font-black uppercase tracking-widest">
                  {currentTeam.roleLabel}
                </Badge>
              </div>
            </div>
          )}
          {!isCollapsed && <ChevronDown className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary transition-colors" />}
        </button>
      </div>

      {/* 2. メインナビゲーション */}
      <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto scrollbar-hide">
        <p className={cn(
          "text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.3em] mb-4 px-4",
          isCollapsed && "text-center px-0"
        )}>
          {isCollapsed ? "•" : "Main Menu"}
        </p>
        {mainNavItems.map((item) => <NavLink key={item.href} item={item} />)}
      </nav>

      {/* 3. 下部固定メニュー */}
      <div className="px-3 py-6 border-t border-border/40 space-y-2">
        {bottomNavItems.map((item) => <NavLink key={item.href} item={item} />)}
        
        <button
          onClick={onLogout}
          className={cn(
            "flex items-center gap-3 w-full px-4 py-3 rounded-2xl text-muted-foreground hover:bg-red-500/5 hover:text-red-500 transition-all group",
            isCollapsed && "justify-center"
          )}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!isCollapsed && <span className="text-sm font-black italic uppercase">Logout</span>}
        </button>

        {/* コラップスボタン */}
        <button 
          onClick={toggleSidebar}
          className="hidden md:flex items-center justify-center w-full py-4 opacity-20 hover:opacity-100 transition-opacity"
        >
          <Menu className="h-4 w-4" />
        </button>
      </div>
    </aside>
  );
}
