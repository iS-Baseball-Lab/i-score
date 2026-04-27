// filepath: `src/app/(protected)/dashboard/page.tsx`
"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { 
  ChevronRight, 
  Activity, 
  Clock, 
  CloudSun, 
  Navigation, 
  Wind, 
  MapPin,
  CalendarDays // 💡 追加
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MatchList } from "@/components/matches/match-list";
import { ScoreTypeSelector } from "@/components/features/dashboard/ScoreTypeSelector"; 
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { Match } from "@/types/match";
import { getWindDirectionLabel, getWMOWeatherText, reverseGeocode, type OpenMeteoResponse } from "@/lib/weather";

export default function DashboardPage() {
  const router = useRouter();
  const [matches, setMatches] = useState<Match[]>([]);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [locationName, setLocationName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [mounted, setMounted] = useState(false);

  // ... (useEffectロジック類は前回同様のため省略。Match表示バグ修正版を継承)

  // 💡 共通見出しコンポーネント（DRY原則に基づき統一感を保証）
  const SectionHeader = ({ title, subtitle, showPulse = false }: { title: string, subtitle: string, showPulse?: boolean }) => (
    <div className="flex flex-col items-center gap-3">
      <h2 className="text-xl sm:text-2xl font-black text-foreground flex items-center gap-5 uppercase tracking-[0.15em]">
        <div className="flex gap-2">
          <span className="w-1.5 h-1.5 bg-primary/20 rounded-full" />
          <span className="w-1.5 h-1.5 bg-primary/50 rounded-full" />
          <span className={cn("w-1.5 h-1.5 bg-primary rounded-full", showPulse && "animate-pulse")} />
        </div>
        {title}
        <div className="flex gap-2">
          <span className={cn("w-1.5 h-1.5 bg-primary rounded-full", showPulse && "animate-pulse")} />
          <span className="w-1.5 h-1.5 bg-primary/50 rounded-full" />
          <span className="w-1.5 h-1.5 bg-primary/20 rounded-full" />
        </div>
      </h2>
      <p className="text-[10px] font-bold text-muted-foreground tracking-[0.4em] uppercase">{subtitle}</p>
    </div>
  );

  return (
    <div className="w-full animate-in fade-in duration-500 bg-transparent min-h-screen pb-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 space-y-16">

        {/* --- 1. Dashboard タイトル & 環境ウィジェット (既存) --- */}
        <section className="text-center space-y-2.5">
          <h2 className="text-2xl sm:text-3xl font-black text-primary uppercase tracking-[0.5em] flex items-center justify-center gap-3">
            <Activity className="h-8 w-8" /> Dashboard
          </h2>
          <h1 className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-[0.35em] opacity-60">
            Match Management & Live Recording
          </h1>
        </section>

        {/* --- スコア入力選択 --- */}
        <section>
          <ScoreTypeSelector />
        </section>

        {/* ... (環境ウィジェット等) ... */}

        {/* --- 2. 試合予定 (UPCOMING MATCHES) --- */}
        <section className="space-y-8">
          <SectionHeader title="試合予定" subtitle="Upcoming Matches" />
          
          {/* 💡 予定のモック表示 */}
          <div className="relative group overflow-hidden p-10 rounded-3xl border-2 border-dashed border-border/40 bg-card/30 flex flex-col items-center justify-center text-center transition-all hover:border-primary/20">
            <div className="p-4 bg-muted/20 rounded-full mb-4">
              <CalendarDays className="h-8 w-8 text-muted-foreground/40" />
            </div>
            <h3 className="text-base font-black text-muted-foreground uppercase tracking-wider">現在、予定されている試合はありません</h3>
            <p className="text-xs font-bold text-muted-foreground/60 mt-2">
              チームを強化し、次の対戦相手を登録しましょう
            </p>
            <Button 
              variant="link" 
              className="mt-4 text-primary font-black uppercase tracking-widest text-[10px] hover:no-underline"
              onClick={() => toast.info("予定作成機能は近日公開予定！")}
            >
              予定を追加する <ChevronRight className="ml-1 h-3 w-3" />
            </Button>
          </div>
        </section>

        {/* --- 3. 試合結果 (LATEST MATCHES) --- */}
        <section className="space-y-8">
          <SectionHeader title="試合結果" subtitle="Latest 3 Matches" showPulse />
          
          <div className="min-h-[100px]">
            <MatchList matches={recentMatches} isLoading={isLoading} />
          </div>
          
          {!isLoading && matches.length > 0 && (
            <div className="flex justify-center pt-4">
              <Button
                onClick={() => router.push('/matches')}
                className="bg-white/50 dark:bg-zinc-800/50 hover:bg-primary/10 text-primary border-2 border-primary/20 rounded-full px-10 h-14 font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 group shadow-sm"
              >
                全ての試合結果を表示
                <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
