// src/app/(protected)/layout.tsx
"use client";

import React, { useState } from "react";
/**
 * 💡 保護ルート共通レイアウト (モバイルヘッダー固定版)
 * 1. 修正: モバイルでもヘッダーを上部固定。
 * 2. 意匠: 画面の横揺れを抑えつつ、ヘッダー・サイドバー・ボトムナビの三権分立を確立。
 * 3. 構造: メインエリアの z-index を適切に設定し、背景グラデーションを最背面に配置。
 */
import { usePathname, useRouter } from "next/navigation";
import { MAIN_NAV_ITEMS, BOTTOM_NAV_ITEMS } from "../../config/navigation";
import { Sidebar } from "../../components/sidebar";
import { Header } from "../../components/header";
import { BottomNavigation } from "../../components/bottom-navigation";
import { MobileDrawer } from "../../components/mobile-drawer";
import { cn } from "../../lib/utils";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname() || "";
  const router = useRouter();
  
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const session = { user: { name: "山田 監督", role: "Admin", image: null } };
  const isUploadingAvatar = false;

  const handleNavigate = (path: string) => {
    router.push(path);
    setIsDrawerOpen(false);
  };

  return (
    <div className="relative flex min-h-screen w-full bg-background text-foreground selection:bg-primary/20">
      
      {/* 🏟 STADIUM SYNC: 全画面共通背景 (最背面) */}
      <div className="fixed inset-0 pointer-events-none -z-50 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,theme(colors.primary.DEFAULT/5%),transparent)]" />
      </div>

      {/* 💻 PC版サイドバー (z-50) */}
      <Sidebar
        session={session}
        pathname={pathname}
        isCollapsed={isCollapsed}
        toggleSidebar={() => setIsCollapsed(!isCollapsed)}
        mainNavItems={MAIN_NAV_ITEMS}
        bottomNavItems={BOTTOM_NAV_ITEMS}
        onClickAvatar={() => router.push("/user")}
        isUploadingAvatar={isUploadingAvatar}
        onLogout={() => console.log("Logout")}
      />

      {/* 🏟 メインコンテンツラッパー
          サイドバーの幅に応じて padding-left を制御
      */}
      <div className={cn(
        "flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out",
        isCollapsed ? "md:pl-16" : "md:pl-56"
      )}>
        
        {/* 🏆 ヘッダー (sticky top-0 でモバイル・PC共に固定) */}
        <Header />

        {/* コンテンツ本体
            ヘッダーが固定されているため、中身が隠れないよう配置
        */}
        <main className="flex-1 w-full relative z-0">
          <div className={cn(
            "w-full max-w-7xl mx-auto p-4 md:p-8",
            "pb-24 md:pb-12" // ボトムナビ用の余白
          )}>
            {children}
          </div>
        </main>
      </div>

      {/* 📱 モバイルパーツ (z-50) */}
      <div className="md:hidden">
        <BottomNavigation
          activeTab={pathname}
          onNavigate={handleNavigate}
          onOpenDrawer={() => setIsDrawerOpen(true)}
        />
        <MobileDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          onNavigate={handleNavigate}
        />
      </div>
    </div>
  );
}
