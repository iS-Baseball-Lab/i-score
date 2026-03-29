"use client";

import React, { useState } from "react";
/**
<<<<<<< HEAD
 * 💡 保護ルート共通レイアウト (デプロイ安定版)
 * 1. 修正: 背景グラデーションを HSL 形式に変更し、デプロイ環境での表示不良を解消。
 * 2. 修正: 画面の横揺れを防ぐため、最外枠に overflow-x-hidden を適用。
 * 3. 構造: サイドバー(fixed)とメインコンテンツ(padding-left制御)の分離を強化。
 * 4. 応答性: モバイル版ボトムナビの表示スペース (pb-24) を確実に確保。
 */
import { usePathname, useRouter } from "next/navigation";

// 💡 整理された設定とコンポーネントをインポート
=======
 * 💡 保護ルート共通レイアウト (究極の整理整頓版)
 * 1. 整理: メニュー定義を src/config/navigation.ts へ分離し、ロジックをクリーンに。
 * 2. レイアウト: padding-left (pl) による安全なサイドバー・オフセットで横溢れを防止。
 * 3. 意匠: 影なし・透過・Stadium Sync 背景を全画面で同期。
 * 4. 安定性: ビルドエラー回避のため、相対パスでのインポートを徹底。
 */
import { usePathname, useRouter } from "next/navigation";

// 💡 整理された設定とコンポーネントをインポート (相対パス)
>>>>>>> 7fd6bac5fc287978cfc3f3626ce8325f803d6dc4
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

<<<<<<< HEAD
  // UI状態管理
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // セッション情報のモック (実際の auth-client 等に合わせて調整)
=======
  // 💡 UI状態管理
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // 💡 セッション情報のモック (実際の実装に合わせて調整してください)
>>>>>>> 7fd6bac5fc287978cfc3f3626ce8325f803d6dc4
  const session = { user: { name: "山田 監督", role: "Admin", image: null } };
  const isUploadingAvatar = false;

  /**
   * 💡 共通ナビゲーション処理
   */
  const handleNavigate = (path: string) => {
    router.push(path);
<<<<<<< HEAD
    setIsDrawerOpen(false);
=======
    setIsDrawerOpen(false); // ナビゲーション実行時にドロワーを閉じる
>>>>>>> 7fd6bac5fc287978cfc3f3626ce8325f803d6dc4
  };

  const handleLogout = () => {
    console.log("Logout triggered");
  };

  return (
<<<<<<< HEAD
    <div className="relative flex min-h-screen w-full bg-background text-foreground overflow-x-hidden">

      {/* 1. 全画面共通：究極の5%背景グラデーション (Stadium Sync) 
          pointer-events-none を付与してクリック操作を邪魔しないようにします */}
      <div
        className="fixed inset-0 pointer-events-none -z-10"
        style={{
          background: 'radial-gradient(circle at 50% 0%, hsl(var(--primary) / 0.05), transparent)'
        }}
      />

      {/* 💻 PC版サイドバー (fixed: z-50) */}
=======
    <div className="min-h-screen bg-background text-foreground relative flex flex-col overflow-x-hidden">

      {/* 💻 PC版サイドバー (md以上) */}
>>>>>>> 7fd6bac5fc287978cfc3f3626ce8325f803d6dc4
      <Sidebar
        session={session}
        pathname={pathname}
        isCollapsed={isCollapsed}
        toggleSidebar={() => setIsCollapsed(!isCollapsed)}
        mainNavItems={MAIN_NAV_ITEMS}
        bottomNavItems={BOTTOM_NAV_ITEMS}
        onClickAvatar={() => router.push("/user")}
        isUploadingAvatar={isUploadingAvatar}
        onLogout={handleLogout}
      />

<<<<<<< HEAD
      {/* 🏟 メインコンテンツラッパー */}
      <div className={cn(
        "flex-1 flex flex-col min-w-0 transition-all duration-300",
        // サイドバーの幅に応じてコンテンツを右に押し出す
        isCollapsed ? "md:ml-16" : "md:ml-56"
      )}>

        {/* 共通ヘッダー (sticky: z-40) */}
        <Header />

        {/* スクロール領域 */}
        <main className="flex-1 w-full relative">
          <div className={cn(
            "p-4 md:p-8 transition-all duration-500",
            // モバイルボトムナビ (h-16) のための余白
            "pb-24 md:pb-12"
          )}>
=======
      {/* 🏟 メインコンテンツエリア */}
      <div className={cn(
        "flex-1 flex flex-col transition-all duration-300 min-h-screen",
        // サイドバーの幅に合わせてコンテンツの左側に余白 (padding) を確保
        isCollapsed ? "md:pl-16" : "md:pl-56"
      )}>

        {/* 共通ヘッダー */}
        <Header />

        {/* モバイル時はボトムナビゲーション用に pb-24 の余白を確保し、
          コンテンツがナビゲーションの下に隠れないようにします。
        */}
        <main className="flex-1 pb-24 md:pb-8 relative">
          {/* STADIUM SYNC: 全画面共通背景グラデーション */}
          <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(var(--primary),0.05),transparent)] pointer-events-none -z-10" />

          <div className="w-full h-full relative z-0">
>>>>>>> 7fd6bac5fc287978cfc3f3626ce8325f803d6dc4
            {children}
          </div>
        </main>
      </div>

<<<<<<< HEAD
      {/* 📱 モバイル：ボトムナビゲーション (fixed: z-[100]) */}
=======
      {/* 📱 モバイル：ボトムナビゲーション (md未満) */}
>>>>>>> 7fd6bac5fc287978cfc3f3626ce8325f803d6dc4
      <BottomNavigation
        activeTab={pathname}
        onNavigate={handleNavigate}
        onOpenDrawer={() => setIsDrawerOpen(true)}
      />

<<<<<<< HEAD
      {/* 📱 モバイル：設定ドロワー (fixed: z-[110]) */}
=======
      {/* 📱 モバイル：設定ドロワー */}
>>>>>>> 7fd6bac5fc287978cfc3f3626ce8325f803d6dc4
      <MobileDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onNavigate={handleNavigate}
      />
    </div>
  );
}