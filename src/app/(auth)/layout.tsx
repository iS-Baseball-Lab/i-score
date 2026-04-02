// src/app/(protected)/layout.tsx
"use client";

import React, { useState } from "react";
/**
 * 💡 保護ルート共通レイアウト (Better Auth 統合版)
 * 1. 意匠: `bg-transparent` を採用し、globals.css の「光彩 ＋ 波紋」背景を全画面で透過表示。
 * 2. 連携: 監督の `auth-client.ts` を使用してセッション監視とサインアウトを制御。
 * 3. 整理: サイドバーの開閉状態 (isCollapsed) に応じて、メインコンテンツの余白を動的に調整。
 * 4. 応答性: モバイルではヘッダーを上部固定、ナビゲーションを下部に配置する「親指優先」設計。
 */
import { usePathname, useRouter } from "next/navigation";
import { MAIN_NAV_ITEMS, BOTTOM_NAV_ITEMS } from "@/config/navigation";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/layout/header";
import { BottomNavigation } from "@/components/bottom-navigation";
import { MobileDrawer } from "@/components/mobile-drawer";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// 💡 監督の構成した Better Auth クライアントをインポート
import { signOut, useSession } from "@/lib/auth-client";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname() || "";
  const router = useRouter();

  // 💡 Better Auth から現在のセッションを取得
  const { data: sessionData, isPending } = useSession();

  // UI状態管理
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // コンポーネントへ渡すためのセッション情報の整形
  const session = {
    user: {
      name: sessionData?.user?.name || (isPending ? "読み込み中..." : "Guest"),
      role: "Manager", // チーム内の役割は Firestore 等から取得する運用を想定
      image: sessionData?.user?.image || null
    }
  };

  /**
   * 💡 究極のログアウト処理
   * Better Auth の signOut を呼び出し、成功時にログイン画面へ遷移。
   */
  const handleLogout = async () => {
    toast.info("ログアウト中...", { duration: 1500 });
    try {
      await signOut({
        fetchOptions: {
          onSuccess: () => {
            toast.success("ログアウトしました。お疲れ様でした！");
            router.push("/login");
          },
        },
      });
    } catch (error) {
      toast.error("ログアウトに失敗しました");
      console.error(error);
    }
  };

  const handleNavigate = (path: string) => {
    router.push(path);
    setIsDrawerOpen(false);
  };

  return (
    <div className="relative flex min-h-screen w-full bg-transparent text-foreground selection:bg-primary/20">

      {/* 💻 デスクトップ専用サイドバー (z-50)
          PC環境でのみ表示され、開閉状態を保持。
      */}
      <Sidebar
        session={session}
        pathname={pathname}
        isCollapsed={isCollapsed}
        toggleSidebar={() => setIsCollapsed(!isCollapsed)}
        mainNavItems={MAIN_NAV_ITEMS}
        bottomNavItems={BOTTOM_NAV_ITEMS}
        onClickAvatar={() => router.push("/user")}
        isUploadingAvatar={false}
        onLogout={handleLogout}
      />

      {/* 🏟 メインコンテンツ・コンテナ
          サイドバーの幅（56=224px / 16=64px）に合わせて左余白を動的に変更。
      */}
      <div className={cn(
        "flex-1 flex flex-col min-w-0 transition-all duration-500 ease-in-out",
        isCollapsed ? "md:pl-16" : "md:pl-56"
      )}>

        {/* 🏆 共通ヘッダー (sticky top-0)
            モバイル・PC共に最上部に固定され、ページタイトルやテーマ切り替えを提供。
        */}
        <Header />

        {/* コンテンツ本体
            背景の透過を維持するため、ここでは背景色を指定せず children を展開。
        */}
        <main className="flex-1 w-full relative z-0">
          <div className={cn(
            "w-full max-w-7xl mx-auto p-4 md:p-8",
            "pb-24 md:pb-12" // モバイルボトムナビ用の下部余白
          )}>
            {children}
          </div>
        </main>
      </div>

      {/* 📱 モバイル専用パーツ
          画面下部のナビゲーションと、詳細メニュー用のドロワー。
      */}
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
          onLogout={handleLogout}
        />
      </div>
    </div>
  );
}
