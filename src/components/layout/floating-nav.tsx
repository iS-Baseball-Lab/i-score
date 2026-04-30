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
 * 💡 フローティング・マキシマム・ナビ
 * ロゴを円いっぱいに広げ、重厚な影で浮遊感を演出した iScore 究極の操作系
 */
export function FloatingNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // 💡 規約: ナビゲーションが発生したら自動で閉じる
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const menuItems = [
    { icon: LayoutDashboard, label: "HOME", href: "/dashboard", angle: -140 },
    { icon: Trophy, label: "MATCH", href: "/matches", angle: -110 },
    { icon: Users, label: "TEAM", href: "/teams", angle: -70 },
    { icon: Settings, label: "CONFIG", href: "/settings", angle: -40 },
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
        
        {/* 🌟 扇状に展開するメニュー */}
        <AnimatePresence>
          {isOpen &&
            menuItems.map((item, index) => (
              <motion.div
                key={item.href}
                initial={{ scale: 0, x: 0, y: 0 }}
                animate={{
                  scale: 1,
                  x: Math.cos((item.angle * Math.PI) / 180) * 115, // 距離を広げて干渉を防ぐ
                  y: Math.sin((item.angle * Math.PI) / 180) * 115,
                }}
                exit={{ scale: 0, x: 0, y: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 28, delay: index * 0.02 }}
                className="absolute"
              >
                <Link href={item.href} className="group flex flex-col items-center gap-1.5 transition-transform active:scale-90">
                  <div className={cn(
                    "w-15 h-15 rounded-full flex items-center justify-center shadow-xl border-2 transition-all",
                    pathname === item.href 
                      ? "bg-primary border-primary text-primary-foreground" 
                      : "bg-background border-border text-foreground"
                  )}>
                    <item.icon className="w-7 h-7" />
                  </div>
                  <span className="text-[9px] font-black tracking-widest text-foreground bg-background px-2.5 py-1 rounded-full border border-border shadow-sm uppercase">
                    {item.label}
                  </span>
                </Link>
              </motion.div>
            ))}
        </AnimatePresence>

        {/* ⚾️ センター・FAB・ボタン（限界拡大ロゴ & 3D Shadow） */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "relative w-22 h-22 rounded-full flex items-center justify-center transition-all active:scale-95 z-50 overflow-hidden",
            // 💡 複数の影を重ねることで、画面から浮き上がっている感を演出
            "shadow-[0_15px_35px_rgba(0,0,0,0.3),0_5px_15px_rgba(var(--primary),0.2)]",
            isOpen ? "bg-background ring-4 ring-primary" : "bg-primary"
          )}
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ opacity: 0, scale: 0.5, rotate: -180 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.5, rotate: 180 }}
                className="flex items-center justify-center"
              >
                <X className="w-12 h-12 text-primary stroke-[3]" />
              </motion.div>
            ) : (
              <motion.div
                key="logo"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="relative w-full h-full"
              >
                {/* 💡 円の直径（w-22=88px）の 90% 以上を占領するように配置 */}
                <Image
                  src="/logo.webp"
                  alt="iScore"
                  fill
                  className="object-contain p-0.5" // 💡 0.5 の微細なパディングで円いっぱいに
                  priority
                />
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* 通知インジケーター（試合中など） */}
          {!isOpen && (
            <div className="absolute top-4 right-4 w-4 h-4 bg-red-500 border-4 border-primary rounded-full shadow-md" />
          )}
        </button>
      </div>
    </div>
  );
}
