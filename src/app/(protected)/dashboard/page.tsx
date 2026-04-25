// filepath: src/app/(protected)/dashboard/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { Clock, Cloud, Wind, MapPin, Plus, History, Trophy, Users, ChevronRight } from "lucide-react";
import { reverseGeocode } from "@/lib/weather";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const [time, setTime] = useState(new Date());
  const [locationName, setLocationName] = useState<string>("");
  const [weather] = useState({ temp: "22", label: "晴れ" }); 
  const [wind] = useState({ speed: "3.2", direction: "北西" });

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const { latitude, longitude } = pos.coords;
        const name = await reverseGeocode(latitude, longitude);
        setLocationName(name);
      });
    }
    return () => clearInterval(timer);
  }, []);

  const timeString = time.toLocaleTimeString("ja-JP", { hour12: false, hour: "2-digit", minute: "2-digit" });
  const dateString = time.toLocaleDateString("ja-JP", { month: "short", day: "numeric", weekday: "short" });

  return (
    <div className="w-full animate-in fade-in duration-700 bg-transparent min-h-screen pb-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">

        {/* 📍 [NEW] 最上部：現在地ステータスバー */}
        <div className="flex items-center">
          <div className="flex items-center gap-2 py-1.5 px-4 rounded-full bg-primary/5 dark:bg-primary/10 border border-primary/20 backdrop-blur-md shadow-sm">
            <MapPin className="h-3.5 w-3.5 text-primary animate-pulse" />
            <span className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-tighter">Current Location:</span>
            <span className="text-[11px] sm:text-xs font-black text-foreground">
              {locationName || "GPS信号を探索中..."}
            </span>
          </div>
        </div>

        {/* 📋 環境ウィジェット（以前のデザインを完全復元） */}
        <section>
          <div className="bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl border border-border/40 shadow-xl rounded-[2.5rem] p-6 sm:p-8">
            <div className="grid grid-cols-2 sm:flex sm:items-center sm:justify-between gap-8">
              
              {/* 時計エリア */}
              <div className="flex items-center gap-5">
                <div className="p-3.5 bg-primary/10 rounded-2xl text-primary shrink-0 shadow-inner">
                  <Clock className="h-7 w-7" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none mb-1.5">{dateString}</p>
                  <p className="text-2xl sm:text-3xl font-black text-foreground tabular-nums leading-none tracking-tighter">
                    {timeString}
                  </p>
                </div>
              </div>

              <div className="hidden sm:block h-12 w-px bg-border/50" />

              {/* 天気エリア */}
              <div className="flex items-center gap-5">
                <div className="p-3.5 bg-blue-500/10 rounded-2xl text-blue-500 shrink-0 shadow-inner">
                  <Cloud className="h-7 w-7" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none mb-1.5">{weather.label}</p>
                  <p className="text-2xl sm:text-3xl font-black text-foreground leading-none tracking-tighter">
                    {weather.temp}<span className="text-lg ml-0.5 font-bold">°C</span>
                  </p>
                </div>
              </div>

              <div className="hidden sm:block h-12 w-px bg-border/50" />

              {/* 風エリア */}
              <div className="flex items-center gap-5">
                <div className="p-3.5 bg-emerald-500/10 rounded-2xl text-emerald-500 shrink-0 shadow-inner">
                  <Wind className="h-7 w-7" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none mb-1.5">{wind.direction}の風</p>
                  <p className="text-2xl sm:text-3xl font-black text-foreground leading-none tracking-tighter">
                    {wind.speed}<span className="text-lg ml-0.5 font-bold">m/s</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 🚀 クイックアクションボタン */}
        <div className="grid grid-cols-2 gap-5 mt-4">
          <Button size="lg" className="h-28 rounded-[2rem] flex flex-col gap-2 text-xl font-black shadow-2xl shadow-primary/30 transition-transform active:scale-95">
            <Plus className="h-8 w-8 stroke-[3]" />
            試合開始
          </Button>
          <Button size="lg" variant="outline" className="h-28 rounded-[2rem] flex flex-col gap-2 text-xl font-black bg-white/40 dark:bg-zinc-900/40 backdrop-blur-sm border-2 transition-transform active:scale-95">
            <History className="h-8 w-8 stroke-[3]" />
            過去の記録
          </Button>
        </div>

        {/* 📊 下部カードセクション */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-2">
          <Card className="p-7 rounded-[2rem] bg-white/40 dark:bg-zinc-900/40 border-dashed border-2 flex items-center justify-between group cursor-pointer hover:border-primary/50 transition-all hover:bg-white/60">
            <div className="flex items-center gap-5">
              <div className="p-4 bg-orange-500/10 rounded-2xl text-orange-500"><Trophy className="h-7 w-7" /></div>
              <div>
                <h3 className="font-black text-lg">所属大会</h3>
                <p className="text-sm text-muted-foreground font-medium">参加中のトーナメント</p>
              </div>
            </div>
            <ChevronRight className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
          </Card>
          
          <Card className="p-7 rounded-[2rem] bg-white/40 dark:bg-zinc-900/40 border-dashed border-2 flex items-center justify-between group cursor-pointer hover:border-primary/50 transition-all hover:bg-white/60">
            <div className="flex items-center gap-5">
              <div className="p-4 bg-purple-500/10 rounded-2xl text-purple-500"><Users className="h-7 w-7" /></div>
              <div>
                <h3 className="font-black text-lg">マイチーム</h3>
                <p className="text-sm text-muted-foreground font-medium">選手名簿・役割の管理</p>
              </div>
            </div>
            <ChevronRight className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
          </Card>
        </div>

      </div>
    </div>
  );
}
