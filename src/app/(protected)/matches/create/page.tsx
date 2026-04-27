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
  PlayCircle 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function CreateMatchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode") || "real"; // デフォルトをrealに

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    opponent: "",
    date: new Date().toISOString().split("T")[0],
    matchType: "practice" as "official" | "practice",
    tournamentName: "",
    surfaceDetails: "",
    battingOrder: "first" as "first" | "second", // 先攻・後攻
    innings: 7,
  });

  // モードに応じたタイトル
  const title = mode === "real" ? "本格記録" : "結果入力";
  const subtitle = mode === "real" ? "Real-time Recording" : "Quick Result Entry";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.opponent) {
      toast.error("対戦相手を入力してください");
      return;
    }

    setIsLoading(true);
    // 💡 将来的にはここでAPIを叩いてMatch IDを発行し、
    // Realモードならスタメン設定（/matches/lineup?id=xxx）へ遷移させます
    setTimeout(() => {
      setIsLoading(false);
      if (mode === "real") {
        toast.success("試合をセットアップしました。スタメンを登録しましょう！");
        // 次のステップへ
        // router.push(`/matches/lineup?id=new_match_id`);
      } else {
        // Quickモードは直接スコア入力へ
        toast.success("試合を作成しました");
      }
    }, 800);
  };

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500 min-h-screen pb-24">
      <div className="max-w-2xl mx-auto px-4 pt-8 space-y-10">
        
        {/* ヘッダー */}
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => router.back()}
            className="rounded-full"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <SectionHeader title={title} subtitle={subtitle} showPulse />
          <div className="w-10" /> {/* バランス調整用 */}
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* 基本情報カード */}
          <div className="bg-card/50 border-2 border-border/40 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="space-y-4">
              <label className="flex items-center gap-2 text-xs font-black text-muted-foreground uppercase tracking-widest ml-1">
                <Swords className="h-4 w-4 text-primary" /> Opponent / 対戦相手
              </label>
              <Input 
                placeholder="相手チーム名を入力" 
                value={formData.opponent}
                onChange={(e) => setFormData({...formData, opponent: e.target.value})}
                className="h-14 rounded-2xl bg-background/50 border-2 border-border/40 text-lg font-bold focus:border-primary/50 transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">
                  <Calendar className="h-3.5 w-3.5 text-primary" /> Date
                </label>
                <Input 
                  type="date" 
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="h-12 rounded-xl bg-background/50 border-border/40 font-bold"
                />
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">
                  <ArrowRightLeft className="h-3.5 w-3.5 text-primary" /> Order
                </label>
                <div className="grid grid-cols-2 h-12 bg-background/50 rounded-xl border border-border/40 p-1">
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, battingOrder: "first"})}
                    className={cn(
                      "rounded-lg text-[10px] font-black transition-all",
                      formData.battingOrder === "first" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-muted"
                    )}
                  >先攻</button>
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, battingOrder: "second"})}
                    className={cn(
                      "rounded-lg text-[10px] font-black transition-all",
                      formData.battingOrder === "second" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-muted"
                    )}
                  >後攻</button>
                </div>
              </div>
            </div>
          </div>

          {/* 詳細設定カード */}
          <div className="bg-card/50 border-2 border-border/40 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
             <div className="space-y-4">
                <label className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">
                  <Trophy className="h-4 w-4 text-amber-500" /> Match Type
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, matchType: "official"})}
                    className={cn(
                      "h-14 rounded-2xl border-2 font-black transition-all flex items-center justify-center gap-2",
                      formData.matchType === "official" ? "border-amber-500 bg-amber-500/10 text-amber-600 shadow-sm shadow-amber-500/10" : "border-border/40 text-muted-foreground bg-background/30"
                    )}
                  >公式戦</button>
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, matchType: "practice"})}
                    className={cn(
                      "h-14 rounded-2xl border-2 font-black transition-all flex items-center justify-center gap-2",
                      formData.matchType === "practice" ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 shadow-sm shadow-emerald-500/10" : "border-border/40 text-muted-foreground bg-background/30"
                    )}
                  >練習試合</button>
                </div>
             </div>

             {formData.matchType === "official" && (
                <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                  <Input 
                    placeholder="大会名を入力" 
                    value={formData.tournamentName}
                    onChange={(e) => setFormData({...formData, tournamentName: e.target.value})}
                    className="h-12 rounded-xl bg-background/50 border-border/40 font-bold"
                  />
                </div>
             )}

             <div className="space-y-2">
                <label className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">
                  <MapPin className="h-3.5 w-3.5 text-primary" /> Location
                </label>
                <Input 
                  placeholder="球場名・グラウンド詳細" 
                  value={formData.surfaceDetails}
                  onChange={(e) => setFormData({...formData, surfaceDetails: e.target.value})}
                  className="h-12 rounded-xl bg-background/50 border-border/40 font-bold"
                />
             </div>
          </div>

          {/* 送信ボタン */}
          <Button 
            type="submit" 
            disabled={isLoading}
            className="w-full h-16 rounded-full text-lg font-black uppercase tracking-[0.2em] shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            {isLoading ? "設定中..." : (
              <>
                {mode === "real" ? "スタメン設定へ" : "スコア入力へ"}
                <PlayCircle className="ml-2 h-6 w-6" />
              </>
            )}
          </Button>

        </form>
      </div>
    </div>
  );
}
