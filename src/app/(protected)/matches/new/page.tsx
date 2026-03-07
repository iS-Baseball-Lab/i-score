// src/app/(protected)/matches/new/page.tsx
"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2, CalendarPlus, Trophy, Users, Calendar, Hash, CalendarDays, ChevronRight } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

function NewMatchForm() {
  const searchParams = useSearchParams();
  const teamId = searchParams.get("teamId") || (typeof window !== 'undefined' ? localStorage.getItem("iScore_selectedTeamId") : null);
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [season, setSeason] = useState(new Date().getFullYear().toString());
  const [opponent, setOpponent] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [matchType, setMatchType] = useState("practice");
  const [innings, setInnings] = useState<number>(7);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!teamId) {
        toast.error("チームが選択されていません");
        return;
    }
    if (!opponent.trim() || !season.trim() || !date) {
        toast.error("必須項目が入力されていません");
        return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamId,
          season,
          opponent,
          date,
          matchType,
          battingOrder: "9",
          innings,
        }),
      });

      if (res.ok) {
        const data = await res.json() as { matchId: string };
        toast.success("試合を作成しました！");
        router.push(`/matches/lineup?id=${data.matchId}&teamId=${teamId}`);
      } else {
        toast.error("試合の作成に失敗しました");
        setIsLoading(false);
      }
    } catch (error) {
      console.error(error);
      toast.error("通信エラーが発生しました");
      setIsLoading(false);
    }
  };

  if (!teamId) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4 px-4 text-center">
        <p className="text-muted-foreground font-bold">チーム情報が取得できませんでした。</p>
        <Button asChild variant="outline" className="rounded-xl"><Link href="/dashboard">ダッシュボードに戻る</Link></Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground pb-32 relative">
      <PageHeader
        href="/dashboard"
        icon={CalendarPlus}
        title="試合の新規作成"
        subtitle="試合情報の入力と設定をしてください。"
      />

      {/* 💡 修正: 外枠（カード）を削除し、フォーム要素が直接画面に並ぶようにしました */}
      <main className="flex-1 px-4 sm:px-6 pt-6 sm:pt-8 max-w-2xl mx-auto w-full animate-in slide-in-from-bottom-4 fade-in duration-500">
        <form onSubmit={handleSubmit} className="space-y-8">

          {/* シーズン選択 */}
          <div className="space-y-3">
            {/* 💡 修正: 項目名（ラベル）のフォントサイズとアイコンを大きくし、色を濃くしました */}
            <label className="text-sm sm:text-base font-extrabold text-foreground flex items-center gap-2 tracking-wide pl-1">
              <Calendar className="h-5 w-5 text-primary" /> シーズン・大会名
            </label>
            <input 
              type="text" 
              required 
              className="flex h-14 w-full rounded-2xl border border-border/60 bg-muted/20 px-4 text-base font-bold shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent transition-all placeholder:text-muted-foreground/50" 
              placeholder="例: 2026, 2026-春季大会" 
              value={season} 
              onChange={(e) => setSeason(e.target.value)} 
            />
          </div>

          {/* 対戦相手 */}
          <div className="space-y-3">
            <label className="text-sm sm:text-base font-extrabold text-foreground flex items-center gap-2 tracking-wide pl-1">
              <Users className="h-5 w-5 text-primary" /> 対戦相手
            </label>
            <input 
              type="text" 
              required 
              className="flex h-14 w-full rounded-2xl border border-border/60 bg-muted/20 px-4 text-base font-bold shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent transition-all placeholder:text-muted-foreground/50" 
              placeholder="例: 横浜ボーイズ" 
              value={opponent} 
              onChange={(e) => setOpponent(e.target.value)} 
            />
          </div>

          {/* 試合日 */}
          <div className="space-y-3">
            <label className="text-sm sm:text-base font-extrabold text-foreground flex items-center gap-2 tracking-wide pl-1">
              <CalendarDays className="h-5 w-5 text-primary" /> 試合日
            </label>
            <input 
              type="date" 
              required 
              className="flex h-14 w-full rounded-2xl border border-border/60 bg-muted/20 px-4 text-base font-bold shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent transition-all cursor-pointer" 
              value={date} 
              onChange={(e) => setDate(e.target.value)} 
            />
          </div>

          {/* 試合種別（セグメントコントロール） */}
          <div className="space-y-3 pt-2">
            <label className="text-sm sm:text-base font-extrabold text-foreground flex items-center gap-2 tracking-wide pl-1">
              <Trophy className="h-5 w-5 text-primary" /> 試合種別
            </label>
            <div className="grid grid-cols-2 gap-2 bg-muted/30 p-1.5 rounded-[20px] border border-border/50">
              <button
                type="button"
                onClick={() => setMatchType('practice')}
                className={cn(
                  "flex items-center justify-center h-12 rounded-[14px] font-extrabold transition-all duration-200 active:scale-[0.96]",
                  matchType === 'practice' 
                    ? "bg-background shadow-sm text-primary border border-border/50" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                練習試合
              </button>
              <button
                type="button"
                onClick={() => setMatchType('official')}
                className={cn(
                  "flex items-center justify-center h-12 rounded-[14px] font-extrabold transition-all duration-200 active:scale-[0.96]",
                  matchType === 'official' 
                    ? "bg-background shadow-sm text-primary border border-border/50" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                公式戦
              </button>
            </div>
          </div>

          {/* 規定イニング数（セグメントコントロール） */}
          <div className="space-y-3 pt-2">
            <label className="text-sm sm:text-base font-extrabold text-foreground flex items-center gap-2 tracking-wide pl-1">
              <Hash className="h-5 w-5 text-primary" /> 規定イニング数
            </label>
            <div className="grid grid-cols-3 gap-2 bg-muted/30 p-1.5 rounded-[20px] border border-border/50">
              {[6, 7, 9].map(num => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setInnings(num)}
                  className={cn(
                    "flex items-center justify-center h-12 rounded-[14px] font-extrabold transition-all duration-200 active:scale-[0.96]",
                    innings === num
                      ? "bg-background shadow-sm text-primary border border-border/50" 
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <span className="text-lg leading-none">{num}</span><span className="text-xs ml-0.5 mt-0.5">回</span>
                </button>
              ))}
            </div>
          </div>

        </form>
      </main>

      {/* 追従する決定ボタン */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-xl border-t border-border/50 z-50 flex justify-center pb-8 sm:pb-6 animate-in slide-in-from-bottom-full duration-500">
        <div className="w-full max-w-2xl px-2">
            <Button 
                onClick={() => handleSubmit()} 
                disabled={isLoading} 
                className="w-full h-14 text-base font-extrabold rounded-2xl shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90 text-primary-foreground transition-all hover:-translate-y-1 active:scale-[0.98]"
            >
                {isLoading ? <><Loader2 className="mr-2 h-6 w-6 animate-spin" /> 作成中...</> : <span className="flex items-center">スタメンの入力へ進む <ChevronRight className="ml-1 h-5 w-5" /></span>}
            </Button>
        </div>
      </div>
    </div>
  );
}

export default function NewMatchPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center bg-background"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
      <NewMatchForm />
    </Suspense>
  );
}
