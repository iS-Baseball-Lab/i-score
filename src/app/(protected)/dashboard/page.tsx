// src/app/(protected)/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { canEditScore, canManageTeam, ROLES } from "@/lib/roles";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Plus, History, ChevronRight, Loader2, Users, Edit2, Trash2, Check, X, BarChart3, Activity, Map, Building2 } from "lucide-react";
import { FaBaseballBatBall } from "react-icons/fa6";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

import {
  Match, Team, PlayerStats, PitcherStats, SprayData,
  RecentMatches, BatterStatsTable, PitcherStatsTable, SprayChartArea
} from "@/components/dashboard/tab-views";

export default function DashboardPage() {
  const { data: session, isPending: isSessionLoading } = authClient.useSession();
  const userRole = (session?.user as any)?.role;

  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string>("");
  const [matches, setMatches] = useState<Match[]>([]);

  const [batterStats, setBatterStats] = useState<PlayerStats[]>([]);
  const [pitcherStats, setPitcherStats] = useState<PitcherStats[]>([]);
  const [sprayData, setSprayData] = useState<SprayData[]>([]);

  const [activeTab, setActiveTab] = useState<"matches" | "batterStats" | "pitcherStats" | "sprayChart">("matches");

  const [isLoadingTeams, setIsLoadingTeams] = useState(true);
  const [isLoadingData, setIsLoadingData] = useState(false);

  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [editTeamName, setEditTeamName] = useState("");

  const handleTeamChange = (newTeamId: string) => {
    setSelectedTeamId(newTeamId);
    localStorage.setItem("iScore_selectedTeamId", newTeamId);
  };

  const fetchTeams = async () => {
    setIsLoadingTeams(true);
    try {
      const res = await fetch('/api/teams');
      if (res.ok) {
        const data = await res.json() as Team[];
        setTeams(data);

        const savedTeamId = localStorage.getItem("iScore_selectedTeamId");
        const isValidSavedTeam = data.some(t => t.id === savedTeamId);

        if (isValidSavedTeam && savedTeamId) {
          setSelectedTeamId(savedTeamId);
        } else if (data.length > 0) {
          setSelectedTeamId(data[0].id);
          localStorage.setItem("iScore_selectedTeamId", data[0].id);
        }
      }
    } catch (e) { console.error(e); }
    finally { setIsLoadingTeams(false); }
  };

  const fetchMatchesAndStats = async () => {
    if (!selectedTeamId) return;
    setIsLoadingData(true);
    try {
      const [matchesRes, bStatsRes, pStatsRes, sprayRes] = await Promise.all([
        fetch(`/api/matches?teamId=${selectedTeamId}`),
        fetch(`/api/teams/${selectedTeamId}/stats`),
        fetch(`/api/teams/${selectedTeamId}/pitcher-stats`),
        fetch(`/api/teams/${selectedTeamId}/spray-chart`)
      ]);

      if (matchesRes.ok) setMatches(await matchesRes.json());
      if (bStatsRes.ok) setBatterStats(await bStatsRes.json());
      if (pStatsRes.ok) setPitcherStats(await pStatsRes.json());
      if (sprayRes.ok) setSprayData(await sprayRes.json());
    } catch (e) { console.error(e); }
    finally { setIsLoadingData(false); }
  };

  useEffect(() => { fetchTeams(); }, []);
  useEffect(() => { fetchMatchesAndStats(); }, [selectedTeamId]);

  const handleDeleteMatch = async (matchId: string) => {
    if (!confirm('⚠️ 本当にこの試合を削除しますか？\n（入力したスコアや個人の成績データもすべて完全に消去され、元に戻せません！）')) return;
    try {
      const res = await fetch(`/api/matches/${matchId}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success("試合を削除しました");
        await fetchMatchesAndStats();
      } else toast.error('試合の削除に失敗しました');
    } catch (e) { console.error(e); }
  };

  const startEditTeam = (team: Team) => { setEditingTeamId(team.id); setEditTeamName(team.name); };

  const handleUpdateTeam = async () => {
    if (!editTeamName.trim() || !editingTeamId) return;
    try {
      const res = await fetch(`/api/teams/${editingTeamId}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editTeamName })
      });
      if (res.ok) {
        setEditingTeamId(null);
        toast.success("チーム名を更新しました");
        await fetchTeams();
      } else toast.error('更新に失敗しました');
    } catch (e) { console.error(e); }
  };

  const handleDeleteTeam = async (targetTeamId: string) => {
    if (!confirm('⚠️ 本当にこのチームを削除しますか？\n（所属選手やこれまでの試合データがすべて完全に消去されます！）')) return;
    try {
      const res = await fetch(`/api/teams/${targetTeamId}`, { method: 'DELETE' });
      if (res.ok) {
        if (selectedTeamId === targetTeamId) setSelectedTeamId("");
        toast.success("チームを削除しました");
        await fetchTeams();
      } else toast.error('削除に失敗しました');
    } catch (e) { console.error(e); }
  };

  const handleExportCSV = (type: "batter" | "pitcher") => {
    let csvContent = "\uFEFF";
    let filename = "";

    if (type === "batter") {
      filename = `打撃成績_${currentTeam?.name || "team"}_${new Date().toLocaleDateString('ja-JP').replace(/\//g, '')}.csv`;
      csvContent += "選手名,打率(AVG),出塁率(OBP),OPS,試合(打席),打数,安打,本塁打,四死球,三振\n";

      batterStats.forEach(s => {
        const avg = s.atBats > 0 ? (s.hits / s.atBats).toFixed(3) : "0.000";
        const obp = s.plateAppearances > 0 ? ((s.hits + s.walks) / s.plateAppearances).toFixed(3) : "0.000";
        const tb = s.singles + (s.doubles * 2) + (s.triples * 3) + (s.homeRuns * 4);
        const slg = s.atBats > 0 ? (tb / s.atBats).toFixed(3) : "0.000";
        const ops = (parseFloat(obp) + parseFloat(slg)).toFixed(3);

        csvContent += `${s.playerName},${avg},${obp},${ops},${s.plateAppearances},${s.atBats},${s.hits},${s.homeRuns},${s.walks},${s.strikeouts}\n`;
      });
    } else {
      filename = `投手成績_${currentTeam?.name || "team"}_${new Date().toLocaleDateString('ja-JP').replace(/\//g, '')}.csv`;
      csvContent += "選手名,投球回,奪三振,与四死球,被安打,対打者\n";

      pitcherStats.forEach(s => {
        const fullInnings = Math.floor(s.outs / 3);
        const remainingOuts = s.outs % 3;
        const ip = remainingOuts > 0 ? `${fullInnings} ${remainingOuts}/3` : `${fullInnings}`;
        csvContent += `${s.playerName},${ip},${s.strikeouts},${s.walks},${s.hitsAllowed},${s.battersFaced}\n`;
      });
    }

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`${type === 'batter' ? '打撃' : '投手'}成績をダウンロードしました！`);
  };

  if (isSessionLoading || isLoadingTeams) {
    return (
      <div className="container mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-6 rounded-[24px] border border-border/50">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-12 w-full sm:w-64 rounded-xl" />
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-48 rounded-[32px]" />
          <Skeleton className="h-48 rounded-[32px] md:col-span-2" />
        </div>

        <Skeleton className="h-14 w-full max-w-2xl rounded-2xl" />

        <div className="space-y-4">
          <Skeleton className="h-8 w-40" />
          <div className="grid gap-4 md:grid-cols-2">
            <Skeleton className="h-56 rounded-[24px]" />
            <Skeleton className="h-56 rounded-[24px]" />
          </div>
        </div>
      </div>
    );
  }

  const currentTeam = teams.find(t => t.id === selectedTeamId);
  const canEdit = currentTeam ? canEditScore(currentTeam.myRole) : false;

  const completedMatches = matches.filter(m => m.status === 'completed');
  const wins = completedMatches.filter(m => m.myScore > m.opponentScore).length;
  const losses = completedMatches.filter(m => m.myScore < m.opponentScore).length;
  const draws = completedMatches.filter(m => m.myScore === m.opponentScore).length;
  const winRate = completedMatches.length > 0 ? Math.round((wins / (wins + losses)) * 100) : 0;

  // 💡 究極UI: チームが0件の場合の洗練されたウェルカム画面（SaaS風）
  if (teams.length === 0) {
    return (
      <div className="container mx-auto max-w-xl px-4 py-20 animate-in slide-in-from-bottom-4 fade-in duration-500">
        <div className="text-center mb-10">
          <div className="h-28 w-28 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner border border-blue-500/20 relative">
            <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl animate-pulse" />
            <Building2 className="h-14 w-14 text-blue-600 relative z-10" />
          </div>
          <h1 className="text-4xl font-black tracking-tight mb-4 drop-shadow-sm">ようこそ i-Score へ！</h1>
          <p className="text-muted-foreground font-extrabold text-lg">まずはあなたの「クラブ」と「チーム」を立ち上げましょう。</p>
        </div>

        <Card className="rounded-[32px] border-border/40 shadow-[0_8px_30px_rgba(0,0,0,0.08)] bg-background/60 backdrop-blur-2xl overflow-hidden text-center p-8 sm:p-12 relative group">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-400 to-blue-600" />

          <p className="text-sm font-bold text-muted-foreground mb-8">
            クラブ管理画面から、新しいクラブを作成し、その中に1軍やジュニアチームを追加できます。
          </p>

          <Button asChild className="h-16 px-10 text-lg font-black rounded-[24px] shadow-xl shadow-blue-500/20 bg-blue-600 hover:bg-blue-700 text-white transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl active:scale-[0.96]">
            <Link href="/teams">クラブ・チーム管理へ進む <ChevronRight className="ml-2 h-6 w-6 transition-transform group-hover:translate-x-1" /></Link>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 animate-in fade-in duration-500 pb-24">
      {/* ヘッダー */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-background/60 backdrop-blur-xl p-4 sm:p-6 rounded-[24px] border border-border/50 shadow-sm">
        <div>
          <h1 className="text-2xl font-black tracking-tight">ダッシュボード</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider">現在の権限</span>
            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-black border border-primary/20">{currentTeam?.myRole}</span>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* 💡 先ほど究極化した Select をそのまま利用 */}
          <Select
            value={selectedTeamId}
            onChange={(e) => handleTeamChange(e.target.value)}
            className="w-full sm:w-64"
          >
            {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </Select>
        </div>
      </div>

      {/* ヒーローセクション */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {canEdit && (
          <Link href={`/matches/new?teamId=${selectedTeamId}`} className="block outline-none rounded-[32px]">
            <Card className="relative overflow-hidden group rounded-[32px] border-primary/30 bg-primary/5 shadow-xs transition-all duration-300 hover:shadow-md hover:border-primary/50 hover:-translate-y-1 cursor-pointer h-full">
              <div className="relative z-10 flex flex-col h-full justify-between">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl flex items-center gap-3 text-primary font-black">
                    <div className="p-2.5 bg-primary/20 rounded-2xl"><FaBaseballBatBall className="h-6 w-6" /></div>
                    新しい試合を記録
                  </CardTitle>
                  <CardDescription className="text-sm font-bold mt-2 text-primary/70">スコアブックの入力を開始します</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center w-full rounded-2xl h-14 text-base font-black shadow-sm bg-primary text-primary-foreground group-hover:bg-primary/90 transition-colors">
                    試合作成へ進む <ChevronRight className="ml-2 h-5 w-5" />
                  </div>
                </CardContent>
              </div>
            </Card>
          </Link>
        )}

        <Card className="rounded-[32px] border-border/20 shadow-lg bg-gradient-to-br from-slate-900 via-slate-900 to-black text-white overflow-hidden relative md:col-span-2">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-primary/30 blur-[60px] rounded-full pointer-events-none"></div>
          <CardContent className="p-6 sm:p-8 relative z-10 h-full flex flex-col justify-center">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
              <div className="space-y-3 w-full sm:w-auto">
                <span className="inline-flex items-center rounded-full px-3 py-1 text-[10px] font-black bg-primary/20 text-primary uppercase tracking-[0.2em] border border-primary/20">2026 Season</span>

                {editingTeamId === currentTeam?.id ? (
                  <div className="flex items-center gap-2 mt-2 animate-in fade-in zoom-in duration-200">
                    <input type="text" value={editTeamName} onChange={(e) => setEditTeamName(e.target.value)} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-4 py-2 text-2xl sm:text-3xl font-black w-full outline-none focus:border-primary text-white shadow-inner" autoFocus />
                    <Button size="icon" className="h-12 w-12 bg-green-500 hover:bg-green-600 text-white shrink-0 rounded-2xl shadow-md" onClick={handleUpdateTeam}><Check className="h-6 w-6" /></Button>
                    <Button size="icon" variant="ghost" className="h-12 w-12 shrink-0 text-white hover:bg-white/10 rounded-2xl" onClick={() => setEditingTeamId(null)}><X className="h-6 w-6" /></Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 group mt-2">
                    <h2 className="text-3xl sm:text-4xl font-black tracking-tight drop-shadow-sm">{currentTeam?.name}</h2>
                    {(canManageTeam(currentTeam?.myRole) || userRole === ROLES.ADMIN) && (
                      <div className="flex gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                        <Button size="icon-sm" variant="ghost" className="h-9 w-9 text-white/50 hover:text-white hover:bg-white/10 rounded-xl" onClick={() => currentTeam && startEditTeam(currentTeam)}><Edit2 className="h-4 w-4" /></Button>
                        <Button size="icon-sm" variant="ghost" className="h-9 w-9 text-white/50 hover:text-red-400 hover:bg-red-400/20 rounded-xl" onClick={() => currentTeam && handleDeleteTeam(currentTeam.id)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    )}
                  </div>
                )}

                <div className="pt-2">
                  <Button asChild variant="secondary" size="sm" className="rounded-[14px] font-extrabold bg-white/10 hover:bg-white/20 text-white border border-white/10 backdrop-blur-md h-10 px-4">
                    <Link href={`/teams/roster?id=${currentTeam?.id}`}><Users className="h-4 w-4 mr-2 opacity-80" /> 選手名簿の管理</Link>
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 bg-white/5 backdrop-blur-xl p-4 sm:px-6 sm:py-5 rounded-[24px] border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.12)] w-full sm:w-auto">
                <div className="text-center">
                  <div className="text-[9px] font-black text-white/50 uppercase tracking-widest mb-1">Wins</div>
                  <div className="text-3xl sm:text-4xl font-black text-primary drop-shadow-sm leading-none">{wins}</div>
                </div>
                <div className="w-px h-12 bg-white/10 rounded-full" />
                <div className="text-center">
                  <div className="text-[9px] font-black text-white/50 uppercase tracking-widest mb-1">Losses</div>
                  <div className="text-3xl sm:text-4xl font-black text-white/80 leading-none">{losses}</div>
                </div>
                {draws > 0 && (
                  <>
                    <div className="w-px h-12 bg-white/10 rounded-full" />
                    <div className="text-center">
                      <div className="text-[9px] font-black text-white/50 uppercase tracking-widest mb-1">Draws</div>
                      <div className="text-3xl sm:text-4xl font-black text-white/60 leading-none">{draws}</div>
                    </div>
                  </>
                )}
                <div className="w-px h-12 bg-white/10 rounded-full" />
                <div className="text-center">
                  <div className="text-[9px] font-black text-white/50 uppercase tracking-widest mb-1">Win %</div>
                  <div className="text-3xl sm:text-4xl font-black text-white drop-shadow-sm leading-none">{winRate}<span className="text-base ml-0.5 text-white/50">%</span></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* セグメントタブ */}
      <div className="flex bg-muted/30 p-1.5 rounded-[20px] border border-border/50 max-w-3xl overflow-x-auto scrollbar-hide shadow-inner">
        <button onClick={() => setActiveTab("matches")} className={cn("flex-1 min-w-[110px] py-3 text-sm font-extrabold rounded-[14px] transition-all duration-200 flex items-center justify-center gap-2", activeTab === "matches" ? "bg-background shadow-xs text-primary border border-border/50" : "text-muted-foreground hover:text-foreground active:scale-95")}>
          <History className="h-4 w-4" /> <span className="hidden sm:inline">試合</span>結果
        </button>
        <button onClick={() => setActiveTab("batterStats")} className={cn("flex-1 min-w-[110px] py-3 text-sm font-extrabold rounded-[14px] transition-all duration-200 flex items-center justify-center gap-2", activeTab === "batterStats" ? "bg-background shadow-xs text-primary border border-border/50" : "text-muted-foreground hover:text-foreground active:scale-95")}>
          <BarChart3 className="h-4 w-4" /> 打撃<span className="hidden sm:inline">成績</span>
        </button>
        <button onClick={() => setActiveTab("pitcherStats")} className={cn("flex-1 min-w-[110px] py-3 text-sm font-extrabold rounded-[14px] transition-all duration-200 flex items-center justify-center gap-2", activeTab === "pitcherStats" ? "bg-background shadow-xs text-primary border border-border/50" : "text-muted-foreground hover:text-foreground active:scale-95")}>
          <Activity className="h-4 w-4" /> 投手<span className="hidden sm:inline">成績</span>
        </button>
        <button onClick={() => setActiveTab("sprayChart")} className={cn("flex-1 min-w-[130px] py-3 text-sm font-extrabold rounded-[14px] transition-all duration-200 flex items-center justify-center gap-2", activeTab === "sprayChart" ? "bg-background shadow-xs text-primary border border-border/50" : "text-muted-foreground hover:text-foreground active:scale-95")}>
          <Map className="h-4 w-4" /> <span className="hidden sm:inline">スプレー</span>チャート
        </button>
      </div>

      {/* タブコンテンツ */}
      <div className="space-y-6">
        {activeTab === "matches" && (
          <RecentMatches matches={matches} isLoadingData={isLoadingData} currentTeam={currentTeam} canEdit={canEdit} onDeleteMatch={handleDeleteMatch} />
        )}
        {activeTab === "batterStats" && (
          <BatterStatsTable stats={batterStats} isLoadingData={isLoadingData} onExportCSV={() => handleExportCSV('batter')} />
        )}
        {activeTab === "pitcherStats" && (
          <PitcherStatsTable stats={pitcherStats} isLoadingData={isLoadingData} onExportCSV={() => handleExportCSV('pitcher')} />
        )}
        {activeTab === "sprayChart" && (
          <SprayChartArea sprayData={sprayData} />
        )}
      </div>

    </div>
  );
}