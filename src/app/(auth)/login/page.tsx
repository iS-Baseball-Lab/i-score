// filepath: `src/app/(auth)/login/page.tsx`
"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn, Mail, Lock, Chrome, MessageCircle, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

/**
 * 💡 ログインページ：スタジアムへの入場ゲート
 * 現場（屋外）での視認性を考慮し、コントラストの強いカードデザインを採用
 */
export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // 💡 将来的には Cloudflare Workers + D1 で検証[cite: 1]
    try {
      // 模擬ログイン
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success("プレイボール！スタジアムへようこそ");
      router.push("/dashboard");
    } catch (error) {
      toast.error("サインが合いません（ログイン失敗）");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center bg-background p-4 relative overflow-hidden">
      
      {/* 🏟 背景演出：ダイヤモンドをイメージした微細なグロー */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] aspect-square bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] aspect-square bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-[400px] space-y-8 z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        
        {/* ⚾️ ロゴセクション */}
        <div className="flex flex-col items-center space-y-4">
          <div className="relative w-20 h-20 drop-shadow-[0_0_15px_rgba(var(--primary),0.3)]">
            <Image
              src="/logo.webp"
              alt="iScore Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          <div className="text-center">
            <h1 className="text-4xl font-black italic tracking-tighter text-primary italic leading-none">
              iScore<span className="text-foreground">Cloud</span>
            </h1>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em] mt-2">
              Baseball Scoring Evolution
            </p>
          </div>
        </div>

        {/* 📋 ログインフォーム：ソリッドな背景で視認性を確保[cite: 1] */}
        <div className="bg-card border border-border/60 rounded-[32px] p-8 shadow-2xl shadow-primary/5">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-black uppercase ml-1 flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-3 w-3" /> Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  className="h-12 bg-muted/50 border-none rounded-xl focus-visible:ring-2 focus-visible:ring-primary font-medium"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between ml-1">
                  <Label htmlFor="password" className="text-xs font-black uppercase flex items-center gap-2 text-muted-foreground">
                    <Lock className="h-3 w-3" /> Password
                  </Label>
                  <Link href="#" className="text-[10px] font-bold text-primary hover:underline">パスワードを忘れた場合</Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  className="h-12 bg-muted/50 border-none rounded-xl focus-visible:ring-2 focus-visible:ring-primary"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 rounded-xl text-sm font-black italic gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
              PLAY BALL (LOGIN)
            </Button>
          </form>

          {/* 🔗 SNS連携セクション */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border/60"></span>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-black">
              <span className="bg-card px-4 text-muted-foreground">Or Connect With</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" className="h-12 rounded-xl gap-2 font-bold border-border/60 hover:bg-muted" onClick={() => {}}>
              <MessageCircle className="h-4 w-4 text-[#06C755]" />
              LINE
            </Button>
            <Button variant="outline" className="h-12 rounded-xl gap-2 font-bold border-border/60 hover:bg-muted" onClick={() => {}}>
              <Chrome className="h-4 w-4 text-primary" />
              Google
            </Button>
          </div>
        </div>

        {/* 📝 フッターリンク */}
        <p className="text-center text-xs text-muted-foreground font-bold">
          アカウントをお持ちでないですか？{" "}
          <Link href="/register" className="text-primary hover:underline font-black">
            新規登録（入団）
          </Link>
        </p>
      </div>

      {/* 💡 リーガルリンク */}
      <footer className="absolute bottom-6 w-full text-center flex justify-center gap-6 opacity-40">
        <Link href="/terms" className="text-[10px] font-bold hover:text-primary transition-colors uppercase tracking-widest">Terms</Link>
        <Link href="/privacy" className="text-[10px] font-bold hover:text-primary transition-colors uppercase tracking-widest">Privacy</Link>
      </footer>
    </div>
  );
}
