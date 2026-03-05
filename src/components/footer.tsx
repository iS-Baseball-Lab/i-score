// src/components/footer.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoIcon } from "@/components/logo";
import { Trophy } from "lucide-react";

export function Footer() {
  const pathname = usePathname();

  // 💡 スコア入力画面ではフッターを隠して画面を広く使う
  if (pathname?.includes("/matches/score")) {
    return null;
  }

  return (
    <footer className="w-full border-t border-border/40 bg-background/80 backdrop-blur-md text-muted-foreground mt-auto transition-all duration-300">
      <div className="container mx-auto px-4 py-8 sm:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          
          {/* ロゴとアプリ名 */}
          <div className="flex items-center gap-2 grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all duration-300">
            <LogoIcon className="h-6 w-6" />
            <span className="font-black italic tracking-tighter text-foreground">
              i-Score
            </span>
          </div>

          {/* リンク群（※将来的にページを作った際のためのダミーリンクです） */}
          <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6 text-xs font-bold">
            <Link href="/" className="hover:text-primary transition-colors">ホーム</Link>
            <Link href="#" className="hover:text-primary transition-colors">利用規約</Link>
            <Link href="#" className="hover:text-primary transition-colors">プライバシーポリシー</Link>
            <Link href="#" className="hover:text-primary transition-colors">お問い合わせ</Link>
          </div>
        </div>

        {/* コピーライト */}
        <div className="mt-8 pt-4 border-t border-border/50 text-center text-[10px] flex items-center justify-center gap-1.5 opacity-60 font-medium tracking-wider">
          <Trophy className="h-3 w-3" />
          <p>&copy; {new Date().getFullYear()} i-Score. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
