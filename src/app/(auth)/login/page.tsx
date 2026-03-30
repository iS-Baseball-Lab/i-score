// src/app/(auth)/login/page.tsx
"use client";

import React, { useState } from "react";
/**
 * 💡 究極のソーシャルログイン (Better Auth 統合版)
 * 1. 連携: 監督の auth-client.ts から signIn を呼び出し、Google/LINE 連携を実行。
 * 2. 意匠: スタジアム・シンク背景を活かす透過カード (bg-card/30)。
 * 3. 整理: メール入力を廃止し、現場で最速のログイン体験を提供。
 * 4. 規則: 影なし、0.5px境界線、角丸40px。
 */
import { useRouter } from "next/navigation";
import { signIn } from "@/lib/auth-client"; 
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, ChevronRight, Loader2, Zap } from "lucide-react";
import { toast } from "sonner";

// LINE ブランドアイコン (SVG)
const LineIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" xmlns="http://www.w3.org/2000/svg">
    <path d="M21 10.354c0-4.062-4.038-7.354-9-7.354s-9 3.292-9 7.354c0 3.642 3.203 6.69 7.531 7.234.293.063.692.193.791.443.09.227.059.582.029.81l-.128.771c-.039.234-.18 1.055.776.575 1.042-.524 5.617-3.385 7.662-5.802.434-.543.339-1.031.339-4.031z"/>
  </svg>
);

export default function LoginPage() {
  const router = useRouter();
  const [loadingType, setLoadingType] = useState<"google" | "line" | null>(null);

  const handleLogin = async (provider: "google" | "line") => {
    setLoadingType(provider);
    try {
      // 💡 Better Auth のソーシャルログイン実行
      await signIn.social({
        provider: provider,
        callbackURL: "/dashboard",
      });
      // Better Auth はリダイレクトを自動で行います
    } catch (error) {
      toast.error("ログイン中にエラーが発生しました。");
      setLoadingType(null);
    }
  };

  return (
    <Card className="bg-card/30 backdrop-blur-3xl border-border/40 rounded-[40px] shadow-none overflow-hidden relative">
      {/* 🏟 Stadium Sync アクセントライン */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      
      <CardHeader className="pt-16 pb-10 flex flex-col items-center text-center space-y-4 px-8">
        <div className="h-20 w-20 rounded-[28px] bg-primary/10 border border-primary/20 flex items-center justify-center mb-2 shadow-inner group">
          <img src="/logo.png" alt="i-Score" className="h-12 w-12 object-contain relative z-10 group-hover:scale-110 transition-transform duration-500" />
        </div>
        
        <div className="space-y-1">
          <Badge variant="outline" className="border-primary/30 text-primary bg-primary/5 rounded-full px-4 py-1 text-[10px] font-black tracking-widest uppercase">
            Better Auth Secured
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-black italic tracking-tighter text-foreground uppercase leading-none mt-2">
            Game <span className="text-primary">Entry</span>
          </h1>
          <p className="text-[11px] font-bold text-muted-foreground/40 uppercase tracking-[0.3em] mt-2 flex items-center gap-2">
            <Zap className="h-3 w-3 text-primary" /> Tactical Hub Access
          </p>
        </div>
      </CardHeader>

      <CardContent className="px-10 pb-16 space-y-4">
        {/* LINE ログイン */}
        <Button 
          onClick={() => handleLogin("line")}
          disabled={!!loadingType}
          className="w-full h-16 rounded-2xl bg-[#06C755] hover:bg-[#05b34d] text-white border-none font-black text-lg tracking-tight transition-all active:scale-95 flex items-center justify-center gap-4 group shadow-lg shadow-[#06C755]/10"
        >
          {loadingType === "line" ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <>
              <LineIcon />
              <span className="flex-1 text-center pr-8">LINE でログイン</span>
              <ChevronRight className="h-5 w-5 opacity-40 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </Button>

        {/* Google ログイン */}
        <Button 
          onClick={() => handleLogin("google")}
          disabled={!!loadingType}
          variant="outline"
          className="w-full h-16 rounded-2xl border-border/60 bg-white/80 dark:bg-zinc-900/40 text-foreground font-black text-lg tracking-tight hover:bg-muted/50 transition-all flex items-center justify-center gap-4 active:scale-95 group shadow-none"
        >
          {loadingType === "google" ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <>
              <img src="https://www.google.com/favicon.ico" alt="" className="h-5 w-5" />
              <span className="flex-1 text-center pr-8">Google でログイン</span>
              <ChevronRight className="h-5 w-5 opacity-20 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </Button>

        <div className="pt-8 border-t border-border/10 flex flex-col items-center gap-4">
          <div className="flex items-center gap-2 text-muted-foreground/20">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span className="text-[9px] font-black uppercase tracking-[0.2em]">Authorized Access Only</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
