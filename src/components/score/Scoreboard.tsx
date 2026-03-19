// src/components/score/Scoreboard.tsx
"use client";

import { ChevronLeft, CalendarDays, Trophy, MapPin, Shield, Swords } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Link from "next/link";

// 💡 チームのスコア情報
export interface TeamScore {
    name: string;
    isSelf: boolean;
    innings: (number | null)[]; // イニングごとの得点 (null はまだプレイしていない回)
    runs: number;   // R: 合計得点
    hits: number;   // H: 安打数
    errors: number; // E: 失策数
}

export interface ScoreboardProps {
    matchInfo?: {
        season: string;
        matchType: string;
        location: string;
        totalInnings: number; // 試合作成時に設定したイニング数 (例: 7)
        currentInning: number;
        isTopHalf: boolean;
    };
    topTeam?: TeamScore;    // 先攻
    bottomTeam?: TeamScore; // 後攻
}

export function Scoreboard({
    // 💡 確認用にデフォルト値(ダミーデータ)を設定しています
    matchInfo = {
        season: "2026",
        matchType: "official",
        location: "多摩川グラウンド",
        totalInnings: 7, // 7回制
        currentInning: 3,
        isTopHalf: false, // 3回裏
    },
    topTeam = {
        name: "世田谷西シニア",
        isSelf: false,
        innings: [0, 2, 0, null, null, null, null],
        runs: 2,
        hits: 4,
        errors: 0,
    },
    bottomTeam = {
        name: "自チーム名イーグルス",
        isSelf: true,
        innings: [1, 0, null, null, null, null, null], // 現在3回裏攻撃中
        runs: 1,
        hits: 2,
        errors: 1,
    }
}: ScoreboardProps) {

    // 試合種別のラベル変換
    const getMatchTypeLabel = (type: string) => {
        switch (type) {
            case "practice": return "練習試合";
            case "official": return "公式戦";
            case "tournament": return "大会";
            default: return "その他";
        }
    };

    // 💡 描画するイニング列の数を計算 (設定イニングか、現在のイニングの大きい方。延長戦対応)
    const displayInningsCount = Math.max(matchInfo.totalInnings, matchInfo.currentInning);
    const inningsArray = Array.from({ length: displayInningsCount }, (_, i) => i + 1);

    return (
        <div className="animate-in fade-in duration-500 mb-6">
            {/* 1. ヘッダー情報 (戻るボタン & バッジ) */}
            <div className="flex flex-col items-start gap-3 mb-4">
                <Button variant="ghost" asChild className="rounded-full pl-2 pr-4 hover:bg-muted text-muted-foreground font-extrabold -ml-2 transition-transform active:scale-95">
                    <Link href="/dashboard"><ChevronLeft className="h-5 w-5 mr-1" /> ダッシュボード</Link>
                </Button>
                <div className="flex flex-wrap items-center gap-2">
                    {matchInfo.season && (
                        <span className="inline-flex items-center rounded-full px-2.5 py-1 text-[10px] sm:text-xs font-black bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                            <CalendarDays className="h-3.5 w-3.5 mr-1" /> {matchInfo.season}年度
                        </span>
                    )}
                    <span className="inline-flex items-center rounded-full px-2.5 py-1 text-[10px] sm:text-xs font-black bg-blue-500/10 text-blue-500 border border-blue-500/20">
                        <Trophy className="h-3.5 w-3.5 mr-1" /> {getMatchTypeLabel(matchInfo.matchType)}
                    </span>
                    {matchInfo.location && (
                        <span className="inline-flex items-center rounded-full px-2.5 py-1 text-[10px] sm:text-xs font-black bg-orange-500/10 text-orange-500 border border-orange-500/20 hidden sm:inline-flex">
                            <MapPin className="h-3.5 w-3.5 mr-1" /> {matchInfo.location}
                        </span>
                    )}
                </div>
            </div>

            {/* 2. 電光掲示板 (スコアボード本体) */}
            <Card className="rounded-[24px] border-border/50 bg-card/90 backdrop-blur-xl shadow-lg overflow-hidden relative">
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-primary/5 blur-[60px] rounded-full pointer-events-none" />

                <CardContent className="p-0 relative z-10">
                    {/* 横スクロール可能なコンテナ (スマホでイニングが増えても破綻しない) */}
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-sm sm:text-base text-center whitespace-nowrap">
                            <thead>
                                <tr className="border-b border-border/40 bg-muted/20">
                                    {/* チーム名列のヘッダー */}
                                    <th className="px-4 py-2 sm:py-3 text-left font-bold text-muted-foreground w-32 sm:w-48 sticky left-0 bg-card/95 backdrop-blur-sm z-20 border-r border-border/40">
                                        TEAM
                                    </th>
                                    {/* イニング列 */}
                                    {inningsArray.map((inning) => (
                                        <th
                                            key={inning}
                                            className={cn(
                                                "px-3 py-2 sm:py-3 font-black w-10 sm:w-12 transition-colors",
                                                matchInfo.currentInning === inning ? "text-primary bg-primary/5" : "text-muted-foreground"
                                            )}
                                        >
                                            {inning}
                                        </th>
                                    ))}
                                    {/* R, H, E 列 */}
                                    <th className="px-3 py-2 sm:py-3 font-black text-foreground w-12 border-l border-border/40 bg-muted/30">R</th>
                                    <th className="px-3 py-2 sm:py-3 font-bold text-muted-foreground w-10 bg-muted/30 text-xs sm:text-sm">H</th>
                                    <th className="px-3 py-2 sm:py-3 font-bold text-muted-foreground w-10 bg-muted/30 text-xs sm:text-sm">E</th>
                                </tr>
                            </thead>
                            <tbody className="font-mono tabular-nums text-lg sm:text-xl font-black">
                                {/* ⚾️ 先攻チームの行 */}
                                <tr className="border-b border-border/20">
                                    <td className="px-4 py-3 sm:py-4 text-left sticky left-0 bg-card/95 backdrop-blur-sm z-20 border-r border-border/40">
                                        <div className="flex items-center gap-2 truncate font-sans text-base sm:text-lg">
                                            {topTeam.isSelf ? <Shield className="h-4 w-4 text-primary shrink-0" /> : <Swords className="h-4 w-4 text-muted-foreground shrink-0" />}
                                            <span className={cn("truncate", topTeam.isSelf ? "text-primary" : "text-foreground")}>{topTeam.name}</span>
                                        </div>
                                    </td>
                                    {inningsArray.map((inning, idx) => (
                                        <td key={inning} className={cn(
                                            "px-3 py-3 sm:py-4 transition-colors",
                                            matchInfo.currentInning === inning ? "bg-primary/5" : "",
                                            (matchInfo.currentInning === inning && matchInfo.isTopHalf) ? "text-primary scale-110" : "text-muted-foreground"
                                        )}>
                                            {topTeam.innings[idx] ?? "-"}
                                        </td>
                                    ))}
                                    <td className="px-3 py-3 sm:py-4 border-l border-border/40 bg-muted/10 text-primary text-xl sm:text-2xl">{topTeam.runs}</td>
                                    <td className="px-3 py-3 sm:py-4 bg-muted/10 text-muted-foreground text-base sm:text-lg">{topTeam.hits}</td>
                                    <td className="px-3 py-3 sm:py-4 bg-muted/10 text-muted-foreground text-base sm:text-lg">{topTeam.errors}</td>
                                </tr>

                                {/* ⚾️ 後攻チームの行 */}
                                <tr>
                                    <td className="px-4 py-3 sm:py-4 text-left sticky left-0 bg-card/95 backdrop-blur-sm z-20 border-r border-border/40">
                                        <div className="flex items-center gap-2 truncate font-sans text-base sm:text-lg">
                                            {bottomTeam.isSelf ? <Shield className="h-4 w-4 text-primary shrink-0" /> : <Swords className="h-4 w-4 text-muted-foreground shrink-0" />}
                                            <span className={cn("truncate", bottomTeam.isSelf ? "text-primary" : "text-foreground")}>{bottomTeam.name}</span>
                                        </div>
                                    </td>
                                    {inningsArray.map((inning, idx) => (
                                        <td key={inning} className={cn(
                                            "px-3 py-3 sm:py-4 transition-colors",
                                            matchInfo.currentInning === inning ? "bg-primary/5" : "",
                                            (matchInfo.currentInning === inning && !matchInfo.isTopHalf) ? "text-primary scale-110" : "text-muted-foreground"
                                        )}>
                                            {bottomTeam.innings[idx] ?? "-"}
                                        </td>
                                    ))}
                                    <td className="px-3 py-3 sm:py-4 border-l border-border/40 bg-muted/10 text-primary text-xl sm:text-2xl">{bottomTeam.runs}</td>
                                    <td className="px-3 py-3 sm:py-4 bg-muted/10 text-muted-foreground text-base sm:text-lg">{bottomTeam.hits}</td>
                                    <td className="px-3 py-3 sm:py-4 bg-muted/10 text-muted-foreground text-base sm:text-lg">{bottomTeam.errors}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}