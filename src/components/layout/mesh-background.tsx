// filepath: `src/components/layout/mesh-background.tsx`
import React from "react";

/**
 * 💡 アプリ共通：メッシュグラデーション背景
 * 現場至上主義の視認性を守るため、透過度(20%)を維持し、
 * fixed配置によりスクロール時も常に美しく画面全体を覆います。
 */
export function MeshBackground() {
  return (
    <>
      <style>{`
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
        
        .animate-mesh-1 { animation: mesh-blob-1 8s infinite alternate ease-in-out; }
        .animate-mesh-2 { animation: mesh-blob-2 10s infinite alternate ease-in-out; }
        .animate-mesh-3 { animation: mesh-blob-3 11s infinite alternate ease-in-out; }
        .animate-mesh-4 { animation: mesh-blob-4 7s infinite alternate ease-in-out; }
        .animate-mesh-5 { animation: mesh-blob-5 9s infinite alternate ease-in-out; }
      `}</style>

      {/* 💡 背景コンテナ：fixedで画面に固定し、はみ出しを隠す */}
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none bg-background">
        {/* アニメーション要素本体 */}
        <div className="absolute inset-[-50%] flex items-center justify-center">
          {/* 1. Primary */}
          <div className="absolute top-[10%] right-[10%] w-[70vw] h-[70vw] min-w-[500px] min-h-[500px] bg-primary/20 blur-[120px] rounded-full animate-mesh-1" />
          {/* 2. Blue */}
          <div className="absolute bottom-[10%] left-[10%] w-[80vw] h-[80vw] min-w-[600px] min-h-[600px] bg-blue-500/20 blur-[120px] rounded-full animate-mesh-2" />
          {/* 3. Emerald */}
          <div className="absolute top-[30%] left-[30%] w-[60vw] h-[60vw] min-w-[400px] min-h-[400px] bg-emerald-500/20 blur-[120px] rounded-full animate-mesh-3" />
          {/* 4. Amber */}
          <div className="absolute bottom-[20%] right-[20%] w-[65vw] h-[65vw] min-w-[450px] min-h-[450px] bg-amber-500/20 blur-[120px] rounded-full animate-mesh-4" />
          {/* 5. Purple */}
          <div className="absolute top-[15%] left-[15%] w-[75vw] h-[75vw] min-w-[550px] min-h-[550px] bg-purple-500/20 blur-[120px] rounded-full animate-mesh-5" />
        </div>
      </div>
    </>
  );
}
