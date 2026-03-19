// src/components/score/PlayArea.tsx
"use client";

import { User, CircleDot, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useScore } from "@/contexts/ScoreContext";

export interface PlayAreaProps {
    batter?: {
        name: string;
        uniformNumber: string;
        statsToday: string;
    };
    // 💡 NEW! 次のバッター（ネクストバッター）の情報を追加
    nextBatter?: {
        name: string;
        uniformNumber: string;
    };
    pitcher?: {
        name: string;
        uniformNumber: string;
        pitchCount: number;
        subStats: string; // 💡 追加: ピッチャーのサブ情報
    };
}

export function PlayArea({
    batter = { name: "山田 太郎", uniformNumber: "18", statsToday: "今日: 1打数1安打 1四球" },
    nextBatter = { name: "高橋 誠", uniformNumber: "51" }, // 💡 ダミーデータ
    pitcher = { name: "佐藤 一郎", uniformNumber: "11", pitchCount: 42, subStats: "3奪三振 1四球" },
}: PlayAreaProps) {

    const { count, currentInning, runners } = useScore();

    return (
        <div className="animate-in slide-in-from-top-4 duration-500 delay-100 mb-6 space-y-4 sm:space-y-6">

            {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            {/* 1. 状況パネル (イニング・ランナー・BSO) */}
            {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            {/* ※ここは前回のまま変更なしです */}
            <Card className="rounded-[28px] border-border/50 bg-card/80 backdrop-blur-xl shadow-sm overflow-hidden relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/5 blur-[80px] rounded-full pointer-events-none" />

                <CardContent className="p-4 sm:p-6 relative z-10 flex flex-row items-center justify-between gap-4">
                    <div className="flex flex-col items-center justify-center shrink-0 w-16 sm:w-24">
                        <span className="text-[10px] sm:text-xs font-black text-muted-foreground uppercase tracking-widest mb-1">Inning</span>
                        <div className="flex items-baseline text-primary">
                            <span className="text-4xl sm:text-5xl font-black tabular-nums tracking-tighter">{currentInning.num}</span>
                            <span className="text-xl sm:text-2xl font-black ml-1">{currentInning.isTop ? "表" : "裏"}</span>
                        </div>
                    </div>

                    <div className="w-px h-16 bg-border/40 shrink-0 hidden sm:block" />

                    <div className="flex flex-col items-center justify-center shrink-0 w-20 sm:w-28 relative">
                        <div className="relative w-12 h-12 sm:w-16 sm:h-16 rotate-45 transform-gpu transition-all duration-300">
                            <div className={cn("absolute top-0 left-0 w-[45%] h-[45%] rounded-sm border-2 transition-all duration-300 shadow-sm", runners[2] ? "bg-primary border-primary shadow-primary/40 scale-110" : "bg-muted/50 border-border/50")} />
                            <div className={cn("absolute top-0 right-0 w-[45%] h-[45%] rounded-sm border-2 transition-all duration-300 shadow-sm", runners[1] ? "bg-primary border-primary shadow-primary/40 scale-110" : "bg-muted/50 border-border/50")} />
                            <div className={cn("absolute bottom-0 left-0 w-[45%] h-[45%] rounded-sm border-2 transition-all duration-300 shadow-sm", runners[3] ? "bg-primary border-primary shadow-primary/40 scale-110" : "bg-muted/50 border-border/50")} />
                            <div className="absolute bottom-0 right-0 w-[45%] h-[45%] rounded-sm border-2 border-border/30 bg-muted/20" />
                        </div>
                    </div>

                    <div className="w-px h-16 bg-border/40 shrink-0 hidden sm:block" />

                    <div className="flex flex-col gap-2 sm:gap-2.5 flex-1 max-w-[140px] sm:max-w-[180px]">
                        <div className="flex items-center gap-2 sm:gap-3">
                            <span className="text-xs sm:text-sm font-black text-emerald-500 w-3">B</span>
                            <div className="flex gap-1.5 sm:gap-2 flex-1">
                                {[1, 2, 3].map((idx) => (
                                    <div key={`b-${idx}`} className={cn("h-3 sm:h-4 w-full rounded-full transition-all duration-300", idx <= count.ball ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-muted border border-border/50")} />
                                ))}
                            </div>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3">
                            <span className="text-xs sm:text-sm font-black text-amber-500 w-3">S</span>
                            <div className="flex gap-1.5 sm:gap-2 flex-1">
                                {[1, 2].map((idx) => (
                                    <div key={`s-${idx}`} className={cn("h-3 sm:h-4 w-full rounded-full transition-all duration-300", idx <= count.strike ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" : "bg-muted border border-border/50")} />
                                ))}
                            </div>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3">
                            <span className="text-xs sm:text-sm font-black text-red-500 w-3">O</span>
                            <div className="flex gap-1.5 sm:gap-2 flex-1">
                                {[1, 2].map((idx) => (
                                    <div key={`o-${idx}`} className={cn("h-3 sm:h-4 w-full rounded-full transition-all duration-300", idx <= count.out ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" : "bg-muted border border-border/50")} />
                                ))}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            {/* 2. 対決パネル (バッター vs ピッチャー) */}
            {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">

                {/* ⚾️ バッターカード */}
                <Card className="rounded-[20px] sm:rounded-[24px] border-border/50 bg-card overflow-hidden transition-all hover:border-primary/30 group flex flex-col">
                    <CardContent className="p-4 sm:p-5 flex items-center gap-4 flex-1">
                        <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                            <User className="h-6 w-6 sm:h-7 sm:w-7 text-primary/70" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-0.5">
                                <label className="text-[10px] sm:text-xs font-black text-primary uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded-sm">Batter</label>
                                <span className="text-[10px] sm:text-xs font-bold text-muted-foreground">{batter.statsToday}</span>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="font-mono text-lg sm:text-xl font-black text-muted-foreground">#{batter.uniformNumber}</span>
                                <span className="text-lg sm:text-xl font-black truncate text-foreground">{batter.name}</span>
                            </div>
                        </div>
                    </CardContent>

                    {/* 💡 NEW! ネクストバッター表示 (フッター領域) */}
                    <div className="bg-primary/5 px-4 py-2 sm:px-5 sm:py-2.5 border-t border-primary/10 flex items-center gap-3">
                        <span className="text-[9px] sm:text-[10px] font-black text-primary uppercase tracking-widest bg-primary/10 border border-primary/20 px-1.5 py-0.5 rounded-sm flex items-center gap-0.5">
                            Next <ChevronRight className="h-3 w-3 -mr-0.5" />
                        </span>
                        <div className="flex items-center gap-1.5">
                            <span className="font-mono text-xs sm:text-sm font-black text-muted-foreground">#{nextBatter.uniformNumber}</span>
                            <span className="text-xs sm:text-sm font-black text-foreground/80">{nextBatter.name}</span>
                        </div>
                    </div>
                </Card>

                {/* ⚾️ ピッチャーカード */}
                <Card className="rounded-[20px] sm:rounded-[24px] border-border/50 bg-card overflow-hidden transition-all hover:border-red-500/30 group flex flex-col">
                    <CardContent className="p-4 sm:p-5 flex items-center gap-4 flex-1">
                        <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                            <CircleDot className="h-6 w-6 sm:h-7 sm:w-7 text-red-500/70" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-0.5">
                                <label className="text-[10px] sm:text-xs font-black text-red-500 uppercase tracking-widest bg-red-500/10 px-2 py-0.5 rounded-sm">Pitcher</label>
                                <span className="text-[10px] sm:text-xs font-bold text-muted-foreground">今日: <span className="text-foreground">{pitcher.pitchCount}</span> 球</span>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="font-mono text-lg sm:text-xl font-black text-muted-foreground">#{pitcher.uniformNumber}</span>
                                <span className="text-lg sm:text-xl font-black truncate text-foreground">{pitcher.name}</span>
                            </div>
                        </div>
                    </CardContent>

                    {/* 💡 左右の高さを揃えるためのピッチャーサブ情報 (フッター領域) */}
                    <div className="bg-red-500/5 px-4 py-2 sm:px-5 sm:py-2.5 border-t border-red-500/10 flex items-center gap-3">
                        <span className="text-[9px] sm:text-[10px] font-black text-red-500 uppercase tracking-widest bg-red-500/10 border border-red-500/20 px-1.5 py-0.5 rounded-sm">
                            Info
                        </span>
                        <div className="flex items-center gap-1.5">
                            <span className="text-[10px] sm:text-xs font-bold text-muted-foreground">成績:</span>
                            <span className="text-xs sm:text-sm font-black text-foreground/80">{pitcher.subStats}</span>
                        </div>
                    </div>
                </Card>

            </div>
        </div>
    );
}