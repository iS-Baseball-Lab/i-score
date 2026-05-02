// filepath: src/components/layout/floating-nav.tsx
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { LayoutDashboard, Users, Trophy, MoreHorizontal, UserSquare2, X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * 💡 iScoreCloud 規約: 
 * センターボタンは閉鎖時 w-24（シンボル）、展開時 w-18（操作性）の可変サイズ。
 * 閉鎖時の過剰なエフェクトを排除し、ロゴの美しさを際立たせる。
 */
export function FloatingNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => setIsOpen(false), [pathname]);

  const menuItems = [
    { icon: Users, label: "TEAM", href: "/team", angle: -210 },
    { icon: UserSquare2, label: "PLAYER", href: "/players", angle: -150 },
    { icon: LayoutDashboard, label: "HOME", href: "/dashboard", angle: -90 },
    { icon: Trophy, label: "EVENT", href: "/tournaments", angle: -30 },
    { icon: MoreHorizontal, label: "MENU", href: "/menu", angle: 30 },
  ];

  return (
    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-zinc-950/98 z-[-1] rounded-full"
          />
        )}
      </AnimatePresence>

      <div className="relative flex items-center justify-center">
        {/* 🌟 センター・リング（結界）：展開時のみ控えめに表示 */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1.3, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              className="absolute w-20 h-20 rounded-full border border-primary/30 bg-primary/5 backdrop-blur-sm pointer-events-none z-40"
            />
          )}
        </AnimatePresence>

        {/* サブボタン展開 */}
        <AnimatePresence>
          {isOpen && menuItems.map((item, index) => {
            const isActive = pathname === item.href;
            const RADIUS = 100;
            const radian = (item.angle * Math.PI) / 180;
            const x = Math.cos(radian) * RADIUS;
            const y = Math.sin(radian) * RADIUS;

            return (
              <motion.div
                key={item.href}
                initial={{ scale: 0, x: 0, y: 0 }}
                animate={{ scale: 1, x, y }}
                exit={{ scale: 0, x: 0, y: 0 }}
                transition={{ type: "spring", stiffness: 700, damping: 32, delay: index * 0.01 }}
                className="absolute"
              >
                <Link href={item.href} className="relative flex items-center justify-center active:scale-95 transition-transform">
                  {isActive && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <motion.div
                        className="absolute w-full h-full rounded-full bg-primary/40"
                        animate={{ scale: [1, 1.4], opacity: [0.6, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                      />
                    </div>
                  )}
                  <div className={cn(
                    "w-18 h-18 rounded-full flex flex-col items-center justify-center gap-1 shadow-2xl border-[3px] transition-colors relative z-10",
                    isActive ? "bg-primary border-primary text-primary-foreground" : "bg-white border-zinc-200 text-zinc-900"
                  )}>
                    <item.icon className="w-7 h-7 stroke-[2.5]" />
                    <span className="text-[8px] font-black uppercase tracking-tighter">{item.label}</span>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* ⚾️ センターボタン：うるさい縁取りを廃止した「スッキリ」版 */}
        <motion.button
          layout
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "relative rounded-full flex items-center justify-center transition-all duration-300 active:scale-95 z-50 overflow-hidden",
            // 💡 修正：うるさい縁取り（ring/blur）を削ぎ落とし、ソリッドな影と薄いボーダーのみに。
            isOpen
              ? "w-18 h-18 bg-white ring-4 ring-primary/40 shadow-none border-none"
              : "w-24 h-24 bg-primary border-2 border-white/20 shadow-xl"
          )}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ opacity: 0, scale: 0.5, rotate: -90 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.5, rotate: 90 }}
                className="flex items-center justify-center"
              >
                <X className="w-9 h-9 text-primary stroke-[5]" />
              </motion.div>
            ) : (
              <motion.div
                key="logo"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="relative w-full h-full"
              >
                <Image src="/logo.webp" alt="iScoreCloud" fill className="object-contain p-1" priority />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </div>
  );
}