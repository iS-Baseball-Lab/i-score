// src/app/(protected)/team/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { Users, MapPin, Calendar, Shield, Trophy, Loader2, Camera, Activity, Info, Crown, Settings, BarChart3, History, Target } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface Team {
  id: string;
  name: string;
  orgName?: string; 
  year: number | null;
  tier: string | null;
  teamType: string | null;
  myRole: string;
  isFounder: boolean;
}

export default function TeamProfilePage() {
  const [team, setTeam] = useState<Team | null>(null);
  const [memberCount, setMemberCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        const activeTeamId = localStorage.getItem("iScore_selectedTeamId");
        if (!activeTeamId) { setIsLoading(false); return; }

        const teamsResponse = await fetch("/api/teams", { cache: "no-store" });
        if (!teamsResponse.ok) throw new Error("取得失敗");
        
        const teamsData: Team[] = await teamsResponse.json();
        const currentTeam = teamsData.find(t => t.id === activeTeamId);

        if (currentTeam) {
          setTeam(currentTeam);
          const playersResponse = await fetch(`/api/teams/${activeTeamId}/players`, { cache: "no-store" });
          if (playersResponse.ok) {
            const playersData = (await playersResponse.json()) as any[];
            setMemberCount(playersData.length || 0);
          }
        }
      } catch (error) {
        console.error(error);
        toast.error("データの読み込みに失敗しました");
      } finally {
        setIsLoading(false);
      }
    };
    fetchTeamData();
  }, []);

  if (isLoading) return <div className="flex h-[60vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!team) return <div className="p-20 text-center text-muted-foreground">チームが選択されていません</div>;

  const canManage = team.myRole === 'ADMIN' || team.myRole === 'MANAGER' || team.isFounder;

  return (
    <div className="w-full animate-in fade-in duration-500">
      {/* 1. ヒーローセクション */}
      <div className="relative w-full aspect-[21/9] lg:aspect-[4/1] bg-muted overflow-hidden border-b border-border/50">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('/team-cover.webp')` }} />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* 2. プロフィールヘッダー */}
        <div className="relative -mt-16 sm:-mt-20 flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-6 mb-8 sm:mb-12">
          <Avatar className="h-28 w-28 sm:h-36 sm:w-36 border-4 border-background shadow-xl bg-white dark:bg-zinc-900">
            <AvatarFallback className="text-4xl sm:text-5xl font-black text-primary">
              {(team.orgName || team.name || "T").slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex flex-col flex-1 pb-1">
            <h2 className="text-sm sm:text-base font-black text-primary mb-1">
              {team.orgName || "所属組織なし"}
            </h2>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground leading-tight mb-3">
              {team.name || "チーム名未設定"}
            </h1>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] sm:text-xs font-bold bg-muted px-2.5 py-0.5 rounded-full uppercase text-muted-foreground">
                <Trophy className="inline h-3 w-3 mr-1" />
                {team.teamType || "TEAM"}
              </span>
              {team.year && <span className="text-[10px] sm:text-xs font-bold bg-muted px-2.5 py-0.5 rounded-full text-muted-foreground">{team.year}年設立</span>}
            </div>
          </div>
        </div>

        {/* 3. ダッシュボード（スケルトン表示） */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="p-6 rounded-3xl bg-background border border-border/50 shadow-sm">
              <h3 className="text-sm font-black flex items-center gap-2 mb-6 text-muted-foreground uppercase tracking-wider">
                <History className="h-4 w-4" /> 最近の試合結果
              </h3>
              {/* データがない時の「枠」表示 */}
              <div className="space-y-3 opacity-40">
                {[1, 2].map(i => (
                  <div key={i} className="h-16 w-full border border-dashed border-border rounded-xl flex items-center px-4 justify-between bg-muted/10">
                    <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-muted" /><div className="w-24 h-4 bg-muted rounded" /></div>
                    <div className="w-16 h-8 bg-muted rounded-lg" />
                  </div>
                ))}
                <p className="text-center text-[10px] font-bold text-muted-foreground pt-2">試合を記録するとここに自動表示されます</p>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-background border border-border/50 shadow-sm">
              <h3 className="text-sm font-black flex items-center gap-2 mb-6 text-muted-foreground uppercase tracking-wider">
                <BarChart3 className="h-4 w-4" /> チーム打撃成績
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 opacity-40">
                {['打率', '本塁打', '打点', '盗塁'].map(stat => (
                  <div key={stat} className="p-4 border border-dashed border-border rounded-2xl text-center">
                    <div className="text-[10px] font-bold text-muted-foreground">{stat}</div>
                    <div className="text-xl font-black mt-1">---</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-primary/5 border border-primary/20 shadow-sm group">
              <span className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-1 block">Roster</span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-4xl font-black text-primary">{memberCount}</span>
                <span className="text-xs font-bold text-primary/80">選手</span>
              </div>
            </div>

            {canManage && (
              <div className="p-6 rounded-3xl bg-background border border-border/50 shadow-sm space-y-4">
                <span className="text-xs font-black text-muted-foreground uppercase tracking-widest block mb-2">Management</span>
                <Button variant="outline" className="w-full justify-start rounded-xl font-bold h-12"><Users className="h-4 w-4 mr-2" />選手管理</Button>
                <Button variant="outline" className="w-full justify-start rounded-xl font-bold h-12"><Settings className="h-4 w-4 mr-2" />チーム設定</Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
