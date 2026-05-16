// filepath: src/app/(auth)/pending-approval/page.tsx
"use client";

import React, { useState } from "react";
import { ShieldAlert, Clock, Send, Loader2, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { LogoutButton } from "@/components/logout";

// 💡 画面の表示モード（チーム作成・選択を排除し、シンプル化）
type ViewMode = "join" | "pending";

// 💡 APIリクエストの型定義（安全な通信のため）
interface JoinTeamRequest {
  inviteCode: string;
}

/**
 * 💡 オンボーディング（チーム参加・待合室）画面
 * - セキュリティと運用保全のため、チーム作成機能を排除。
 * - 現場至上主義に基づき、グラスモーフィズムを排したソリッドな高コントラストUI。
 */
export default function PendingApprovalPage() {
  // 初期状態は「参加画面」。APIで既に申請済みの場合は "pending" を初期値にする等の拡張が可能です。
  const [view, setView] = useState<ViewMode>("join");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inviteCode, setInviteCode] = useState("");

  // ━━ チーム参加処理 ━━
  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode) return;
    
    setIsSubmitting(true);
    try {
      const payload: JoinTeamRequest = { inviteCode };
      // 💡 Cloudflare Workers (Hono) へのリクエスト想定
      const res = await fetch("/api/teams/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("無効な招待コードです");
      
      toast.success("チームへの参加申請を送信しました！");
      setView("pending"); // 申請完了後は待合室へ
    } catch (error) {
      toast.error("参加申請に失敗しました。招待コードを確認してください。");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-8 rounded-[40px] bg-card border border-border shadow-lg flex flex-col gap-8 animate-in fade-in zoom-in-95 duration-500 relative z-10">
      
      {/* ━━ 1. チーム参加（招待コード入力）画面 ━━ */}
      {view === "join" && (
        <form onSubmit={handleJoin} className="flex flex-col gap-6 animate-in slide-in-from-right-4 duration-300">
          
          {/* 💡 現場至上主義：日本語メイン・英語サブのヘッダー */}
          <div className="flex flex-col items-center text-center space-y-1 mb-2">
            <div className="bg-primary/10 p-4 rounded-full mb-3">
              <KeyRound className="w-8 h-8 text-primary" strokeWidth={2.5} />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-foreground">
              チームに参加
            </h1>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em]">
              Join Team
            </p>
          </div>

          <div className="space-y-4">
            <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground text-center block">
              招待コード (チームID)
            </Label>
            {/* 屋外でのタップしやすさと視認性を考慮した超巨大入力フィールド */}
            <Input 
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              placeholder="例: ABC-1234-XYZ"
              required
              className="h-16 rounded-[var(--radius-xl)] text-center text-2xl font-black tracking-widest bg-muted/30 border-2 focus-visible:ring-primary focus-visible:border-primary transition-all"
            />
            <p className="text-[11px] text-muted-foreground font-bold text-center leading-relaxed">
              監督やマネージャーから共有された<br />コードを入力してください。
            </p>
          </div>

          <div className="flex flex-col gap-3 mt-4">
            <Button type="submit" disabled={isSubmitting || !inviteCode} className="h-16 rounded-[var(--radius-xl)] font-black text-lg gap-2 shadow-md hover:scale-[0.98] transition-transform">
              {isSubmitting ? <Loader2 className="h-6 w-6 animate-spin" /> : <Send className="h-6 w-6" strokeWidth={2.5} />}
              参加申請を送る
            </Button>

            {/* 💡 デッドエンド撲滅：コードがわからないユーザーが迷子にならないようログアウトへの導線を確保 */}
            <LogoutButton className="h-14 rounded-full text-sm font-bold active:scale-95 text-muted-foreground" variant="ghost" />
          </div>
        </form>
      )}

      {/* ━━ 2. 承認待ち（待合室）画面 ━━ */}
      {view === "pending" && (
        <div className="flex flex-col gap-8 text-center animate-in slide-in-from-bottom-4 duration-500">
          <div className="flex justify-center">
            <div className="relative">
              <ShieldAlert className="w-16 h-16 text-primary" />
              <Clock className="absolute -bottom-2 -right-2 w-8 h-8 text-amber-500 bg-card rounded-full p-1 border-2 border-card" />
            </div>
          </div>

          {/* 💡 現場至上主義：日本語メイン・英語サブのヘッダー */}
          <div className="space-y-2">
            <h1 className="text-2xl font-black tracking-tight text-foreground">承認待ちです</h1>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em]">Pending Approval</p>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed font-bold">
            現在、参加申請の確認をおこなっています。<br />
            チーム管理者からの承認をお待ちください。
          </p>

          <div className="p-4 bg-primary/5 rounded-[var(--radius-xl)] border border-primary/20">
            <p className="text-xs text-primary/80 font-black tracking-wider">
              💡 管理者に「申請したよ！」とお伝えください
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-3 justify-center w-full">
            <Button variant="outline" onClick={() => setView("join")} className="w-full rounded-full h-12 text-sm font-bold active:scale-95 border-2">
              別のコードを入力する
            </Button>
            {/* 💡 デッドエンド撲滅：待合室からのログアウト手段も用意 */}
            <LogoutButton className="w-full rounded-full h-12 text-sm font-bold active:scale-95 text-muted-foreground" variant="ghost" />
          </div>
        </div>
      )}

    </div>
  );
}
