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
  CalendarDays,
  PlayCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MatchList } from "@/components/matches/match-list";
import { ScoreTypeSelector } from "@/components/features/dashboard/ScoreTypeSelector";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { EmptyState } from "@/components/layout/EmptyState";
import { useTeam } from "@/contexts/TeamContext";
import { Match } from "@/types/match";
import { getWindDirectionLabel, getWMOWeatherText, reverseGeocode, type OpenMeteoResponse } from "@/lib/weather";
import { cn } from "@/lib/utils";

interface WeatherData {
  temp: number;
  weatherCode: number;
  windDir: number;
  windSpd: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const { currentTeam } = useTeam();
  const [matches, setMatches] = useState<Match[]>([]);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [locationName, setLocationName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [mounted, setMounted] = useState(false);

  // 1. マウント管理 & 時計
  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 2. 天気・位置情報取得
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

  // 3. 試合データ取得 (TeamContext連携)
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!currentTeam?.id) return;
      setIsLoading(true);
      try {
        const matchRes = await fetch(`/api/matches?teamId=${currentTeam.id}`);
        if (matchRes.ok) {
          const result = await matchRes.json() as any;
          const matchArray: Match[] = Array.isArray(result) ? result : (result.data || []);
          setMatches(matchArray.sort((a, b) => b.date.localeCompare(a.date)));
        }
      } catch (error) {
        console.error("Match fetch error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, [currentTeam?.id]);

  // 💡 LIVE試合の抽出
  const liveMatch = useMemo(() => {
    return matches.find(m => m.status === 'live');
  }, [matches]);

  // 💡 完了した試合 (FINISHED) だけを 3 件抽出
  const finishedMatches = useMemo(() =>
    matches.filter(m => m.status === 'finished').slice(0, 3)
    , [matches]);

  // 💡 完了試合のみでの成績計算
  const stats = useMemo(() => {
    const s = { win: 0, loss: 0, draw: 0 };
    matches.filter(m => m.status === 'finished').forEach(m => {
      if (m.myScore > m.opponentScore) s.win++;
      else if (m.myScore < m.opponentScore) s.loss++;
      else s.draw++;
    });
    const total = s.win + s.loss + s.draw;
    const rate = total > 0 ? (s.win / total).toFixed(3).replace(/^0/, '') : ".000";
    return { ...s, total, rate };
  }, [matches]);

  if (!mounted) return null;

  const timeString = currentTime.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
  const dateString = currentTime.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric', weekday: 'short' });

  return (
    <div className="w-full animate-in fade-in duration-500 bg-transparent min-h-screen pb-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 space-y-16">

        {/* タイトルセクション */}
        <section className="text-center space-y-3">
          <h2 className="text-3xl sm:text-4xl font-black text-primary uppercase tracking-[0.5em] flex items-center justify-center gap-4">
            <Activity className="h-8 w-8" /> Dashboard
          </h2>
          <div className="flex justify-center mt-4">
            <div className="flex items-center gap-2 py-2 px-6 rounded-full bg-primary/10 border border-primary/20 text-primary">
              <MapPin className="h-3 w-3 animate-pulse" />
              <span className="text-xs font-black tracking-tight">{locationName || "取得中..."}</span>
            </div>
          </div>
        </section>

        {/* 環境ウィジェット */}
        <section className="bg-card/50 dark:bg-zinc-900/50 backdrop-blur-sm border border-border/40 shadow-sm rounded-3xl p-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            <div className="flex flex-col items-center gap-1">
              <Clock className="h-5 w-5 text-primary mb-1" />
              <p className="text-[10px] font-bold text-muted-foreground uppercase">{dateString}</p>
              <p className="text-lg font-black text-foreground tabular-nums leading-none">{timeString}</p>
            </div>
            <div className="flex flex-col items-center gap-1">
              <CloudSun className="h-5 w-5 text-amber-500 mb-1" />
              <p className="text-[10px] font-bold text-muted-foreground uppercase">Weather</p>
              <p className="text-lg font-black text-foreground leading-none">
                {weather ? `${getWMOWeatherText(weather.weatherCode)} ${weather.temp}°` : "--"}
              </p>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Navigation className="h-5 w-5 text-blue-500 mb-1" style={{ transform: `rotate(${weather ? weather.windDir : 0}deg)` }} />
              <p className="text-[10px] font-bold text-muted-foreground uppercase">Wind</p>
              <p className="text-lg font-black text-foreground leading-none">{weather ? getWindDirectionLabel(weather.windDir) : "--"}</p>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Wind className="h-5 w-5 text-teal-500 mb-1" />
              <p className="text-[10px] font-bold text-muted-foreground uppercase">Speed</p>
              <p className="text-lg font-black text-foreground leading-none tabular-nums">{weather ? `${weather.windSpd}m/s` : "--"}</p>
            </div>
          </div>
        </section>

        {/* --- 🚀 LIVE MATCH HERO --- */}
        {liveMatch && (
          <section className="animate-in zoom-in duration-500">
            <div
              onClick={() => router.push(`/matches/score?id=${liveMatch.id}`)}
              className="group relative overflow-hidden bg-zinc-950 border-2 border-primary rounded-[2.5rem] p-8 shadow-2xl shadow-primary/30 cursor-pointer transition-all hover:scale-[1.01]"
            >
              <div className="absolute -right-4 -top-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <PlayCircle className="h-40 w-40 text-primary" />
              </div>

              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex flex-col items-center md:items-start gap-2">
                  <div className="flex items-center gap-3">
                    <span className="flex h-3 w-3 rounded-full bg-primary animate-ping" />
                    <span className="text-primary font-black tracking-[0.3em] text-xs uppercase">Scoring Now</span>
                  </div>
                  <p className="text-white/40 text-[10px] font-bold uppercase ml-6 italic">
                    {(liveMatch as any).tournamentName || "Practice Match"}
                  </p>
                </div>

                <div className="flex items-center gap-8 sm:gap-16">
                  <div className="text-center">
                    <p className="text-[10px] font-black text-zinc-500 uppercase mb-2">MY TEAM</p>
                    <p className="text-6xl font-black text-white tabular-nums">{liveMatch.myScore}</p>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-zinc-800 font-black text-3xl italic">VS</span>
                    <span className="bg-primary/20 text-primary text-[10px] font-black px-4 py-1.5 rounded-full mt-3 uppercase tracking-widest border border-primary/30">
                      {(liveMatch as any).currentInning
                        ? `${(liveMatch as any).currentInning}回${(liveMatch as any).isBottom ? "裏" : "表"}`
                        : "LIVE"
                      }
                    </span>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] font-black text-zinc-500 uppercase mb-2">{liveMatch.opponent}</p>
                    <p className="text-6xl font-black text-white tabular-nums">{liveMatch.opponentScore}</p>
                  </div>
                </div>

                <Button className="rounded-full px-10 h-14 font-black bg-primary text-primary-foreground group-hover:bg-primary/90 transition-colors">
                  入力に戻る
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          </section>
        )}

        <ScoreTypeSelector />

        {/* チーム成績 */}
        <section className="space-y-6">
          <SectionHeader title="チーム成績" subtitle="Season Standings" showPulse />
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-primary text-primary-foreground rounded-3xl p-6 flex flex-col items-center justify-center">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Win Rate</p>
              <p className="text-4xl font-black mt-1">{stats.rate}</p>
            </div>
            <div className="sm:col-span-3 grid grid-cols-3 gap-4">
              {[
                { label: 'Wins', val: stats.win, color: 'text-blue-500', dot: 'bg-blue-500' },
                { label: 'Losses', val: stats.loss, color: 'text-rose-500', dot: 'bg-rose-500' },
                { label: 'Draws', val: stats.draw, color: 'text-muted-foreground', dot: 'bg-zinc-400' }
              ].map((s, i) => (
                <div key={i} className="bg-card/30 border border-border/40 rounded-3xl p-6 flex flex-col items-center justify-center">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={cn("w-1.5 h-1.5 rounded-full", s.dot)} />
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{s.label}</p>
                  </div>
                  <p className={cn("text-3xl font-black tabular-nums", s.color)}>{s.val}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 試合結果 */}
        <section className="space-y-8">
          <SectionHeader title="直近の試合結果" subtitle="Latest 3 Results" showPulse />
          <MatchList matches={finishedMatches} isLoading={isLoading} />
          {!isLoading && matches.length > 0 && (
            <div className="flex justify-center pt-4">
              <Button onClick={() => router.push('/matches')} variant="ghost" className="text-primary font-black uppercase tracking-widest text-xs hover:bg-primary/5 rounded-full px-8 h-12">
                View All Results <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          )}
        </section>

      </div>
    </div>
  );
}