// filepath: src/app/(protected)/dashboard/page.tsx
/* 💡 i-score ダッシュボード：元のデザインを維持しつつリアルタイム天気を統合 */
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Trophy, Users, PlayCircle, Plus, Activity, Clock, CloudSun, Navigation, Wind } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MatchList } from "@/components/matches/match-list";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { Match } from "@/types/match";
import { 
  getWindDirectionLabel, 
  getWMOWeatherText, 
  type OpenMeteoResponse 
} from "@/lib/weather"; // 🌟 weather.ts からインポート

interface UserMembership {
  teamId: string;
  organizationName: string;
  teamName: string;
}

interface WeatherData {
  temp: number;
  weatherCode: number;
  windDir: number;
  windSpd: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [matches, setMatches] = useState<Match[]>([]);
  const [teamInfo, setTeamInfo] = useState<{ org: string; name: string } | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const checkAdmin = async () => {
      const { data: session } = await authClient.getSession();
      if (session?.user?.role === "SYSTEM_ADMIN") {
        router.replace("/admin");
        return;
      }
    };
    checkAdmin();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, [router]);

  // 天気取得ロジック（バックグラウンドで実行）
  useEffect(() => {
    const fetchWeather = async (lat: number, lon: number) => {
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
      } catch (e) {
        console.error("Weather fetch error", e);
      }
    };

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude),
        () => console.log("Location access denied")
      );
    }
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const teamId = localStorage.getItem("iScore_selectedTeamId");
        if (!teamId) {
          setIsLoading(false);
          return;
        }

        const teamRes = await fetch("/api/auth/me");
        if (teamRes.ok) {
          const res = (await teamRes.json()) as { data: { memberships: UserMembership[] } };
          const currentMembership = res.data.memberships.find((m) => m.teamId === teamId);
          if (currentMembership) {
            setTeamInfo({ org: currentMembership.organizationName, name: currentMembership.teamName });
          }
        }

        const matchRes = await fetch(`/api/matches?teamId=${teamId}`);
        if (matchRes.ok) {
          const matchData = (await matchRes.json()) as Match[];
          setMatches(Array.isArray(matchData) ? matchData.sort((a, b) => b.date.localeCompare(a.date)) : []);
        }
      } catch (error) {
        toast.error("データの読み込みに失敗しました");
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (!mounted) return null;

  const timeString = currentTime.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const dateString = currentTime.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric', weekday: 'short' });

  return (
    <div className="w-full animate-in fade-in duration-500 bg-transparent min-h-screen pb-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6 sm:space-y-8">
        
        {/* --- ヒーローセクション（元のデザイン） --- */}
        <section>
          <h2 className="text-sm font-black text-primary uppercase tracking-widest mb-1 flex items-center gap-2">
            <Activity className="h-4 w-4" /> Overview
          </h2>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight flex flex-wrap gap-x-2">
            {teamInfo ? (
              <><span className="text-foreground">{teamInfo.org}</span><span className="text-primary">{teamInfo.name}</span></>
            ) : (
              <span className="text-foreground">Team Loading...</span>
            )}
          </h1>
        </section>

        {/* --- 環境ウィジェット（元の角丸[40px]・透過bg-background/40デザイン） --- */}
        <section className="bg-background/40 backdrop-blur-xl border border-border/40 shadow-sm rounded-[40px] p-4 sm:p-5">
          <div className="grid grid-cols-2 sm:flex sm:items-center sm:justify-between gap-4 sm:gap-6">
            
            {/* 時計 */}
            <div className="flex items-center gap-3">
              <div className="p-2 sm:p-2.5 bg-primary/10 rounded-full text-primary shrink-0"><Clock className="h-5 w-5 sm:h-6 sm:w-6" /></div>
              <div>
                <p className="text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase">{dateString}</p>
                <p className="text-base sm:text-lg font-black text-foreground tabular-nums leading-none mt-0.5">{timeString}</p>
              </div>
            </div>

            <div className="hidden sm:block h-8 w-px bg-border/50" />

            {/* 天気 */}
            <div className="flex items-center gap-3">
              <div className="p-2 sm:p-2.5 bg-amber-500/10 rounded-full text-amber-500 shrink-0"><CloudSun className="h-5 w-5 sm:h-6 sm:w-6" /></div>
              <div>
                <p className="text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase">Weather</p>
                <p className="text-sm sm:text-base font-black text-foreground leading-none mt-0.5">
                  {weather ? (
                    <>{getWMOWeatherText(weather.weatherCode)} <span className="text-muted-foreground text-xs ml-0.5">{weather.temp}°C</span></>
                  ) : "---"}
                </p>
              </div>
            </div>

            <div className="hidden sm:block h-8 w-px bg-border/50" />

            {/* 風向き */}
            <div className="flex items-center gap-3">
              <div className="p-2 sm:p-2.5 bg-blue-500/10 rounded-full text-blue-500 shrink-0">
                <Navigation 
                  className="h-5 w-5 sm:h-6 sm:w-6 transition-transform duration-700" 
                  style={{ transform: `rotate(${weather ? weather.windDir : 45}deg)` }} 
                />
              </div>
              <div>
                <p className="text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase">Wind Dir</p>
                <p className="text-sm sm:text-base font-black text-foreground leading-none mt-0.5">
                  {weather ? getWindDirectionLabel(weather.windDir) : "---"}
                </p>
              </div>
            </div>

            <div className="hidden sm:block h-8 w-px bg-border/50" />

            {/* 風速 */}
            <div className="flex items-center gap-3">
              <div className="p-2 sm:p-2.5 bg-teal-500/10 rounded-full text-teal-500 shrink-0"><Wind className="h-5 w-5 sm:h-6 sm:w-6" /></div>
              <div>
                <p className="text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase">Wind Spd</p>
                <p className="text-sm sm:text-base font-black text-foreground leading-none mt-0.5 tabular-nums">
                  {weather ? weather.windSpd : "--"} <span className="text-muted-foreground text-xs font-bold">m/s</span>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* --- クイックアクション（元のRounded-fullデザイン） --- */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Button 
            onClick={() => router.push("/matches/create")}
            className="h-auto py-4 sm:py-6 rounded-full flex flex-col gap-1 sm:gap-2 font-bold transition-all hover:scale-105 active:scale-95 bg-primary text-primary-foreground shadow-lg"
          >
            <Plus className="h-5 w-5 sm:h-6 sm:w-6" />
            <span className="text-xs sm:text-sm">New Match</span>
          </Button>
          <Button 
            variant="outline"
            onClick={() => router.push("/players")}
            className="h-auto py-4 sm:py-6 rounded-full flex flex-col gap-1 sm:gap-2 font-bold backdrop-blur-md bg-background/40 border-border/40 transition-all hover:scale-105"
          >
            <Users className="h-5 w-5 sm:h-6 sm:w-6" />
            <span className="text-xs sm:text-sm">Players</span>
          </Button>
          <Button 
            variant="outline"
            onClick={() => router.push("/team")}
            className="h-auto py-4 sm:py-6 rounded-full flex flex-col gap-1 sm:gap-2 font-bold backdrop-blur-md bg-background/40 border-border/40 transition-all hover:scale-105"
          >
            <Trophy className="h-5 w-5 sm:h-6 sm:w-6" />
            <span className="text-xs sm:text-sm">Team Stats</span>
          </Button>
          <Button 
            variant="outline"
            className="h-auto py-4 sm:py-6 rounded-full flex flex-col gap-1 sm:gap-2 font-bold backdrop-blur-md bg-background/40 border-border/40 transition-all hover:scale-105"
          >
            <PlayCircle className="h-5 w-5 sm:h-6 sm:w-6" />
            <span className="text-xs sm:text-sm">Training</span>
          </Button>
        </section>

        {/* --- 試合リスト（元のRounded-[40px]デザイン） --- */}
        <section className="space-y-4 sm:space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-lg sm:text-xl font-black flex items-center gap-2 tracking-tight">
              <Trophy className="h-5 w-5 text-primary" /> Recent Matches
            </h3>
          </div>
          <div className="bg-background/40 backdrop-blur-xl rounded-[40px] border border-border/40 p-2 sm:p-4 min-h-[300px] shadow-sm">
            <MatchList matches={matches} isLoading={isLoading} />
          </div>
        </section>

      </div>
    </div>
  );
}
