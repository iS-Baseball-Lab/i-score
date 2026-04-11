// src/app/(protected)/matches/edit/page.tsx
"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, Save, MapPin, Calendar, Users, Trophy, Loader2, Clock, Trash2, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

function MatchEditContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const matchId = searchParams.get("id");

  const [opponent, setOpponent] = useState("");
  const [tournamentName, setTournamentName] = useState(""); // 🌟 追加
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [matchType, setMatchType] = useState<'official' | 'practice'>("practice");
  const [battingOrder, setBattingOrder] = useState<'first' | 'second'>("first");
  const [venue, setVenue] = useState("");

  const [inningCount, setInningCount] = useState(7);
  const [myInnings, setMyInnings] = useState<string[]>([]);
  const [opponentInnings, setOpponentInnings] = useState<string[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [teamName, setTeamName] = useState("自チーム");

  useEffect(() => {
    if (!matchId) { router.push("/dashboard"); return; }

    const fetchAllData = async () => {
      try {
        // 1. 試合基本情報の取得
        const res = await fetch(`/api/matches/${matchId}`);
        const data = (await res.json()) as { success: boolean; match?: {
          id: string; opponent: string; tournamentName?: string; matchType: 'official' | 'practice';
          battingOrder: 'first' | 'second'; surfaceDetails?: string; innings?: number; date?: string;
          myScore?: number; opponentScore?: number;
        } };

        if (data.success && data.match) {
          const m = data.match;
          setOpponent(m.opponent || "");
          setTournamentName(m.tournamentName || "");
          setMatchType(m.matchType || "practice");
          setBattingOrder(m.battingOrder || "first");
          setVenue(m.surfaceDetails || "");
          setInningCount(m.innings || 7);

          if (m.date) {
            const [d, t] = m.date.split(" ");
            setDate(d || "");
            setTime(t || "");
          }

          // 2. スコア詳細（イニングスコア）の取得
          const inningsRes = await fetch(`/api/matches/${matchId}/innings`);
          if (inningsRes.ok) {
            const inningsData = (await inningsRes.json()) as { teamType: string; inningNumber: number; runs: number }[];
            const myScores = Array(m.innings || 7).fill("");
            const oppScores = Array(m.innings || 7).fill("");

            inningsData.forEach(inv => {
              if (inv.teamType === 'home' && m.battingOrder === 'second') myScores[inv.inningNumber - 1] = inv.runs.toString();
              else if (inv.teamType === 'away' && m.battingOrder === 'first') myScores[inv.inningNumber - 1] = inv.runs.toString();
              else if (inv.teamType === 'home' && m.battingOrder === 'first') oppScores[inv.inningNumber - 1] = inv.runs.toString();
              else oppScores[inv.inningNumber - 1] = inv.runs.toString();
            });
            setMyInnings(myScores);
            setOpponentInnings(oppScores);
          }
        }
      } catch (error) {
        toast.error("データの読み込みに失敗しました");
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllData();
  }, [matchId, router]);

  const myTotalScore = myInnings.reduce((sum, val) => sum + (parseInt(val) || 0), 0);
  const opponentTotalScore = opponentInnings.reduce((sum, val) => sum + (parseInt(val) || 0), 0);

  const handleUpdate = async () => {
    if (!opponent) { toast.error("対戦相手を入力してください"); return; }
    setIsSubmitting(true);

    try {
      // 1. 基本情報の更新
      const res = await fetch(`/api/matches/${matchId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          opponent,
          tournamentName: matchType === 'official' ? tournamentName : "",
          date: `${date} ${time}`,
          matchType,
          battingOrder,
          location: venue,
          innings: inningCount
        }),
      });

      const data = (await res.json()) as { success: boolean; error?: string };
      if (!data.success) throw new Error(data.error);

      // 2. スコアの再保存（finish APIを再利用）
      await fetch(`/api/matches/${matchId}/finish`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          myScore: myTotalScore,
          opponentScore: opponentTotalScore,
          myInningScores: myInnings.map(val => parseInt(val) || 0),
          opponentInningScores: opponentInnings.map(val => parseInt(val) || 0),
        }),
      });

      toast.success("試合情報を更新しました！");
      router.back();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "更新に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;

  return (
    <div className="min-h-screen bg-transparent p-4 sm:p-6 space-y-6 flex flex-col animate-in fade-in duration-300 max-w-lg mx-auto pb-32">

      {/* 1. ヘッダー */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-10 w-10 rounded-full bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm border border-border/40 hover:bg-white/80 dark:hover:bg-zinc-800/80 shadow-sm transition-all">
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-black tracking-tight">Edit Match</h1>
      </div>

      {/* 2. 基本情報入力 */}
      <Card className="rounded-3xl border-border/40 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md shadow-sm">
        <CardContent className="p-5 space-y-5">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /> Opponent</label>
            <Input value={opponent} onChange={(e) => setOpponent(e.target.value)} className="h-11 rounded-2xl text-sm font-bold bg-background border-border/50" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> Date</label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-11 rounded-2xl text-sm font-bold bg-background border-border/50" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> Time</label>
              <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="h-11 rounded-2xl text-sm font-bold bg-background border-border/50" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> Venue</label>
              <Input value={venue} onChange={(e) => setVenue(e.target.value)} className="h-11 rounded-2xl text-sm font-bold bg-background border-border/50" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5"><Trophy className="h-3.5 w-3.5" /> Type</label>
              <div className="flex gap-1.5">
                <Button variant={matchType === 'official' ? 'default' : 'outline'} onClick={() => setMatchType('official')} className={cn("flex-1 h-11 px-0 rounded-2xl text-[10px] font-bold", matchType === 'official' && "bg-amber-600")}>公式</Button>
                <Button variant={matchType === 'practice' ? 'default' : 'outline'} onClick={() => setMatchType('practice')} className={cn("flex-1 h-11 px-0 rounded-2xl text-[10px] font-bold", matchType === 'practice' && "bg-emerald-600")}>練習</Button>
              </div>
            </div>
          </div>

          {matchType === 'official' && (
            <div className="space-y-1.5 animate-in slide-in-from-top-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-amber-600 flex items-center gap-1.5"><Trophy className="h-3.5 w-3.5" /> Tournament</label>
              <Input value={tournamentName} onChange={(e) => setTournamentName(e.target.value)} className="h-11 rounded-2xl text-sm font-bold bg-amber-500/5 border-amber-500/20" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* 3. スコアボード (Quick Score と共通) */}
      <Card className="rounded-3xl border-border/40 bg-background shadow-xl overflow-hidden">
        {/* ... (先ほどの Quick Score のスコアボード部分と同じ、省略しますが実装します) ... */}
        {/* ここに先攻・後攻の入力行が入ります */}
      </Card>

      {/* 4. アクションボタン */}
      <div className="pt-4 space-y-3">
        <Button onClick={handleUpdate} disabled={isSubmitting} className="w-full h-14 sm:h-16 rounded-3xl font-black text-lg shadow-lg bg-primary">
          {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2" />}
          試合情報を更新する
        </Button>
        <Button variant="ghost" className="w-full text-red-500 hover:bg-red-500/10 rounded-2xl h-12 font-bold text-xs gap-2">
          <Trash2 className="h-4 w-4" /> この試合を削除する
        </Button>
      </div>

    </div>
  );
}

export default function MatchEditPage() {
  return (
    <Suspense fallback={<Loader2 className="animate-spin" />}>
      <MatchEditContent />
    </Suspense>
  );
}