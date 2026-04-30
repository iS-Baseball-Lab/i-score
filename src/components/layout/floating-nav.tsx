// filepath: src/components/layout/floating-nav.tsx
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, Users, Trophy, Settings, X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * 💡 フローティング・マキシマム・ナビ（真円死守・巨大アイコン・半透明枠）
 * どんな状態でも rounded-full を維持し、現場でのブランドアイデンティティを保つ。
 */
export function FloatingNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // 💡 規約: ナビゲーションが発生したら自動で閉じる
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const menuItems = [
    { icon: LayoutDashboard, label: "HOME", href: "/dashboard", angle: -145 },
    { icon: Trophy, label: "MATCH", href: "/matches", angle: -115 },
    { icon: Users, label: "TEAM", href: "/teams", angle: -65 },
    { icon: Settings, label: "CONFIG", href: "/settings", angle: -35 },
  ];

  return (
    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100]">
      
      {/* 🌟 背景オーバーレイ（脱・グラスモーフィズム：屋外視認性重視） */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-background/90 z-[-1]" 
          />
        )}
      </AnimatePresence>

      <div className="relative flex items-center justify-center">
        
        {/* 🌟 扇状メニュー（距離130pxで余裕のある配置） */}
        <AnimatePresence>
          {isOpen &&
            menuItems.map((item, index) => (
              <motion.div
                key={item.href}
                initial={{ scale: 0, x: 0, y: 0 }}
                animate={{
                  scale: 1,
                  x: Math.cos((item.angle * Math.PI) / 180) * 130,
                  y: Math.sin((item.angle * Math.PI) / 180) * 130,
                }}
                exit={{ scale: 0, x: 0, y: 0 }}
                transition={{ type: "spring", stiffness: 450, damping: 30, delay: index * 0.02 }}
                className="absolute"
              >
                <Link href={item.href} className="group flex flex-col items-center gap-2 transition-transform active:scale-90">
                  <div className={cn(
                    "w-16 h-16 rounded-full flex items-center justify-center shadow-2xl border-2 transition-all",
                    pathname === item.href 
                      ? "bg-primary border-primary text-primary-foreground scale-110" 
                      : "bg-background border-border text-foreground"
                  )}>
                    <item.icon className="w-8 h-8" />
                  </div>
                  <span className="text-[10px] font-black tracking-widest text-foreground bg-background px-3 py-1 rounded-full border border-border shadow-sm uppercase">
                    {item.label}
                  </span>
                </Link>
              </motion.div>
            ))}
        </AnimatePresence>

        {/* ⚾️ センターボタン：w-24（96px）＋ 強力シャドウ ＋ 真円絶対固定 */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            // 💡 真円（rounded-full）と 影（shadow）をベースクラスに固定
            "relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 active:scale-95 z-50 overflow-hidden",
            "shadow-[0_25px_50px_rgba(0,0,0,0.4),0_10px_20px_rgba(var(--primary),0.3)]",
            isOpen 
              ? "bg-background/40 ring-[6px] ring-primary/50 backdrop-blur-md" // 💡 展開時の半透明枠
              : "bg-primary ring-[0px] ring-transparent"
          )}
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ opacity: 0, scale: 0.5, rotate: -180 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.5, rotate: 180 }}
                className="flex items-center justify-center w-full h-full rounded-full" // ここにも rounded-full
              >
                <X className="w-14 h-14 text-primary stroke-[4]" />
              </motion.div>
            ) : (
              <motion.div
                key="logo"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="relative w-full h-full rounded-full" // ここにも rounded-full
              >
                <Image
                  src="/logo.webp"
                  alt="iScore"
                  fill
                  className="object-contain p-0.5 rounded-full" // 💡 画像レベルでも真円を意識
                  priority
                />
              </motion.div>
            )}
          </AnimatePresence>
        </button>
      </div>
    </div>
  );
}
