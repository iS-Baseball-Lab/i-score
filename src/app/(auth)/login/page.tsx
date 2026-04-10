// src/app/(auth)/login/page.tsx
/* 💡 ログイン画面（SNSログイン統合版・管理者判定は遷移先で行う） */
"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { SiLine } from "react-icons/si";
import { signIn } from "@/lib/auth-client"; // Client SDK

export default function LoginPage() {
  const [loadingProvider, setLoadingProvider] = useState<"google" | "line" | null>(null);

  const handleSocialLogin = async (provider: "google" | "line") => {
    setLoadingProvider(provider);
    try {
      await signIn.social({
        provider,
        // 🌟 ログイン成功後は、まずダッシュボードへ飛ばす
        callbackURL: "/dashboard",
      });
    } catch (error) {
      toast.error(`${provider === 'google' ? 'Google' : 'LINE'}でのログインに失敗しました`);
      setLoadingProvider(null);
    }
  };

  return (
    <div className="w-full p-8 rounded-[40px] bg-card/60 backdrop-blur-2xl border border-border/50 shadow-2xl flex flex-col gap-8 animate-in fade-in zoom-in-95 duration-500">
      <div className="space-y-2 text-center">
        <h1 className="text-4xl font-black tracking-tighter text-primary">i-Score</h1>
        <p className="text-sm text-muted-foreground font-bold tracking-widest">PLAY BALL!</p>
      </div>

      <div className="space-y-4">
        <p className="text-center text-xs font-medium text-muted-foreground">SNSアカウントで安全にサインイン</p>
        <div className="flex flex-col gap-4 w-full">
          <Button
            type="button"
            variant="outline"
            disabled={loadingProvider !== null}
            className="relative w-full h-14 bg-background/80 hover:bg-background transition-colors text-foreground border-border/50 shadow-sm text-base rounded-2xl font-bold"
            onClick={() => handleSocialLogin("google")}
          >
            <div className="absolute left-4 flex items-center justify-center">
              {loadingProvider === "google" ? <Loader2 className="h-5 w-5 animate-spin" /> : <FcGoogle size={24} />}
            </div>
            Googleで続ける
          </Button>

          <Button
            type="button"
            disabled={loadingProvider !== null}
            className="relative w-full h-14 bg-[#06C755]/90 hover:bg-[#06C755] text-white transition-colors border-none shadow-sm text-base rounded-2xl font-bold"
            onClick={() => handleSocialLogin("line")}
          >
            <div className="absolute left-4 flex items-center justify-center">
              {loadingProvider === "line" ? <Loader2 className="h-5 w-5 animate-spin text-white" /> : <SiLine size={24} />}
            </div>
            LINEで続ける
          </Button>
        </div>
      </div>

      <footer className="mt-4 text-[10px] text-center text-muted-foreground/60">
        <p>Developed by <span className="font-bold">iS Baseball Lab</span></p>
      </footer>
    </div>
  );
}