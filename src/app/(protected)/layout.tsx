// src/app/(protected)/layout.tsx
"use client";

import React, { useState } from "react";
/**
 * 💡 保護ルート共通レイアウト (ログアウト機能実装版)
 * 1. 整理: ログアウト処理 (handleLogout) を一元管理し、子コンポーネントへ注入。
 * 2. 挙動: router.push('/login') により、認証画面へ確実に戻します。
 */
import { usePathname, useRouter } from "next/navigation";
import { MAIN_NAV_ITEMS, BOTTOM_NAV_ITEMS } from "../../config/navigation";
import { Sidebar } from "../../components/sidebar";
import { Header } from "../../components/layout/header";
import { BottomNavigation } from "../../components/bottom-navigation";
import { MobileDrawer } from "../../components/mobile-drawer";
import { cn } from "../../lib/utils";
import { toast } from "sonner";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname() || "";
  const router = useRouter();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // 仮のセッション
  const session = { user: { name: "山田 監督", role: "Admin", image: null } };
  const isUploadingAvatar = false;

  /**
   * 💡 究極のログアウト処理
   * 1. 現場（ダッシュボード等）を離れる際の通知。
   * 2. ログイン画面へのルーティング。
   */
  const handleLogout = () => {
    toast.info("ログアウトしています...", {
      description: "お疲れ様でした。ゲートへ戻ります。",
      duration: 1500
    });

    // 💡 実際にはここで Firebase signOut(auth) 等を呼び出します
    setTimeout(() => {
      router.push("/login");
    }, 1000);
  };

  const handleNavigate = (path: string) => {
    router.push(path);
    setIsDrawerOpen(false);
  };

  return (
    <div className="relative flex min-h-screen w-full bg-transparent text-foreground selection:bg-primary/20">

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
        onLogout={handleLogout} // 💡 注入
      />

      <div className={cn(
        "flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out",
        isCollapsed ? "md:pl-16" : "md:pl-56"
      )}>
        <Header />

        <main className="flex-1 w-full relative z-0">
          <div className={cn(
            "w-full max-w-7xl mx-auto p-4 md:p-8",
            "pb-24 md:pb-12"
          )}>
            {children}
          </div>
        </main>
      </div>

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
          onLogout={handleLogout} // 💡 注入
        />
      </div>
    </div>
  );
}
