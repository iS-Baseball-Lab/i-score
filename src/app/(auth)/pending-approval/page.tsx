// filepath: src/app/(auth)/pending-approval/page.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert, Clock, Users, PlusCircle, ArrowLeft, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { LogoutButton } from "@/components/logout";
import { cn } from "@/lib/utils";

// 💡 画面の表示モードを管理
type ViewMode = "select" | "join" | "create" | "pending";

// 💡 APIリクエストの型定義（安全な通信のため）
interface CreateTeamRequest {
  teamName: string;
  organizationName?: string;
}

interface JoinTeamRequest {
  inviteCode: string;
}

/**
 * 💡 オンボーディング（チーム参加・作成・待合室）画面
 * - ログイン後、チームに所属していないユーザーが必ず通るハブ画面。
 * - 現場至上主義に基づき、グラスモーフィズムを排したソリッドな高コントラストUI。
 */
export default function PendingApprovalPage() {
  const router = useRouter();
  
  // 初期状態は「選択画面」。APIで既に申請済みの場合は "pending" を初期値にする等の拡張が可能です。
  const [view, setView] = useState<ViewMode>("select");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // フォーム状態
  const [inviteCode, setInviteCode] = useState("");
  const [teamName, setTeamName] = useState("");
  const [orgName, setOrgName] = useState("");

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

  // ━━ チーム作成処理 ━━
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName) return;

    setIsSubmitting(true);
    try {
      const payload: CreateTeamRequest = { teamName, organizationName: orgName };
      const res = await fetch("/api/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("チーム作成に失敗しました");
      
      toast.success(`${teamName} を作成しました！`);
      router.push("/"); // 作成完了（管理者権限付与）後はダッシュボードへ
    } catch (error) {
      toast.error("エラーが発生しました。もう一度お試しください。");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-8 rounded-[40px] bg-card border border-border shadow-lg flex flex-col gap-8 animate-in fade-in zoom-in-95 duration-500">
      
      {/* ━━ 1. アクション選択画面 ━━ */}
      {view === "select" && (
        <div className="flex flex-col gap-6 text-center animate-in slide-in-from-right-4 duration-300">
          <div className="space-y-2">
            <h1 className="text-2xl font-black tracking-tight text-foreground">チームをはじめよう</h1>
            <p className="text-sm text-muted-foreground font-bold">
              i-Scoreへようこそ！<br />まずは所属するチームを選択してください。
            </p>
          </div>

          <div className="grid gap-3 mt-2">
            <Button 
              onClick={() => setView("join")}
              className="h-16 rounded-[var(--radius-xl)] bg-blue-600 hover:bg-blue-700 text-white font-black text-lg gap-3 shadow-md transition-transform active:scale-95"
            >
              <Users className="h-6 w-6" strokeWidth={2.5} />
              既存のチームに参加する
            </Button>

            <Button 
              onClick={() => setView("create")}
              variant="outline"
              className="h-16 rounded-[var(--radius-xl)] border-2 border-border hover:bg-primary/5 hover:text-primary font-black text-lg gap-3 shadow-sm transition-transform active:scale-95"
            >
              <PlusCircle className="h-6 w-6 text-primary" strokeWidth={2.5} />
              新しくチームを作成する
            </Button>
          </div>

          <div className="pt-4 flex justify-center w-full">
            <LogoutButton className="w-full rounded-full h-12 text-sm font-bold active:scale-95" variant="ghost" />
          </div>
        </div>
      )}

      {/* ━━ 2. チーム参加（招待コード入力）画面 ━━ */}
      {view === "join" && (
        <form onSubmit={handleJoin} className="flex flex-col gap-6 animate-in slide-in-from-right-4 duration-300">
          <div className="flex items-center gap-2 mb-2">
            <Button type="button" variant="ghost" size="icon" onClick={() => setView("select")} className="h-8 w-8 rounded-full shrink-0 -ml-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-black tracking-tight text-foreground">チームに参加</h1>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">招待コード</Label>
            <Input 
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              placeholder="例: ABC-1234-XYZ"
              required
              className="h-14 rounded-[var(--radius-xl)] text-center text-xl font-bold tracking-widest bg-muted/20"
            />
            <p className="text-[10px] text-muted-foreground font-bold text-center mt-2">
              ※監督やマネージャーから共有されたコードを入力してください。
            </p>
          </div>

          <Button type="submit" disabled={isSubmitting || !inviteCode} className="h-14 rounded-[var(--radius-xl)] font-black text-lg gap-2 mt-4 shadow-md">
            {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" strokeWidth={2.5} />}
            参加申請を送る
          </Button>
        </form>
      )}

      {/* ━━ 3. チーム作成画面 ━━ */}
      {view === "create" && (
        <form onSubmit={handleCreate} className="flex flex-col gap-5 animate-in slide-in-from-right-4 duration-300">
          <div className="flex items-center gap-2 mb-2">
            <Button type="button" variant="ghost" size="icon" onClick={() => setView("select")} className="h-8 w-8 rounded-full shrink-0 -ml-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-black tracking-tight text-foreground">チーム作成</h1>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">チーム名 <span className="text-destructive">*</span></Label>
              <Input 
                value={teamName} onChange={(e) => setTeamName(e.target.value)}
                placeholder="例: 川崎ブルーソックス" required
                className="h-12 rounded-[var(--radius-xl)] font-bold"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">所属団体/学校名 <span className="text-[10px] font-normal">(任意)</span></Label>
              <Input 
                value={orgName} onChange={(e) => setOrgName(e.target.value)}
                placeholder="例: 株式会社〇〇 / 〇〇大学"
                className="h-12 rounded-[var(--radius-xl)] font-bold"
              />
            </div>
          </div>

          <Button type="submit" disabled={isSubmitting || !teamName} className="h-14 rounded-[var(--radius-xl)] font-black text-lg gap-2 mt-4 shadow-md">
            {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <PlusCircle className="h-5 w-5" strokeWidth={2.5} />}
            チームを設立する
          </Button>
        </form>
      )}

      {/* ━━ 4. 承認待ち（待合室）画面 ━━ */}
      {view === "pending" && (
        <div className="flex flex-col gap-8 text-center animate-in slide-in-from-bottom-4 duration-500">
          <div className="flex justify-center">
            <div className="relative">
              <ShieldAlert className="w-16 h-16 text-primary" />
              <Clock className="absolute -bottom-2 -right-2 w-8 h-8 text-amber-500 bg-card rounded-full p-1 border-2 border-card" />
            </div>
          </div>

          <div className="space-y-3">
            <h1 className="text-2xl font-black tracking-tight text-foreground">承認待ちです</h1>
            <p className="text-sm text-muted-foreground leading-relaxed font-bold">
              現在、参加申請の確認をおこなっています。<br />
              チーム管理者からの承認をお待ちください。
            </p>
          </div>

          <div className="p-4 bg-primary/5 rounded-[var(--radius-xl)] border border-primary/20">
            <p className="text-xs text-primary/80 font-black tracking-wider">
              💡 管理者に「申請したよ！」とお伝えください
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-3 justify-center w-full">
            <Button variant="outline" onClick={() => setView("select")} className="w-full rounded-full h-12 text-sm font-bold active:scale-95">
              別の方法を試す
            </Button>
            <LogoutButton className="w-full rounded-full h-12 text-sm font-bold active:scale-95" variant="ghost" />
          </div>
        </div>
      )}

    </div>
  );
}
