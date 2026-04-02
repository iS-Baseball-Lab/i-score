// src/app/(protected)/profile/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { User, Mail, Shield, Save, Crown, Loader2, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { UserSession } from "@/types/auth";

interface AuthResponse {
  success: boolean;
  data: UserSession;
}

/**
 * 💡 アカウント設定 (Profile) ページ
 * 1. UI/UX: カバー画像とはみ出すアバターでSaaSライクな美しいプロフカードを演出。
 * 2. 権限連動: SYSTEM_ADMINの場合は、王冠バッジと専用の権限説明パネルを表示。
 * 3. 状態管理: /api/auth/me からユーザー情報を取得し、表示名を編集可能に。
 */
export default function ProfilePage() {
  const [user, setUser] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [name, setName] = useState("");

  // 💡 ユーザー情報の取得
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("/api/auth/me");
        if (!response.ok) throw new Error("Failed to fetch");
        const json = (await response.json()) as AuthResponse;
        if (json.success) {
          setUser(json.data);
          setName(json.data.name || "");
        }
      } catch (error) {
        toast.error("ユーザー情報の取得に失敗しました");
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, []);

  // 💡 保存処理（※今回はUIのモックアップとして1秒待機し、トーストを出します）
  // 実際は Better Auth の update API や、独自のバックエンドへPUTする処理を入れます。
  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast.success("プロフィールを更新しました", {
      description: "ベンチに変更サインを伝達しました！"
    });
    // setUser({ ...user, name }); のように状態を更新すると完璧です
    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  // Headerと同じく権限を判定
  const isAdmin = user.role === 'SYSTEM_ADMIN' || user.systemRole === 'SYSTEM_ADMIN';

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* 🌟 ページタイトル */}
      <div className="mb-8">
        <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
          <User className="h-8 w-8 text-primary" />
          アカウント設定
        </h1>
        <p className="text-muted-foreground mt-2 font-medium tracking-wide">
          選手登録情報（プロフィール）の確認と更新を行います。
        </p>
      </div>

      {/* 🌟 究極のプロフィールカード */}
      <div className="bg-card/40 backdrop-blur-xl border border-border/50 shadow-xl rounded-[32px] overflow-hidden">
        
        {/* カバー画像風のグラデーションヘッダー */}
        <div className="h-32 bg-gradient-to-r from-primary/30 via-primary/10 to-transparent w-full" />

        <div className="px-6 sm:px-10 pb-10">
          
          {/* アバター部分（上に少しはみ出させる高度なCSSトリック） */}
          <div className="relative flex justify-between items-end -mt-12 mb-8">
            <div className="relative group">
              <Avatar className="h-24 w-24 border-4 border-background shadow-xl bg-white">
                <AvatarImage src={user.avatarUrl || ""} className="object-cover" />
                <AvatarFallback className="bg-primary/10 text-primary text-2xl font-black">
                  {(user.name || "U").slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {/* アバター変更ボタン（UIのみ） */}
              <button className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full shadow-lg hover:scale-110 active:scale-95 transition-transform cursor-pointer">
                <Camera className="h-4 w-4" />
              </button>
            </div>
            
            {/* VIP感のある管理者バッジ */}
            {isAdmin && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 shadow-sm mb-2">
                <Crown className="h-4 w-4" />
                <span className="text-xs font-black tracking-widest uppercase">
                  SYSTEM ADMIN
                </span>
              </div>
            )}
          </div>

          {/* 🌟 フォーム部分 */}
          <div className="space-y-6">
            
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-bold text-muted-foreground flex items-center gap-2">
                <User className="h-4 w-4" /> 表示名 (登録名)
              </Label>
              <Input 
                id="name" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                className="h-12 rounded-xl border-border/50 bg-background/50 text-lg font-medium focus-visible:ring-primary/50 transition-colors"
                placeholder="グラウンドでの名前を入力"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-bold text-muted-foreground flex items-center gap-2">
                <Mail className="h-4 w-4" /> メールアドレス
              </Label>
              <Input 
                id="email" 
                value={user.email} 
                disabled
                className="h-12 rounded-xl border-border/50 bg-muted/50 text-lg font-medium text-muted-foreground cursor-not-allowed opacity-70"
              />
              <p className="text-xs text-muted-foreground mt-1 ml-1 font-medium">
                ※メールアドレスはSNSプロバイダーと連携しているため変更できません。
              </p>
            </div>

            {/* 権限情報（リードオンリーの美しいパネル） */}
            <div className="space-y-2 pt-2">
              <Label className="text-sm font-bold text-muted-foreground flex items-center gap-2">
                <Shield className="h-4 w-4" /> アカウント権限
              </Label>
              <div className="p-4 rounded-xl border border-border/50 bg-background/30 flex items-center gap-4">
                {isAdmin ? (
                  <>
                    <div className="p-3 bg-amber-500/20 rounded-lg shrink-0">
                      <Crown className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <p className="font-bold text-amber-600 dark:text-amber-400">システム管理者</p>
                      <p className="text-xs text-muted-foreground mt-1 font-medium">i-Scoreの全ての機能と設定にアクセスできる最高権限です。</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="p-3 bg-primary/20 rounded-lg shrink-0">
                      <Shield className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-bold text-foreground">一般ユーザー</p>
                      <p className="text-xs text-muted-foreground mt-1 font-medium">所属チームの権限（監督・選手・マネージャー）に基づき機能を利用できます。</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* 保存ボタン */}
            <div className="pt-6">
              <Button 
                size="lg" 
                onClick={handleSave} 
                // 名前に変更がない場合、または保存中はボタンを非活性にする
                disabled={isSaving || name === user.name}
                className="w-full sm:w-auto h-14 px-8 rounded-full font-bold text-base shadow-md shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
              >
                {isSaving ? (
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                ) : (
                  <Save className="h-5 w-5 mr-2" />
                )}
                {isSaving ? "更新中..." : "変更を保存"}
              </Button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
