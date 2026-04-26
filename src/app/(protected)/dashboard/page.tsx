// filepath: src/app/(protected)/dashboard/page.tsx
/* 💡 ダッシュボード（環境ウィジェット連動スタイル ＆ オフライン耐性版） */
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Trophy, Users, PlayCircle, Plus, ChevronLeft, ChevronRight, Activity, Swords, Clock, CloudSun, Navigation, Wind, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MatchList } from "@/components/matches/match-list";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { Match } from "@/types/match";
import { getWindDirectionLabel, getWMOWeatherText, reverseGeocode, type OpenMeteoResponse } from "@/lib/weather";

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
  const [locationName, setLocationName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [mounted, setMounted] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setMounted(true);
    const checkAdminAndStartTimer = async () => {
      try {
        const { data: session } = await authClient.getSession();
        if (session?.user?.role === "SYSTEM_ADMIN") {
          router.replace("/admin");
          return;
        }
      } catch (err) {
        // オフライン時はログアウトさせず維持
        console.warn("Auth check deferred. Network might be unstable.");
      }
    };
    checkAdminAndStartTimer();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, [router]);

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
      } catch (e) {
        console.error("Fetch error", e);
      }
    };

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchWeatherAndLocation(pos.coords.latitude, pos.coords.longitude),
        () => console.log("Geolocation access denied")
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
          const sorted = Array.isArray(matchData) ? matchData.sort((a, b) => b.date.localeCompare(a.date)) : [];
          setMatches(sorted);
        }
      } catch (error) {
        if (navigator.onLine) {
          toast.error("データの読み込みに失敗しました");
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const totalPages = Math.ceil(matches.length / itemsPerPage);
  const paginatedMatches = matches.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (!mounted) return null;

  const timeString = currentTime.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const dateString = currentTime.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric', weekday: 'short' });

  return (
    <div className="w-full animate-in fade-in duration-500 bg-transparent min-h-screen pb-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6 sm:space-y-8">

        {/* --- 1. ヒーローセクション --- */}
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

        {/* --- 🌟 現在地ステータス（中央配置・透過・影なし・ウィジェット連動の角丸） --- */}
        <div className="flex justify-center px-1 mb-2">
          <div className="flex items-center gap-2 py-2 px-6 rounded-3xl bg-primary/10 border border-primary/20 text-primary shadow-sm transition-all cursor-default">
            <MapPin className="h-4 w-4 animate-pulse" />
            <span className="text-sm sm:text-base font-black tracking-tight">
              現在地：{locationName || "取得中..."}
            </span>
          </div>
        </div>

        {/* --- 🌟 環境ウィジェット（rounded-3xl がユーザー設定に連動） --- */}
        <section className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md border border-border/40 shadow-sm rounded-3xl p-4 sm:p-5">
          <div className="grid grid-cols-2 sm:flex sm:items-center sm:justify-between gap-4 sm:gap-6">
            <div className="flex items-center gap-3">
              <div className="p-2 sm:p-2.5 bg-primary/10 rounded-xl text-primary shrink-0"><Clock className="h-5 w-5 sm:h-6 sm:w-6" /></div>
              <div>
                <p className="text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase">{dateString}</p>
                <p className="text-base sm:text-lg font-black text-foreground tabular-nums leading-none mt-0.5">{timeString}</p>
              </div>
            </div>
            <div className="hidden sm:block h-8 w-px bg-border/50" />
            <div className="flex items-center gap-3">
              <div className="p-2 sm:p-2.5 bg-amber-500/10 rounded-xl text-amber-500 shrink-0"><CloudSun className="h-5 w-5 sm:h-6 sm:w-6" /></div>
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
            <div className="flex items-center gap-3">
              <div className="p-2 sm:p-2.5 bg-blue-500/10 rounded-xl text-blue-500 shrink-0">
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
            <div className="flex items-center gap-3">
              <div className="p-2 sm:p-2.5 bg-teal-500/10 rounded-xl text-teal-500 shrink-0"><Wind className="h-5 w-5 sm:h-6 sm:w-6" /></div>
              <div>
                <p className="text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase">Wind Spd</p>
                <p className="text-sm sm:text-base font-black text-foreground leading-none mt-0.5 tabular-nums">
                  {weather ? weather.windSpd : "--"} <span className="text-muted-foreground text-xs font-bold">m/s</span>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* --- 2. クイックアクション --- */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <button 
            onClick={() => router.push('/matches/create?mode=quick')} 
            className="col-span-2 lg:col-span-2 relative overflow-hidden flex flex-col items-start p-5 sm:p-6 rounded-3xl bg-primary text-primary-foreground shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all group border border-primary-foreground/10 text-left"
          >
            <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500"><PlayCircle className="w-32 h-32" /></div>
            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm mb-4"><Plus className="h-6 w-6 text-white" /></div>
            <h3 className="text-lg sm:text-xl font-black tracking-tight mb-1">Quick Score</h3>
            <p className="text-xs sm:text-sm font-medium text-primary-foreground/80">試合結果を爆速で入力する</p>
          </button>
          <button onClick={() => router.push('/players')} className="flex flex-col items-start justify-between p-5 sm:p-6 rounded-3xl bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md border border-border/40 shadow-sm hover:shadow-md hover:border-primary/40 active:scale-[0.98] transition-all group">
            <div className="p-3 bg-muted dark:bg-zinc-800 rounded-2xl group-hover:bg-primary/10 group-hover:text-primary transition-colors mb-4"><Users className="h-6 w-6" /></div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-foreground mb-1">選手名簿</h3>
              <p className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-widest">PLAYERS</p>
            </div>
          </button>
          <button onClick={() => router.push('/team')} className="flex flex-col items-start justify-between p-5 sm:p-6 rounded-3xl bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md border border-border/40 shadow-sm hover:shadow-md hover:border-primary/40 active:scale-[0.98] transition-all group">
            <div className="p-3 bg-muted dark:bg-zinc-800 rounded-2xl group-hover:bg-primary/10 group-hover:text-primary transition-colors mb-4"><Trophy className="h-6 w-6" /></div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-foreground mb-1">チーム成績</h3>
              <p className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-widest">Analytics</p>
            </div>
          </button>
        </section>

        {/* --- 3. 試合リスト --- */}
        <section className="pt-2 sm:pt-4">
          <div className="flex items-center justify-between mb-4 px-1">
            <h2 className="text-xs sm:text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2"><Swords className="h-4 w-4" /> Recent Matches</h2>
            <Button variant="outline" size="lg" onClick={() => router.push('/matches')} className="text-[12px] font-black uppercase tracking-widest text-primary border-primary/40 hover:bg-primary/10 rounded-full px-6 h-10 shadow-sm transition-all active:scale-95">
              See All Matches <ChevronRight className="h-4 w-4 ml-1.5" />
            </Button>
          </div>
          <MatchList matches={paginatedMatches} isLoading={isLoading} />
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-8">
              <Button
                variant="outline"
                size="icon"
                className="rounded-2xl h-11 w-11 bg-primary/10 hover:bg-primary/20 border-primary/20 text-primary shadow-sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <span className="text-sm font-black tabular-nums bg-white/50 dark:bg-zinc-800/50 px-4 py-2 rounded-xl border border-border/50 shadow-sm">
                {currentPage} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="icon"
                className="rounded-2xl h-11 w-11 bg-primary/10 hover:bg-primary/20 border-primary/20 text-primary shadow-sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
