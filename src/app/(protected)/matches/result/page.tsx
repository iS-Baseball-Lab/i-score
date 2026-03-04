// src/app/(protected)/matches/result/page.tsx
"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Newspaper, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

interface Match {
    id: string; opponent: string; date: string; season: string; status: string;
    myScore: number; opponentScore: number;
    myInningScores: string; opponentInningScores: string; // JSON文字列として取得
}

interface AtBat {
    inning: number; isTop: number; batterName: string; result: string | null;
}

const resultLabels: Record<string, string> = {
    'single': '単打', 'double': '二塁打', 'triple': '三塁打', 'home_run': '本塁打',
    'walk': '四死球', 'strikeout': '三振', 'groundout': 'ゴロ', 'flyout': '飛・直', 'double_play': '併殺打',
};

const getResultColor = (result: string | null) => {
    if (!result) return "text-muted-foreground";
    if (['single', 'double', 'triple', 'home_run'].includes(result)) return "text-blue-600 dark:text-blue-400 font-bold";
    if (result === 'walk') return "text-green-600 dark:text-green-500 font-bold";
    if (['strikeout', 'double_play'].includes(result)) return "text-red-500 font-bold";
    return "text-foreground";
};

function MatchResultContent() {
    const searchParams = useSearchParams();
    const matchId = searchParams.get("id");

    const [match, setMatch] = useState<Match | null>(null);
    const [atBats, setAtBats] = useState<AtBat[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!matchId) return;
        const fetchData = async () => {
            try {
                const matchRes = await fetch(`/api/matches/${matchId}`);
                if (matchRes.ok) setMatch(await matchRes.json());

                const boxscoreRes = await fetch(`/api/matches/${matchId}/boxscore`);
                if (boxscoreRes.ok) setAtBats(await boxscoreRes.json());
            } catch (e) { console.error(e); }
            finally { setIsLoading(false); }
        };
        fetchData();
    }, [matchId]);

    if (isLoading) return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    if (!match) return <div className="flex h-screen items-center justify-center">試合が見つかりません</div>;

    // 打者ごとに打席をまとめる処理
    const battersMap = new Map<string, AtBat[]>();
    let maxAtBatsCount = 0;
    atBats.forEach(ab => {
        if (!battersMap.has(ab.batterName)) battersMap.set(ab.batterName, []);
        battersMap.get(ab.batterName)!.push(ab);
        if (battersMap.get(ab.batterName)!.length > maxAtBatsCount) {
            maxAtBatsCount = battersMap.get(ab.batterName)!.length;
        }
    });
    const batters = Array.from(battersMap.entries());

    // 💡 イニングスコアの復元
    const guestScores: (number | null)[] = match.opponentInningScores ? JSON.parse(match.opponentInningScores) : [];
    const selfScores: (number | null)[] = match.myInningScores ? JSON.parse(match.myInningScores) : [];
    const inningsCount = Math.max(9, guestScores.length, selfScores.length);
    const isWin = match.myScore > match.opponentScore;

    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground pb-20">
            <PageHeader
                href="/dashboard"
                icon={Newspaper}
                title={`試合結果 vs ${match.opponent}`}
                subtitle={`${new Date(match.date).toLocaleDateString('ja-JP')} • ${match.season}`}
            />

            <main className="flex-1 p-4 max-w-5xl mx-auto w-full space-y-8 mt-4">

                {/* 💡 1. ランニングスコア（得点表） */}
                <Card className="rounded-2xl border-border bg-background shadow-xs overflow-hidden animate-in slide-in-from-bottom-4 duration-500 p-0 gap-0">
                    <div className="bg-muted/30 p-4 border-b border-border/50 flex items-center justify-between">
                        <h2 className="text-lg font-black tracking-tight flex items-center gap-2">
                            <Trophy className={cn("h-5 w-5", isWin ? "text-yellow-500" : "text-muted-foreground")} />
                            ランニングスコア
                        </h2>
                    </div>
                    <div className="overflow-x-auto scrollbar-hide pb-2">
                        <div className="min-w-[500px] px-4 pt-4 pb-2">
                            <table className="w-full text-center text-base table-fixed">
                                <thead>
                                    <tr className="text-muted-foreground border-b border-border text-sm">
                                        <th className="text-left font-bold pb-2 pl-3 w-32 sticky left-0 bg-background z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">TEAM</th>
                                        {[...Array(inningsCount)].map((_, i) => (
                                            <th key={i} className="font-bold pb-2 w-10">{i + 1}</th>
                                        ))}
                                        <th className="font-black pb-2 w-12 text-primary sticky right-0 bg-background z-10 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.1)]">R</th>
                                    </tr>
                                </thead>
                                <tbody className="font-black text-base sm:text-lg">
                                    {/* 相手チーム */}
                                    <tr className="border-b border-border/50">
                                        <td className="text-left py-3 pl-3 sticky left-0 bg-background z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                                            <span className="truncate max-w-[120px] inline-block align-middle">{match.opponent}</span>
                                        </td>
                                        {[...Array(inningsCount)].map((_, i) => (
                                            <td key={i} className="py-3 text-muted-foreground">
                                                {guestScores[i] !== null && guestScores[i] !== undefined ? guestScores[i] : '-'}
                                            </td>
                                        ))}
                                        <td className="py-3 text-xl sm:text-2xl text-foreground sticky right-0 bg-background z-10 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.1)]">{match.opponentScore}</td>
                                    </tr>
                                    {/* 自チーム */}
                                    <tr>
                                        <td className="text-left py-3 pl-3 sticky left-0 bg-background z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                                            <span className="truncate max-w-[120px] inline-block align-middle text-primary">Self Team</span>
                                        </td>
                                        {[...Array(inningsCount)].map((_, i) => (
                                            <td key={i} className="py-3 text-muted-foreground">
                                                {selfScores[i] !== null && selfScores[i] !== undefined ? selfScores[i] : '-'}
                                            </td>
                                        ))}
                                        <td className="py-3 text-xl sm:text-2xl text-primary sticky right-0 bg-background z-10 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.1)]">{match.myScore}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </Card>

                {/* 2. ボックススコア（打席一覧） */}
                <Card className="rounded-2xl border-border bg-background shadow-xs overflow-hidden animate-in slide-in-from-bottom-8 duration-500 delay-150 p-0 gap-0">
                    <div className="bg-muted/30 p-4 border-b border-border/50">
                        <h2 className="text-lg font-black tracking-tight flex items-center gap-2">
                            <Newspaper className="h-5 w-5 text-primary" /> ボックススコア（打席結果）
                        </h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left whitespace-nowrap">
                            <thead className="bg-muted/10 text-muted-foreground text-[11px] font-bold uppercase tracking-wider">
                                <tr>
                                    <th className="px-4 py-3 sticky left-0 bg-muted/90 backdrop-blur-sm z-10 shadow-[1px_0_0_rgba(0,0,0,0.1)]">打者名</th>
                                    {[...Array(Math.max(maxAtBatsCount, 3))].map((_, i) => (
                                        <th key={i} className="px-4 py-3 text-center">第{i + 1}打席</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                                {batters.length === 0 ? (
                                    <tr>
                                        <td colSpan={maxAtBatsCount + 1} className="text-center py-8 text-muted-foreground">打席データがありません</td>
                                    </tr>
                                ) : (
                                    batters.map(([name, abs], idx) => (
                                        <tr key={idx} className="hover:bg-muted/10 transition-colors">
                                            <td className="px-4 py-3 font-bold sticky left-0 bg-background z-10 shadow-[1px_0_0_rgba(0,0,0,0.05)]">
                                                {name}
                                            </td>
                                            {[...Array(Math.max(maxAtBatsCount, 3))].map((_, i) => {
                                                const ab = abs[i];
                                                const resultText = ab?.result ? resultLabels[ab.result] || ab.result : '-';
                                                return (
                                                    <td key={i} className="px-4 py-3 text-center">
                                                        {ab && <div className="text-[9px] text-muted-foreground mb-0.5">{ab.inning}回{ab.isTop ? '表' : '裏'}</div>}
                                                        <span className={getResultColor(ab?.result || null)}>{resultText}</span>
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </main>
        </div>
    );
}

export default function MatchResultPage() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
            <MatchResultContent />
        </Suspense>
    );

}
