// filepath: src/app/page.tsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
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
  Monitor,
  PlayCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { FeatureCard } from "@/components/feature-card";
import { cn } from "@/lib/utils";

type Theme = "light" | "dark" | "system";

export default function LandingPage() {
  const [theme, setTheme] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  // 💡 近未来的な「データの神経系」を表現する無差別高速パルスの生成
  const pulses = useMemo(() => [...Array(15)].map((_, i) => ({
    id: i,
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    duration: 0.8 + Math.random() * 1.5,
    delay: Math.random() * 5,
    type: i % 3 === 0 ? "h" : i % 3 === 1 ? "v" : "d",
  })), []);

  // 💡 究極のテーマ管理（iScoreCloud 規約に則った堅牢な実装）
  useEffect(() => {
    setMounted(true);
    const root = document.documentElement;
    const systemThemeMedia = window.matchMedia("(prefers-color-scheme: dark)");

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

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem("iscore-theme", newTheme);
  };

  if (!mounted) return null;

  const features = [
    { icon: <Smartphone className="h-10 w-10 text-orange-500" strokeWidth={1.5} />, title: "現場至上主義UI", desc: "太陽光下でも視認性抜群。片手で絶対に間違えない入力設計。", glowColor: "rgba(249, 115, 22, 0.15)" },
    { icon: <Users className="h-10 w-10 text-blue-500" strokeWidth={1.5} />, title: "チーム完全連携", desc: "マネージャーも監督も。リアルタイムでスタッツと戦況を共有。", glowColor: "rgba(59, 130, 246, 0.15)" },
    { icon: <FileSpreadsheet className="h-10 w-10 text-green-500" strokeWidth={1.5} />, title: "早稲田式スコア出力", desc: "入力データを伝統的で美しいスコアブック形式に一発変換。", glowColor: "rgba(34, 197, 94, 0.15)" },
    { icon: <Zap className="h-10 w-10 text-amber-500" strokeWidth={1.5} />, title: "1球速報システム", desc: "球場に来られないメンバーへ。プロ野球並みの1球速報を配信。", glowColor: "rgba(245, 158, 11, 0.15)" },
    { icon: <TrendingUp className="h-10 w-10 text-purple-500" strokeWidth={1.5} />, title: "プロ級の成績分析", desc: "打率、防御率だけでなく、OPSやWHIPなど高度指標を自動計算。", glowColor: "rgba(168, 85, 247, 0.15)" },
    { icon: <Sparkles className="h-10 w-10 text-cyan-500" strokeWidth={1.5} />, title: "AI戦況アシスト", desc: "次のプレイの予測や、打者の傾向分析をAIがアドバイス。", glowColor: "rgba(6, 182, 212, 0.15)" },
  ];

  return (
    <div className="relative min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/30 overflow-hidden">

      {/* 🌟 究極のサイバー背景レイヤー（cyber-stadium.webp を確実に表示） */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 transition-opacity duration-1000">
          <Image
            src="/cyber-stadium.webp"
            alt="iScoreCloud Stadium"
            fill
            className={cn(
              "object-cover object-center transition-all duration-700",
              theme === "light" ? "invert opacity-[0.04] grayscale" : "opacity-30 contrast-[1.1]"
            )}
            priority
          />
        </div>

        {/* 💡 高速無差別交差パルス */}
        <AnimatePresence>
          {pulses.map((p) => (
            <motion.div
              key={p.id}
              initial={p.type === "h" ? { x: "-100%", y: p.top } : p.type === "v" ? { y: "-100%", x: p.left } : { x: "-50%", y: "-50%", opacity: 0 }}
              animate={p.type === "h" ? { x: "200%" } : p.type === "v" ? { y: "200%" } : { x: "150%", y: "150%", opacity: [0, 1, 0] }}
              transition={{ duration: p.duration, repeat: Infinity, ease: "circIn", delay: p.delay }}
              className={cn(
                "absolute blur-[1px] shadow-[0_0_12px_rgba(var(--primary),0.7)]",
                p.type === "h" ? "h-[1.5px] w-64 bg-gradient-to-r from-transparent via-primary/80 to-transparent" :
                  p.type === "v" ? "w-[1.5px] h-64 bg-gradient-to-b from-transparent via-primary/80 to-transparent" :
                    "w-48 h-[1px] bg-gradient-to-br from-transparent via-primary/60 to-transparent rotate-45"
              )}
            />
          ))}
        </AnimatePresence>

        <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-transparent to-background/90" />
      </div>

      {/* 🌟 固定ヘッダー */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 h-20 transition-all duration-300">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <img src="/logo.webp" alt="iScoreCloud Logo" className="h-10 w-10 object-contain drop-shadow-sm" />
          <span className="text-3xl font-black italic tracking-tighter text-foreground drop-shadow-sm">
            iScore<span className="text-primary italic">Cloud</span>
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <div className="flex items-center p-1 border border-border/30 rounded-full bg-background/40 backdrop-blur-md shadow-sm">
            <button
              onClick={() => handleThemeChange("light")}
              className={cn("p-2 rounded-full transition-all duration-300", theme === "light" ? "bg-background shadow-sm text-foreground scale-105" : "text-muted-foreground hover:text-foreground")}
            >
              <Sun className="h-5 w-5" />
            </button>
            <button
              onClick={() => handleThemeChange("system")}
              className={cn("p-2 rounded-full transition-all duration-300", theme === "system" ? "bg-background shadow-sm text-foreground scale-105" : "text-muted-foreground hover:text-foreground")}
            >
              <Monitor className="h-5 w-5" />
            </button>
            <button
              onClick={() => handleThemeChange("dark")}
              className={cn("p-2 rounded-full transition-all duration-300", theme === "dark" ? "bg-background shadow-sm text-foreground scale-105" : "text-muted-foreground hover:text-foreground")}
            >
              <Moon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* 🌟 ヒーローコンテンツ */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 w-full max-w-5xl mx-auto pt-32 pb-16 animate-in fade-in slide-in-from-bottom-8 duration-1000">

        <div className="space-y-8 text-center w-full max-w-4xl">
          <h1 className="text-6xl md:text-[6.5rem] lg:text-[7.5rem] font-black italic tracking-tighter leading-none text-foreground drop-shadow-2xl">
            iScore<span className="text-primary">Cloud</span>
          </h1>
          <p className="text-lg md:text-2xl font-bold tracking-[0.4em] uppercase text-muted-foreground drop-shadow-sm">
            Tactical Data Neural Network
          </p>
        </div>

        <div className="mt-16 flex flex-col sm:flex-row items-center gap-6 w-full sm:w-auto">
          <Link href="/login" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto rounded-[30px] h-20 px-12 text-2xl font-black italic gap-4 shadow-[0_20px_50px_rgba(var(--primary),0.3)] hover:scale-105 transition-all bg-primary">
              <PlayCircle className="w-10 h-10" />
              PLAY BALL
            </Button>
          </Link>
        </div>

        <div id="features" className="mt-32 w-full max-w-5xl flex flex-wrap justify-center gap-3 sm:gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
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

      <footer className="relative z-10 w-full border-t border-border/40 bg-background/60 backdrop-blur-md py-12 mt-auto">
        <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 opacity-80">
            <img src="/logo.webp" alt="Logo" className="h-6 w-6 grayscale" />
            <span className="text-xl font-black italic tracking-tighter text-foreground">iScoreCloud</span>
          </div>
          <p className="text-sm text-muted-foreground font-medium">
            © {new Date().getFullYear()} iS Baseball Lab. FIELD LOGIC PROTOCOL.
          </p>
          <div className="flex gap-4 text-sm text-muted-foreground font-medium">
            <Link href="/terms" className="hover:text-primary">利用規約</Link>
            <Link href="/privacy" className="hover:text-primary">プライバシー</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}