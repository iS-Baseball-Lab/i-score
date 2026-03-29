// src/app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
/**
 * 💡 究極のルートレイアウト (Tailwind v4 安定化版)
 * 1. 修正: ThemeProvider の設定を調整。v4 の .dark クラス運用を確実にします。
 * 2. 意匠: globals.css の oklch 変数と背景グラデーションを最大限活かす構成。
 */
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";

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
    // suppressHydrationWarning は next-themes 使用時に必須です
    <html lang="ja" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          inter.variable
        )}
      >
        <ThemeProvider
          attribute="class"    // 💡 <html> に .dark クラスを付与
          defaultTheme="system" // 💡 デフォルトはシステム設定
          enableSystem={true}
          disableTransitionOnChange={false} // アニメーションを有効にして変化を分かりやすく
        >
          <Toaster
            position="top-center"
            toastOptions={{
              className: "rounded-2xl border-border bg-background/80 backdrop-blur-md font-bold shadow-none",
            }}
          />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}