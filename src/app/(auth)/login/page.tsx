// filepath: `src/app/(auth)/login/page.tsx`
"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { BsMicrosoft } from "react-icons/bs";
/** 💡 Better-Auth のクライアントをインポート */
import { authClient } from "@/lib/auth-client"; 

export default function LoginPage() {
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);

  /**
   * 💡 ソーシャルログイン実行 (Better-Auth 仕様)
   * signIn.social を使用して、各プロバイダーの承認ページへ安全に遷移します。
   */
  const handleSocialLogin = async (provider: "line" | "google" | "microsoft") => {
    setLoadingProvider(provider);
    
    try {
      toast.loading(`${provider.toUpperCase()} 認証を開始します...`);
      
      // 🚀 Better-Auth の機能で承認ページへ飛ばす
      await authClient.signIn.social({
        provider: provider,
        callbackURL: "/dashboard", 
      });

    } catch (error) {
      console.error(`${provider} login error:`, error);
      const providerName = provider === 'google' ? 'Google' : provider === 'line' ? 'LINE' : 'Microsoft';
      toast.error(`${providerName}でのログインに失敗しました。`);
      setLoadingProvider(null);
    }
  };

  return (
    // 💡 min-h-[100dvh] と justify-between で画面全体をFlex管理
    <div className="w-full min-h-[100dvh] flex flex-col items-center justify-between py-10 px-6">
      
      {/* 上部スペース（ロゴとボタンを画面中央に保つためのバランサー） */}
      <div className="flex-1" />

      {/* ⚾️ メインコンテンツ（shrink-0 で画面が小さくても潰れないように保護） */}
      <div className="w-full max-w-[360px] space-y-16 z-10 animate-in fade-in zoom-in-95 duration-1000 shrink-0">
        
        {/* センターロゴ */}
        <div className="flex flex-col items-center space-y-6">
          <div className="relative w-28 h-28 drop-shadow-[0_0_20px_rgba(var(--primary),0.5)]">
            <Image
              src="/logo.webp"
              alt="iScore Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          <div className="text-center space-y-1">
            <h1 className="text-5xl font-black italic tracking-tighter text-primary leading-none select-none drop-shadow-sm">
              iScore<span className="text-foreground">Cloud</span>
            </h1>
            <p className="text-[10px] font-black text-muted-foreground/80 uppercase tracking-[0.4em] select-none">
              Authentic Scorer
            </p>
          </div>
        </div>

        {/* 🔓 ログインアクション */}
        <div className="space-y-6">
          <p className="text-center text-[11px] font-black text-muted-foreground/80 uppercase tracking-widest select-none">
            Welcome to the Stadium
          </p>
          
          <div className="grid gap-5">
            {/* LINE */}
            <Button 
              onClick={() => handleSocialLogin("line")}
              disabled={!!loadingProvider}
              className="h-16 w-full rounded-[24px] bg-[#06C755] hover:bg-[#05b34c] text-white font-black text-lg shadow-md shadow-emerald-900/20 active:scale-[0.98] transition-all border-none flex items-center justify-start px-6 relative"
            >
              {loadingProvider === "line" ? (
                <Loader2 className="h-8 w-8 animate-spin mx-auto" />
              ) : (
                <>
                  <div className="relative h-9 w-9 shrink-0">
                    <Image src="/line-logo.png" alt="LINE" fill className="object-contain" />
                  </div>
                  <span className="w-full text-center pr-9">LINEで入場</span>
                </>
              )}
            </Button>

            {/* Google */}
            <Button 
              onClick={() => handleSocialLogin("google")}
              disabled={!!loadingProvider}
              variant="secondary"
              className="h-16 w-full rounded-[24px] bg-white text-black hover:bg-zinc-100 font-black text-lg shadow-md shadow-black/10 active:scale-[0.98] transition-all border border-zinc-200 flex items-center justify-start px-6 relative"
            >
              {loadingProvider === "google" ? (
                <Loader2 className="h-8 w-8 animate-spin text-zinc-400 mx-auto" />
              ) : (
                <>
                  <div className="relative h-8 w-8 shrink-0">
                    <Image src="/google-logo.png" alt="Google" fill className="object-contain" />
                  </div>
                  <span className="w-full text-center pr-8">Googleで入場</span>
                </>
              )}
            </Button>

            {/* Microsoft */}
            <Button 
              onClick={() => handleSocialLogin("microsoft")}
              disabled={!!loadingProvider}
              variant="secondary"
              className="h-16 w-full rounded-[24px] bg-[#2f2f2f] hover:bg-[#1a1a1a] text-white font-black text-lg shadow-md shadow-black/20 active:scale-[0.98] transition-all border-none flex items-center justify-start px-6 relative"
            >
              {loadingProvider === "microsoft" ? (
                <Loader2 className="h-8 w-8 animate-spin text-zinc-400 mx-auto" />
              ) : (
                <>
                  <BsMicrosoft size={32} className="shrink-0 text-[#00a4ef]" />
                  <span className="w-full text-center pr-8">Microsoftで入場</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* 💡 フッター（下部スペース。absoluteをやめて自然に一番下へ配置） */}
      <div className="flex-1 flex flex-col justify-end w-full pb-4 pt-12 z-10">
        <footer className="w-full flex flex-col items-center gap-4">
          <div className="flex gap-6">
            <Link href="/terms" className="text-[14px] font-black text-muted-foreground/60 hover:text-primary tracking-widest uppercase transition-colors">Terms</Link>
            <Link href="/privacy" className="text-[14px] font-black text-muted-foreground/60 hover:text-primary tracking-widest uppercase transition-colors">Privacy</Link>
          </div>
          <p className="text-[12px] font-medium text-muted-foreground/60 tracking-tighter">© 2026 iScoreCloud / iS Baseball Lab</p>
        </footer>
      </div>

    </div>
  );
}
