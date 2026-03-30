// src/app/(auth)/login/page.tsx
"use client";

import React, { useState } from "react";
/**
 * 💡 究極のログイン画面
 * 1. 意匠: bg-card/30, backdrop-blur-2xl, rounded-[40px], border-border/40。
 * 2. 演出: 野球の「プレイ開始」を彷彿とさせるシャープなタイポグラフィ。
 * 3. 規則: 影なし (No Shadow)。OKLCHカラーのアクセント。
 */
import { useRouter } from "next/navigation";
import { 
  Card, 
  CardContent, 
  CardHeader 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  ShieldCheck, 
  LogIn, 
  Mail, 
  Lock, 
  ChevronRight, 
  Loader2,
  Zap
} from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // 💡 認証ロジック (実際には Firebase Auth / NextAuth 等を呼び出し)
    setTimeout(() => {
      setIsLoading(false);
      toast.success("プレイボール！ログインに成功しました。");
      router.push("/dashboard");
    }, 1500);
  };

  return (
    <Card className="bg-card/30 backdrop-blur-2xl border-border/40 rounded-[40px] shadow-none overflow-hidden relative group">
      {/* カード上部の Stadium Sync 装飾線 */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      
      <CardHeader className="pt-12 pb-8 flex flex-col items-center text-center space-y-4">
        <div className="h-16 w-16 rounded-[24px] bg-primary/10 border border-primary/20 flex items-center justify-center mb-2 shadow-inner">
          <img src="/logo.png" alt="i-Score" className="h-10 w-10 object-contain" />
        </div>
        
        <div className="space-y-1">
          <div className="flex items-center justify-center gap-2">
            <Badge variant="outline" className="border-primary/30 text-primary bg-primary/5 rounded-full px-3 py-0.5 text-[9px] font-black tracking-widest uppercase">
              Secure Access
            </Badge>
          </div>
          <h1 className="text-4xl font-black italic tracking-tighter text-foreground uppercase leading-none">
            Welcome <span className="text-primary">Back</span>
          </h1>
          <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
            Enter the tactical hub
          </p>
        </div>
      </CardHeader>

      <CardContent className="px-8 pb-12">
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-4">
            {/* メールアドレス入力 */}
            <div className="space-y-2 group">
              <label className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest pl-2 flex items-center gap-2">
                <Mail className="h-3 w-3" /> Email Address
              </label>
              <Input 
                type="email" 
                placeholder="manager@example.com"
                required
                className="h-14 rounded-2xl bg-muted/20 border-border/40 focus:border-primary/40 focus:ring-primary/10 transition-all shadow-none font-bold placeholder:text-muted-foreground/30 px-6"
              />
            </div>

            {/* パスワード入力 */}
            <div className="space-y-2 group">
              <div className="flex items-center justify-between pl-2 pr-2">
                <label className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest flex items-center gap-2">
                  <Lock className="h-3 w-3" /> Password
                </label>
                <button type="button" className="text-[9px] font-black text-primary/60 hover:text-primary transition-colors uppercase tracking-widest">Forgot?</button>
              </div>
              <Input 
                type="password" 
                placeholder="••••••••"
                required
                className="h-14 rounded-2xl bg-muted/20 border-border/40 focus:border-primary/40 focus:ring-primary/10 transition-all shadow-none font-bold placeholder:text-muted-foreground/30 px-6"
              />
            </div>
          </div>

          <div className="pt-4 space-y-4">
            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full h-16 rounded-[24px] bg-primary text-primary-foreground font-black text-xl shadow-lg shadow-primary/10 hover:bg-primary/90 transition-all flex items-center justify-center gap-3 active:scale-95 group"
            >
              {isLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <>
                  <LogIn className="h-6 w-6 stroke-[3px]" />
                  <span>SIGN IN</span>
                  <ChevronRight className="h-5 w-5 opacity-40 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>

            <div className="relative py-4 flex items-center">
              <div className="flex-grow border-t border-border/20"></div>
              <span className="flex-shrink mx-4 text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest">Or Continue With</span>
              <div className="flex-grow border-t border-border/20"></div>
            </div>

            <Button 
              type="button"
              variant="outline"
              className="w-full h-14 rounded-2xl border-border/40 bg-muted/10 font-black text-sm tracking-tight hover:bg-muted/20 transition-all flex items-center gap-3 active:scale-95"
            >
              <img src="https://www.google.com/favicon.ico" alt="" className="h-4 w-4 grayscale opacity-60 group-hover:grayscale-0 transition-all" />
              Google でログイン
            </Button>
          </div>
        </form>

        <div className="mt-10 flex flex-col items-center gap-4 border-t border-border/20 pt-8 text-center">
          <p className="text-xs font-bold text-muted-foreground">
            アカウントをお持ちでないですか？
            <button className="text-primary hover:underline ml-1">新規登録（監督用）</button>
          </p>
          <div className="flex items-center gap-2 text-muted-foreground/30">
            <ShieldCheck className="h-3 w-3" />
            <span className="text-[8px] font-black uppercase tracking-widest">Biometric Support Ready</span>
          </div>
        </div>
      </CardContent>

      {/* 装飾: 背景の微細な光彩 */}
      <div className="absolute -bottom-20 -right-20 h-40 w-40 bg-primary/10 blur-[80px] rounded-full pointer-events-none" />
    </Card>
  );
}
