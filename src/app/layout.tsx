// src/app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
/**
 * 💡 究極のルートレイアウト (背景一任 ＋ AppShell統合版)
 * 1. 修正: body タグから `bg-background` クラスを削除。
 * 2. 追加: 全画面共通のヘッダーとボトムナビを管理する `AppShell` を導入。
 */
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { AppShell } from "@/components/layout/app-shell"; // 🔥 追加：アプリの殻

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "i-Score | Baseball Tactical Hub",
  description: "Next-gen baseball scoring and analytics platform.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen font-sans antialiased",
          inter.variable
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem={true}
          disableTransitionOnChange={false}
        >
          <Toaster
            position="top-center"
            toastOptions={{
              className: "rounded-2xl border-border bg-background/80 backdrop-blur-md font-bold shadow-none",
            }}
          />

          {/* 🔥 ここでアプリ全体（children）を AppShell で包み込む！ */}
          <AppShell>
            {children}
          </AppShell>

        </ThemeProvider>
      </body>
    </html>
  );
}