// src/app/layout.tsx
"use client";

import React, { useState } from "react";
/**
 * 💡 保護ルート共通レイアウト (型安全・レイアウト修正版)
 * 1. 修正: MobileDrawer への関数渡しにおける型エラー (2322) を引数の調整で解消。
 * 2. 修正: 画面が横に溢れる問題を margin(ml) から padding(pl) 制御に変更して解決。
 * 3. 構成: PCサイドバー、モバイルボトムナビ、モバイルドロワー、ヘッダーを完全統合。
 * 4. 意匠: 影なし・透過・Stadium Sync 背景を全画面で同期。
 */
import { usePathname, useRouter } from "next/navigation";
import { Sidebar, NavItem } from "@/components/sidebar";
import { Header } from "@/components/header";
import { BottomNavigation } from "@/components/bottom-navigation";
import { MobileDrawer } from "@/components/mobile-drawer";
import { cn } from "@/lib/utils";
import {
	LayoutGrid,
	Users,
	Users2,
	Trophy,
	History,
	PlusSquare,
	UserCheck,
	Settings
} from "lucide-react";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ⚾️ メニュー構成定義 (NavItem スキーマ厳守)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const mainNavItems: NavItem[] = [
	{ name: "ダッシュボード", href: "/dashboard", icon: LayoutGrid, show: true, exact: true },
	{ name: "チーム", href: "/teams/profile", icon: Users, show: true },
	{ name: "選手名簿", href: "/players", icon: Users2, show: true },
	{ name: "大会マップ", href: "/tournaments/map", icon: Trophy, show: true },
	{ name: "試合記録", href: "/matches/history", icon: History, show: true },
];

const bottomNavItems: NavItem[] = [
	{ name: "大会管理", href: "/tournaments/register", icon: PlusSquare, show: true },
	{ name: "参加申請", href: "/teams/requests", icon: UserCheck, show: true },
	{ name: "設定", href: "/settings", icon: Settings, show: true },
];

export default function ProtectedLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const pathname = usePathname() || "";
	const router = useRouter();

	// 💡 サイドバー・ドロワーの状態管理
	const [isCollapsed, setIsCollapsed] = useState(false);
	const [isDrawerOpen, setIsDrawerOpen] = useState(false);

	// モックセッション (実際は auth-client 等から取得)
	const session = { user: { name: "山田 監督", role: "Admin", image: null } };
	const isUploadingAvatar = false;

	/**
	 * 💡 共通ナビゲーション処理
	 * 型エラー回避のため、第2引数 id をオプション (?) に修正
	 */
	const handleNavigate = (path: string, id?: string) => {
		router.push(path);
		setIsDrawerOpen(false);
	};

	const handleLogout = () => {
		console.log("Logout triggered");
	};

	return (
		<div className="min-h-screen bg-background text-foreground relative flex flex-col">

			{/* 💻 デスクトップ：サイドバー (md以上) */}
			<Sidebar
				session={session}
				pathname={pathname}
				isCollapsed={isCollapsed}
				toggleSidebar={() => setIsCollapsed(!isCollapsed)}
				mainNavItems={mainNavItems}
				bottomNavItems={bottomNavItems}
				onClickAvatar={() => router.push("/user")}
				isUploadingAvatar={isUploadingAvatar}
				onLogout={handleLogout}
			/>

			{/* 🏟 コンテンツエリア本体 */}
			<div className={cn(
				"flex-1 flex flex-col transition-all duration-300 min-h-screen",
				// 💡 修正ポイント: ml-56 ではなく pl-56 を使用
				// これにより、要素を「外に押し出す」のではなく「内側に余白を作る」ため、
				// 画面幅が100%を超えて横スクロールが発生するのを防ぎます。
				isCollapsed ? "md:pl-16" : "md:pl-56"
			)}>

				{/* ヘッダー */}
				<Header />

				<main className="flex-1 pb-24 md:pb-8 relative">
					{/* STADIUM SYNC: 全画面共通背景グラデーション */}
					<div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(var(--primary),0.05),transparent)] pointer-events-none -z-10" />

					{/* 子要素（各ページ）のレンダリング */}
					<div className="w-full h-full relative z-0">
						{children}
					</div>
				</main>
			</div>

			{/* 📱 モバイル：ボトムナビゲーション (md未満) */}
			<BottomNavigation
				activeTab={pathname}
				onNavigate={(path) => handleNavigate(path)}
				onOpenDrawer={() => setIsDrawerOpen(true)}
			/>

			{/* 📱 モバイル：設定ドロワー (handleNavigate の型不整合を解消) */}
			<MobileDrawer
				isOpen={isDrawerOpen}
				onClose={() => setIsDrawerOpen(false)}
				onNavigate={(path) => handleNavigate(path)}
			/>
		</div>
	);
}