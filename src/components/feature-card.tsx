// src/components/feature-card.tsx
"use client";

import React, { useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  glowColor: string;
}

export function FeatureCard({ icon, title, description, glowColor }: FeatureCardProps) {
  const divRef = useRef<HTMLDivElement>(null);
  // 💡 モバイル（初期状態）でも光が真ん中から出るように x:150, y:150 をセット
  const [position, setPosition] = useState({ x: 150, y: 150 });
  const [isHovered, setIsHovered] = useState(false);

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
      className="relative h-full flex flex-col items-center text-center p-6 rounded-[32px] bg-card/40 backdrop-blur-xl border border-border/50 shadow-xl overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl active:scale-95 group cursor-default"
    >
      {/* 🌟 ハイブリッド・スポットライト 
          モバイル(md未満): hoverに関係なく、うっすらと呼吸する(animate-pulse)光を固定配置。
          PC(md以上): hover時のみ、マウスに追従してクッキリ光る。
      */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-500 ease-in-out opacity-40 animate-pulse md:animate-none md:opacity-0 md:group-hover:opacity-100"
        style={{
          background: `radial-gradient(300px circle at ${position.x}px ${position.y}px, ${glowColor}, transparent 60%)`,
        }}
      />

      <div className="relative z-10 flex flex-col items-center">
        {/* 🌟 コントラスト＆インパクト強化のアイコン背景
            bg-background/80 などの半透明をやめ、しっかりとした色と強いシャドウで立体感を出しました。
            角も丸めすぎない rounded-[24px] でソリッドに！
        */}
        <div className="p-4 bg-background dark:bg-card shadow-lg mb-5 border border-border/60 group-hover:scale-110 group-hover:shadow-primary/20 group-hover:shadow-xl transition-all duration-500 rounded-[24px]">
          {icon}
        </div>
        <h3 className="text-lg font-black tracking-tight mb-2 group-hover:text-foreground transition-colors">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground font-medium leading-relaxed group-hover:text-foreground/80 transition-colors">
          {description}
        </p>
      </div>

      <div className="absolute inset-0 rounded-[32px] border-2 border-transparent group-hover:border-white/10 transition-colors duration-500 pointer-events-none" />
    </div>
  );
}