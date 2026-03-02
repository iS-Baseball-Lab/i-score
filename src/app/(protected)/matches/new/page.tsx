// src/app/(protected)/matches/new/page.tsx
"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, Calendar, CalendarPlus, Loader2, Trophy, Users } from "lucide-react";

function NewMatchForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 💡 ダッシュボードのURLから渡された teamId を取得！
  const teamId = searchParams.get("teamId");

  const [opponent, setOpponent] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]); // 今日の日付
  const [matchType, setMatchType] = useState("practice");

  // 💡 シーズンの管理（デフォルトは現在の年 "2026"）
  const [season, setSeason] = useState(new Date().getFullYear().toString());
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamId) {
      alert("チームが選択されていません。ダッシュボードからやり直してください。");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/matches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamId,
          season,
          opponent,
          date,
          matchType,
          location: "",
          battingOrder: "[]",
        }),
      });

      // 💡 成功時と失敗時で、受け取る変数名と型を完全に分ける！
      if (response.ok) {
        // 成功時は matchId が返ってくる
        const successData = (await response.json()) as { matchId: string };
        router.push(`/matches/score?id=${successData.matchId}`);
      } else {
        // 失敗時は error メッセージが返ってくる
        const errorData = (await response.json()) as { error: string };
        alert(`作成に失敗しました: ${errorData.error}`);
      }

    } catch (error) {
      console.error("試合作成エラー:", error);
      alert("通信エラーが発生しました。");
    } finally {
      setIsLoading(false);
    }
  };

  // チームIDがURLに無い場合のエラーハンドリング
  if (!teamId) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <p className="text-muted-foreground font-bold">チーム情報が取得できませんでした。</p>
        <Button asChild variant="outline"><Link href="/dashboard">ダッシュボードに戻る</Link></Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8 animate-in fade-in duration-500">
      <PageHeader
        href="/dashboard" 
        icon={CalendarPlus} 
        title="新規試合の作成" 
        subtitle="試合情報の入力と設定" 
      />

      <Card className="border-border/50 shadow-sm">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* シーズン選択 */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" /> シーズン・大会名
              </label>
              <input
                type="text"
                required
                className="flex h-12 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                placeholder="例: 2026, 2026-春季大会"
                value={season}
                onChange={(e) => setSeason(e.target.value)}
              />
            </div>

            {/* 対戦相手 */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" /> 対戦相手
              </label>
              <input
                type="text"
                required
                className="flex h-12 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                placeholder="例: 横浜ボーイズ"
                value={opponent}
                onChange={(e) => setOpponent(e.target.value)}
              />
            </div>

            {/* 試合日 */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground">試合日</label>
              <input
                type="date"
                required
                className="flex h-12 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 cursor-pointer"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            {/* 試合種別 */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground flex items-center gap-2">
                <Trophy className="h-4 w-4 text-primary" /> 試合種別
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label className={`flex flex-col items-center justify-center rounded-xl border-2 p-4 cursor-pointer transition-all ${matchType === 'practice' ? 'border-primary bg-primary/5 text-primary' : 'border-border hover:bg-muted'}`}>
                  <input type="radio" name="matchType" value="practice" className="sr-only" checked={matchType === 'practice'} onChange={() => setMatchType('practice')} />
                  <span className="font-bold">練習試合</span>
                </label>
                <label className={`flex flex-col items-center justify-center rounded-xl border-2 p-4 cursor-pointer transition-all ${matchType === 'official' ? 'border-primary bg-primary/5 text-primary' : 'border-border hover:bg-muted'}`}>
                  <input type="radio" name="matchType" value="official" className="sr-only" checked={matchType === 'official'} onChange={() => setMatchType('official')} />
                  <span className="font-bold">公式戦</span>
                </label>
              </div>
            </div>

            <Button type="submit" className="w-full h-14 text-base font-bold rounded-xl shadow-md mt-4" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "試合を作成してスコアを入力する"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

// Next.js の useSearchParams を使うための Suspense ラッパー
export default function NewMatchPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
      <NewMatchForm />
    </Suspense>
  );
}
