// src/app/(protected)/matches/new/page.tsx
"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ChevronLeft, CalendarDays, MapPin, Swords, Trophy, Loader2, Flag, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

function NewMatchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [teamId, setTeamId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const currentYear = new Date().getFullYear().toString();

  const [date, setDate] = useState(today);
  const [season, setSeason] = useState(currentYear);
  const [opponent, setOpponent] = useState("");
  const [matchType, setMatchType] = useState("practice");
  const [location, setLocation] = useState("");

  useEffect(() => {
    const id = searchParams.get("teamId") || localStorage.getItem("iScore_selectedTeamId");
    if (id) {
      setTeamId(id);
    } else {
      router.push("/dashboard");
    }
  }, [searchParams, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamId || !opponent.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/matches', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamId,
          opponent,
          date,
          season,
          matchType,
          location,
          status: 'scheduled'
        }),
      });

      // 💡 型アサーションを追加してTypeScriptエラーを解消
      const data = await res.json() as { success: boolean; matchId?: string; error?: string };

      if (res.ok && data.success) {
        toast.success("試合を作成しました！スタメンを入力しましょう。");
        router.push(`/matches/lineup?id=${data.matchId}&teamId=${teamId}`);
      } else {
        toast.error(data.error || "試合の作成に失敗しました");
      }
    } catch (error) {
      toast.error("通信エラーが発生しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!teamId) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="flex flex-col min-h-screen text-foreground pb-32 relative overflow-x-hidden">
      <main className="flex-1 px-4 sm:px-6 max-w-3xl mx-auto w-full mt-6 sm:mt-10 relative z-10 animate-in fade-in duration-500">

        {/* 1. ヘッダー部分 */}
        <div className="mb-8 flex flex-col items-start gap-4">
          <Button variant="ghost" onClick={() => router.back()} className="rounded-full pl-2 pr-4 hover:bg-muted text-muted-foreground font-extrabold -ml-2 transition-transform active:scale-95">
            <ChevronLeft className="h-5 w-5 mr-1" /> ダッシュボードへ戻る
          </Button>
          <div className="flex flex-col gap-2 w-full">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-3">
              <div className="p-2.5 bg-primary/10 rounded-2xl text-primary shadow-sm border border-primary/20">
                <Swords className="h-6 w-6 sm:h-7 sm:w-7" />
              </div>
              新しい試合を記録
            </h1>
            <p className="text-sm font-bold text-muted-foreground ml-1">
              試合の基本情報を入力して、スコアブックの準備をします。
            </p>
          </div>
        </div>

        {/* 2. 入力フォーム */}
        <Card className="rounded-[32px] border-border/50 bg-card/80 backdrop-blur-xl shadow-sm relative overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/5 blur-[80px] rounded-full pointer-events-none" />

          <CardContent className="p-6 sm:p-10 relative z-10">
            <form onSubmit={handleSubmit} className="space-y-8">

              <div className="grid grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <label className="text-sm sm:text-base font-bold text-muted-foreground uppercase tracking-widest pl-1 flex items-center gap-1.5">
                    <CalendarDays className="h-4 w-4 text-primary/70" /> 試合日
                  </label>
                  <Input
                    type="date" required
                    className="h-14 rounded-[16px] border-border/50 bg-background text-base font-black focus-visible:ring-primary/50 shadow-inner"
                    value={date} onChange={(e) => setDate(e.target.value)} disabled={isSubmitting}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm sm:text-base font-bold text-muted-foreground uppercase tracking-widest pl-1 flex items-center gap-1.5">
                    <Trophy className="h-4 w-4 text-primary/70" /> シーズン(年度)
                  </label>
                  <Input
                    type="number" required
                    className="h-14 rounded-[16px] border-border/50 bg-background text-base font-black focus-visible:ring-primary/50 shadow-inner"
                    value={season} onChange={(e) => setSeason(e.target.value)} disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="h-px w-full bg-border/50" />

              <div className="space-y-2">
                <label className="text-sm sm:text-base font-bold text-muted-foreground uppercase tracking-widest pl-1 flex items-center gap-1.5">
                  <Swords className="h-4 w-4 text-primary/70" /> 対戦相手
                </label>
                <Input
                  type="text" placeholder="例: 世田谷西シニア" required
                  className="h-14 rounded-[16px] border-primary/30 bg-primary/5 text-base font-black focus-visible:ring-primary/50 shadow-inner transition-all"
                  value={opponent} onChange={(e) => setOpponent(e.target.value)} disabled={isSubmitting} autoFocus
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm sm:text-base font-bold text-muted-foreground uppercase tracking-widest pl-1 flex items-center gap-1.5">
                    <Flag className="h-4 w-4 text-primary/70" /> 試合種別
                  </label>
                  <select
                    className="flex h-14 w-full appearance-none rounded-[16px] border border-border/50 bg-background px-4 pr-10 text-base font-black shadow-inner focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 cursor-pointer bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke-width%3D%222.5%22%20stroke%3D%22%2371717a%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20d%3D%22M19%209l-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] bg-[length:18px_18px] bg-[position:right_16px_center] bg-no-repeat"
                    value={matchType} onChange={(e) => setMatchType(e.target.value)} disabled={isSubmitting}
                  >
                    <option value="practice">練習試合</option>
                    <option value="official">公式戦</option>
                    <option value="tournament">大会・トーナメント</option>
                    <option value="other">紅白戦・その他</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm sm:text-base font-bold text-muted-foreground uppercase tracking-widest pl-1 flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-primary/70" /> 球場・場所
                  </label>
                  <Input
                    type="text" placeholder="例: 多摩川河川敷グラウンド"
                    className="h-14 rounded-[16px] border-border/50 bg-background text-base font-black focus-visible:ring-primary/50 shadow-inner"
                    value={location} onChange={(e) => setLocation(e.target.value)} disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="pt-6">
                <Button
                  type="submit" disabled={isSubmitting || !opponent.trim()}
                  className="w-full h-16 rounded-[24px] text-lg font-black bg-primary text-primary-foreground hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all active:scale-[0.98]"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                  ) : (
                    <>スタメンの入力へ進む <ArrowRight className="ml-2 h-5 w-5" /></>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export default function NewMatchPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
      <NewMatchContent />
    </Suspense>
  );
}