// filepath: src/app/page.tsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Sun, Moon, Monitor, PlayCircle, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** 
 * 💡 iScoreCloud 規約: 
 * テーマ管理は localStorage で保持し、現場の光量に合わせて瞬時に切り替え可能にする。
 */
type Theme = "light" | "dark" | "system";

export default function LandingPage() {
  const [theme, setTheme] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  // 💡 近未来的・無差別パルスの生成ロジック
  const pulses = useMemo(() => [...Array(12)].map((_, i) => ({
    id: i,
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    duration: 0.5 + Math.random() * 1.5, // 💡 素早く駆け抜ける
    delay: Math.random() * 5,
    type: i % 3 === 0 ? "h" : i % 3 === 1 ? "v" : "d",
  })), []);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("iscore-theme") as Theme | null;
    if (saved) setTheme(saved);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    if (theme === "system") {
      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      root.classList.add(isDark ? "dark" : "light");
    } else {
      root.classList.add(theme);
    }
    localStorage.setItem("iscore-theme", theme);
  }, [theme, mounted]);

  if (!mounted) return null;

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-background selection:bg-primary/30">

      {/* 🌟 究極のサイバー・背景レイヤー */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        {/* 💡 画像表示の修正：/public/cyber-stadium.webp を確実に読み込む */}
        <div className="absolute inset-0 transition-opacity duration-1000">
          <Image
            src="/cyber-stadium.webp"
            alt="Cyber Stadium"
            fill
            className={cn(
              "object-cover object-center transition-all duration-700",
              theme === "light" ? "invert opacity-[0.03] grayscale" : "opacity-40 contrast-[1.1]"
            )}
            priority
            onError={(e) => console.error("Image load failed:", e)}
          />
        </div>

        {/* 💡 高速無差別パルス（格子状の神経系） */}
        <AnimatePresence>
          {pulses.map((p) => (
            <motion.div
              key={p.id}
              initial={p.type === "h" ? { x: "-100%", y: p.top } : p.type === "v" ? { y: "-100%", x: p.left } : { x: "-50%", y: "-50%", opacity: 0 }}
              animate={p.type === "h" ? { x: "200%" } : p.type === "v" ? { y: "200%" } : { x: "150%", y: "150%", opacity: [0, 1, 0] }}
              transition={{ duration: p.duration, repeat: Infinity, ease: "circIn", delay: p.delay }}
              className={cn(
                "absolute blur-[1px] shadow-[0_0_10px_rgba(var(--primary),0.6)]",
                p.type === "h" ? "h-[1px] w-64 bg-gradient-to-r from-transparent via-primary/70 to-transparent" :
                  p.type === "v" ? "w-[1px] h-64 bg-gradient-to-b from-transparent via-primary/70 to-transparent" :
                    "w-48 h-[0.5px] bg-gradient-to-br from-transparent via-primary/50 to-transparent rotate-45"
              )}
            />
          ))}
        </AnimatePresence>

        {/* 下部へのグラデーションによる奥行き */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/20 to-background" />
      </div>

      {/* 🌟 タクティカル・テーマセレクター（ライト/ダーク復刻） */}
      <header className="fixed top-6 right-8 z-[60]">
        <div className="flex items-center p-1.5 border border-border/40 rounded-full bg-background/40 backdrop-blur-xl shadow-2xl">
          {(["light", "system", "dark"] as Theme[]).map((t) => (
            <button
              key={t}
              onClick={() => setTheme(t)}
              className={cn(
                "p-2.5 rounded-full transition-all duration-500",
                theme === t ? "bg-primary text-primary-foreground shadow-lg scale-110" : "text-muted-foreground hover:text-primary"
              )}
            >
              {t === "light" && <Sun className="h-4 w-4" />}
              {t === "system" && <Monitor className="h-4 w-4" />}
              {t === "dark" && <Moon className="h-4 w-4" />}
            </button>
          ))}
        </div>
      </header>

      {/* 🌟 メイン・ヒーローコア */}
      <main className="z-10 flex flex-col items-center gap-14 max-w-4xl w-full px-6 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 100, damping: 15 }}
          className="relative w-56 h-56 drop-shadow-[0_0_60px_rgba(var(--primary),0.3)]"
        >
          <Image src="/logo.webp" alt="iScoreCloud Logo" fill className="object-contain" priority />
        </motion.div>

        <div className="space-y-4">
          <h1 className="text-6xl md:text-[7rem] font-black italic tracking-tighter leading-none text-foreground">
            iScore<span className="text-primary italic">Cloud</span>
          </h1>
          <p className="text-muted-foreground font-bold text-lg md:text-xl tracking-[0.4em] uppercase">
            Evolution of Tactical Data Analysis
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-6 w-full max-w-lg">
          <Button asChild className="h-20 rounded-[30px] text-2xl font-black italic gap-4 shadow-2xl shadow-primary/30 hover:scale-105 transition-all bg-primary">
            <Link href="/dashboard">
              <PlayCircle className="w-10 h-10" />
              PLAY BALL
            </Link>
          </Button>
        </div>

        <div className="flex items-center gap-4 text-[10px] font-black text-muted-foreground tracking-[0.4em] pt-12 uppercase">
          <ShieldCheck className="w-4 h-4 text-primary" />
          <span>Field Logic Protocol Active</span>
        </div>
      </main>
    </div>
  );
}