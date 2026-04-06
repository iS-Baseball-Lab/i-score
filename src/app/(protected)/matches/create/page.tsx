"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, Save, Plus, MapPin, Calendar, Users, Trophy, Activity, Loader2, X, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

function MatchCreateContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode");

  // --- 基本情報 ---
  const [opponent, setOpponent] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [time, setTime] = useState("10:00"); // 💡 時刻を追加
  const [matchType, setMatchType] = useState<'official' | 'practice'>("practice");
  const [battingOrder, setBattingOrder] = useState<'first' | 'second'>("first");
  const [venue, setVenue] = useState("");

  // --- スコアボード ---
  const [inningCount, setInningCount] = useState(7);
  const [myInnings, setMyInnings] = useState<string[]>(Array(7).fill(""));
  const [opponentInnings, setOpponentInnings] = useState<string[]>(Array(7).fill(""));

  // --- 選択肢用データ（マスタ） ---
  const [opponentList, setOpponentList] = useState<string[]>([]);
  const [venueList, setVenueList] = useState<string[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [teamName, setTeamName] = useState("自チーム");

  useEffect(() => {
    const activeTeamId = localStorage.getItem("iScore_selectedTeamId");
    if (activeTeamId) {
      // 1. 自チーム名の取得
      fetch("/api/teams")
        .then(res => res.json())
        .then(data => {
          const teamsData = data as any[];
          const current = teamsData.find((t: any) => t.id === activeTeamId);
          if (current) setTeamName(current.name);
        }).catch(() => { });

      // 2. 過去の試合から「対戦相手」と「球場」のリストを抽出（サジェスト用）
      fetch(`/api/teams/${activeTeamId}/recent-matches`)
        .then(res => res.json())
        .then(data => {
          const matches = data as any[];
          // 重複を排除してリスト化
          const opponents = Array.from(new Set(matches.map(m => m.opponent).filter(Boolean))) as string[];
          const venues = Array.from(new Set(matches.map(m => m.venue || m.surfaceDetails).filter(Boolean))) as string[];
          setOpponentList(opponents);
          setVenueList(venues);
        }).catch(() => { });
    }
  }, []);

  if (mode === 'live') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Activity className="h-16 w-16 text-primary animate-pulse" />
        <h2 className="text-2xl font-black text-foreground">リアルタイム入力は開発中…</h2>
        <Button onClick={() => router.push('/dashboard')} variant="outline">ダッシュボードへ戻る</Button>
      </div>
    );
  }

  const myTotalScore = myInnings.reduce((sum, val) => sum + (parseInt(val) || 0), 0);
  const opponentTotalScore = opponentInnings.reduce((sum, val) => sum + (parseInt(val) || 0), 0);

  const addInning = () => {
    setInningCount(prev => prev + 1);
    setMyInnings(prev => [...prev, ""]);
    setOpponentInnings(prev => [...prev, ""]);
  };

  const removeInning = () => {
    if (inningCount <= 1) return;
    setInningCount(prev => prev - 1);
    setMyInnings(prev => prev.slice(0, -1));
    setOpponentInnings(prev => prev.slice(0, -1));
  };

  const handleSave = async () => {
    if (!opponent) {
      toast.error("対戦相手を入力してください");
      return;
    }

    setIsSubmitting(true);
    const activeTeamId = localStorage.getItem("iScore_selectedTeamId");

    try {
      const createRes = await fetch("/api/matches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamId: activeTeamId,
          opponent,
          // 💡 日付と時刻を組み合わせて保存（DBの型に合わせて調整可能）
          date: `${date} ${time}`,
          matchType,
          battingOrder,
          location: venue,
          innings: inningCount
        }),
      });

      const createData = (await createRes.json()) as { success: boolean; matchId: string; error?: string };
      if (!createData.success) throw new Error(createData.error);
      const matchId = createData.matchId;

      const finishRes = await fetch(`/api/matches/${matchId}/finish`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          myScore: myTotalScore,
          opponentScore: opponentTotalScore,
          myInningScores: myInnings.map(val => parseInt(val) || 0),
          opponentInningScores: opponentInnings.map(val => parseInt(val) || 0),
        }),
      });

      if (!finishRes.ok) throw new Error("スコアの保存に失敗しました");

      toast.success("試合結果を保存しました！🔥");
      router.push("/dashboard");

    } catch (error: any) {
      toast.error(error.message || "エラーが発生しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-transparent p-2 sm:p-4 space-y-2 flex flex-col animate-in fade-in duration-300 max-w-lg mx-auto">

      {/* 1. ヘッダー */}
      <div className="flex items-center justify-between pb-1 shrink-0">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-8 w-8 rounded-full">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-black tracking-tight">Quick Score</h1>
        </div>
        <Button onClick={handleSave} disabled={isSubmitting} size="sm" className="rounded-full px-4 h-8 font-bold text-xs">
          {isSubmitting ? <Loader2 className="h-3 w-3 animate-spin mr-1.5" /> : <Save className="h-3 w-3 mr-1.5" />}
          保存
        </Button>
      </div>

      {/* 2. 基本情報入力 (高密度) */}
      <Card className="rounded-[24px] border-border/40 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md shadow-sm shrink-0">
        <CardContent className="p-3 space-y-3">

          {/* 対戦相手 (選択 ＋ 入力) */}
          <div className="space-y-1">
            <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1">
              <Users className="h-3 w-3" /> Opponent Team
            </label>
            <Input
              list="opponent-options"
              value={opponent}
              onChange={(e) => setOpponent(e.target.value)}
              placeholder="チーム名を入力または選択"
              className="h-9 rounded-xl text-sm font-bold bg-background border-border/50"
            />
            <datalist id="opponent-options">
              {opponentList.map(opt => <option key={opt} value={opt} />)}
            </datalist>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* 日付 */}
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" /> Date
              </label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-9 rounded-xl text-xs font-bold bg-background border-border/50 px-2" />
            </div>

            {/* 時刻 (追加！) */}
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" /> Time
              </label>
              <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="h-9 rounded-xl text-xs font-bold bg-background border-border/50 px-2" />
            </div>

            {/* 開催地 (選択 ＋ 入力) */}
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3" /> Venue
              </label>
              <Input
                list="venue-options"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                placeholder="球場名を入力または選択"
                className="h-9 rounded-xl text-xs font-bold bg-background border-border/50"
              />
              <datalist id="venue-options">
                {venueList.map(opt => <option key={opt} value={opt} />)}
              </datalist>
            </div>

            {/* 試合タイプ */}
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                <Trophy className="h-3 w-3" /> Match Type
              </label>
              <div className="flex gap-1">
                <Button variant={matchType === 'official' ? 'default' : 'outline'} onClick={() => setMatchType('official')} className={cn("flex-1 h-9 px-0 rounded-xl text-[10px] font-bold", matchType === 'official' && "bg-blue-600")}>公式</Button>
                <Button variant={matchType === 'practice' ? 'default' : 'outline'} onClick={() => setMatchType('practice')} className={cn("flex-1 h-9 px-0 rounded-xl text-[10px] font-bold", matchType === 'practice' && "bg-emerald-600")}>練習</Button>
              </div>
            </div>
          </div>

          {/* 先攻/後攻 */}
          <div className="flex items-center p-0.5 bg-muted/50 rounded-xl border border-border/50 mt-1">
            <button onClick={() => setBattingOrder('first')} className={cn("flex-1 h-7 text-[10px] font-black rounded-lg transition-all", battingOrder === 'first' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground")}>先攻 (Top)</button>
            <button onClick={() => setBattingOrder('second')} className={cn("flex-1 h-7 text-[10px] font-black rounded-lg transition-all", battingOrder === 'second' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground")}>後攻 (Bottom)</button>
          </div>
        </CardContent>
      </Card>

      {/* 3. 爆速スコアボード */}
      <Card className="rounded-[24px] border-border/40 bg-background shadow-xl overflow-hidden flex-1 flex flex-col">
        <div className="bg-zinc-900 text-zinc-100 p-2 px-4 flex items-center justify-between shrink-0">
          <h2 className="text-xs font-black italic tracking-wider">SCOREBOARD</h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={removeInning} disabled={inningCount <= 1} className="h-6 w-6 p-0 rounded-full bg-zinc-800 border-zinc-700 text-zinc-300">
              <X className="h-3 w-3" />
            </Button>
            <span className="text-[10px] font-bold text-zinc-400 tabular-nums w-10 text-center">{inningCount} INN</span>
            <Button variant="outline" size="sm" onClick={addInning} className="h-6 w-6 p-0 rounded-full bg-zinc-800 border-zinc-700 text-zinc-300">
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        </div>

        <div className="p-2 overflow-x-auto flex-1">
          <div className="min-w-max">
            {/* ヘッダー行 */}
            <div className="flex items-center mb-1">
              <div className="w-16 shrink-0" />
              <div className="flex gap-1">
                {Array.from({ length: inningCount }).map((_, i) => (
                  <div key={i} className="w-8 text-center text-[9px] font-black text-muted-foreground uppercase">{i + 1}</div>
                ))}
              </div>
              <div className="w-8 shrink-0 text-center text-[9px] font-black text-primary">R</div>
            </div>

            {/* 先攻チーム行 */}
            <div className="flex items-center mb-1">
              <div className="w-16 shrink-0 text-[10px] font-black truncate pr-2 text-foreground/80">
                {battingOrder === 'first' ? teamName : (opponent || 'Opp')}
              </div>
              <div className="flex gap-1">
                {Array.from({ length: inningCount }).map((_, i) => (
                  <Input key={i} type="text" inputMode="numeric" pattern="[0-9]*" value={battingOrder === 'first' ? myInnings[i] : opponentInnings[i]}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (battingOrder === 'first') { const n = [...myInnings]; n[i] = val; setMyInnings(n); }
                      else { const n = [...opponentInnings]; n[i] = val; setOpponentInnings(n); }
                    }}
                    className="w-8 h-9 text-center text-sm font-black bg-muted/30 border-border/50 rounded-lg px-0" placeholder="-"
                  />
                ))}
              </div>
              <div className="w-8 shrink-0 text-center text-lg font-black tabular-nums">{battingOrder === 'first' ? myTotalScore : opponentTotalScore}</div>
            </div>

            {/* 後攻チーム行 */}
            <div className="flex items-center">
              <div className="w-16 shrink-0 text-[10px] font-black truncate pr-2 text-foreground/80">
                {battingOrder === 'second' ? teamName : (opponent || 'Opp')}
              </div>
              <div className="flex gap-1">
                {Array.from({ length: inningCount }).map((_, i) => (
                  <Input key={i} type="text" inputMode="numeric" pattern="[0-9]*" value={battingOrder === 'second' ? myInnings[i] : opponentInnings[i]}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (battingOrder === 'second') { const n = [...myInnings]; n[i] = val; setMyInnings(n); }
                      else { const n = [...opponentInnings]; n[i] = val; setOpponentInnings(n); }
                    }}
                    className="w-8 h-9 text-center text-sm font-black bg-muted/30 border-border/50 rounded-lg px-0" placeholder="-"
                  />
                ))}
              </div>
              <div className="w-8 shrink-0 text-center text-lg font-black tabular-nums">{battingOrder === 'second' ? myTotalScore : opponentTotalScore}</div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default function MatchCreatePage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>}>
      <MatchCreateContent />
    </Suspense>
  );
}