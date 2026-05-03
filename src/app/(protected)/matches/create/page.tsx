// filepath: `src/app/(protected)/matches/create/page.tsx`
"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ChevronLeft,
  Swords,
  Calendar,
  Trophy,
  MapPin,
  ArrowRightLeft,
  PlayCircle,
  PlusCircle,
  Hash // スコア用
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function CreateMatchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode") || "real";

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    opponent: "",
    date: new Date().toISOString().split("T")[0],
    matchType: "practice" as "official" | "practice",
    tournamentName: "",
    surfaceDetails: "",
    battingOrder: "first" as "first" | "second",
    innings: 7,
    // 💡 Quickモード用の追加フィールド
    myScore: "",
    opponentScore: "",
    myInningScores: [] as string[],
    opponentInningScores: [] as string[],
  });

  // イニングスコア入力欄の初期化
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      myInningScores: Array(prev.innings).fill(""),
      opponentInningScores: Array(prev.innings).fill(""),
    }));
  }, [formData.innings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.opponent) {
      toast.error("対戦相手を入力してください");
      return;
    }

    setIsLoading(true);

    // 💡 本来はここでDBに試合を保存し、発行された ID を取得します
    // 一旦、デモ用に ID を生成してスタメン画面へバトンを渡します
    const mockMatchId = "new-match-123";

    setTimeout(() => {
      setIsLoading(false);

      if (mode === "real") {
        toast.success("試合をセットアップしました。スタメンを登録しましょう！");
        // 💡 修正ポイント：スタメン登録画面へ、matchIdとteamIdを持って遷移
        router.push(`/matches/lineup?id=${mockMatchId}`);
      } else {
        // Quickモードは結果を保存してダッシュボードへ
        toast.success("試合結果を保存しました");
        router.push("/dashboard");
      }
    }, 800);
  };

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500 min-h-screen pb-24">
      <div className="max-w-2xl mx-auto px-4 pt-8 space-y-10">

        {/* ヘッダー */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <SectionHeader title={mode === "real" ? "本格記録" : "結果入力"} subtitle={mode === "real" ? "Lineup & Play-by-play" : "Quick Entry"} showPulse />
          <div className="w-10" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">

          {/* 1. 基本情報（共通） */}
          <div className="bg-card border-2 border-border/40 rounded-3xl p-6 space-y-6 shadow-xs">
            <div className="space-y-4">
              <label className="text-xs font-black text-muted-foreground uppercase tracking-widest ml-1">Opponent</label>
              <Input
                placeholder="相手チーム名"
                value={formData.opponent}
                onChange={(e) => setFormData({ ...formData, opponent: e.target.value })}
                className="h-14 rounded-2xl bg-background/50 border-2 border-border/40 text-lg font-bold"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Date</label>
                <Input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className="h-12 bg-background/50 border-border/40 font-bold" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Order</label>
                <div className="grid grid-cols-2 h-12 bg-background/50 rounded-xl border border-border/40 p-1">
                  <button type="button" onClick={() => setFormData({ ...formData, battingOrder: "first" })} className={cn("rounded-lg text-[10px] font-black", formData.battingOrder === "first" ? "bg-primary text-primary-foreground" : "text-muted-foreground")}>先攻</button>
                  <button type="button" onClick={() => setFormData({ ...formData, battingOrder: "second" })} className={cn("rounded-lg text-[10px] font-black", formData.battingOrder === "second" ? "bg-primary text-primary-foreground" : "text-muted-foreground")}>後攻</button>
                </div>
              </div>
            </div>
          </div>

          {/* 💡 2. Quickモード専用：スコア入力セクション */}
          {mode === "quick" && (
            <div className="animate-in slide-in-from-top-4 duration-500 space-y-6">
              <SectionHeader title="スコア入力" subtitle="Match Result" />
              <div className="bg-card border-2 border-border/40 rounded-3xl p-6 space-y-8 shadow-xs">

                {/* 合計スコア */}
                <div className="flex items-center justify-around gap-4 py-4">
                  <div className="text-center space-y-2">
                    <p className="text-[10px] font-black text-muted-foreground uppercase">自チーム</p>
                    <Input
                      type="number"
                      placeholder="0"
                      className="w-20 h-20 text-center text-3xl font-black rounded-2xl bg-primary/5 border-primary/20 text-primary"
                      value={formData.myScore}
                      onChange={(e) => setFormData({ ...formData, myScore: e.target.value })}
                    />
                  </div>
                  <span className="text-2xl font-black text-muted-foreground/30 mt-6">-</span>
                  <div className="text-center space-y-2">
                    <p className="text-[10px] font-black text-muted-foreground uppercase">相手</p>
                    <Input
                      type="number"
                      placeholder="0"
                      className="w-20 h-20 text-center text-3xl font-black rounded-2xl bg-background border-border/40"
                      value={formData.opponentScore}
                      onChange={(e) => setFormData({ ...formData, opponentScore: e.target.value })}
                    />
                  </div>
                </div>

                {/* 各回スコア（スクローラブル） */}
                <div className="space-y-4">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Inning Scores (Optional)</p>
                  <div className="overflow-x-auto pb-2 -mx-2 px-2">
                    <div className="flex gap-3">
                      {Array.from({ length: formData.innings }).map((_, i) => (
                        <div key={i} className="flex flex-col gap-2 shrink-0">
                          <span className="text-[10px] font-black text-center text-muted-foreground/50">{i + 1}</span>
                          <Input
                            type="text"
                            placeholder="-"
                            className="w-10 h-10 p-0 text-center font-bold bg-primary/5 border-primary/10 rounded-lg"
                            value={formData.myInningScores[i]}
                            onChange={(e) => {
                              const newScores = [...formData.myInningScores];
                              newScores[i] = e.target.value;
                              setFormData({ ...formData, myInningScores: newScores });
                            }}
                          />
                          <Input
                            type="text"
                            placeholder="-"
                            className="w-10 h-10 p-0 text-center font-bold bg-background border-border/40 rounded-lg"
                            value={formData.opponentInningScores[i]}
                            onChange={(e) => {
                              const newScores = [...formData.opponentInningScores];
                              newScores[i] = e.target.value;
                              setFormData({ ...formData, opponentInningScores: newScores });
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 3. 詳細設定（共通：Realなら必須、Quickなら隠し気味でも良いが今回は表示） */}
          <div className="bg-card border-2 border-dashed border-border/40 rounded-3xl p-6 space-y-6 shadow-xs">
            <div className="space-y-4">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Match Type / Location</label>
              <div className="grid grid-cols-2 gap-4">
                <button type="button" onClick={() => setFormData({ ...formData, matchType: "official" })} className={cn("h-14 rounded-2xl border-2 font-black", formData.matchType === "official" ? "border-amber-500 bg-amber-500/10 text-amber-600" : "border-border/40 text-muted-foreground")}>公式戦</button>
                <button type="button" onClick={() => setFormData({ ...formData, matchType: "practice" })} className={cn("h-14 rounded-2xl border-2 font-black", formData.matchType === "practice" ? "border-emerald-500 bg-emerald-500/10 text-emerald-600" : "border-border/40 text-muted-foreground")}>練習試合</button>
              </div>
              <Input placeholder="球場名・詳細" value={formData.surfaceDetails} onChange={(e) => setFormData({ ...formData, surfaceDetails: e.target.value })} className="h-12 bg-background/50 border-border/40 font-bold" />
            </div>
          </div>

          <Button type="submit" disabled={isLoading} className="w-full h-16 rounded-full text-lg font-black uppercase tracking-[0.2em] shadow-sm shadow-primary/20">
            {isLoading ? "保存中..." : (mode === "real" ? "スタメン設定へ" : "試合結果を保存")}
            <PlayCircle className="ml-2 h-6 w-6" />
          </Button>

        </form>
      </div>
    </div>
  );
}
