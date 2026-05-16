// filepath: `src/app/(auth)/layout.tsx`
import React from "react";

/**
 * 💡 認証エリア共通レイアウト
 * 1. スクロールさせない (h-[100dvh] overflow-hidden)
 * 2. 視認性を確保しつつ、全画面に広がる5色のメッシュグラデーション・アニメーション
 * 3. ヘッダー、ボトムナビ、アバターなどは一切配置しない「純粋な空間」
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex h-[100dvh] w-full flex-col items-center justify-center overflow-hidden bg-background text-foreground selection:bg-primary/20 z-0">
      
      {/* 🌟 共通の背景装飾（躍動感のある5色メッシュグラデーション） */}
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
        @keyframes mesh-blob-4 {
          0% { transform: translate(0%, 0%) scale(1); }
          33% { transform: translate(-10%, -15%) scale(0.95); }
          66% { transform: translate(15%, 15%) scale(1.1); }
          100% { transform: translate(0%, 0%) scale(1); }
        }
        @keyframes mesh-blob-5 {
          0% { transform: translate(0%, 0%) scale(1); }
          33% { transform: translate(15%, 10%) scale(1.05); }
          66% { transform: translate(-15%, -10%) scale(0.95); }
          100% { transform: translate(0%, 0%) scale(1); }
        }
        
        /* スピードを速く（7〜11秒）、生き生きとした動きに */
        .animate-mesh-1 { animation: mesh-blob-1 8s infinite alternate ease-in-out; }
        .animate-mesh-2 { animation: mesh-blob-2 10s infinite alternate ease-in-out; }
        .animate-mesh-3 { animation: mesh-blob-3 11s infinite alternate ease-in-out; }
        .animate-mesh-4 { animation: mesh-blob-4 7s infinite alternate ease-in-out; }
        .animate-mesh-5 { animation: mesh-blob-5 9s infinite alternate ease-in-out; }
      `}</style>

      {/* inset-[-50%] と大きな要素で、画面外まで確実にグラデーションを敷き詰める */}
      <div className="absolute inset-[-50%] z-[-1] pointer-events-none flex items-center justify-center">
        {/* 1. Primary Color (ブランドカラー) */}
        <div className="absolute top-[10%] right-[10%] w-[70vw] h-[70vw] min-w-[500px] min-h-[500px] bg-primary/20 blur-[120px] rounded-full animate-mesh-1" />
        
        {/* 2. Blue (深い青 - ナイターの夜空) */}
        <div className="absolute bottom-[10%] left-[10%] w-[80vw] h-[80vw] min-w-[600px] min-h-[600px] bg-blue-500/20 blur-[120px] rounded-full animate-mesh-2" />
        
        {/* 3. Emerald (鮮やかな緑 - 人工芝/天然芝) */}
        <div className="absolute top-[30%] left-[30%] w-[60vw] h-[60vw] min-w-[400px] min-h-[400px] bg-emerald-500/20 blur-[120px] rounded-full animate-mesh-3" />

        {/* 4. Amber (オレンジ - ナイター照明/夕焼け) - NEW */}
        <div className="absolute bottom-[20%] right-[20%] w-[65vw] h-[65vw] min-w-[450px] min-h-[450px] bg-amber-500/20 blur-[120px] rounded-full animate-mesh-4" />

        {/* 5. Purple (紫 - 空間を馴染ませるブリッジカラー) - NEW */}
        <div className="absolute top-[15%] left-[15%] w-[75vw] h-[75vw] min-w-[550px] min-h-[550px] bg-purple-500/20 blur-[120px] rounded-full animate-mesh-5" />
      </div>

      {/* コンテンツエリア（モバイル幅に最適化） */}
      <main className="w-full max-w-md z-10 flex flex-col items-center">
        {children}
      </main>
    </div>
  );
}
