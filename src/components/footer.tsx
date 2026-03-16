// src/components/footer.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { LogoIcon } from "@/components/logo";
import { Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

export function Footer() {
  const pathname = usePathname();
  const { data: session } = authClient.useSession();

  if (pathname?.includes("/matches/score")) {
    return null;
  }

  return (
    <footer className={cn(
      "w-full border-t border-zinc-800/80 bg-zinc-950/95 backdrop-blur-md text-zinc-400 mt-auto transition-all duration-300",
      session && "md:pl-[280px]" // 💡 幅を 260px から 280px に拡張
    )}>
      <div className="container mx-auto px-4 py-8 sm:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">

          <div className="flex items-center gap-2 grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all duration-300 cursor-pointer">
            <LogoIcon className="h-6 w-6" />
            <span className="font-black italic tracking-tighter text-zinc-100">
              i-Score
            </span>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6 text-xs font-bold">
            <Link href="/" className="hover:text-white transition-colors duration-200">ホーム</Link>
            <Link href="#" className="hover:text-white transition-colors duration-200">利用規約</Link>
            <Link href="#" className="hover:text-white transition-colors duration-200">プライバシーポリシー</Link>
            <Link href="#" className="hover:text-white transition-colors duration-200">お問い合わせ</Link>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-zinc-800/80 text-center text-[10px] flex items-center justify-center gap-1.5 opacity-60 font-medium tracking-wider">
          <Trophy className="h-3 w-3 text-zinc-500" />
          <p>&copy; {new Date().getFullYear()} iS Baseball Lab. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}