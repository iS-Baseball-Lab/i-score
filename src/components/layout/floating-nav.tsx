// filepath: src/components/layout/floating-nav.tsx
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, Users, Trophy, MoreHorizontal, UserSquare2, X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * 💡 フローティング・マキシマム・ナビ（黄金比配置 & ソーラーエフェクト）
 * 全ボタン w-18 固定。背後から漏れ出す光のアニメーションで選択状態を表現。
 * 半径135px、角度-145~-35度で、中央寄りと美しさを両立。
 */
export function FloatingNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // 💡 規約: ナビゲーションが発生したら自動で閉じる
  useEffect(() => setIsOpen(false), [pathname]);

  const menuItems = [
    { icon: Users, label: "TEAM", href: "/team", angle: -145 },
    { icon: UserSquare2, label: "PLAYER", href: "/players", angle: -117.5 },
    { icon: LayoutDashboard, label: "HOME", href: "/dashboard", angle: -90 },
    { icon: Trophy, label: "EVENT", href: "/tournaments", angle: -62.5 }, // 💡 パス修正完了
    { icon: MoreHorizontal, label: "MENU", href: "/menu", angle: -35 },
  ];

  return (
    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100]">
      
      {/* 🌟 背景オーバーレイ（漆黒 98%：屋外視認性の極致） */}
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
        
        {/* 🌟 サブボタン：全項目 w-18 固定・中央寄り配置 */}
        <AnimatePresence>
          {isOpen &&
            menuItems.map((item, index) => {
              const isActive = pathname === item.href;
              return (
                <motion.div
                  key={item.href}
                  initial={{ scale: 0, x: 0, y: 0 }}
                  animate={{
                    scale: 1,
                    // 💡 距離 135px で中央への寄せと間隔を最適化
                    x: Math.cos((item.angle * Math.PI) / 180) * 135,
                    y: Math.sin((item.angle * Math.PI) / 180) * 135,
                  }}
                  exit={{ scale: 0, x: 0, y: 0 }}
                  transition={{ type: "spring", stiffness: 600, damping: 35, delay: index * 0.01 }}
                  className="absolute"
                >
                  <Link href={item.href} className="relative flex items-center justify-center">
                    
                    {/* 💡 ソーラーエフェクト：ボタンの背後から広がる光の波紋 */}
                    {isActive && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <motion.div
                          className="absolute w-full h-full rounded-full bg-primary/40"
                          animate={{ scale: [1, 1.4], opacity: [0.6, 0] }}
                          transition={{ repeat: Infinity, duration: 1.5, ease: "easeOut" }}
                        />
                        <div className="absolute inset-[-4px] rounded-full border-2 border-primary/60" />
                      </div>
                    )}
                    
                    <div className={cn(
                      "w-18 h-18 rounded-full flex flex-col items-center justify-center gap-1 shadow-2xl border-[3px] transition-colors relative z-10",
                      isActive 
                        ? "bg-primary border-primary text-primary-foreground" 
                        : "bg-white border-zinc-200 text-zinc-900" 
                    )}>
                      <item.icon className="w-7 h-7 stroke-[2.5]" />
                      <span className="text-[8px] font-black tracking-tighter leading-none uppercase">
                        {item.label}
                      </span>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
        </AnimatePresence>

        {/* ⚾️ センターボタン（w-24 / 96px / 常時真円・爆速） */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 active:scale-95 z-50 overflow-hidden",
            "shadow-[0_25px_60px_rgba(0,0,0,0.5),0_10px_25px_rgba(var(--primary),0.3)]",
            isOpen ? "bg-white ring-[8px] ring-primary/60" : "bg-primary"
          )}
        >
          <div className="absolute inset-0 rounded-full overflow-hidden flex items-center justify-center">
            <AnimatePresence mode="wait">
              {isOpen ? (
                <motion.div
                  key="close"
                  initial={{ opacity: 0, scale: 0.8, rotate: -45 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0.8, rotate: 45 }}
                  transition={{ duration: 0.1, ease: "circOut" }}
                  className="flex items-center justify-center w-full h-full rounded-full"
                >
                  <X className="w-14 h-14 text-primary stroke-[5]" />
                </motion.div>
              ) : (
                <motion.div
                  key="logo"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.1, ease: "circOut" }}
                  className="relative w-full h-full rounded-full"
                >
                  <Image src="/logo.webp" alt="iScore" fill className="object-contain p-0.5 rounded-full" priority />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </button>
      </div>
    </div>
  );
}
