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
 * 💡 フローティング・マキシマム・ナビ（Motion v12 / 100px・包囲型ダイヤモンド）
 * 半径100px、-190度〜10度の範囲を使い、HOMEを真上に固定。
 * MENUを画面内にしっかり収め、中央のリングエフェクトで高級感を演出。
 */
export function FloatingNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // 💡 画面遷移時にクローズ
  useEffect(() => setIsOpen(false), [pathname]);

  /**
   * 🏟️ 角度の絶対定義：HOMEを頂点に、50度ステップでセンターを包む
   */
  const menuItems = [
    { icon: Users, label: "TEAM", href: "/team", angle: -190 },         // 左：真横より10度下
    { icon: UserSquare2, label: "PLAYER", href: "/players", angle: -140 }, // 左斜め上
    { icon: LayoutDashboard, label: "HOME", href: "/dashboard", angle: -90 },   // ⭐真上（頂点）
    { icon: Trophy, label: "EVENT", href: "/tournaments", angle: -40 }, // 右斜め上
    { icon: MoreHorizontal, label: "MENU", href: "/menu", angle: 10 },          // 右：真横より10度下
  ];

  return (
    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100]">

      {/* 🌟 背景オーバーレイ：漆黒(bg-zinc-950/98)で視認性死守 */}
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

        {/* 🌟 中央の半透明リングエフェクト：展開時にふわっと浮かぶ */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1.1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="absolute w-28 h-28 rounded-full border border-primary/20 bg-primary/5 pointer-events-none"
            />
          )}
        </AnimatePresence>

        {/* 🌟 サブボタン：半径100px、全 w-18 (72px) 固定 */}
        <AnimatePresence>
          {isOpen &&
            menuItems.map((item, index) => {
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
                  transition={{
                    type: "spring",
                    stiffness: 700,
                    damping: 32,
                    delay: index * 0.01
                  }}
                  className="absolute"
                >
                  <Link href={item.href} className="relative flex items-center justify-center group active:scale-95 transition-transform">

                    {/* アクティブ時のソーラーリング */}
                    {isActive && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <motion.div
                          className="absolute w-full h-full rounded-full bg-primary/30"
                          animate={{ scale: [1, 1.4], opacity: [0.5, 0] }}
                          transition={{ repeat: Infinity, duration: 1.5, ease: "easeOut" }}
                        />
                        <div className="absolute inset-[-4px] rounded-full border-2 border-primary/60" />
                      </div>
                    )}

                    <div className={cn(
                      "w-18 h-18 rounded-full flex flex-col items-center justify-center gap-1 shadow-2xl border-[3px] transition-colors relative z-10",
                      isActive
                        ? "bg-primary border-primary text-primary-foreground"
                        : "bg-white border-zinc-200 text-zinc-900 shadow-black/10"
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

        {/* ⚾️ センターボタン：w-24 */}
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
                  transition={{ duration: 0.1 }}
                >
                  <X className="w-14 h-14 text-primary stroke-[5]" />
                </motion.div>
              ) : (
                <motion.div
                  key="logo"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="relative w-full h-full"
                >
                  <Image
                    src="/logo.webp"
                    alt="iScore"
                    fill
                    className="object-contain p-0.5"
                    priority
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </button>
      </div>
    </div>
  );
}