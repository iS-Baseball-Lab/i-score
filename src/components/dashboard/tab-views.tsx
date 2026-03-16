// src/components/dashboard/tab-views.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Trash2, ClipboardList, History, BarChart3, Download, Activity, Map, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

// --- Types (page.tsxから移動) ---
export interface Match {
  id: string; opponent: string; date: string;
  location: string | null; matchType: string; status: string; season: string;
  myScore: number; opponentScore: number;
}

export interface Team {
  id: string;
  name: string;
  myRole: string;
  isFounder: boolean;
  year?: number;
  tier?: string;
  generation?: string;
  teamType?: string;
}

export interface PlayerStats {
  playerName: string; plateAppearances: number; atBats: number; hits: number;
  singles: number; doubles: number; triples: number; homeRuns: number;
  walks: number; strikeouts: number;
}

export interface PitcherStats {
  playerName: string; battersFaced: number; strikeouts: number; walks: number; hitsAllowed: number; outs: number;
}

export interface SprayData {
  hitX: number; hitY: number; result: string; batterName: string;
}

// --- Helpers ---
export const formatInnings = (outs: number) => {
  const fullInnings = Math.floor(outs / 3);
  const remainingOuts = outs % 3;
  return remainingOuts > 0 ? `${fullInnings} ${remainingOuts}/3` : `${fullInnings}`;
};


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 1. 最近の試合タブ
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export function RecentMatches({ matches, isLoadingData, currentTeam, canEdit, onDeleteMatch }: { matches: Match[], isLoadingData: boolean, currentTeam: Team | undefined, canEdit: boolean, onDeleteMatch: (id: string) => void }) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
      <h2 className="text-xl font-black flex items-center gap-2 tracking-tight mb-6">
        <History className="h-5 w-5 text-primary" /> 最近の試合
      </h2>
      {isLoadingData ? (
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-56 rounded-[24px]" />
          <Skeleton className="h-56 rounded-[24px]" />
        </div>
      ) : matches.length === 0 ? (
        <div className="text-center py-16 bg-muted/20 rounded-[32px] border border-dashed border-border/60">
          <Trophy className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground font-bold">まだ試合の記録がありません。</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {matches.map((match) => (
            <Card key={match.id} className="rounded-[28px] border-border/50 bg-background shadow-xs transition-all duration-300 hover:shadow-md hover:-translate-y-1 hover:border-primary/30 overflow-hidden relative group">
              <div className={cn("absolute left-0 top-0 bottom-0 w-2 transition-colors", match.status === 'scheduled' ? 'bg-slate-300' : 'bg-primary')} />
              <CardContent className="p-5 sm:p-6 pl-6 sm:pl-8 flex flex-col h-full">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground font-extrabold tracking-wider">
                    <Calendar className="h-4 w-4 text-primary/70" />{new Date(match.date).toLocaleDateString('ja-JP')}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn("inline-flex items-center rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider", match.status === 'completed' ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700')}>
                      {match.status === 'completed' ? '試合終了' : '進行中'}
                    </span>
                    {canEdit && (
                      <Button size="icon-sm" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-full transition-colors opacity-100 sm:opacity-0 sm:group-hover:opacity-100" onClick={() => onDeleteMatch(match.id)} title="削除">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between bg-muted/20 border border-border/50 rounded-[20px] p-4 mb-auto">
                  <div className="text-sm sm:text-base font-black w-1/3 text-center truncate">{currentTeam?.name}</div>
                  <div className="flex items-center justify-center gap-3 w-1/3">
                    <div className={cn("text-3xl font-black", match.myScore > match.opponentScore ? "text-primary drop-shadow-sm" : "")}>{match.myScore || 0}</div>
                    <div className="text-muted-foreground/50 font-black">-</div>
                    <div className={cn("text-3xl font-black", match.opponentScore > match.myScore ? "text-foreground drop-shadow-sm" : "")}>{match.opponentScore || 0}</div>
                  </div>
                  <div className="text-sm sm:text-base font-bold text-muted-foreground w-1/3 text-center truncate">{match.opponent}</div>
                </div>

                <div className="flex gap-2 mt-6 pt-4 border-t border-border/40 justify-end">
                  {match.status !== 'completed' && (
                    <Button asChild variant="outline" size="sm" className="rounded-[12px] font-extrabold shadow-xs border-border/60 hover:bg-muted">
                      <Link href={`/matches/lineup?id=${match.id}&teamId=${currentTeam?.id}`}><ClipboardList className="h-4 w-4 mr-1.5" />スタメン</Link>
                    </Button>
                  )}
                  {match.status === 'completed' ? (
                    <Button asChild size="sm" className="rounded-[12px] font-extrabold bg-slate-800 hover:bg-slate-700 text-white shadow-sm border-none">
                      <Link href={`/matches/result?id=${match.id}`}>結果 (BoxScore)</Link>
                    </Button>
                  ) : (
                    <Button asChild size="sm" className="rounded-[12px] font-extrabold bg-primary text-primary-foreground shadow-sm hover:bg-primary/90">
                      <Link href={`/matches/score?id=${match.id}`}>スコア入力へ戻る</Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 2. 打撃成績タブ
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export function BatterStatsTable({ stats, isLoadingData, onExportCSV }: { stats: PlayerStats[], isLoadingData: boolean, onExportCSV: () => void }) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-black flex items-center gap-2 tracking-tight">
          <BarChart3 className="h-5 w-5 text-primary" /> 個人打撃成績
        </h2>
        <Button onClick={onExportCSV} variant="outline" size="sm" className="font-bold shadow-xs h-9 rounded-[12px] border-border/60">
          <Download className="h-4 w-4 mr-1.5" /> <span className="hidden sm:inline">CSVダウンロード</span><span className="sm:hidden">CSV</span>
        </Button>
      </div>
      <Card className="rounded-[24px] border-border/50 bg-background shadow-xs overflow-hidden p-0 gap-0">
        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="bg-muted/30 text-muted-foreground text-[10px] font-black uppercase tracking-wider border-b border-border/50">
              <tr>
                <th className="px-4 py-4 sticky left-0 bg-muted/90 backdrop-blur-sm z-10 shadow-[1px_0_0_rgba(0,0,0,0.05)]">選手名</th>
                <th className="px-4 py-4 text-center text-primary font-black">打率(AVG)</th>
                <th className="px-4 py-4 text-center">出塁率(OBP)</th>
                <th className="px-4 py-4 text-center">OPS</th>
                <th className="px-4 py-4 text-center">試合(打席)</th>
                <th className="px-4 py-4 text-center">打数</th>
                <th className="px-4 py-4 text-center">安打</th>
                <th className="px-4 py-4 text-center">本塁打</th>
                <th className="px-4 py-4 text-center">四死球</th>
                <th className="px-4 py-4 text-center">三振</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {isLoadingData ? (
                <>
                  {[1, 2, 3].map((i) => (
                    <tr key={i}>
                      <td className="px-4 py-3"><Skeleton className="h-4 w-16" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-4 w-10 mx-auto" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-4 w-10 mx-auto" /></td>
                      <td className="px-4 py-3"><Skeleton className="h-4 w-10 mx-auto" /></td>
                      <td colSpan={6}><Skeleton className="h-4 w-full mx-auto opacity-50" /></td>
                    </tr>
                  ))}
                </>
              ) : stats.length === 0 ? (
                <tr><td colSpan={10} className="text-center py-12 text-muted-foreground font-bold">完了した試合のデータがありません</td></tr>
              ) : (
                stats.map((s, i) => {
                  const avg = s.atBats > 0 ? s.hits / s.atBats : 0;
                  const obp = s.plateAppearances > 0 ? (s.hits + s.walks) / s.plateAppearances : 0;
                  const tb = s.singles + (s.doubles * 2) + (s.triples * 3) + (s.homeRuns * 4);
                  const slg = s.atBats > 0 ? tb / s.atBats : 0;
                  const ops = obp + slg;

                  return (
                    <tr key={i} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-4 font-extrabold sticky left-0 bg-background z-10 shadow-[1px_0_0_rgba(0,0,0,0.05)]">{s.playerName}</td>
                      <td className="px-4 py-4 text-center font-black text-primary">{avg.toFixed(3).replace(/^0/, '')}</td>
                      <td className="px-4 py-4 text-center text-muted-foreground font-bold">{obp.toFixed(3).replace(/^0/, '')}</td>
                      <td className="px-4 py-4 text-center font-bold text-foreground/80">{ops.toFixed(3).replace(/^0/, '')}</td>
                      <td className="px-4 py-4 text-center text-muted-foreground">{s.plateAppearances}</td>
                      <td className="px-4 py-4 text-center text-muted-foreground">{s.atBats}</td>
                      <td className="px-4 py-4 text-center font-black">{s.hits}</td>
                      <td className="px-4 py-4 text-center font-black text-[#f97316]">{s.homeRuns}</td>
                      <td className="px-4 py-4 text-center text-[#10b981] font-bold">{s.walks}</td>
                      <td className="px-4 py-4 text-center text-[#ef4444] font-bold">{s.strikeouts}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 3. 投手成績タブ
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export function PitcherStatsTable({ stats, isLoadingData, onExportCSV }: { stats: PitcherStats[], isLoadingData: boolean, onExportCSV: () => void }) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-black flex items-center gap-2 tracking-tight">
          <Activity className="h-5 w-5 text-blue-600" /> 個人投手成績
        </h2>
        <Button onClick={onExportCSV} variant="outline" size="sm" className="font-bold shadow-xs h-9 rounded-[12px] border-blue-200 hover:bg-blue-50 text-blue-700">
          <Download className="h-4 w-4 mr-1.5" /> <span className="hidden sm:inline">CSVダウンロード</span><span className="sm:hidden">CSV</span>
        </Button>
      </div>
      <Card className="rounded-[24px] border-border/50 bg-background shadow-xs overflow-hidden p-0 gap-0">
        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="bg-muted/30 text-muted-foreground text-[10px] font-black uppercase tracking-wider border-b border-border/50">
              <tr>
                <th className="px-4 py-4 sticky left-0 bg-muted/90 backdrop-blur-sm z-10 shadow-[1px_0_0_rgba(0,0,0,0.05)]">選手名</th>
                <th className="px-4 py-4 text-center text-blue-600 font-black">投球回</th>
                <th className="px-4 py-4 text-center">奪三振</th>
                <th className="px-4 py-4 text-center">与四死球</th>
                <th className="px-4 py-4 text-center">被安打</th>
                <th className="px-4 py-4 text-center">対打者</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {isLoadingData ? (
                <>
                  {[1, 2].map((i) => (
                    <tr key={i}>
                      <td className="px-4 py-3"><Skeleton className="h-4 w-16" /></td>
                      <td colSpan={5} className="px-4 py-3"><Skeleton className="h-4 w-full mx-auto opacity-50" /></td>
                    </tr>
                  ))}
                </>
              ) : stats.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-muted-foreground font-bold">完了した試合のデータがありません</td></tr>
              ) : (
                stats.map((s, i) => (
                  <tr key={i} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-4 font-extrabold sticky left-0 bg-background z-10 shadow-[1px_0_0_rgba(0,0,0,0.05)]">{s.playerName}</td>
                    <td className="px-4 py-4 text-center font-black text-blue-600">{formatInnings(s.outs)}</td>
                    <td className="px-4 py-4 text-center font-black text-red-500">{s.strikeouts}</td>
                    <td className="px-4 py-4 text-center text-muted-foreground font-bold">{s.walks}</td>
                    <td className="px-4 py-4 text-center text-muted-foreground font-bold">{s.hitsAllowed}</td>
                    <td className="px-4 py-4 text-center text-muted-foreground font-bold">{s.battersFaced}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 4. スプレーチャートタブ
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export function SprayChartArea({ sprayData }: { sprayData: SprayData[] }) {
  const [selectedBatter, setSelectedBatter] = useState<string>("all");

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
      <h2 className="text-xl font-black flex items-center gap-2 tracking-tight mb-4">
        <Map className="h-5 w-5 text-green-600" /> スプレーチャート <span className="text-sm text-muted-foreground font-bold ml-2">(打球方向)</span>
      </h2>
      <Card className="rounded-[24px] border-border/50 bg-background shadow-xs p-5 sm:p-8">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-3">
          <span className="text-sm font-extrabold text-muted-foreground">選手を選択:</span>
          <Select value={selectedBatter} onChange={(e) => setSelectedBatter(e.target.value)} className="w-full sm:w-64 h-12 rounded-[16px] shadow-xs font-bold bg-muted/20 border-border/60">
            <option value="all">チーム全体</option>
            {Array.from(new Set(sprayData.map(d => d.batterName))).map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
          </Select>
        </div>

        <div className="relative w-full max-w-[400px] aspect-square mx-auto mt-6 drop-shadow-[0_10px_20px_rgba(0,0,0,0.1)] dark:drop-shadow-none">
          <svg viewBox="0 0 100 100" className="w-full h-full rounded-[24px] overflow-hidden bg-muted/10 border-[3px] border-border/40">
            <path d="M 50 90 L 15 20 Q 50 5 85 20 Z" fill="#15803d" stroke="#4ade80" strokeWidth="0.5" />
            <path d="M 50 90 L 68 54 Q 50 35 32 54 Z" fill="#a16207" />
            <line x1="50" y1="90" x2="15" y2="20" stroke="white" strokeWidth="0.5" />
            <line x1="50" y1="90" x2="85" y2="20" stroke="white" strokeWidth="0.5" />
            <polygon points="50,88 52,90 50,92 48,90" fill="white" />
            <polygon points="63,66 65,68 63,70 61,68" fill="white" />
            <polygon points="50,44 52,46 50,48 48,46" fill="white" />
            <polygon points="37,66 39,68 37,70 35,68" fill="white" />
          </svg>

          {sprayData
            .filter(d => selectedBatter === "all" || d.batterName === selectedBatter)
            .map((hit, i) => {
              const isOut = hit.result.includes('out') || hit.result.includes('double_play');
              const isHomeRun = hit.result === 'home_run';
              return (
                <div
                  key={i}
                  className={cn(
                    "absolute w-3.5 h-3.5 -ml-[7px] -mt-[7px] rounded-full border-[1.5px] border-white shadow-md transition-transform duration-200 hover:scale-[2] z-10 cursor-pointer",
                    isHomeRun ? "bg-[#f97316] w-5 h-5 -ml-2.5 -mt-2.5 animate-pulse shadow-[0_0_10px_rgba(249,115,22,0.8)]" :
                      isOut ? "bg-[#ef4444]" : "bg-[#3b82f6]"
                  )}
                  style={{ left: `${hit.hitX * 100}%`, top: `${hit.hitY * 100}%` }}
                  title={`${hit.batterName} - ${hit.result}`}
                />
              );
            })
          }
        </div>

        <div className="flex items-center justify-center gap-5 mt-8 text-xs font-extrabold text-muted-foreground">
          <div className="flex items-center gap-2"><div className="w-3.5 h-3.5 rounded-full bg-[#3b82f6] border border-white shadow-sm"></div>ヒット</div>
          <div className="flex items-center gap-2"><div className="w-3.5 h-3.5 rounded-full bg-[#f97316] border border-white shadow-sm"></div>ホームラン</div>
          <div className="flex items-center gap-2"><div className="w-3.5 h-3.5 rounded-full bg-[#ef4444] border border-white shadow-sm"></div>アウト</div>
        </div>
      </Card>
    </div>
  );
}
