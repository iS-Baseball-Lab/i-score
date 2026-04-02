// src/components/feature-card.tsx
"use client";

import React, { useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * 💡 究極のマイクロカード (FeatureCard)
 * 1. スポットライト効果: マウスカーソルの位置を計算し、カードの背後でテーマカラーの光を追従させる。
 * 2. グラスモーフィズムとの融合: 透過背景(backdrop-blur)と光を組み合わせ、圧倒的な没入感を生む。
 * 3. マイクロインタラクション: ホバー時にアイコンが少し大きくなり、カード全体がフワッと浮き上がる。
 */
interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  glowColor: string; // 🔥 ラッキーセブンのテーマカラー（rgba指定）
}

export function FeatureCard({ icon, title, description, glowColor }: FeatureCardProps) {
  const divRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  // マウスの座標を計算し、光の中心点を更新する
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative h-full flex flex-col items-center text-center p-6 rounded-[32px] bg-card/40 backdrop-blur-xl border border-border/50 shadow-xl overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl cursor-default group"
    >
      {/* 🌟 究極の仕掛け：マウス追従型スポットライト */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-500 ease-in-out"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(300px circle at ${position.x}px ${position.y}px, ${glowColor}, transparent 60%)`,
        }}
      />

      {/* コンテンツエリア（z-10で光の手前に配置） */}
      <div className="relative z-10 flex flex-col items-center">
        <div className="p-3 bg-background/80 rounded-full shadow-sm mb-4 border border-border/30 group-hover:scale-110 group-hover:shadow-md transition-all duration-500">
          {icon}
        </div>
        <h3 className="text-lg font-black tracking-tight mb-2 group-hover:text-foreground transition-colors">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground font-medium leading-relaxed group-hover:text-foreground/80 transition-colors">
          {description}
        </p>
      </div>

      {/* ホバー時にカードの「フチ」だけをうっすら光らせる隠し味 */}
      <div className="absolute inset-0 rounded-[32px] border-2 border-transparent group-hover:border-white/10 transition-colors duration-500 pointer-events-none" />
    </div>
  );
}