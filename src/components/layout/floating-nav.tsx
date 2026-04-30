// filepath: src/components/layout/floating-nav.tsx
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, Users, Trophy, Settings, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * 💡 フローティング・サークルナビ
 * 中央のロゴを起点に、各メニューが扇状に展開する現場仕様のUI
 */
export function FloatingNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // 💡 規約: ナビゲーション（パス変更）が発生したら自動で閉じる
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const menuItems = [
    { icon: LayoutDashboard, label: "HOME", href: "/dashboard", angle: -140 },
    { icon: Trophy, label: "GAME", href: "/matches", angle: -110 },
    { icon: Users, label: "TEAM", href: "/teams", angle: -70 },
    { icon: Settings, label: "SETTING", href: "/settings", angle: -40 },
  ];

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100]">
      {/* 🌟 メニュー展開時の背景オーバーレイ（タップで閉じる） */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-background/60 backdrop-blur-sm z-[-1]"
          />
        )}
      </AnimatePresence>

      <div className="relative flex items-center justify-center">
        {/* 🌟 サブメニュー項目 */}
        <AnimatePresence>
          {isOpen &&
            menuItems.map((item, index) => (
              <motion.div
                key={item.href}
                initial={{ scale: 0, x: 0, y: 0 }}
                animate={{
                  scale: 1,
                  x: Math.cos((item.angle * Math.PI) / 180) * 100,
                  y: Math.sin((item.angle * Math.PI) / 180) * 100,
                }}
                exit={{ scale: 0, x: 0, y: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 25, delay: index * 0.05 }}
                className="absolute"
              >
                <Link href={item.href} className="group flex flex-col items-center gap-1">
                  <div className={cn(
                    "w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all active:scale-90",
                    pathname === item.href ? "bg-primary text-primary-foreground" : "bg-card border border-border text-foreground"
                  )}>
                    <item.icon className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-black text-foreground bg-background/80 px-2 py-0.5 rounded-full border border-border/40 shadow-sm">
                    {item.label}
                  </span>
                </Link>
              </motion.div>
            ))}
        </AnimatePresence>

        {/* ⚾️ メイン・センターボタン */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "relative w-20 h-20 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(var(--primary),0.3)] transition-all active:scale-95 z-50",
            isOpen ? "bg-background border-2 border-primary" : "bg-primary"
          )}
        >
          <motion.div
            animate={{ rotate: isOpen ? 135 : 0 }}
            className="relative w-12 h-12 flex items-center justify-center"
          >
            {isOpen ? (
              <X className="w-10 h-10 text-primary" />
            ) : (
              <div className="relative w-full h-full">
                <Image
                  src="/logo.webp"
                  alt="iScore"
                  fill
                  className="object-contain drop-shadow-md"
                />
              </div>
            )}
          </motion.div>
          
          {/* 未読通知などのバッジがあればここに配置 */}
          {!isOpen && (
            <div className="absolute top-0 right-0 w-6 h-6 bg-destructive border-4 border-background rounded-full animate-pulse" />
          )}
        </button>
      </div>
    </div>
  );
}
