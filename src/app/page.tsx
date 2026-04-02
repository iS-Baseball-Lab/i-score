// src/app/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Smartphone,
  Users,
  FileSpreadsheet,
  Zap,
  TrendingUp,
  Sparkles,
  ShieldCheck,
  Moon,
  Sun,
  Monitor
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { FeatureCard } from "@/components/feature-card";

type Theme = "light" | "dark" | "system";

export default function LandingPage() {
  const [theme, setTheme] = useState<Theme>("system");
  const [isScrolled, setIsScrolled] = useState(false); // 💡 ヘッダースクロール検知用ステート

  // 💡 テーマ設定の副作用
  useEffect(() => {
    const root = document.documentElement;
    const systemThemeMedia = window.matchMedia("(prefers-color-scheme: dark)");

    const applyTheme = (currentTheme: Theme) => {
      root.classList.remove("light", "dark");
      if (currentTheme === "system") {
        root.classList.add(systemThemeMedia.matches ? "dark" : "light");
      } else {
        root.classList.add(currentTheme);
      }
    };

    applyTheme(theme);

    const handleSystemThemeChange = () => {
      if (theme === "system") applyTheme("system");
    };

    systemThemeMedia.addEventListener("change", handleSystemThemeChange);
    return () => systemThemeMedia.removeEventListener("change", handleSystemThemeChange);
  }, [theme]);

  // 💡 スクロール検知の副作用（ヘッダーのガラス化）
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const features = [
    { icon: <Smartphone className="h-10 w-10 text-orange-500" strokeWidth={1.5} />, title: "現場至上主義UI", desc: "太陽光下でも視認性抜群。片手で絶対に間違えない入力設計。", glowColor: "rgba(249, 115, 22, 0.15)" },
    { icon: <Users className="h-10 w-10 text-blue-500" strokeWidth={1.5} />, title: "チーム完全連携", desc: "マネージャーも監督も。リアルタイムでスタッツと戦況を共有。", glowColor: "rgba(59, 130, 246, 0.15)" },
    { icon: <FileSpreadsheet className="h-10 w-10 text-green-500" strokeWidth={1.5} />, title: "早稲田式スコア出力", desc: "入力されたデータを、伝統的で美しいスコアブック形式に一発変換。", glowColor: "rgba(34, 197, 94, 0.15)" },
    { icon: <Zap className="h-10 w-10 text-amber-500" strokeWidth={1.5} />, title: "1球速報システム", desc: "球場に来られないメンバーへ。プロ野球のような1球速報を配信。", glowColor: "rgba(245, 158, 11, 0.15)" },
    { icon: <TrendingUp className="h-10 w-10 text-purple-500" strokeWidth={1.5} />, title: "プロ級の成績分析", desc: "打率や防御率だけでなく、OPSやWHIPなど高度な指標を自動計算。", glowColor: "rgba(168, 85, 247, 0.15)" },
    { icon: <Sparkles className="h-10 w-10 text-cyan-500" strokeWidth={1.5} />, title: "AI戦況アシスト", desc: "次のプレイの予測や、打者の傾向分析をAIがベンチにアドバイス。", glowColor: "rgba(6, 182, 212, 0.15)" },
    { icon: <ShieldCheck className="h-10 w-10 text-rose-500" strokeWidth={1.5} />, title: "鉄壁のセキュリティ", desc: "ゲスト権限と承認フローにより、チームの機密データを安全に保護。", glowColor: "rgba(244, 63, 94, 0.15)" },
  ];

  return (
    <div className="relative min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/30">

      {/* 🌟 究極の固定ヘッダー（スクロールでガラス化） */}
      {/* 💡 absolute から fixed に変更し、isScrolled の状態で背景色を切り替えます */}
      <header className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 h-20 transition-all duration-300 ${isScrolled ? "bg-background/70 backdrop-blur-md border-b border-border/50 shadow-sm" : "bg-transparent"
        }`}>
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <img src="/logo.png" alt="i-Score Logo" className="h-10 w-10 object-contain drop-shadow-sm" />
          <span className="text-3xl font-black italic tracking-tighter text-foreground drop-shadow-sm">
            i-Score
          </span>
        </Link>

        {/* 3連テーマスイッチャー */}
        <div className="flex items-center gap-4">
          <div className={`flex items-center p-1 border rounded-full transition-colors duration-300 ${isScrolled ? "border-border/60 bg-background/50" : "border-border/30 bg-background/30 backdrop-blur-md"
            }`}>
            <button
              onClick={() => setTheme("light")}
              className={`p-2 rounded-full transition-all duration-300 ${theme === "light" ? "bg-background shadow-sm text-foreground scale-105" : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                }`}
              title="ライトモード"
            >
              <Sun className="h-5 w-5" />
            </button>
            <button
              onClick={() => setTheme("system")}
              className={`p-2 rounded-full transition-all duration-300 ${theme === "system" ? "bg-background shadow-sm text-foreground scale-105" : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                }`}
              title="システム設定に従う"
            >
              <Monitor className="h-5 w-5" />
            </button>
            <button
              onClick={() => setTheme("dark")}
              className={`p-2 rounded-full transition-all duration-300 ${theme === "dark" ? "bg-background shadow-sm text-foreground scale-105" : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                }`}
              title="ダークモード"
            >
              <Moon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* 🌟 背景セクション（バグ撲滅・完全版パララックス！） */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* 画像の存在感をしっかり出す (ライト40%, ダーク60%) */}
        <div className="absolute inset-0 bg-[url('/stadium.webp')] bg-cover bg-center bg-no-repeat opacity-40 dark:opacity-60" />

        {/* 💡 バグの原因だったカスタムグラデーションを削除し、純粋な Tailwind のすりガラスに！
             ライトは bg-background/20 (20%の白)、ダークは bg-background/40 で美しくぼかします */}
        <div className="absolute inset-0 bg-background/20 dark:bg-background/40 backdrop-blur-[6px] transition-colors duration-300" />

        {/* 下部からフッターへ溶け込むグラデーション */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
      </div>

      {/* 🌟 ヒーローコンテンツ */}
      {/* 💡 main 全体を relative z-10 にすることで、fixed な背景の上を美しく滑ります */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 w-full max-w-5xl mx-auto pt-32 pb-16 animate-in fade-in slide-in-from-bottom-8 duration-1000">

        <div className="space-y-6 text-center w-full max-w-4xl">
          <h1 className="text-5xl md:text-[5rem] lg:text-7xl md:leading-[1.1] font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-br from-foreground to-foreground/70 drop-shadow-sm md:whitespace-nowrap">
            野球の<span className="text-primary drop-shadow-md transition-colors duration-300">今</span>を、<br className="md:hidden" />
            <span className="text-primary drop-shadow-md transition-colors duration-300">次世代</span>へ。
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground font-medium leading-relaxed tracking-widest mt-6">
            草野球・アマチュア野球のための究極のスコアブック。
            <br className="hidden md:block" />
            現場の熱気をそのままに、指先一つでプロ並みのデータ分析を。
          </p>
        </div>

        <div className="mt-12 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <Link href="/login" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto rounded-full h-14 px-8 text-base font-bold gap-2 shadow-lg shadow-primary/20 hover:scale-105 transition-transform duration-300">
              無料で始める
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>

        {/* 💡 余白圧縮！ mt-28 から mt-16 へ。コンテンツが間延びしません。 */}
        <div id="features" className="mt-16 w-full max-w-5xl flex flex-wrap justify-center gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex-grow-0 flex-shrink-0 w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]"
            >
              <FeatureCard
                icon={feature.icon}
                title={feature.title}
                description={feature.desc}
                glowColor={feature.glowColor}
              />
            </div>
          ))}
        </div>

      </main>

      {/* 🌟 究極のフッター */}
      <footer className="relative z-10 w-full border-t border-border/40 bg-background/60 backdrop-blur-md py-8 mt-auto">
        <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 opacity-80">
            <img src="/logo.png" alt="i-Score Logo" className="h-6 w-6 object-contain grayscale" />
            <span className="text-lg font-black italic tracking-tighter text-foreground">i-Score</span>
          </div>
          <p className="text-sm text-muted-foreground font-medium">
            © {new Date().getFullYear()} i-Score. All rights reserved.
          </p>
          <div className="flex gap-4 text-sm text-muted-foreground font-medium">
            <Link href="#" className="hover:text-primary transition-colors">利用規約</Link>
            <Link href="#" className="hover:text-primary transition-colors">プライバシー</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}