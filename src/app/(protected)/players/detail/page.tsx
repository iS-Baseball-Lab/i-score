// src/app/(protected)/players/detail/page.tsx
"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, User, BarChart3, Activity, Map } from "lucide-react";
import { cn } from "@/lib/utils";

interface PlayerStats {
    playerName: string; plateAppearances: number; atBats: number; hits: number;
    singles: number; doubles: number; triples: number; homeRuns: number;
    walks: number; strikeouts: number;
}

interface PitcherStats {
    playerName: string; battersFaced: number; strikeouts: number; walks: number; hitsAllowed: number; outs: number;
}

interface SprayData {
    hitX: number; hitY: number; result: string; batterName: string;
}

function PlayerDetailContent() {
    const searchParams = useSearchParams();
    const teamId = searchParams.get("teamId");
    const playerName = searchParams.get("playerName");
    const uniformNumber = searchParams.get("uniformNumber");

    const [isLoading, setIsLoading] = useState(true);
    const [batterStat, setBatterStat] = useState<PlayerStats | null>(null);
    const [pitcherStat, setPitcherStat] = useState<PitcherStats | null>(null);
    const [sprayData, setSprayData] = useState<SprayData[]>([]);

    useEffect(() => {
        if (!teamId || !playerName) return;

        const fetchPlayerStats = async () => {
            setIsLoading(true);
            try {
                const [bStatsRes, pStatsRes, sprayRes] = await Promise.all([
                    fetch(`/api/teams/${teamId}/stats`),
                    fetch(`/api/teams/${teamId}/pitcher-stats`),
                    fetch(`/api/teams/${teamId}/spray-chart`)
                ]);

                if (bStatsRes.ok) {
                    const allBStats = await bStatsRes.json() as PlayerStats[];
                    setBatterStat(allBStats.find(s => s.playerName === playerName) || null);
                }
                if (pStatsRes.ok) {
                    const allPStats = await pStatsRes.json() as PitcherStats[];
                    setPitcherStat(allPStats.find(s => s.playerName === playerName) || null);
                }
                if (sprayRes.ok) {
                    const allSpray = await sprayRes.json() as SprayData[];
                    setSprayData(allSpray.filter(s => s.batterName === playerName));
                }
            } catch (e) { console.error(e); }
            finally { setIsLoading(false); }
        };

        fetchPlayerStats();
    }, [teamId, playerName]);

    const formatInnings = (outs: number) => {
        const fullInnings = Math.floor(outs / 3);
        const remainingOuts = outs % 3;
        return remainingOuts > 0 ? `${fullInnings} ${remainingOuts}/3` : `${fullInnings}`;
    };

    if (isLoading) return <div className="flex h-screen items-center justify-center bg-background"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    if (!playerName) return <div className="flex h-screen items-center justify-center">選手情報が指定されていません</div>;

    // 打撃成績の計算
    let avg = 0, obp = 0, slg = 0, ops = 0;
    if (batterStat) {
        avg = batterStat.atBats > 0 ? batterStat.hits / batterStat.atBats : 0;
        obp = batterStat.plateAppearances > 0 ? (batterStat.hits + batterStat.walks) / batterStat.plateAppearances : 0;
        const tb = batterStat.singles + (batterStat.doubles * 2) + (batterStat.triples * 3) + (batterStat.homeRuns * 4);
        slg = batterStat.atBats > 0 ? tb / batterStat.atBats : 0;
        ops = obp + slg;
    }

    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground pb-20">
            <PageHeader
                href={`/teams/roster?id=${teamId}`}
                icon={User}
                title="選手詳細データ"
                subtitle="Player Personal Stats"
            />

            <main className="flex-1 p-4 max-w-4xl mx-auto w-full space-y-6 mt-4 animate-in fade-in duration-500">

                {/* プロフィールヘッダー */}
                <div className="flex items-center gap-4 bg-muted/30 p-6 rounded-3xl border border-border shadow-sm">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white shadow-lg shrink-0">
                        <span className="text-3xl sm:text-4xl font-black">{uniformNumber}</span>
                    </div>
                    <div>
                        <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">2026 Season Stats</div>
                        <h1 className="text-2xl sm:text-4xl font-black tracking-tight">{playerName}</h1>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* 左カラム：打撃成績 */}
                    <div className="space-y-6">
                        <Card className="rounded-2xl border-border bg-background shadow-sm overflow-hidden">
                            <div className="bg-primary/5 p-4 border-b border-primary/10">
                                <h2 className="text-lg font-black tracking-tight flex items-center gap-2 text-primary">
                                    <BarChart3 className="h-5 w-5" /> 打撃成績
                                </h2>
                            </div>
                            <CardContent className="p-0">
                                {!batterStat ? (
                                    <div className="p-8 text-center text-muted-foreground font-medium">打撃記録がありません</div>
                                ) : (
                                    <div className="divide-y divide-border">
                                        <div className="grid grid-cols-3 p-4 bg-muted/10 text-center gap-2">
                                            <div className="bg-background rounded-xl p-3 border border-border shadow-sm"><div className="text-xs text-muted-foreground font-bold mb-1">打率 (AVG)</div><div className="text-2xl font-black text-primary">{avg.toFixed(3).replace(/^0/, '')}</div></div>
                                            <div className="bg-background rounded-xl p-3 border border-border shadow-sm"><div className="text-xs text-muted-foreground font-bold mb-1">出塁率 (OBP)</div><div className="text-2xl font-black">{obp.toFixed(3).replace(/^0/, '')}</div></div>
                                            <div className="bg-background rounded-xl p-3 border border-border shadow-sm"><div className="text-xs text-muted-foreground font-bold mb-1">OPS</div><div className="text-2xl font-black">{ops.toFixed(3).replace(/^0/, '')}</div></div>
                                        </div>
                                        <div className="grid grid-cols-2 text-sm">
                                            <div className="p-3 px-5 flex justify-between border-r border-border"><span className="text-muted-foreground">試合(打席)</span><span className="font-bold">{batterStat.plateAppearances}</span></div>
                                            <div className="p-3 px-5 flex justify-between"><span className="text-muted-foreground">打数</span><span className="font-bold">{batterStat.atBats}</span></div>
                                            <div className="p-3 px-5 flex justify-between border-r border-border bg-muted/5"><span className="text-muted-foreground">安打</span><span className="font-bold text-primary">{batterStat.hits}</span></div>
                                            <div className="p-3 px-5 flex justify-between bg-muted/5"><span className="text-muted-foreground">本塁打</span><span className="font-bold text-orange-500">{batterStat.homeRuns}</span></div>
                                            <div className="p-3 px-5 flex justify-between border-r border-border"><span className="text-muted-foreground">四死球</span><span className="font-bold text-green-600">{batterStat.walks}</span></div>
                                            <div className="p-3 px-5 flex justify-between"><span className="text-muted-foreground">三振</span><span className="font-bold text-red-500">{batterStat.strikeouts}</span></div>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* 投手成績 */}
                        <Card className="rounded-2xl border-border bg-background shadow-sm overflow-hidden">
                            <div className="bg-blue-500/5 p-4 border-b border-blue-500/10 dark:bg-blue-900/20">
                                <h2 className="text-lg font-black tracking-tight flex items-center gap-2 text-blue-600 dark:text-blue-400">
                                    <Activity className="h-5 w-5" /> 投手成績
                                </h2>
                            </div>
                            <CardContent className="p-0">
                                {!pitcherStat ? (
                                    <div className="p-8 text-center text-muted-foreground font-medium">登板記録がありません</div>
                                ) : (
                                    <div className="divide-y divide-border">
                                        <div className="p-6 bg-muted/10 flex justify-center items-center gap-8">
                                            <div className="text-center"><div className="text-sm text-muted-foreground font-bold mb-1">投球回 (IP)</div><div className="text-4xl font-black text-blue-600">{formatInnings(pitcherStat.outs)}</div></div>
                                            <div className="w-px h-12 bg-border"></div>
                                            <div className="text-center"><div className="text-sm text-muted-foreground font-bold mb-1">奪三振 (K)</div><div className="text-4xl font-black text-red-500">{pitcherStat.strikeouts}</div></div>
                                        </div>
                                        <div className="grid grid-cols-2 text-sm">
                                            <div className="p-3 px-5 flex justify-between border-r border-border"><span className="text-muted-foreground">与四死球</span><span className="font-bold">{pitcherStat.walks}</span></div>
                                            <div className="p-3 px-5 flex justify-between"><span className="text-muted-foreground">被安打</span><span className="font-bold">{pitcherStat.hitsAllowed}</span></div>
                                            <div className="p-3 px-5 flex justify-between border-r border-border bg-muted/5 col-span-2"><span className="text-muted-foreground">対打者数</span><span className="font-bold">{pitcherStat.battersFaced}</span></div>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* 右カラム：スプレーチャート */}
                    <div>
                        <Card className="rounded-2xl border-border bg-background shadow-sm h-full flex flex-col">
                            <div className="bg-green-500/5 p-4 border-b border-green-500/10 dark:bg-green-900/20">
                                <h2 className="text-lg font-black tracking-tight flex items-center gap-2 text-green-600 dark:text-green-500">
                                    <Map className="h-5 w-5" /> スプレーチャート (打球方向)
                                </h2>
                            </div>
                            <CardContent className="p-6 flex-1 flex flex-col justify-center">
                                {sprayData.length === 0 ? (
                                    <div className="text-center text-muted-foreground font-medium">打球データがありません</div>
                                ) : (
                                    <>
                                        <div className="relative w-full max-w-[320px] aspect-square mx-auto drop-shadow-md">
                                            {/* SVG グラウンド背景 */}
                                            <svg viewBox="0 0 100 100" className="w-full h-full rounded-2xl overflow-hidden bg-muted/20">
                                                <path d="M 50 90 L 15 20 Q 50 5 85 20 Z" fill="#15803d" stroke="#4ade80" strokeWidth="0.5" />
                                                <path d="M 50 90 L 68 54 Q 50 35 32 54 Z" fill="#a16207" />
                                                <line x1="50" y1="90" x2="15" y2="20" stroke="white" strokeWidth="0.5" />
                                                <line x1="50" y1="90" x2="85" y2="20" stroke="white" strokeWidth="0.5" />
                                                <polygon points="50,88 52,90 50,92 48,90" fill="white" />
                                                <polygon points="63,66 65,68 63,70 61,68" fill="white" />
                                                <polygon points="50,44 52,46 50,48 48,46" fill="white" />
                                                <polygon points="37,66 39,68 37,70 35,68" fill="white" />
                                            </svg>

                                            {/* プロット */}
                                            {sprayData.map((hit, i) => {
                                                const isOut = hit.result.includes('out') || hit.result.includes('double_play');
                                                const isHomeRun = hit.result === 'home_run';
                                                return (
                                                    <div
                                                        key={i}
                                                        className={cn(
                                                            "absolute w-3.5 h-3.5 -ml-1.5 -mt-1.5 rounded-full border-[1.5px] border-white shadow-sm transition-transform hover:scale-150 z-10 cursor-pointer",
                                                            isHomeRun ? "bg-orange-500 w-5 h-5 -ml-2.5 -mt-2.5 animate-pulse" :
                                                                isOut ? "bg-red-500/90" : "bg-blue-500"
                                                        )}
                                                        style={{ left: `${hit.hitX * 100}%`, top: `${hit.hitY * 100}%` }}
                                                        title={`${hit.result}`}
                                                    />
                                                );
                                            })}
                                        </div>
                                        <div className="flex items-center justify-center gap-4 mt-6 text-xs font-bold text-muted-foreground bg-muted/20 py-2 rounded-xl">
                                            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-blue-500 border border-white"></div>ヒット</div>
                                            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-orange-500 border border-white"></div>ホームラン</div>
                                            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-red-500/90 border border-white"></div>アウト</div>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default function PlayerDetailPage() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
            <PlayerDetailContent />
        </Suspense>
    );
}