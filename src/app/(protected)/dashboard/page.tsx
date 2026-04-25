// filepath: src/app/(protected)/dashboard/page.tsx
/* 💡 i-Score ダッシュボード：【完全復旧】オリジナルデザイン一致版 */
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
} from "@/lib/weather";

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

  // 天気データ取得（バックグラウンド処理のみ）
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
          const res = await teamRes.json();
          const currentMembership = res.data.memberships.find((m: any) => m.teamId === teamId);
          if (currentMembership) {
            setTeamInfo({ org: currentMembership.organizationName, name: currentMembership.teamName });
          }
        }

        const matchRes = await fetch(`/api/matches?teamId=${teamId}`);
        if (matchRes.ok) {
          const matchData = await matchRes.json();
          setMatches(Array.isArray(matchData) ? matchData.sort((a: Match, b: Match) => b.date.localeCompare(a.date)) : []);
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

  const timeString = currentTime.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
  const dateString = currentTime.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric', weekday: 'short' });

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            {teamInfo ? `${teamInfo.org} ${teamInfo.name}` : "Dashboard"}
          </h2>
          <div className="flex items-center text-muted-foreground">
            <Activity className="mr-2 h-4 w-4" />
            <span>Team Overview & Quick Access</span>
          </div>
        </div>
      </div>

      {/* 環境情報：枠を分けず、以前の統合された横並びスタイルに復旧 */}
      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
        <div className="flex items-center gap-1.5">
          <Clock className="h-4 w-4" />
          <span>{dateString} {timeString}</span>
        </div>
        <div className="flex items-center gap-1.5 ml-auto md:ml-0">
          <CloudSun className="h-4 w-4" />
          <span>{weather ? `${getWMOWeatherText(weather.weatherCode)} ${weather.temp}°C` : "---"}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Navigation className="h-4 w-4" style={{ transform: `rotate(${weather ? weather.windDir : 0}deg)` }} />
          <span>{weather ? getWindDirectionLabel(weather.windDir) : "---"}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Wind className="h-4 w-4" />
          <span>{weather ? `${weather.windSpd} m/s` : "---"}</span>
        </div>
      </div>

      {/* クイックアクション：ボタンを大きく、以前のアイコン強調デザインに復旧 */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Button 
          variant="default"
          onClick={() => router.push("/matches/create")}
          className="h-32 flex flex-col items-center justify-center gap-4 rounded-xl shadow-md transition-all hover:scale-[1.02]"
        >
          <div className="p-3 bg-white/20 rounded-full">
            <Plus className="h-8 w-8" />
          </div>
          <span className="text-lg font-bold">New Match</span>
        </Button>

        <Button 
          variant="outline"
          onClick={() => router.push("/players")}
          className="h-32 flex flex-col items-center justify-center gap-4 rounded-xl shadow-sm hover:bg-accent"
        >
          <Users className="h-8 w-8 text-primary" />
          <span className="text-base font-semibold">Players</span>
        </Button>

        <Button 
          variant="outline"
          onClick={() => router.push("/team")}
          className="h-32 flex flex-col items-center justify-center gap-4 rounded-xl shadow-sm hover:bg-accent"
        >
          <Trophy className="h-8 w-8 text-primary" />
          <span className="text-base font-semibold">Team Stats</span>
        </Button>

        <Button 
          variant="outline"
          className="h-32 flex flex-col items-center justify-center gap-4 rounded-xl shadow-sm hover:bg-accent"
        >
          <PlayCircle className="h-8 w-8 text-primary" />
          <span className="text-base font-semibold">Training</span>
        </Button>
      </div>

      {/* 試合リスト：コンテナを完全に削除し、以前の直接配置に戻す（ページングが直ります） */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" /> Recent Matches
          </h3>
        </div>
        <MatchList matches={matches} isLoading={isLoading} />
      </div>
    </div>
  );
}
