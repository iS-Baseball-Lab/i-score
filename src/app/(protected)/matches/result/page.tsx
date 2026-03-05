// src/app/(protected)/matches/result/page.tsx
"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Newspaper, Trophy, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import * as htmlToImage from 'html-to-image';

interface Match {
    id: string; opponent: string; date: string; season: string; status: string;
    myScore: number; opponentScore: number;
    myInningScores: string; opponentInningScores: string;
    innings?: number;
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
    const [isDownloading, setIsDownloading] = useState(false);
    const captureRef = useRef<HTMLDivElement>(null);

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

    const handleDownloadImage = async () => {
        if (!captureRef.current || !match) return;
        setIsDownloading(true);
        try {
            // 💡 修正：html-to-image を使ったモダンで確実な画像生成
            const dataUrl = await htmlToImage.toPng(captureRef.current, {
                backgroundColor: document.documentElement.classList.contains('dark') ? '#020817' : '#ffffff',
                pixelRatio: 1.5, // スマホでも綺麗に、かつ重すぎない解像度
            });

            const link = document.createElement("a");
            link.download = `試合結果_${match.opponent}戦_${match.date}.png`;
            link.href = dataUrl;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

        } catch (error: any) {
            console.error("画像化エラー:", error);
            alert(`画像の保存に失敗しました。\n詳細: ${error?.message || error}`);
        } finally {
            setIsDownloading(false);
        }
    };

    if (isLoading) return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    if (!match) return <div className="flex h-screen items-center justify-center">試合が見つかりません</div>;

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

    const guestScores: (number | null)[] = match.opponentInningScores ? JSON.parse(match.opponentInningScores) : [];
    const selfScores: (number | null)[] = match.myInningScores ? JSON.parse(match.myInningScores) : [];

    let maxInning = match.innings || 9;
    guestScores.forEach((s, i) => { if (s !== null) maxInning = Math.max(maxInning, i + 1); });
    selfScores.forEach((s, i) => { if (s !== null) maxInning = Math.max(maxInning, i + 1); });
    const inningsCount = maxInning;

    const isWin = match.myScore > match.opponentScore;

    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground pb-20">
            <PageHeader
                href="/dashboard"
                icon={Newspaper}
                title={`試合結果 vs ${match.opponent}`}
                subtitle={`${new Date(match.date).toLocaleDateString('ja-JP')} • ${match.season}`}
            />

            <div className="max-w-5xl mx-auto w-full px-4 mt-6 flex justify-end">
                <Button onClick={handleDownloadImage} disabled={isDownloading} className="rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all active:scale-95">
                    {isDownloading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> 画像を生成中...</> : <><Download className="mr-2 h-5 w-5" /> 結果を画像で保存 (シェア)</>}
                </Button>
            </div>

            {/* 💡 ここから下のクラス名から /10 や /50 などの透過度指定を除外しました */}
            <div ref={captureRef} className="bg-background p-4 sm:p-6 max-w-5xl mx-auto w-full mt-2 rounded-2xl">
                <div className="text-center mb-6 pb-4 border-b border-border">
                    <div className="inline-flex items-center rounded-full px-3 py-1 text-xs font-extrabold bg-primary text-primary-foreground uppercase tracking-wider mb-2">
                        {match.season}
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black tracking-tight mb-1">vs {match.opponent}</h1>
                    <p className="text-sm text-muted-foreground font-bold">{new Date(match.date).toLocaleDateString('ja-JP')}</p>
                </div>

                <div className="space-y-8">
                    <Card className="rounded-2xl border-border bg-background shadow-sm overflow-hidden p-0 gap-0">
                        <div className="bg-muted p-4 border-b border-border flex items-center justify-between">
                            <h2 className="text-lg font-black tracking-tight flex items-center gap-2">
                                <Trophy className={cn("h-5 w-5", isWin ? "text-yellow-500" : "text-muted-foreground")} />
                                ランニングスコア
                            </h2>
                        </div>
                        <div className="overflow-x-auto scrollbar-hide pb-2">
                            <div className="min-w-[400px] px-2 pt-4 pb-2">
                                <table className="w-full text-center text-sm table-fixed">
                                    <thead>
                                        <tr className="text-muted-foreground border-b border-border text-xs">
                                            <th className="text-left font-bold pb-2 pl-1 w-20 sm:w-24 sticky left-0 bg-background z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">TEAM</th>
                                            {[...Array(inningsCount)].map((_, i) => (
                                                <th key={i} className="font-bold pb-2 w-8 sm:w-10">{i + 1}</th>
                                            ))}
                                            <th className="font-black pb-2 w-10 text-primary sticky right-0 bg-background z-10 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.1)]">R</th>
                                        </tr>
                                    </thead>
                                    <tbody className="font-black text-base">
                                        <tr className="border-b border-border">
                                            <td className="text-left py-3 pl-1 sticky left-0 bg-background z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                                                <span className="truncate max-w-[70px] sm:max-w-[85px] inline-block align-middle">{match.opponent}</span>
                                            </td>
                                            {[...Array(inningsCount)].map((_, i) => (
                                                <td key={i} className="py-3 text-muted-foreground">
                                                    {guestScores[i] !== null && guestScores[i] !== undefined ? guestScores[i] : '-'}
                                                </td>
                                            ))}
                                            <td className="py-3 text-xl sm:text-2xl text-foreground sticky right-0 bg-background z-10 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.1)]">{match.opponentScore}</td>
                                        </tr>
                                        <tr>
                                            <td className="text-left py-3 pl-1 sticky left-0 bg-background z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                                                <span className="truncate max-w-[70px] sm:max-w-[85px] inline-block align-middle text-primary">Self</span>
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

                    <Card className="rounded-2xl border-border bg-background shadow-sm overflow-hidden p-0 gap-0">
                        <div className="bg-muted p-4 border-b border-border">
                            <h2 className="text-lg font-black tracking-tight flex items-center gap-2">
                                <Newspaper className="h-5 w-5 text-primary" /> ボックススコア
                            </h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left whitespace-nowrap">
                                <thead className="bg-muted text-muted-foreground text-[11px] font-bold uppercase tracking-wider">
                                    <tr>
                                        <th className="px-3 py-3 sticky left-0 bg-muted/90 backdrop-blur-sm z-10 shadow-[1px_0_0_rgba(0,0,0,0.1)]">打者名</th>
                                        {[...Array(Math.max(maxAtBatsCount, 3))].map((_, i) => (
                                            <th key={i} className="px-4 py-3 text-center">第{i + 1}打席</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {batters.length === 0 ? (
                                        <tr>
                                            <td colSpan={maxAtBatsCount + 1} className="text-center py-8 text-muted-foreground">打席データがありません</td>
                                        </tr>
                                    ) : (
                                        batters.map(([name, abs], idx) => (
                                            <tr key={idx} className="hover:bg-muted transition-colors">
                                                <td className="px-3 py-3 font-bold sticky left-0 bg-background z-10 shadow-[1px_0_0_rgba(0,0,0,0.05)]">
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
                </div>

                <div className="mt-8 pt-4 border-t border-border text-center text-xs font-bold text-muted-foreground opacity-50 flex items-center justify-center gap-2">
                    <Trophy className="h-3 w-3" /> Powered by i-Score
                </div>
            </div>
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