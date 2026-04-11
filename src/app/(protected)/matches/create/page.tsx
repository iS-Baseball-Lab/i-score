// src/app/(protected)/matches/create/page.tsx
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

  // --- 試合基本情報のステート ---
  const [opponent, setOpponent] = useState("");
  const [tournamentName, setTournamentName] = useState(""); // 🌟 大会名
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [time, setTime] = useState("10:00");
  const [matchType, setMatchType] = useState<'official' | 'practice'>("practice");
  const [battingOrder, setBattingOrder] = useState<'first' | 'second'>("first");
  const [venue, setVenue] = useState("");

  // --- スコア関連のステート ---
  const [inningCount, setInningCount] = useState(7);
  const [myInnings, setMyInnings] = useState<string[]>(Array(7).fill(""));
  const [opponentInnings, setOpponentInnings] = useState<string[]>(Array(7).fill(""));

  // --- チーム・サジェスト用のステート ---
  const [opponentList, setOpponentList] = useState<string[]>([]);
  const [venueList, setVenueList] = useState<string[]>([]);
  const [teamName, setTeamName] = useState("自チーム");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 🌟 初期データの取得（自チーム名と、過去の対戦相手・球場リスト）
  useEffect(() => {
    const activeTeamId = localStorage.getItem("iScore_selectedTeamId");
    if (activeTeamId) {
      fetch("/api/teams")
        .then(res => res.json())
        .then(data => {
          const teamsData = data as { id: string; name: string }[];
          const current = teamsData.find(t => t.id === activeTeamId);
          if (current) setTeamName(current.name);
        }).catch(() => { });

      fetch(`/api/teams/${activeTeamId}/recent-matches`)
        .then(res => res.json())
        .then(data => {
          const matches = data as { opponent: string | null; venue?: string | null; surfaceDetails?: string | null }[];
          const opponents = Array.from(new Set(matches.map(m => m.opponent).filter(Boolean))) as string[];
          const venues = Array.from(new Set(matches.map(m => m.venue || m.surfaceDetails).filter(Boolean))) as string[];
          setOpponentList(opponents);
          setVenueList(venues);
        }).catch(() => { });
    }
  }, []);

  // リアルタイム入力モード（開発中）
  if (mode === 'live') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Activity className="h-16 w-16 text-primary animate-pulse" />
        <h2 className="text-2xl font-black text-foreground">リアルタイム入力は開発中…</h2>
        <Button onClick={() => router.push('/dashboard')} variant="outline">ダッシュボードへ戻る</Button>
      </div>
    );
  }

  // 合計スコアの計算
  const myTotalScore = myInnings.reduce((sum, val) => sum + (parseInt(val) || 0), 0);
  const opponentTotalScore = opponentInnings.reduce((sum, val) => sum + (parseInt(val) || 0), 0);

  // イニングの追加・削除
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

  // 🌟 試合結果の保存処理
  const handleSave = async () => {
    if (!opponent) {
      toast.error("対戦相手を入力してください");
      return;
    }

    setIsSubmitting(true);
    const activeTeamId = localStorage.getItem("iScore_selectedTeamId");

    try {
      // 1. 試合の作成（tournamentNameも送信）
      const createRes = await fetch("/api/matches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamId: activeTeamId,
          opponent,
          tournamentName: matchType === 'official' ? tournamentName : "", // 🌟 公式戦のみ送信
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

      // 2. スコアの保存（イニングごとの詳細）
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
      router.push("/dashboard"); // 保存後はダッシュボードへ帰還

    } catch (error) {
      toast.error(error instanceof Error ? error.message : "エラーが発生しました");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent p-4 sm:p-6 space-y-6 flex flex-col animate-in fade-in duration-300 max-w-lg mx-auto pb-32">

      {/* 1. ヘッダー */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-10 w-10 rounded-full bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm border border-border/40 hover:bg-white/80 dark:hover:bg-zinc-800/80 shadow-sm transition-all">
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-black tracking-tight">Quick Score</h1>
      </div>

      {/* 2. 基本情報入力 */}
      <Card className="rounded-3xl border-border/40 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md shadow-sm">
        <CardContent className="p-5 space-y-5">

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" /> Opponent Team
            </label>
            <Input
              list="opponent-options"
              value={opponent}
              onChange={(e) => setOpponent(e.target.value)}
              placeholder="チーム名を入力または選択"
              className="h-11 rounded-2xl text-sm font-bold bg-background border-border/50"
            />
            <datalist id="opponent-options">
              {opponentList.map(opt => <option key={opt} value={opt} />)}
            </datalist>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" /> Date
              </label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-11 rounded-2xl text-sm font-bold bg-background border-border/50 px-3" />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" /> Time
              </label>
              <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="h-11 rounded-2xl text-sm font-bold bg-background border-border/50 px-3" />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" /> Venue
              </label>
              <Input
                list="venue-options"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                placeholder="球場名を選択"
                className="h-11 rounded-2xl text-sm font-bold bg-background border-border/50"
              />
              <datalist id="venue-options">
                {venueList.map(opt => <option key={opt} value={opt} />)}
              </datalist>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                <Trophy className="h-3.5 w-3.5" /> Match Type
              </label>
              <div className="flex gap-1.5">
                <Button variant={matchType === 'official' ? 'default' : 'outline'} onClick={() => setMatchType('official')} className={cn("flex-1 h-11 px-0 rounded-2xl text-[10px] sm:text-xs font-bold transition-colors", matchType === 'official' && "bg-amber-600 hover:bg-amber-700")}>公式</Button>
                <Button variant={matchType === 'practice' ? 'default' : 'outline'} onClick={() => setMatchType('practice')} className={cn("flex-1 h-11 px-0 rounded-2xl text-[10px] sm:text-xs font-bold transition-colors", matchType === 'practice' && "bg-emerald-600 hover:bg-emerald-700")}>練習</Button>
              </div>
            </div>
          </div>

          {/* 🌟 隠し味：公式戦の時だけ「大会名」がフワッと現れる */}
          {matchType === 'official' && (
            <div className="space-y-1.5 animate-in slide-in-from-top-2 duration-300">
              <label className="text-[10px] font-black uppercase tracking-widest text-amber-600 flex items-center gap-1.5">
                <Trophy className="h-3.5 w-3.5" /> Tournament Name
              </label>
              <Input
                value={tournamentName}
                onChange={(e) => setTournamentName(e.target.value)}
                placeholder="大会名を入力 (例: 夏季大会)"
                className="h-11 rounded-2xl text-sm font-bold bg-amber-500/5 border-amber-500/20 focus:border-amber-500"
              />
            </div>
          )}

          <div className="pt-2">
            <div className="flex items-center p-1 bg-muted/50 rounded-2xl border border-border/50">
              <button onClick={() => setBattingOrder('first')} className={cn("flex-1 h-9 text-[10px] sm:text-xs font-black rounded-xl transition-all", battingOrder === 'first' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}>先攻 (Top)</button>
              <button onClick={() => setBattingOrder('second')} className={cn("flex-1 h-9 text-[10px] sm:text-xs font-black rounded-xl transition-all", battingOrder === 'second' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}>後攻 (Bottom)</button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. スコアボード */}
      <Card className="rounded-3xl border-border/40 bg-background shadow-xl overflow-hidden">
        <div className="bg-zinc-900 text-zinc-100 p-3 flex items-center justify-between">
          <h2 className="text-xs font-black italic tracking-wider">SCOREBOARD</h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={removeInning} disabled={inningCount <= 1} className="h-7 w-7 rounded-full bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700 hover:text-white">
              <X className="h-3 w-3" />
            </Button>
            <span className="text-[10px] font-bold text-zinc-400 tabular-nums w-12 text-center">{inningCount} INN</span>
            <Button variant="outline" size="icon" onClick={addInning} className="h-7 w-7 rounded-full bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700 hover:text-white">
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        </div>

        <div className="p-3 overflow-x-auto">
          <div className="min-w-max">
            {/* ヘッダー行 */}
            <div className="flex items-center mb-1.5">
              <div className="w-16 sm:w-20 shrink-0" />
              <div className="flex gap-1.5">
                {Array.from({ length: inningCount }).map((_, i) => (
                  <div key={i} className="w-9 sm:w-10 text-center text-[10px] font-black text-muted-foreground uppercase">{i + 1}</div>
                ))}
              </div>
              <div className="w-10 shrink-0 text-center text-[10px] font-black text-primary">R</div>
            </div>

            {/* 先攻チーム行 */}
            <div className="flex items-center mb-2">
              <div className="w-16 sm:w-20 shrink-0 text-xs font-black truncate pr-2 text-foreground/80">
                {battingOrder === 'first' ? teamName : (opponent || 'Opp')}
              </div>
              <div className="flex gap-1.5">
                {Array.from({ length: inningCount }).map((_, i) => (
                  <Input key={i} type="text" inputMode="numeric" pattern="[0-9]*" value={battingOrder === 'first' ? myInnings[i] : opponentInnings[i]}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (battingOrder === 'first') { const n = [...myInnings]; n[i] = val; setMyInnings(n); }
                      else { const n = [...opponentInnings]; n[i] = val; setOpponentInnings(n); }
                    }}
                    className="w-9 sm:w-10 h-10 sm:h-11 text-center text-sm font-black bg-muted/30 border-border/50 rounded-xl px-0 focus:bg-background" placeholder="-"
                  />
                ))}
              </div>
              <div className="w-10 shrink-0 text-center text-xl font-black tabular-nums">{battingOrder === 'first' ? myTotalScore : opponentTotalScore}</div>
            </div>

            {/* 後攻チーム行 */}
            <div className="flex items-center">
              <div className="w-16 sm:w-20 shrink-0 text-xs font-black truncate pr-2 text-foreground/80">
                {battingOrder === 'second' ? teamName : (opponent || 'Opp')}
              </div>
              <div className="flex gap-1.5">
                {Array.from({ length: inningCount }).map((_, i) => (
                  <Input key={i} type="text" inputMode="numeric" pattern="[0-9]*" value={battingOrder === 'second' ? myInnings[i] : opponentInnings[i]}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (battingOrder === 'second') { const n = [...myInnings]; n[i] = val; setMyInnings(n); }
                      else { const n = [...opponentInnings]; n[i] = val; setOpponentInnings(n); }
                    }}
                    className="w-9 sm:w-10 h-10 sm:h-11 text-center text-sm font-black bg-muted/30 border-border/50 rounded-xl px-0 focus:bg-background" placeholder="-"
                  />
                ))}
              </div>
              <div className="w-10 shrink-0 text-center text-xl font-black tabular-nums">{battingOrder === 'second' ? myTotalScore : opponentTotalScore}</div>
            </div>
          </div>
        </div>
      </Card>

      {/* 4. アクションボタン（巨大ボタンで一撃保存！） */}
      <div className="pt-4">
        <Button
          onClick={handleSave}
          disabled={isSubmitting}
          className="w-full h-14 sm:h-16 rounded-2xl sm:rounded-3xl font-black text-base sm:text-lg shadow-lg hover:shadow-xl active:scale-[0.98] transition-all bg-primary text-primary-foreground"
        >
          {isSubmitting ? (
            <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin mr-2" />
          ) : (
            <Save className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
          )}
          試合結果を保存する
        </Button>
      </div>

    </div>
  );
}

// 🌟 Suspenseでラップしてエクスポート
export default function MatchCreatePage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>}>
      <MatchCreateContent />
    </Suspense>
  );
}