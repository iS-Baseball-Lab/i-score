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
    <div className="relative flex h-[100dvh] w-full flex-col items-center justify-center overflow-hidden bg-background text-foreground selection:bg-primary/20 z-0">
      
      {/* 🌟 共通の背景装飾（メッシュグラデーション・アニメーション） */}
      {/* 画面全体のルートで管理することで、左右の余白を完全に撲滅します 🔥 */}
      <style>{`
        @keyframes mesh-blob {
          0% { transform: translate(0%, 0%) scale(1); }
          33% { transform: translate(8%, -8%) scale(1.1); }
          66% { transform: translate(-8%, 8%) scale(0.95); }
          100% { transform: translate(0%, 0%) scale(1); }
        }
        .animate-mesh-1 { animation: mesh-blob 12s infinite alternate ease-in-out; }
        .animate-mesh-2 { animation: mesh-blob 15s infinite alternate-reverse ease-in-out; }
        .animate-mesh-3 { animation: mesh-blob 18s infinite alternate ease-in-out; }
      `}</style>

      {/* inset-[-50%] と大きな要素で、画面外まで確実にグラデーションを敷き詰めます */}
      <div className="absolute inset-[-50%] z-[-1] pointer-events-none flex items-center justify-center">
        <div className="absolute top-[10%] right-[10%] w-[80vw] h-[80vw] min-w-[600px] min-h-[600px] bg-primary/20 dark:bg-primary/30 blur-[120px] rounded-full animate-mesh-1" />
        <div className="absolute bottom-[10%] left-[10%] w-[90vw] h-[90vw] min-w-[700px] min-h-[700px] bg-blue-500/20 dark:bg-blue-600/25 blur-[120px] rounded-full animate-mesh-2" />
        <div className="absolute top-[30%] left-[30%] w-[70vw] h-[70vw] min-w-[500px] min-h-[500px] bg-emerald-500/20 dark:bg-emerald-500/25 blur-[120px] rounded-full animate-mesh-3" />
      </div>

      {/* コンテンツエリア（モバイル幅に最適化） */}
      <main className="w-full max-w-md z-10 flex flex-col items-center">
        {children}
      </main>
    </div>
  );
}
