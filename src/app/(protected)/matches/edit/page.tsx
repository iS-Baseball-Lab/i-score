// src/app/(protected)/matches/edit/page.tsx
"use client";

import React, { useState, useEffect, Suspense } from "react";
// 🌟 修正: useParams ではなく useSearchParams を使用
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, Save, MapPin, Calendar, Users, Trophy, Loader2, Clock, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

function MatchEditContent() {
  const router = useRouter();
  // 🌟 修正: URL（?id=xxx）から試合IDを安全に取得
  const searchParams = useSearchParams();
  const matchId = searchParams.get("id");

  const [opponent, setOpponent] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [matchType, setMatchType] = useState<'official' | 'practice'>("practice");
  const [battingOrder, setBattingOrder] = useState<'first' | 'second'>("first");
  const [venue, setVenue] = useState("");
  const [innings, setInnings] = useState(7);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // 💡 IDが渡ってきていない場合はダッシュボードに強制送還
    if (!matchId) {
      toast.error("試合IDが指定されていません");
      router.push("/dashboard");
      return;
    }

    const fetchMatch = async () => {
      try {
        const res = await fetch(`/api/matches/${matchId}`);
        const data = await res.json() as { success: boolean; match?: any };
        if (data.success && data.match) {
          const m = data.match;
          setOpponent(m.opponent || "");
          setMatchType(m.matchType || "practice");
          setBattingOrder(m.battingOrder || "first");
          setVenue(m.surfaceDetails || "");
          setInnings(m.innings || 7);

          if (m.date) {
            const [d, t] = m.date.split(" ");
            setDate(d || "");
            setTime(t || "");
          }
        }
      } catch (error) {
        toast.error("データの読み込みに失敗しました");
      } finally {
        setIsLoading(false);
      }
    };
    fetchMatch();
  }, [matchId, router]);

  const handleUpdate = async () => {
    if (!opponent) {
      toast.error("対戦相手を入力してください");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/matches/${matchId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          opponent,
          date: `${date} ${time}`,
          matchType,
          battingOrder,
          location: venue,
          innings
        }),
      });

      const data = await res.json() as { success: boolean; error?: string };
      if (!data.success) throw new Error(data.error);

      toast.success("試合情報を更新しました！");
      router.back();

    } catch (error: any) {
      toast.error(error.message || "更新に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;

  return (
    <div className="min-h-[100dvh] bg-transparent p-2 sm:p-4 space-y-3 flex flex-col animate-in fade-in duration-300 max-w-lg mx-auto">

      <div className="flex items-center justify-between pb-1 shrink-0">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-8 w-8 rounded-full">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-black tracking-tight">Edit Match Info</h1>
        </div>
        <Button onClick={handleUpdate} disabled={isSubmitting} size="sm" className="rounded-full px-4 h-8 font-bold text-xs">
          {isSubmitting ? <Loader2 className="h-3 w-3 animate-spin mr-1.5" /> : <Save className="h-3 w-3 mr-1.5" />}
          更新
        </Button>
      </div>

      <Card className="rounded-3xl border-border/40 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md shadow-sm overflow-hidden">
        <CardContent className="p-4 space-y-4">

          <div className="space-y-1">
            <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1">
              <Users className="h-3 w-3" /> Opponent Team
            </label>
            <Input
              value={opponent}
              onChange={(e) => setOpponent(e.target.value)}
              className="h-10 rounded-xl text-sm font-bold bg-background border-border/50"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" /> Date
              </label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-10 rounded-xl text-xs font-bold bg-background border-border/50 px-2" />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" /> Time
              </label>
              <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="h-10 rounded-xl text-xs font-bold bg-background border-border/50 px-2" />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3" /> Venue
              </label>
              <Input
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                className="h-10 rounded-xl text-xs font-bold bg-background border-border/50"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                <Trophy className="h-3 w-3" /> Match Type
              </label>
              <div className="flex gap-1">
                <Button variant={matchType === 'official' ? 'default' : 'outline'} onClick={() => setMatchType('official')} className={cn("flex-1 h-10 px-0 rounded-xl text-[10px] font-bold", matchType === 'official' && "bg-blue-600 hover:bg-blue-700")}>公式</Button>
                <Button variant={matchType === 'practice' ? 'default' : 'outline'} onClick={() => setMatchType('practice')} className={cn("flex-1 h-10 px-0 rounded-xl text-[10px] font-bold", matchType === 'practice' && "bg-emerald-600 hover:bg-emerald-700")}>練習</Button>
              </div>
            </div>
          </div>

          <div className="space-y-1 pt-2">
            <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground block text-center mb-1">Batting Order</label>
            <div className="flex items-center p-0.5 bg-muted/50 rounded-xl border border-border/50">
              <button onClick={() => setBattingOrder('first')} className={cn("flex-1 h-8 text-[10px] font-black rounded-lg transition-all", battingOrder === 'first' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}>先攻 (Top)</button>
              <button onClick={() => setBattingOrder('second')} className={cn("flex-1 h-8 text-[10px] font-black rounded-lg transition-all", battingOrder === 'second' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}>後攻 (Bottom)</button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="pt-4 px-4">
        <Button variant="ghost" className="w-full text-red-500 hover:bg-red-500/10 rounded-2xl h-12 font-bold text-xs gap-2">
          <Trash2 className="h-4 w-4" />
          この試合を削除する
        </Button>
      </div>

    </div>
  );
}

// 🌟 Suspenseラップ（useSearchParamsを使う際のNext.jsの必須ルール）
export default function MatchEditPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>}>
      <MatchEditContent />
    </Suspense>
  );
}