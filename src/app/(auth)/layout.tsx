// filepath: `src/app/(auth)/layout.tsx`
import React from "react";

/**
 * 💡 認証エリア共通レイアウト
 * 1. スクロールさせない (h-[100dvh] overflow-hidden)
 * 2. 視認性を確保しつつ、全画面に広がるメッシュグラデーション・アニメーション
 * 3. ヘッダー、ボトムナビ、アバターなどは一切配置しない「純粋な空間」
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex h-[100dvh] w-full flex-col items-center justify-center overflow-hidden bg-background text-foreground selection:bg-primary/30 z-0">
      
      {/* 🌟 共通の背景装飾（躍動感のあるメッシュグラデーション） */}
      <style>{`
        /* それぞれ独立したダイナミックな軌道を描くキーフレーム */
        @keyframes mesh-blob-1 {
          0% { transform: translate(0%, 0%) scale(1); }
          33% { transform: translate(15%, -10%) scale(1.15); }
          66% { transform: translate(-10%, 15%) scale(0.9); }
          100% { transform: translate(0%, 0%) scale(1); }
        }
        @keyframes mesh-blob-2 {
          0% { transform: translate(0%, 0%) scale(1); }
          33% { transform: translate(-15%, 15%) scale(0.9); }
          66% { transform: translate(15%, -10%) scale(1.15); }
          100% { transform: translate(0%, 0%) scale(1); }
        }
        @keyframes mesh-blob-3 {
          0% { transform: translate(0%, 0%) scale(1); }
          33% { transform: translate(10%, 15%) scale(1.1); }
          66% { transform: translate(-15%, -15%) scale(0.95); }
          100% { transform: translate(0%, 0%) scale(1); }
        }
        
        /* スピードアップ（12s->8s 等）させ、より生き生きとした動きに */
        .animate-mesh-1 { animation: mesh-blob-1 8s infinite alternate ease-in-out; }
        .animate-mesh-2 { animation: mesh-blob-2 10s infinite alternate ease-in-out; }
        .animate-mesh-3 { animation: mesh-blob-3 12s infinite alternate ease-in-out; }
      `}</style>

      {/* inset-[-50%] と大きな要素で、画面外まで確実にグラデーションを敷き詰めます */}
      <div className="absolute inset-[-50%] z-[-1] pointer-events-none flex items-center justify-center">
        {/* Primary Color Blob - 濃度を引き上げ、はっきりと */}
        <div className="absolute top-[10%] right-[10%] w-[80vw] h-[80vw] min-w-[600px] min-h-[600px] bg-primary/30 dark:bg-primary/40 blur-[120px] rounded-full animate-mesh-1" />
        
        {/* Secondary Blue Blob - 深みのある青を強調 */}
        <div className="absolute bottom-[10%] left-[10%] w-[90vw] h-[90vw] min-w-[700px] min-h-[700px] bg-blue-600/30 dark:bg-blue-600/40 blur-[120px] rounded-full animate-mesh-2" />
        
        {/* Emerald Blob - 鮮やかな緑でコントラストを出す */}
        <div className="absolute top-[30%] left-[30%] w-[70vw] h-[70vw] min-w-[500px] min-h-[500px] bg-emerald-500/30 dark:bg-emerald-500/40 blur-[120px] rounded-full animate-mesh-3" />
      </div>

      {/* コンテンツエリア（モバイル幅に最適化） */}
      <main className="w-full max-w-md z-10 flex flex-col items-center">
        {children}
      </main>
    </div>
  );
}
