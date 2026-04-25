// filepath: src/app/(protected)/dashboard/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { Clock, Cloud, Wind, MapPin, Plus, History, Trophy, Users } from "lucide-react";
import { reverseGeocode } from "@/lib/weather"; // 上記の関数をインポート
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const [time, setTime] = useState(new Date());
  const [locationName, setLocationName] = useState<string>("");
  const [weather, setWeather] = useState({ temp: "--", label: "Loading..." });
  const [wind, setWind] = useState({ speed: "--", direction: "--" });

  useEffect(() => {
    // 1. 時計の更新
    const timer = setInterval(() => setTime(new Date()), 1000);

    // 2. 位置情報と天気の取得
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const { latitude, longitude } = pos.coords;
        
        // 住所取得 (都道府県＋市区町村)
        const name = await reverseGeocode(latitude, longitude);
        setLocationName(name);

        // 天気情報取得 (例: Open-Meteoなどを使用する場合の擬似コード)
        // 本来はここでfetchWeather(latitude, longitude)を呼ぶ
        setWeather({ temp: "22", label: "晴れ" });
        setWind({ speed: "3.2", direction: "北西" });
      });
    }

    return () => clearInterval(timer);
  }, []);

  const timeString = time.toLocaleTimeString("ja-JP", { hour12: false, hour: "2-digit", minute: "2-digit" });
  const dateString = time.toLocaleDateString("ja-JP", { month: "short", day: "numeric", weekday: "short" });

  return (
    <div className="w-full animate-in fade-in duration-500 bg-transparent min-h-screen pb-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-4">

        {/* 🌟 1. 現在地ステータスバー (最上部) */}
        <div className="flex items-center justify-center sm:justify-start">
          <div className="flex items-center gap-2 py-1.5 px-4 rounded-full bg-primary/5 dark:bg-primary/10 border border-primary/20 backdrop-blur-sm shadow-sm">
            <MapPin className="h-3.5 w-3.5 text-primary animate-pulse" />
            <span className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-tighter">Current Location:</span>
            <span className="text-[11px] sm:text-xs font-black text-foreground">
              {locationName || "GPS信号を探索中..."}
            </span>
          </div>
        </div>

        {/* 🌟 2. 環境ウィジェット枠 (時計・天気・風) */}
        <section>
          <div className="bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl border border-border/40 shadow-xl rounded-[2rem] p-5 sm:p-6">
            <div className="grid grid-cols-2 sm:flex sm:items-center sm:justify-between gap-6">
              
              {/* 時計エリア */}
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-2xl text-primary shrink-0">
                  <Clock className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase leading-none mb-1">{dateString}</p>
                  <p className="text-xl sm:text-2xl font-black text-foreground tabular-nums leading-none tracking-tight">
                    {timeString}
                  </p>
                </div>
              </div>

              <div className="hidden sm:block h-10 w-px bg-border/50" />

              {/* 天気エリア */}
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-500 shrink-0">
                  <Cloud className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase leading-none mb-1">{weather.label}</p>
                  <p className="text-xl sm:text-2xl font-black text-foreground leading-none tracking-tight">
                    {weather.temp}<span className="text-sm ml-0.5">°C</span>
                  </p>
                </div>
              </div>

              <div className="hidden sm:block h-10 w-px bg-border/50" />

              {/* 風情報エリア */}
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-500 shrink-0">
                  <Wind className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase leading-none mb-1">{wind.direction}の風</p>
                  <p className="text-xl sm:text-2xl font-black text-foreground leading-none tracking-tight">
                    {wind.speed}<span className="text-sm ml-0.5">m/s</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 🌟 3. クイックアクションボタン */}
        <div className="grid grid-cols-2 gap-4 mt-8">
          <Button size="lg" className="h-24 rounded-3xl flex flex-col gap-2 text-lg font-bold shadow-lg shadow-primary/20">
            <Plus className="h-6 w-6" />
            試合開始
          </Button>
          <Button size="lg" variant="outline" className="h-24 rounded-3xl flex flex-col gap-2 text-lg font-bold bg-white/50 dark:bg-zinc-900/50">
            <History className="h-6 w-6" />
            過去の記録
          </Button>
        </div>

        {/* 🌟 4. サマリーセクション (チーム・大会) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <Card className="p-6 rounded-[2rem] bg-white/40 dark:bg-zinc-900/40 border-dashed border-2 flex items-center justify-between group cursor-pointer hover:border-primary/50 transition-colors">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-500/10 rounded-2xl text-orange-500"><Trophy className="h-6 w-6" /></div>
              <div>
                <h3 className="font-bold text-sm">所属大会</h3>
                <p className="text-xs text-muted-foreground">参加中のトーナメント</p>
              </div>
            </div>
          </Card>
          <Card className="p-6 rounded-[2rem] bg-white/40 dark:bg-zinc-900/40 border-dashed border-2 flex items-center justify-between group cursor-pointer hover:border-primary/50 transition-colors">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-500"><Users className="h-6 w-6" /></div>
              <div>
                <h3 className="font-bold text-sm">マイチーム</h3>
                <p className="text-xs text-muted-foreground">選手・役割の管理</p>
              </div>
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
}
