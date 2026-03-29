// src/components/theme-toggle.tsx
"use client";

import * as React from "react";
/**
 * 💡 テーマトグル・コンポーネント (修正版)
 * 1. 修正: 判定基準を theme から resolvedTheme に変更。
 * これにより「システム設定」かつ「現在ダークモード」の状態から確実にライトモードへ切り替え可能に。
 * 2. 意匠: 
 * - icon variant: ヘッダー用。Sun/Moonが入れ替わるアニメーション。
 * - segmented variant: ドロワー用。3つの選択肢をカプセル型に配置。
 * 3. 安定性: マウント状態をチェックし、SSR時の Hydration Error を防止。
 */
import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

export function ThemeToggle({ variant = "icon" }: { variant?: "icon" | "segmented" }) {
  // 💡 resolvedTheme を追加取得。これはシステム設定を含めた「現在の実際の色」を返します。
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // クライアントサイドでのマウントを待機 (Hydrationエラー防止)
  React.useEffect(() => setMounted(true), []);

  // マウント前はレイアウトシフトを防ぐために空の領域を表示
  if (!mounted) return <div className="h-10 w-10 md:h-9 md:w-9" />;

  /**
   * 💡 テーマ切り替えロジック
   * 実際の外観 (resolvedTheme) が dark なら light へ、それ以外なら dark へ。
   */
  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 💻 PC版: アイコン循環トグル
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (variant === "icon") {
    return (
      <button
        onClick={toggleTheme}
        className="relative h-10 w-10 flex items-center justify-center rounded-full hover:bg-muted/50 text-muted-foreground transition-all active:scale-90 group shadow-none border-none overflow-hidden"
        aria-label="テーマを切り替える"
      >
        <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 group-hover:text-primary" />
        <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 group-hover:text-primary" />
      </button>
    );
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 📱 モバイル版: セグメント・コントロール
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  return (
    <div className="flex p-1 bg-muted/20 rounded-2xl border border-border/40 w-full backdrop-blur-sm shadow-none">
      {[
        { id: "light", icon: Sun, label: "Light" },
        { id: "dark", icon: Moon, label: "Dark" },
        { id: "system", icon: Monitor, label: "Auto" },
      ].map((item) => {
        // 現在の設定（theme）と一致しているボタンをアクティブにする
        const isActive = theme === item.id;

        return (
          <button
            key={item.id}
            onClick={() => setTheme(item.id)}
            className={cn(
              "flex-1 flex flex-col items-center justify-center gap-1.5 py-3 rounded-xl transition-all duration-300",
              isActive
                ? "bg-background text-primary shadow-sm ring-1 ring-border/10"
                : "text-muted-foreground opacity-40 hover:opacity-100"
            )}
          >
            <item.icon className={cn(
              "h-4.5 w-4.5 transition-transform duration-300",
              isActive && "animate-in zoom-in-75 duration-300 text-primary"
            )} />
            <span className="text-[9px] font-black uppercase tracking-[0.15em] leading-none">
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}