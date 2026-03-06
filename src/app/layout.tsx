// src/app/layout.tsx
import * as React from "react";
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer"; // 💡 フッターをインポート
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const viewport: Viewport = {
	width: "device-width",
	initialScale: 1,
	maximumScale: 1,
	userScalable: false,
	themeColor: [
		{ media: "(prefers-color-scheme: light)", color: "#ffffff" },
		{ media: "(prefers-color-scheme: dark)", color: "#09090b" },
	],
};

export const metadata: Metadata = {
	title: "i-Score",
	description: "次世代野球スコア記録アプリ",
	manifest: "/manifest.json",
	appleWebApp: {
		capable: true,
		statusBarStyle: "black-translucent",
		title: "i-Score",
	},
	// 💡 iPhoneなどで「ホーム画面に追加」したときのアイコンを指定
	icons: {
		icon: "/logo.png",
		apple: "/logo.png",
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="ja" suppressHydrationWarning>
			<head>
				<script
					dangerouslySetInnerHTML={{
						__html: `
							try {
								var theme = localStorage.getItem('i-score-color-theme');
								if (theme && theme !== 'default') {
									document.documentElement.classList.add(theme);
								}
							} catch (e) {}
						`,
					}}
				/>
			</head>
			{/* 💡 min-h-screen を追加して、フッターが常に一番下にくるように調整 */}
			<body className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}>
				<ThemeProvider
					attribute="class"
					defaultTheme="system"
					enableSystem
					disableTransitionOnChange>
					
					{/* ヘッダー */}
					<Header />
					
					{/* メインコンテンツ（flex-1 で余白をすべて埋める） */}
					<main className="flex-1 flex flex-col">
						{children}
					</main>

					{/* 💡 新しく追加したフッター */}
					<Footer />
		
					{/* 💡 これを追加！リッチな通知が表示されるようになります */}
					<Toaster richColors position="top-center" />
				</ThemeProvider>
			</body>
		</html>
	);
}
