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
  const [isScrolled, setIsScrolled] = useState(false);

  // 💡 究極のテーマ管理（localStorageによる保持機能付き）
  useEffect(() => {
    const root = document.documentElement;
    const systemThemeMedia = window.matchMedia("(prefers-color-scheme: dark)");

    // 1. 保存されたテーマがあれば読み込む
    const savedTheme = localStorage.getItem("iscore-theme") as Theme | null;
    if (savedTheme) {
      setTheme(savedTheme);
    }

    const applyTheme = (currentTheme: Theme) => {
      root.classList.remove("light", "dark");
      if (currentTheme === "system") {
        root.classList.add(systemThemeMedia.matches ? "dark" : "light");
      } else {
        root.classList.add(currentTheme);
      }
    };

    applyTheme(savedTheme || theme);

    const handleSystemThemeChange = () => {
      if (theme === "system") applyTheme("system");
    };

    systemThemeMedia.addEventListener("change", handleSystemThemeChange);
    return () => systemThemeMedia.removeEventListener("change", handleSystemThemeChange);
  }, [theme]);

  // 💡 テーマを切り替えて保存する関数
  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem("iscore-theme", newTheme);
  };

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

      {/* 🌟 究極の固定ヘッダー */}
      <header className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 h-20 transition-all duration-300 ${isScrolled ? "bg-background/80 backdrop-blur-md border-b border-border/50" : "bg-transparent"
        }`}>
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <img src="/logo.webp" alt="iScore Logo" className="h-10 w-10 object-contain drop-shadow-sm" />
          <span className="text-3xl font-black italic tracking-tighter text-foreground drop-shadow-sm">
            iScore
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <div className="flex items-center p-1 border border-border/30 rounded-full bg-background/20 backdrop-blur-md shadow-sm">
            <button
              onClick={() => handleThemeChange("light")}
              className={`p-2 rounded-full transition-all duration-300 ${theme === "light" ? "bg-background shadow-sm text-foreground scale-105" : "dark:text-muted-foreground hover:text-foreground hover:bg-background/50"
                }`}
            >
              <Sun className="h-5 w-5" />
            </button>
            <button
              onClick={() => handleThemeChange("system")}
              className={`p-2 rounded-full transition-all duration-300 ${theme === "system" ? "bg-background shadow-sm text-foreground scale-105" : "dark:text-muted-foreground hover:text-foreground hover:bg-background/50"
                }`}
            >
              <Monitor className="h-5 w-5" />
            </button>
            <button
              onClick={() => handleThemeChange("dark")}
              className={`p-2 rounded-full transition-all duration-300 ${theme === "dark" ? "bg-background shadow-sm text-foreground scale-105" : "dark:text-muted-foreground hover:text-foreground hover:bg-background/50"
                }`}
            >
              <Moon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* 🌟 究極の背景（スタジアム画像をもっとクリアに！） */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* 💡 透過度を上げ(0.5/0.7)、画像をハッキリ見せます */}
        <div className="absolute inset-0 bg-[url('/stadium.webp')] bg-cover bg-center bg-no-repeat bg-fixed opacity-90 dark:opacity-70" />

        {/* 💡 ライトモードの白い壁を大幅に薄くし(0.3)、画像そのままの迫力を活かします */}
        <div className="absolute inset-0 bg-background/20 dark:bg-background/40 backdrop-blur-[2px] transition-colors duration-300" />

        {/* 💡 画面端のグラデーションも最小限に。画像に没入させます */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent pointer-events-none" />
      </div>

      {/* 🌟 ヒーローコンテンツ */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 w-full max-w-5xl mx-auto pt-32 pb-16 animate-in fade-in slide-in-from-bottom-8 duration-1000">

        <div className="space-y-6 text-center w-full max-w-4xl">
          <h1 className="text-5xl md:text-[5rem] lg:text-7xl md:leading-[1.1] font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-br from-foreground to-foreground/70 drop-shadow-sm md:whitespace-nowrap">
            野球の<span className="text-primary drop-shadow-md">今</span>を、<br className="md:hidden" />
            <span className="text-primary drop-shadow-md">次世代</span>へ。
          </h1>
          {/* 🔥 魂のキャッチフレーズ変更！ */}
          <p className="text-lg md:text-xl dark:text-muted-foreground font-medium leading-relaxed tracking-widest mt-6">
            学童野球から草野球まで使える次世代スコアブック。
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

        {/* 🌟 修正: 親の隙間を スマホは gap-3(12px)、PCは gap-6(24px) に可変させます */}
        <div id="features" className="mt-16 w-full max-w-5xl flex flex-wrap justify-center gap-3 sm:gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              // 🔥 修正: スマホ(基本)を w-[calc(50%-6px)] に変更して2列化！
              className="flex-grow-0 flex-shrink-0 w-[calc(50%-6px)] sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]"
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

      <footer className="relative z-10 w-full border-t border-border/40 bg-background/60 backdrop-blur-md py-8 mt-auto">
        <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 opacity-80">
            <img src="/logo.webp" alt="iScore Logo" className="h-6 w-6 object-contain grayscale" />
            <span className="text-lg font-black italic tracking-tighter text-foreground">iScore</span>
          </div>
          <p className="text-sm text-muted-foreground font-medium">
            © {new Date().getFullYear()} iS Baseball Lab. All rights reserved.
          </p>
          <div className="flex gap-4 text-sm text-muted-foreground font-medium">
            <Link href="/terms" className="hover:text-primary transition-colors">利用規約</Link>
            <Link href="/privacy" className="hover:text-primary transition-colors">プライバシー</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}