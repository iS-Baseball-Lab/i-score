// filepath: src/components/layout/hero-background.tsx
"use client";

import React from "react";
import { motion } from "motion/react";

/**
 * 💡 i-score データ・ビジュアライゼーション・背景
 * スコアブックの幾何学的な美しさを背景に反映。
 * Motion v12 の GPU 加速を活かし、低負荷かつ高品位なアニメーションを実現。
 */
export function HeroBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-zinc-950">
      {/* 🌟 ダイヤモンド・グリッドレイヤー */}
      <div 
        className="absolute inset-0 opacity-[0.08]" 
        style={{ 
          backgroundImage: `
            linear-gradient(30deg, #ffffff 1px, transparent 1px), 
            linear-gradient(150deg, #ffffff 1px, transparent 1px)
          `,
          backgroundSize: '60px 104px',
          backgroundPosition: '0 0'
        }} 
      />

      {/* 🌟 動的な「データの光」: 横方向に走り抜けるライン */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ x: "-100%", opacity: 0 }}
          animate={{ x: "200%", opacity: [0, 0.5, 0] }}
          transition={{ 
            duration: 10 + i * 2, 
            repeat: Infinity, 
            ease: "linear", 
            delay: i * 3 
          }}
          className="absolute h-[1px] w-full bg-gradient-to-r from-transparent via-primary/40 to-transparent"
          style={{ top: `${25 + i * 20}%` }}
        />
      ))}

      {/* 🌟 スキャニング・エフェクト: 上下方向にゆっくり動く光の帯 */}
      <motion.div
        animate={{ y: ["0%", "100%", "0%"] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-primary/5 pointer-events-none"
      />

      {/* 🌟 放射状グラデーション: 中央のロゴやナビゲーションを際立たせる */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,0,0,0)_0%,rgba(9,9,11,0.8)_80%,rgba(9,9,11,1)_100%)]" />
    </div>
  );
}
