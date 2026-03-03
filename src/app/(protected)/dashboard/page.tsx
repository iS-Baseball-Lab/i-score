// src/app/(protected)/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { canEditScore, canManageTeam, ROLES } from "@/lib/roles";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Plus, History, Trophy, Calendar, ChevronRight, Loader2, Users, CheckCircle2, ClipboardList, Edit2, Trash2, Check, X, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Match {
  id: string; opponent: string; date: string;
  location: string | null; matchType: string; status: string; season: string;
  myScore: number; opponentScore: number;
}

interface Team {
  id: string; name: string; myRole: string; isFounder: boolean;
}

// 💡 取得するスタッツの型定義
interface PlayerStats {
  playerName: string; plateAppearances: number; atBats: number; hits: number;
  singles: number; doubles: number; triples: number; homeRuns: number;
  walks: number; strikeouts: number;
}

export default function DashboardPage() {
  const { data: session, isPending: isSessionLoading } = authClient.useSession();
  const userRole = (session?.user as any)?.role;

  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string>("");
  const [matches, setMatches] = useState<Match[]>([]);

  // 💡 スタッツ用のState
  const [stats, setStats] = useState<PlayerStats[]>([]);
  const [activeTab, setActiveTab] = useState<"matches" | "stats">("matches");

  const [isLoadingTeams, setIsLoadingTeams] = useState(true);
  const [isLoadingMatches, setIsLoadingMatches] = useState(false);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  const [isCreating, setIsCreating] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamRole, setNewTeamRole] = useState<string>(ROLES.SCORER);

  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [editTeamName, setEditTeamName] = useState("");

  const fetchTeams = async () => {
    setIsLoadingTeams(true);
    try {
      const res = await fetch('/api/teams');
      if (res.ok) {
        const data = await res.json() as Team[];
        setTeams(data);
        if (data.length > 0 && !selectedTeamId) setSelectedTeamId(data[0].id);
      }
    } catch (e) { console.error(e); }
    finally { setIsLoadingTeams(false); }
  };

  useEffect(() => { fetchTeams(); }, []);

  // 試合一覧とスタッツの取得
  useEffect(() => {
    if (!selectedTeamId) return;

    const fetchMatchesAndStats = async () => {
      setIsLoadingMatches(true);
      setIsLoadingStats(true);
      try {
        const [matchesRes, statsRes] = await Promise.all([
          fetch(`/api/matches?teamId=${selectedTeamId}`),
          fetch(`/api/teams/${selectedTeamId}/stats`) // 💡 スタッツ取得APIを呼ぶ
        ]);

        if (matchesRes.ok) setMatches(await matchesRes.json());
        if (statsRes.ok) setStats(await statsRes.json());
      } catch (e) { console.error(e); }
      finally {
        setIsLoadingMatches(false);
        setIsLoadingStats(false);
      }
    };
    fetchMatchesAndStats();
  }, [selectedTeamId]);

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim()) return;
    setIsCreating(true);
    try {
      const res = await fetch('/api/teams', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newTeamName, role: newTeamRole }),
      });
      if (res.ok) { setNewTeamName(""); await fetchTeams(); }
      else { alert("チームの作成に失敗しました"); }
    } catch (e) { console.error(e); }
    finally { setIsCreating(false); }
  };

  const startEditTeam = (team: Team) => { setEditingTeamId(team.id); setEditTeamName(team.name); };

  const handleUpdateTeam = async () => {
    if (!editTeamName.trim() || !editingTeamId) return;
    try {
      const res = await fetch(`/api/teams/${editingTeamId}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editTeamName })
      });
      if (res.ok) { setEditingTeamId(null); await fetchTeams(); }
      else alert('更新に失敗しました');
    } catch (e) { console.error(e); }
  };

  const handleDeleteTeam = async (targetTeamId: string) => {
    if (!confirm('⚠️ 本当にこのチームを削除しますか？\n（所属選手やこれまでの試合データがすべて完全に消去されます！）')) return;
    try {
      const res = await fetch(`/api/teams/${targetTeamId}`, { method: 'DELETE' });
      if (res.ok) { if (selectedTeamId === targetTeamId) setSelectedTeamId(""); await fetchTeams(); }
      else alert('削除に失敗しました');
    } catch (e) { console.error(e); }
  };

  if (isSessionLoading || isLoadingTeams) return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  const currentTeam = teams.find(t => t.id === selectedTeamId);
  const canEdit = currentTeam ? canEditScore(currentTeam.myRole) : false;

  const completedMatches = matches.filter(m => m.status === 'completed');
  const wins = completedMatches.filter(m => m.myScore > m.opponentScore).length;
  const losses = completedMatches.filter(m => m.myScore < m.opponentScore).length;
  const draws = completedMatches.filter(m => m.myScore === m.opponentScore).length;
  const winRate = completedMatches.length > 0 ? Math.round((wins / (wins + losses)) * 100) : 0;

  if (teams.length === 0) {
    return (
      <div className="container mx-auto max-w-xl px-4 py-12 animate-in fade-in duration-500">
        <div className="text-center mb-8">
          <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-2">ようこそ i-Score へ！</h1>
          <p className="text-muted-foreground">まずはあなたのチームを作成するか、招待をお待ちください。</p>
        </div>

        <Card className="border-primary/20 shadow-md">
          <CardHeader className="bg-muted/30 pb-4 border-b border-border/50">
            <CardTitle className="flex items-center gap-2"><Plus className="h-5 w-5 text-primary" /> チームを新規作成</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleCreateTeam} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-bold">チーム名</label>
                <input type="text" required placeholder="例: 川崎中央シニア" className="flex h-12 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" value={newTeamName} onChange={(e) => setNewTeamName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold">あなたの役割（ロール）</label>
                <Select className="flex h-12 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm focus-visible:ring-primary font-medium" value={newTeamRole} onChange={(e) => setNewTeamRole(e.target.value)}>
                  <option value={ROLES.MANAGER}>監督 / 代表 (Manager)</option>
                  <option value={ROLES.COACH}>コーチ (Coach)</option>
                  <option value={ROLES.SCORER}>スコアラー (Scorer)</option>
                  <option value={ROLES.STAFF}>スタッフ (Staff)</option>
                </Select>
              </div>
              <Button type="submit" className="w-full h-12 text-base font-bold rounded-xl mt-4" disabled={isCreating}>
                {isCreating ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "チームを作成して始める"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-muted/30 p-4 sm:p-6 rounded-2xl border border-border/50">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">ダッシュボード</h1>
          <p className="text-sm text-muted-foreground font-medium mt-1">現在の権限: <span className="text-primary font-bold">{currentTeam?.myRole}</span></p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-muted-foreground hidden sm:inline">対象チーム:</span>
          <Select className="flex h-11 w-full sm:w-64 rounded-xl border border-input bg-background px-4 text-sm font-bold shadow-sm" value={selectedTeamId} onChange={(e) => setSelectedTeamId(e.target.value)}>
            {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </Select>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {canEdit && (
          <Link href={`/matches/new?teamId=${selectedTeamId}`} className="block outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-2xl">
            <Card className="relative overflow-hidden group rounded-2xl border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background shadow-sm transition-all hover:shadow-md hover:border-primary/40 active:scale-[0.98] cursor-pointer h-full">
              <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              <div className="relative z-10">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl flex items-center gap-3 text-primary">
                    <div className="p-2 bg-primary/10 rounded-full"><Plus className="h-5 w-5" /></div>新しい試合を記録
                  </CardTitle>
                  <CardDescription className="text-sm font-medium">スコアブックの入力を開始します</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center w-full rounded-xl h-12 text-base font-bold shadow-sm bg-primary text-primary-foreground group-hover:bg-primary/90 transition-colors">
                    試合作成へ進む <ChevronRight className="ml-2 h-5 w-5" />
                  </div>
                </CardContent>
              </div>
            </Card>
          </Link>
        )}

        <Card className="border-border/50 shadow-sm bg-gradient-to-br from-slate-900 to-slate-950 text-white overflow-hidden relative md:col-span-2">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-primary/20 blur-3xl rounded-full pointer-events-none"></div>
          <CardContent className="p-6 sm:p-8 relative z-10 h-full flex flex-col justify-center">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
              <div className="space-y-2 w-full sm:w-auto">
                <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-extrabold bg-primary/20 text-primary uppercase tracking-wider">2026 Season</span>
                {editingTeamId === currentTeam?.id ? (
                  <div className="flex items-center gap-2 mt-2 animate-in fade-in zoom-in duration-200">
                    <input type="text" value={editTeamName} onChange={(e) => setEditTeamName(e.target.value)} className="bg-slate-900/50 border border-white/20 rounded-lg px-3 py-1 text-2xl sm:text-3xl font-black w-full outline-none focus:border-primary text-white" autoFocus />
                    <Button size="icon" className="bg-green-500 hover:bg-green-600 text-white shrink-0 rounded-lg" onClick={handleUpdateTeam}><Check className="h-5 w-5" /></Button>
                    <Button size="icon" variant="ghost" className="shrink-0 text-white hover:bg-white/10 rounded-lg" onClick={() => setEditingTeamId(null)}><X className="h-5 w-5" /></Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 group mt-2">
                    <h2 className="text-3xl sm:text-4xl font-black tracking-tight">{currentTeam?.name}</h2>
                    {(canManageTeam(currentTeam?.myRole) || userRole === ROLES.ADMIN) && (
                      <div className="flex gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                        <Button size="icon-sm" variant="ghost" className="h-8 w-8 text-white/50 hover:text-white hover:bg-white/10 rounded-full" onClick={() => currentTeam && startEditTeam(currentTeam)}><Edit2 className="h-4 w-4" /></Button>
                        <Button size="icon-sm" variant="ghost" className="h-8 w-8 text-white/50 hover:text-red-400 hover:bg-red-400/10 rounded-full" onClick={() => currentTeam && handleDeleteTeam(currentTeam.id)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    )}
                  </div>
                )}
                <div className="pt-2">
                  <Button asChild variant="secondary" size="sm" className="rounded-xl font-bold bg-white/10 hover:bg-white/20 text-white border-0 backdrop-blur-sm">
                    <Link href={`/teams/roster?id=${currentTeam?.id}`}><Users className="h-4 w-4 mr-2" />選手名簿の管理</Link>
                  </Button>
                </div>
              </div>
              <div className="flex items-center gap-4 bg-slate-950/50 p-4 rounded-2xl border border-white/10 shadow-inner w-full sm:w-auto mt-4 sm:mt-0">
                <div className="text-center px-2"><div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Wins</div><div className="text-3xl font-black text-primary">{wins}</div></div>
                <div className="w-px h-10 bg-white/10"></div>
                <div className="text-center px-2"><div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Losses</div><div className="text-3xl font-black text-slate-300">{losses}</div></div>
                {draws > 0 && <><div className="w-px h-10 bg-white/10"></div><div className="text-center px-2"><div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Draws</div><div className="text-3xl font-black text-slate-400">{draws}</div></div></>}
                <div className="w-px h-10 bg-white/10"></div>
                <div className="text-center px-2"><div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Win %</div><div className="text-3xl font-black text-white">{winRate}<span className="text-sm ml-0.5 text-slate-400">%</span></div></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 💡 タブ切り替えUI（試合一覧 vs 成績表） */}
      <div className="flex bg-muted/30 p-1.5 rounded-xl border border-border shadow-inner max-w-sm">
        <button onClick={() => setActiveTab("matches")} className={cn("flex-1 py-2.5 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2", activeTab === "matches" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}>
          <History className="h-4 w-4" /> 試合結果
        </button>
        <button onClick={() => setActiveTab("stats")} className={cn("flex-1 py-2.5 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2", activeTab === "stats" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}>
          <BarChart3 className="h-4 w-4" /> 個人成績
        </button>
      </div>

      <div className="space-y-6">
        {activeTab === "matches" ? (
          <>
            <h2 className="text-xl font-extrabold flex items-center gap-2 tracking-tight">
              <History className="h-5 w-5 text-primary" /> 最近の試合
            </h2>
            {isLoadingMatches ? (
              <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
            ) : matches.length === 0 ? (
              <div className="text-center py-12 bg-muted/30 rounded-2xl border border-dashed border-border"><p className="text-muted-foreground font-medium mb-4">まだ試合の記録がありません。</p></div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {matches.map((match) => (
                  <Card key={match.id} className="rounded-2xl border-border bg-background shadow-sm transition-all duration-200 hover:shadow-md hover:border-primary/30 overflow-hidden relative">
                    <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${match.status === 'scheduled' ? 'bg-slate-300' : 'bg-blue-500'}`} />
                    <CardContent className="p-5 sm:p-6 pl-6 sm:pl-8">
                      <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground font-bold">
                          <Calendar className="h-3.5 w-3.5" />{new Date(match.date).toLocaleDateString('ja-JP')}
                        </div>
                        <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-extrabold ring-1 ring-inset bg-blue-50 text-blue-700 ring-blue-600/20">
                          {match.status === 'completed' ? '試合終了' : '進行中'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between bg-muted/30 rounded-xl p-4">
                        <div className="text-base font-extrabold w-1/3 text-center truncate">{currentTeam?.name}</div>
                        <div className="flex items-center justify-center gap-4 w-1/3">
                          <div className="text-3xl font-black">{match.myScore || 0}</div>
                          <div className="text-muted-foreground font-bold">-</div>
                          <div className="text-3xl font-black">{match.opponentScore || 0}</div>
                        </div>
                        <div className="text-base font-bold text-muted-foreground w-1/3 text-center truncate">{match.opponent}</div>
                      </div>
                      <div className="flex gap-2 mt-4 pt-4 border-t border-border/50 justify-end">
                        <Button asChild variant="outline" size="sm" className="rounded-lg font-bold shadow-sm">
                          <Link href={`/matches/lineup?id=${match.id}&teamId=${currentTeam?.id}`}><ClipboardList className="h-4 w-4 mr-1.5" />スタメン</Link>
                        </Button>
                        <Button asChild size="sm" className="rounded-lg font-bold bg-primary text-primary-foreground shadow-sm">
                          <Link href={`/matches/score?id=${match.id}`}>スコア入力</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        ) : (
          /* 💡 ここからが新機能：成績テーブルの表示 */
          <div className="animate-in fade-in duration-300">
            <h2 className="text-xl font-extrabold flex items-center gap-2 tracking-tight mb-4">
              <BarChart3 className="h-5 w-5 text-primary" /> 個人打撃成績
            </h2>
            <Card className="rounded-2xl border-border bg-background shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left whitespace-nowrap">
                  <thead className="bg-muted/30 text-muted-foreground text-[11px] font-bold uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3 sticky left-0 bg-muted/90 backdrop-blur-sm z-10 shadow-[1px_0_0_rgba(0,0,0,0.1)] dark:shadow-[1px_0_0_rgba(255,255,255,0.1)]">選手名</th>
                      <th className="px-4 py-3 text-center text-primary font-black">打率(AVG)</th>
                      <th className="px-4 py-3 text-center">出塁率(OBP)</th>
                      <th className="px-4 py-3 text-center">OPS</th>
                      <th className="px-4 py-3 text-center">試合(打席)</th>
                      <th className="px-4 py-3 text-center">打数</th>
                      <th className="px-4 py-3 text-center">安打</th>
                      <th className="px-4 py-3 text-center">本塁打</th>
                      <th className="px-4 py-3 text-center">四死球</th>
                      <th className="px-4 py-3 text-center">三振</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {isLoadingStats ? (
                      <tr><td colSpan={10} className="text-center py-8"><Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" /></td></tr>
                    ) : stats.length === 0 ? (
                      <tr><td colSpan={10} className="text-center py-8 text-muted-foreground">完了した試合のデータがありません</td></tr>
                    ) : (
                      stats.map((s, i) => {
                        // 💡 打率、出塁率、長打率、OPSの計算
                        const avg = s.atBats > 0 ? s.hits / s.atBats : 0;
                        const obp = s.plateAppearances > 0 ? (s.hits + s.walks) / s.plateAppearances : 0;
                        const tb = s.singles + (s.doubles * 2) + (s.triples * 3) + (s.homeRuns * 4); // 塁打数
                        const slg = s.atBats > 0 ? tb / s.atBats : 0; // 長打率
                        const ops = obp + slg;

                        return (
                          <tr key={i} className="hover:bg-muted/20 transition-colors">
                            <td className="px-4 py-3 font-bold sticky left-0 bg-background z-10 shadow-[1px_0_0_rgba(0,0,0,0.05)] dark:shadow-[1px_0_0_rgba(255,255,255,0.05)]">{s.playerName}</td>
                            <td className="px-4 py-3 text-center font-black text-primary">{avg.toFixed(3).replace(/^0/, '')}</td>
                            <td className="px-4 py-3 text-center text-muted-foreground font-medium">{obp.toFixed(3).replace(/^0/, '')}</td>
                            <td className="px-4 py-3 text-center font-bold">{ops.toFixed(3).replace(/^0/, '')}</td>
                            <td className="px-4 py-3 text-center text-muted-foreground">{s.plateAppearances}</td>
                            <td className="px-4 py-3 text-center text-muted-foreground">{s.atBats}</td>
                            <td className="px-4 py-3 text-center font-bold">{s.hits}</td>
                            <td className="px-4 py-3 text-center font-bold text-orange-500">{s.homeRuns}</td>
                            <td className="px-4 py-3 text-center text-green-600">{s.walks}</td>
                            <td className="px-4 py-3 text-center text-red-500">{s.strikeouts}</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}