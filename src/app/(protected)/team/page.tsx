// src/app/team/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { Users, MapPin, Calendar, Shield, Trophy, Loader2, Camera, Activity, Info, Crown, Settings } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

// 💡 バックエンドのレスポンスに合わせた型定義
interface Team {
  id: string;
  name: string;
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
        // 1. ローカルストレージから「現在選択中のチームID」を取得
        const activeTeamId = localStorage.getItem("iScore_selectedTeamId");

        if (!activeTeamId) {
          setIsLoading(false);
          return;
        }

        // 2. 所属チーム一覧を取得し、現在のチーム情報を特定する
        const teamsResponse = await fetch("/api/teams");
        if (!teamsResponse.ok) throw new Error("チーム情報の取得に失敗しました");

        const teamsData: Team[] = await teamsResponse.json();
        const currentTeam = teamsData.find(t => t.id === activeTeamId);

        if (currentTeam) {
          setTeam(currentTeam);

          // 3. チームの所属選手を取得して人数（メンバーカウント）を計算
          const playersResponse = await fetch(`/api/teams/${activeTeamId}/players`);
          if (playersResponse.ok) {
            const playersData = await playersResponse.json() as any[];;
            // 配列の長さをメンバー数としてセット
            setMemberCount(playersData.length || 0);
          }
        } else {
          // 選択中のチームIDが所属一覧にない場合（削除された等）
          localStorage.removeItem("iScore_selectedTeamId");
        }

      } catch (error) {
        console.error("Team fetch error:", error);
        toast.error("チームデータの読み込みに失敗しました");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeamData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // チームが存在しない場合のエンプティステート
  if (!team) {
    return (
      <div className="flex flex-col h-[60vh] items-center justify-center space-y-4 px-4 text-center">
        <Shield className="h-16 w-16 text-muted-foreground opacity-20" />
        <h2 className="text-2xl font-black text-foreground">チームが選択されていません</h2>
        <p className="text-muted-foreground font-medium max-w-md">
          現在選択されているチームがありません。右上のメニューからチームを選択するか、新しいチームを作成・検索してください。
        </p>
      </div>
    );
  }

  // 権限チェック（監督・管理者か）
  const canManage = team.myRole === 'ADMIN' || team.myRole === 'MANAGER' || team.isFounder;

  return (
    <div className="w-full animate-in fade-in duration-500">

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          1. ヒーローセクション（カバー画像）
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="relative w-full aspect-[21/9] lg:aspect-[4/1] bg-muted overflow-hidden sm:rounded-b-3xl shadow-sm">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/80 via-primary/40 to-background opacity-80" />

        {/* ※ 将来的にチーム毎のカバー画像をDBに持たせるまではデフォルト画像 */}
        <div
          className="absolute inset-0 bg-cover bg-center mix-blend-overlay opacity-40"
          style={{ backgroundImage: `url('/team-cover.jpg')` }}
        />

        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            2. プロフィールヘッダー
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <div className="relative -mt-16 sm:-mt-20 flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-6 mb-8 sm:mb-12">

          <div className="relative group shrink-0 self-start sm:self-auto">
            <Avatar className="h-28 w-28 sm:h-36 sm:w-36 border-4 border-background shadow-xl bg-white dark:bg-zinc-900">
              <AvatarImage src="" className="object-contain p-2" />
              <AvatarFallback className="text-4xl sm:text-5xl font-black text-primary bg-primary/5">
                {team.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {canManage && (
              <button className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 p-2.5 sm:p-3 bg-primary text-primary-foreground rounded-full shadow-lg hover:scale-110 active:scale-95 transition-transform border-2 border-background cursor-pointer">
                <Camera className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            )}
          </div>

          <div className="flex flex-col flex-1 pb-1 sm:pb-3">
            <div className="flex flex-wrap items-center gap-2 mb-1.5 sm:mb-2">
              <span className="flex items-center text-muted-foreground text-[10px] sm:text-xs font-bold bg-muted px-2.5 py-0.5 rounded-full uppercase">
                <Trophy className="h-3 w-3 mr-1" />
                {team.teamType === 'regular' ? '一般チーム' : team.teamType || 'Team'}
              </span>
              {team.year && (
                <span className="flex items-center text-muted-foreground text-[10px] sm:text-xs font-bold bg-muted px-2.5 py-0.5 rounded-full">
                  <Calendar className="h-3 w-3 mr-1" />
                  Est. {team.year}
                </span>
              )}
              {team.isFounder && (
                <span className="flex items-center text-amber-600 dark:text-amber-400 text-[10px] sm:text-xs font-bold bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full">
                  <Crown className="h-3 w-3 mr-1" />
                  創設者
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground leading-tight">
              {team.name}
            </h1>

            {team.tier && (
              <p className="text-sm font-bold text-muted-foreground mt-1 flex items-center gap-1.5">
                <Shield className="h-4 w-4" />
                Tier: {team.tier}
              </p>
            )}
          </div>
        </div>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            3. データパネル（2カラム構成）
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">

          {/* 左側: メイン情報エリア (2カラム分) */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            <div className="p-5 sm:p-8 rounded-3xl bg-background border border-border/50 shadow-sm">
              <h2 className="text-lg font-black flex items-center gap-2 mb-6">
                <Info className="h-5 w-5 text-primary" />
                チームダッシュボード
              </h2>
              <div className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-border/50 rounded-2xl bg-muted/20 gap-2">
                <Activity className="h-8 w-8 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground font-bold text-sm text-center">
                  ここに最近の試合結果や<br />チーム内打率ランキングが表示されます
                </p>
              </div>
            </div>
          </div>

          {/* 右側: ステータスエリア (1カラム分) */}
          <div className="space-y-4 sm:space-y-6">

            {/* 本物のメンバーカウント！ */}
            <div className="p-5 sm:p-6 rounded-3xl bg-primary/5 border border-primary/20 shadow-sm relative overflow-hidden group">
              <Users className="absolute -right-2 -bottom-2 h-20 w-20 text-primary/10 group-hover:scale-110 transition-transform duration-500" />
              <span className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-1 relative z-10">Roster</span>
              <div className="flex items-baseline gap-1.5 relative z-10 mt-1">
                <span className="text-4xl font-black text-primary tracking-tighter">
                  {memberCount}
                </span>
                <span className="text-xs font-bold text-primary/80">選手</span>
              </div>
            </div>

            {/* 管理者用メニュー */}
            {canManage && (
              <div className="p-5 sm:p-6 rounded-3xl bg-background border border-border/50 shadow-sm">
                <span className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-4 block">Management</span>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start rounded-xl h-12 font-bold border-border/50 hover:bg-primary/5 hover:text-primary hover:border-primary/30 transition-colors">
                    <Users className="h-4 w-4 mr-2" />
                    選手・メンバー管理
                  </Button>
                  <Button variant="outline" className="w-full justify-start rounded-xl h-12 font-bold border-border/50 hover:bg-primary/5 hover:text-primary hover:border-primary/30 transition-colors">
                    <Settings className="h-4 w-4 mr-2" />
                    チーム設定の編集
                  </Button>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}