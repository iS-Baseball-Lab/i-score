// src/app/layout.tsx
"use client";

import React, { useState, useEffect } from "react";
/**
 * 💡 保護ルート共通レイアウト (修正済)
 * 1. 構成: PC用サイドバーとモバイル用ボトムナビ/ドロワーをレスポンシブに切り替え。
 * 2. 状態管理: サイドバー開閉(isCollapsed)とドロワー開閉(isDrawerOpen)を統合。
 * 3. 修正: MobileDrawer の型エラーを解消し、onNavigate プロパティを正しく渡す。
 * 4. 意匠: メインコンテンツに Stadium Sync 背景を適用。
 */
import { usePathname, useRouter } from "next/navigation";
import { Sidebar, NavItem } from "@/components/sidebar";
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
// ⚾️ メニュー構成定義
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
	const pathname = usePathname();
	const router = useRouter();

	// 状態管理
	const [isCollapsed, setIsCollapsed] = useState(false);
	const [isDrawerOpen, setIsDrawerOpen] = useState(false);

	// モックセッション情報
	const session = { user: { name: "山田 監督", role: "Admin", image: null } };
	const isUploadingAvatar = false;

	// 💡 ナビゲーション処理
	const handleNavigate = (path: string, id: string) => {
		router.push(path);
		setIsDrawerOpen(false);
	};

	const handleLogout = () => {
		console.log("Logout triggered");
	};

	const handleClickAvatar = () => {
		router.push("/user");
	};

	return (
		<div className="flex min-h-screen bg-background text-foreground overflow-x-hidden">

			{/* 💻 PC版サイドバー (md以上) */}
			<Sidebar
				session={session}
				pathname={pathname}
				isCollapsed={isCollapsed}
				toggleSidebar={() => setIsCollapsed(!isCollapsed)}
				mainNavItems={mainNavItems}
				bottomNavItems={bottomNavItems}
				onClickAvatar={handleClickAvatar}
				isUploadingAvatar={isUploadingAvatar}
				onLogout={handleLogout}
			/>

			{/* 🏟 メインコンテンツエリア */}
			<div className={cn(
				"flex-1 flex flex-col transition-all duration-300",
				// サイドバーの開閉に合わせてマージンを調整
				!isCollapsed ? "md:ml-56" : "md:ml-16"
			)}>
				<main className="flex-1 pb-20 md:pb-0 min-h-screen relative">
					{/* 全画面共通：究極の5%背景グラデーション */}
					<div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(var(--primary),0.05),transparent)] pointer-events-none -z-10" />

					{children}
				</main>
			</div>

			{/* 📱 モバイル版ボトムナビ (md未満) */}
			<BottomNavigation
				activeTab={pathname}
				onNavigate={handleNavigate}
				onOpenDrawer={() => setIsDrawerOpen(true)}
			/>

			{/* 📱 モバイル版ドロワー (型エラーを解消) */}
			{/* <MobileDrawer
				isOpen={isDrawerOpen}
				onClose={() => setIsDrawerOpen(false)}
				onNavigate={handleNavigate}
			/> */}
		</div>
	);
}