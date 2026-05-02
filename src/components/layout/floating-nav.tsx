// filepath: src/components/layout/floating-nav.tsx
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { LayoutDashboard, Users, Trophy, MoreHorizontal, UserSquare2, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function FloatingNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => setIsOpen(false), [pathname]);

  /**
   * 🏟️ 監督オーダー：TEAMをさらに下げ、HOMEを頂点に、MENUを正常位置へ。
   * 半径100pxを維持しつつ、角度を調整（TEAM: -210度まで下げ、MENU: 30度）
   */
  const menuItems = [
    { icon: Users, label: "TEAM", href: "/team", angle: -210 },         // 💡 さらに下げて親指に寄せる
    { icon: UserSquare2, label: "PLAYER", href: "/players", angle: -150 },
    { icon: LayoutDashboard, label: "HOME", href: "/dashboard", angle: -90 }, // ⭐ 真上
    { icon: Trophy, label: "EVENT", href: "/tournaments", angle: -30 }, 
    { icon: MoreHorizontal, label: "MENU", href: "/menu", angle: 30 },          // 💡 ジョークにならない位置
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
        
        {/* 🌟 中央の半透明リング（結界）：展開時にロゴを優しく包む */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1.2, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              className="absolute w-24 h-24 rounded-full border-[2px] border-primary/40 bg-primary/10 backdrop-blur-sm pointer-events-none z-40"
            />
          )}
        </AnimatePresence>

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
                  transition={{ type: "spring", stiffness: 700, damping: 30, delay: index * 0.01 }}
                  className="absolute"
                >
                  <Link href={item.href} className="relative flex items-center justify-center active:scale-95 transition-transform">
                    {/* ソーラー波紋 */}
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
                      <span className="text-[8px] font-black uppercase">{item.label}</span>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
        </AnimatePresence>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 active:scale-95 z-50 overflow-hidden shadow-2xl",
            isOpen ? "bg-white ring-[8px] ring-primary/60" : "bg-primary"
          )}
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div key="close" initial={{ opacity: 0, rotate: -45 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: 45 }}>
                <X className="w-14 h-14 text-primary stroke-[5]" />
              </motion.div>
            ) : (
              <motion.div key="logo" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative w-full h-full">
                <Image src="/logo.webp" alt="iScore" fill className="object-contain p-0.5" priority />
              </motion.div>
            )}
          </AnimatePresence>
        </button>
      </div>
    </div>
  );
}
