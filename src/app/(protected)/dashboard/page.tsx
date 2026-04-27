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
  MapPin 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MatchList } from "@/components/matches/match-list";
import { ScoreTypeSelector } from "@/components/features/dashboard/ScoreTypeSelector"; 
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { Match } from "@/types/match";
import { getWindDirectionLabel, getWMOWeatherText, reverseGeocode, type OpenMeteoResponse } from "@/lib/weather";

// 💡 復活：天気データの型定義
interface WeatherData {
  temp: number;
  weatherCode: number;
  windDir: number;
  windSpd: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [matches, setMatches] = useState<Match[]>([]);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [locationName, setLocationName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [mounted, setMounted] = useState(false);

  // 1. マウント管理 & 時計タイマー (復活)
  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 2. 認証チェック
  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const { data: session } = await authClient.getSession();
        if (session?.user?.role === "SYSTEM_ADMIN") {
          router.replace("/admin");
        }
      } catch (err) { console.warn("Auth check deferred."); }
    };
    checkAdmin();
  }, [router]);

  // 3. 💡 復活：天気・位置情報取得の完全ロジック
  useEffect(() => {
    const fetchWeatherAndLocation = async (lat: number, lon: number) => {
      try {
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,wind_speed_10m,wind_direction_10m`
        );
        if (res.ok) {
          const data = (await res.json()) as OpenMeteoResponse;
          setWeather({
            temp: Math.round(data.current.temperature_2m),
            weatherCode: data.current.weather_code,
            windDir: data.current.wind_direction_10m,
            windSpd: Math.round(data.current.wind_speed_10m),
          });
        }
        const name = await reverseGeocode(lat, lon);
        setLocationName(name);
      } catch (e) { console.error("Weather error", e); }
    };

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchWeatherAndLocation(pos.coords.latitude, pos.coords.longitude),
        () => console.warn("Geolocation access denied")
      );
    }
  }, []);

  // 4. 💡 修正：試合データ取得（データ構造の不整合を完全にガード）
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        const teamId = typeof window !== "undefined" ? localStorage.getItem("iScore_selectedTeamId") : null;
        if (!teamId) {
          setIsLoading(false);
          return;
        }

        const matchRes = await fetch(`/api/matches?teamId=${teamId}`);
        if (matchRes.ok) {
          const result = await matchRes.json() as any;
          
          let matchArray: Match[] = [];
          // 配列か、あるいは .data に配列が入っているかを確認
          if (Array.isArray(result)) {
            matchArray = result;
          } else if (result && Array.isArray(result.data)) {
            matchArray = result.data;
          }

          if (matchArray.length > 0) {
            const sorted = matchArray.sort((a, b) => b.date.localeCompare(a.date));
            setMatches(sorted);
          } else {
            setMatches([]);
          }
        }
      } catch (error) {
        console.error("Match fetch error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  // 💡 直近3件をメモ化
  const recentMatches = useMemo(() => matches.slice(0, 3), [matches]);

  if (!mounted) return null;

  const timeString = currentTime.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const dateString = currentTime.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric', weekday: 'short' });

  return (
    <div className="w-full animate-in fade-in duration-500 bg-transparent min-h-screen pb-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 space-y-12">

        {/* --- 1. タイトルセクション (Dashboard 最大化) --- */}
        <section className="text-center space-y-2.5">
          <h2 className="text-2xl sm:text-3xl font-black text-primary uppercase tracking-[0.5em] flex items-center justify-center gap-3">
            <Activity className="h-8 w-8" /> Dashboard
          </h2>
          <h1 className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-[0.35em] opacity-60">
            Match Management & Live Recording
          </h1>
        </section>

        {/* --- 現在地ステータス --- */}
        <div className="flex justify-center px-1">
          <div className="flex items-center gap-2 py-3 px-10 rounded-3xl bg-primary/10 border border-primary/20 text-primary shadow-sm transition-all cursor-default">
            <MapPin className="h-4 w-4 animate-pulse" />
            <span className="text-sm sm:text-base font-black tracking-tight">
              現在地：{locationName || "取得中..."}
            </span>
          </div>
        </div>

        {/* --- 2. スコア入力選択 --- */}
        <section>
          <ScoreTypeSelector />
        </section>

        {/* --- 🌟 環境ウィジェット (完全復活) --- */}
        <section className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md border border-border/40 shadow-sm rounded-3xl p-5 sm:p-6">
          <div className="grid grid-cols-2 sm:flex sm:items-center sm:justify-between gap-4 sm:gap-6 text-center sm:text-left">
            <div className="flex items-center gap-3">
              <div className="p-2 sm:p-2.5 bg-primary/10 rounded-xl text-primary shrink-0"><Clock className="h-5 w-5 sm:h-6 sm:w-6" /></div>
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase">{dateString}</p>
                <p className="text-base sm:text-lg font-black text-foreground tabular-nums leading-none mt-1">{timeString}</p>
              </div>
            </div>
            <div className="hidden sm:block h-8 w-px bg-border/50" />
            <div className="flex items-center gap-3">
              <div className="p-2 sm:p-2.5 bg-amber-500/10 rounded-xl text-amber-500 shrink-0"><CloudSun className="h-5 w-5 sm:h-6 sm:w-6" /></div>
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase">Weather</p>
                <p className="text-sm sm:text-base font-black text-foreground leading-none mt-1">
                  {weather ? (
                    <>{getWMOWeatherText(weather.weatherCode)} <span className="text-muted-foreground text-xs ml-0.5">{weather.temp}°C</span></>
                  ) : "---"}
                </p>
              </div>
            </div>
            <div className="hidden sm:block h-8 w-px bg-border/50" />
            <div className="flex items-center gap-3">
              <div className="p-2 sm:p-2.5 bg-blue-500/10 rounded-xl text-blue-500 shrink-0">
                <Navigation 
                  className="h-5 w-5 sm:h-6 sm:w-6 transition-transform duration-700" 
                  style={{ transform: `rotate(${weather ? weather.windDir : 45}deg)` }} 
                />
              </div>
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase">Wind Dir</p>
                <p className="text-sm sm:text-base font-black text-foreground leading-none mt-1">
                  {weather ? getWindDirectionLabel(weather.windDir) : "---"}
                </p>
              </div>
            </div>
            <div className="hidden sm:block h-8 w-px bg-border/50" />
            <div className="flex items-center gap-3">
              <div className="p-2 sm:p-2.5 bg-teal-500/10 rounded-xl text-teal-500 shrink-0"><Wind className="h-5 w-5 sm:h-6 sm:w-6" /></div>
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase">Wind Spd</p>
                <p className="text-sm sm:text-base font-black text-foreground leading-none mt-1 tabular-nums">
                  {weather ? weather.windSpd : "--"} <span className="text-muted-foreground text-xs font-bold">m/s</span>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* --- 3. 試合結果 (3件表示) --- */}
        <section className="pt-4 space-y-6">
          <div className="flex flex-col items-center gap-3">
            <h2 className="text-xl sm:text-2xl font-black text-foreground flex items-center gap-5 uppercase tracking-[0.15em]">
              <div className="flex gap-2">
                <span className="w-1.5 h-1.5 bg-primary/20 rounded-full" />
                <span className="w-1.5 h-1.5 bg-primary/50 rounded-full" />
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
              </div>
              試合結果
              <div className="flex gap-2">
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                <span className="w-1.5 h-1.5 bg-primary/50 rounded-full" />
                <span className="w-1.5 h-1.5 bg-primary/20 rounded-full" />
              </div>
            </h2>
            <p className="text-[10px] font-bold text-muted-foreground tracking-[0.4em] uppercase">Latest 3 Matches</p>
          </div>

          {/* 💡 試合リスト表示のコンテナ */}
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
