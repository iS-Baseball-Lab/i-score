"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { BottomNavigation } from "@/components/bottom-navigation"; // 💡 パスはご自身の環境に合わせてください

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("dashboard");

  // URLのパスが変わるたびに、ボトムナビの光るアイコン（activeTab）を自動で合わせる
  useEffect(() => {
    if (pathname?.startsWith("/team")) setActiveTab("team");
    else if (pathname?.startsWith("/players")) setActiveTab("players");
    else if (pathname?.startsWith("/tournaments/map")) setActiveTab("map");
    else if (pathname?.startsWith("/dashboard")) setActiveTab("dashboard");
  }, [pathname]);

  const handleNavigate = (path: string, tabId: string) => {
    setActiveTab(tabId);
    router.push(path);
  };

  const handleOpenDrawer = () => {
    console.log("その他メニュー（Drawer）を開く処理をここに書きます");
  };

  // ログイン画面など、ヘッダーとナビを隠したい画面の判定
  const isAuthPage = pathname?.startsWith("/login") || pathname?.startsWith("/register");

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div className="relative min-h-screen flex flex-col bg-background">
      {/* 常に上部に固定される究極のヘッダー */}
      <Header />

      {/* 各画面の中身（ダッシュボードやチームプロフィールがここに入ります） */}
      <main className="flex-1 w-full relative">
        {children}
      </main>

      {/* 常に下部に固定される究極のボトムナビ */}
      <BottomNavigation
        activeTab={activeTab}
        onNavigate={handleNavigate}
        onOpenDrawer={handleOpenDrawer}
      />
    </div>
  );
}