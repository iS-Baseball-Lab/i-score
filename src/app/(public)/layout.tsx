// filepath: `src/app/(public)/layout.tsx`
import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Trophy } from "lucide-react"; // 💡 ロゴ用アイコン

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  // 💡 ロゴコンポーネントを共通化
  const Logo = () => (
    <div className="flex items-center gap-2 group">
      <div className="relative">
        {/* アイコンの背景に薄い光を配置してロゴっぽさを演出 */}
        <div className="absolute inset-0 bg-primary/20 blur-md rounded-full group-hover:bg-primary/40 transition-all" />
        <Trophy className="relative h-6 w-6 text-primary rotate-[-10deg] group-hover:rotate-0 transition-transform duration-300" />
      </div>
      <span className="text-xl font-black italic tracking-tighter text-primary">
        iScore<span className="text-foreground/80">Cloud</span>
      </span>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      
      {/* 🚀 ヘッダー */}
      <header className="h-16 border-b border-border/40 flex items-center justify-between px-6 sticky top-0 bg-background/80 backdrop-blur-md z-50">
        <Link href="/">
          <Logo />
        </Link>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild className="text-xs font-bold">
            <Link href="/login">ログイン</Link>
          </Button>
          <Button size="sm" asChild className="text-xs font-bold rounded-full px-5">
            <Link href="/register">無料で始める</Link>
          </Button>
        </div>
      </header>

      {/* コンテンツ */}
      <main className="flex-1 w-full max-w-4xl mx-auto py-10 px-4">
        {children}
      </main>

      {/* 🚀 フッター */}
      <footer className="border-t border-border/40 bg-muted/10 py-12 mt-auto">
        <div className="max-w-6xl mx-auto px-6 text-center md:text-left">
          <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-8">
            <div className="space-y-4">
              <Link href="/">
                <Logo />
              </Link>
              <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
                次世代の野球スコアリングプラットフォーム。
                データの力で、すべての試合をドラマチックに。
              </p>
            </div>
            
            {/* リンク集などは以前のまま ... */}
            <div className="flex gap-10">
               <div className="space-y-3 text-left">
                  <h4 className="text-[10px] font-black tracking-widest uppercase">Legal</h4>
                  <ul className="space-y-2 text-xs text-muted-foreground font-bold">
                    <li><Link href="/terms" className="hover:text-primary">利用規約</Link></li>
                    <li><Link href="/privacy" className="hover:text-primary">プライバシーポリシー</Link></li>
                  </ul>
               </div>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-border/20">
            <p className="text-[10px] text-muted-foreground/40 font-medium">© 2026 iScoreCloud</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
