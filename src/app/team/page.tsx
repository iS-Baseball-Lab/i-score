// src/app/team/page.tsx
"use client";

import React from "react";
import { MapPin, Calendar, Trophy, Swords, Users, Target, ChevronRight, Shield } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// 💡 モックデータ（後でD1データベースから取得するように繋ぎ変えます）
const TEAM_DATA = {
  name: "iS Baseball Club",
  category: "2024年度 1軍",
  established: "2020年",
  location: "神奈川県 横浜市",
  description: "「野球の今を、次世代へ。」をスローガンに掲げる、データ駆動型の次世代ベースボールクラブ。機動力を活かした攻撃と、堅実な守備が持ち味。",
  stats: {
    matches: 24,
    wins: 18,
    losses: 5,
    draws: 1,
    winRate: ".783",
    streak: "3連勝中",
  },
  roster: [
    { id: 1, name: "山田 太郎", number: "30", position: "監督", role: "MANAGER" },
    { id: 2, name: "佐藤 健太", number: "1", position: "投手", role: "PLAYER" },
    { id: 3, name: "鈴木 大輔", number: "2", position: "捕手", role: "PLAYER" },
    { id: 4, name: "高橋 翔", number: "6", position: "遊撃手", role: "PLAYER" },
    { id: 5, name: "田中 マネ", number: "-", position: "スコアラー", role: "SCORER" },
  ]
};

export default function TeamProfilePage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] pb-20 w-full animate-in fade-in duration-500">

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          1. ヒーローセクション（カバー画像＆ロゴ）
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="relative w-full aspect-[21/9] lg:aspect-[4/1] bg-muted overflow-hidden">
         
        {/* 🔥 ここを変更！ publicフォルダに入れたファイル名（例: /team-cover.jpg）を指定します */}
        <div className="absolute inset-0 bg-[url('/team-cover.webp')] bg-cover bg-center mix-blend-overlay opacity-30" />
        
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative -mt-16 sm:-mt-20 flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-6 mb-8">

          {/* チームロゴ（オーバーラップ配置） */}
          <Avatar className="h-24 w-24 sm:h-32 sm:w-32 border-4 border-background shadow-xl bg-background shrink-0">
            <AvatarFallback className="text-3xl sm:text-4xl font-black text-primary bg-primary/10">
              {TEAM_DATA.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          {/* チーム名＆基本ステータス */}
          <div className="flex flex-col flex-1 pb-1 sm:pb-2">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] sm:text-xs font-black tracking-widest uppercase border border-primary/20">
                {TEAM_DATA.category}
              </span>
              <span className="flex items-center text-muted-foreground text-[10px] sm:text-xs font-bold">
                <MapPin className="h-3 w-3 mr-1" />
                {TEAM_DATA.location}
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-foreground leading-tight">
              {TEAM_DATA.name}
            </h1>
            <p className="text-xs sm:text-sm font-bold text-muted-foreground mt-2 max-w-2xl leading-relaxed">
              {TEAM_DATA.description}
            </p>
          </div>
        </div>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            2. 戦績サマリー（Tinted Glass グリッド）
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-10">

          <div className="p-4 sm:p-5 rounded-2xl bg-primary/5 border border-primary/20 shadow-sm flex flex-col relative overflow-hidden group">
            <Trophy className="absolute -right-2 -bottom-2 h-16 w-16 text-primary/10 group-hover:scale-110 transition-transform duration-500" />
            <span className="text-[10px] sm:text-xs font-black text-muted-foreground uppercase tracking-widest mb-1 z-10">Win Rate</span>
            <div className="flex items-baseline gap-1.5 z-10">
              <span className="text-3xl sm:text-4xl font-black text-primary tracking-tighter">{TEAM_DATA.stats.winRate}</span>
            </div>
            <span className="text-[10px] sm:text-xs font-bold text-primary/80 mt-1 z-10">{TEAM_DATA.stats.streak}</span>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-background border border-border/50 shadow-sm flex flex-col relative overflow-hidden group">
            <Swords className="absolute -right-2 -bottom-2 h-16 w-16 text-muted/30 group-hover:scale-110 transition-transform duration-500" />
            <span className="text-[10px] sm:text-xs font-black text-muted-foreground uppercase tracking-widest mb-1 z-10">Matches</span>
            <div className="flex items-baseline gap-1.5 z-10">
              <span className="text-3xl sm:text-4xl font-black text-foreground tracking-tighter">{TEAM_DATA.stats.matches}</span>
              <span className="text-xs font-bold text-muted-foreground">試合</span>
            </div>
            <div className="flex gap-2 mt-2 z-10">
              <span className="text-[10px] font-black text-blue-500 bg-blue-500/10 px-1.5 py-0.5 rounded">{TEAM_DATA.stats.wins}W</span>
              <span className="text-[10px] font-black text-red-500 bg-red-500/10 px-1.5 py-0.5 rounded">{TEAM_DATA.stats.losses}L</span>
              <span className="text-[10px] font-black text-slate-500 bg-slate-500/10 px-1.5 py-0.5 rounded">{TEAM_DATA.stats.draws}D</span>
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-background border border-border/50 shadow-sm flex flex-col justify-center">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                <Calendar className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Established</span>
                <span className="text-sm sm:text-base font-bold text-foreground">{TEAM_DATA.established} 設立</span>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-background border border-border/50 shadow-sm flex flex-col justify-center cursor-pointer hover:border-primary/50 transition-colors group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <Target className="h-5 w-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Next Match</span>
                  <span className="text-sm sm:text-base font-bold text-foreground">未定</span>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </div>

        </div>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            3. ロースター（選手名鑑）
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg sm:text-xl font-black text-foreground flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              ロースター <span className="text-muted-foreground text-sm font-bold">({TEAM_DATA.roster.length}名)</span>
            </h2>
            <button className="text-xs font-bold text-primary hover:underline">すべて見る</button>
          </div>

          <div className="bg-background rounded-2xl border border-border/50 shadow-sm overflow-hidden">
            <div className="divide-y divide-border/50">
              {TEAM_DATA.roster.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-3 sm:p-4 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-3 sm:gap-4">
                    {/* 背番号バッジ */}
                    <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-muted flex items-center justify-center shrink-0 border border-border/50 shadow-inner">
                      <span className="text-lg sm:text-xl font-black text-foreground tracking-tighter">
                        {member.number}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm sm:text-base font-bold text-foreground">{member.name}</span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] sm:text-xs font-bold text-muted-foreground">{member.position}</span>
                        {member.role === "MANAGER" && (
                          <span className="flex items-center px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] font-black bg-amber-500/10 text-amber-600 border border-amber-500/20 uppercase">
                            <Shield className="h-2.5 w-2.5 mr-0.5" /> Manager
                          </span>
                        )}
                        {member.role === "SCORER" && (
                          <span className="px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] font-black bg-blue-500/10 text-blue-500 border border-blue-500/20 uppercase">
                            Scorer
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
