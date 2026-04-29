// filepath: `src/app/(public)/layout.tsx`
import React from "react";
import Link from "next/link";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    // 💡 背景をグローバルの bg-background に合わせ、少し奥行きを出す
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20">
      
      {/* 💡 ヘッダー：余白を抑えてスリムに */}
      <header className="h-14 border-b border-border/40 flex items-center justify-between px-4 sticky top-0 bg-background/80 backdrop-blur-md z-50">
        <Link href="/" className="text-lg font-black italic tracking-tighter text-primary">
          iScoreCloud
        </Link>
        <Link href="/login" className="text-xs font-bold text-muted-foreground hover:text-primary transition-colors">
          ログインに戻る
        </Link>
      </header>

      {/* 💡 メイン：余白を「py-8 px-4」程度に絞り、読みやすさを向上 */}
      <main className="w-full max-w-3xl mx-auto py-8 px-4 sm:px-6">
        <div className="bg-card/30 rounded-3xl p-6 sm:p-8 border border-border/40 shadow-sm backdrop-blur-sm">
          {children}
        </div>
      </main>

      {/* 💡 フッター：シンプルに */}
      <footer className="py-10 text-center">
        <p className="text-[10px] text-muted-foreground font-medium tracking-widest uppercase opacity-50">
          © 2026 iScore
        </p>
      </footer>
    </div>
  );
}
