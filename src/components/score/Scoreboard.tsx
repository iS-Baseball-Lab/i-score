// src/components/score/Scoreboard.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Maximize, Activity, ChevronRight, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface Match {
    id: string; opponent: string; date: string;
    location: string | null; matchType: string; status: string; season: string;
}

interface LineupPlayer {
    batting_order: number; playerName: string; uniformNumber: string; position: string;
}

interface ScoreboardProps {
    match: Match; inning: number; isTop: boolean;
    guestInningScores: number[]; selfInningScores: number[];
    guestScore: number; selfScore: number;
    currentPitcher: LineupPlayer | null; selfPitchCount: number; selfInningPitchCount: number;
    currentBatter: LineupPlayer | null; nextBatter: LineupPlayer | null;
    onFinish: () => void; onToggleFullScreen: () => void;
}

export function Scoreboard({
    match, inning, isTop, guestInningScores, selfInningScores, guestScore, selfScore,
    currentPitcher, selfPitchCount, selfInningPitchCount, currentBatter, nextBatter,
    onFinish, onToggleFullScreen
}: ScoreboardProps) {
    return (
        <header className="bg-muted/10 p-4 pb-0 shrink-0 z-10">
            <div className="flex items-center justify-between mb-2">
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted -ml-2" asChild>
                    <Link href="/dashboard"><ArrowLeft className="h-5 w-5" /></Link>
                </Button>
                <div className="flex flex-col items-center">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">
                        {match.season} {match.matchType === 'practice' ? 'Practice' : 'Official'}
                    </span>
                    {/* 💡 修正1: 一番上の「VS 〇〇」も一回り大きく (text-sm -> text-base) */}
                    <h1 className="font-black text-base tracking-tight truncate max-w-[200px]">VS {match.opponent}</h1>
                </div>
                <div className="flex items-center gap-1 sm:gap-2">
                    <Button variant="ghost" size="icon" className="rounded-full" onClick={onToggleFullScreen}>
                        <Maximize className="h-4 w-4 text-muted-foreground" />
                    </Button>
                    <Button onClick={onFinish} size="sm" className="bg-red-600 hover:bg-red-700 text-white font-bold rounded-full px-3 sm:px-4 shadow-sm text-xs">
                        試合終了
                    </Button>
                </div>
            </div>

            <div className="relative -mx-4 mb-2 mt-2">
                <div className="bg-background border-y border-border overflow-x-auto scrollbar-hide pb-3">
                    {/* 💡 修正2: テーブル全体の幅をさらに広げる (420px -> 500px) */}
                    <div className="min-w-[500px] px-2 pt-2">
                        <table className="w-full text-center text-base table-fixed">
                            <thead>
                                {/* 💡 修正3: イニングヘッダーの文字をさらに大きく (text-xs -> text-sm) */}
                                <tr className="text-muted-foreground border-b border-border text-sm">
                                    {/* 💡 修正4: チーム名の幅を大幅拡大 (w-24 -> w-28) */}
                                    <th className="text-left font-bold pb-2 pl-3 w-28 sticky left-0 bg-background z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] dark:shadow-[2px_0_5px_-2px_rgba(255,255,255,0.05)]">TEAM</th>

                                    {/* 💡 修正5: 各イニングの幅を拡大 (w-8 -> w-10) */}
                                    {[...Array(9)].map((_, i) => (
                                        <th key={i} className={cn("font-bold pb-2 w-10", inning === i + 1 ? "text-primary font-black text-base" : "")}>{i + 1}</th>
                                    ))}

                                    {/* 💡 修正6: 合計点数(R)の幅を拡大 (w-10 -> w-12) */}
                                    <th className="font-black pb-2 w-12 text-primary sticky right-0 bg-background z-10 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.1)] dark:shadow-[-2px_0_5px_-2px_rgba(255,255,255,0.05)]">R</th>
                                </tr>
                            </thead>

                            {/* 💡 修正7: 点数の基本フォントサイズをさらに大きく (text-sm -> text-base sm:text-lg) */}
                            <tbody className="font-black text-base sm:text-lg">
                                <tr className="border-b border-border/50">
                                    {/* 💡 修正8: 縦の余白を増やして窮屈さを解消 (py-2 -> py-3) */}
                                    <td className="text-left py-3 pl-3 sticky left-0 bg-background z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] dark:shadow-[2px_0_5px_-2px_rgba(255,255,255,0.05)]">
                                        {/* 💡 修正9: チーム名の表示文字数をさらに増やす (max-w-[85px] -> max-w-[105px]) */}
                                        <span className="truncate max-w-[105px] inline-block align-middle">{match.opponent}</span>
                                    </td>
                                    {[...Array(9)].map((_, i) => (
                                        <td key={i} className={cn("py-3", inning === i + 1 && isTop ? "bg-primary/10 text-primary rounded-sm" : "text-muted-foreground")}>
                                            {guestInningScores[i] !== null ? guestInningScores[i] : '-'}
                                        </td>
                                    ))}
                                    {/* 💡 修正10: 合計点数を「特大サイズ (text-xl sm:text-2xl)」にして一目でわかるように */}
                                    <td className="py-3 text-xl sm:text-2xl text-foreground sticky right-0 bg-background z-10 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.1)] dark:shadow-[-2px_0_5px_-2px_rgba(255,255,255,0.05)]">{guestScore}</td>
                                </tr>
                                <tr>
                                    <td className="text-left py-3 pl-3 sticky left-0 bg-background z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] dark:shadow-[2px_0_5px_-2px_rgba(255,255,255,0.05)]">
                                        <span className="truncate max-w-[105px] inline-block align-middle text-primary">Self</span>
                                    </td>
                                    {[...Array(9)].map((_, i) => (
                                        <td key={i} className={cn("py-3", inning === i + 1 && !isTop ? "bg-primary/10 text-primary rounded-sm" : "text-muted-foreground")}>
                                            {selfInningScores[i] !== null ? selfInningScores[i] : '-'}
                                        </td>
                                    ))}
                                    <td className="py-3 text-xl sm:text-2xl text-primary sticky right-0 bg-background z-10 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.1)] dark:shadow-[-2px_0_5px_-2px_rgba(255,255,255,0.05)]">{selfScore}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="absolute -bottom-3 left-0 right-0 flex justify-center items-end gap-2 px-2 z-20 pointer-events-none">
                    {isTop ? (
                        currentPitcher && (
                            <div className="bg-blue-600 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-md flex items-center gap-2 border-2 border-background whitespace-nowrap animate-in slide-in-from-top-2">
                                <Activity className="h-3.5 w-3.5" /> P: {currentPitcher.playerName}
                                <span className="bg-blue-800/60 px-2 py-0.5 rounded text-[10px] ml-1 flex items-center gap-1.5">
                                    <span>計{selfPitchCount}球</span><span className="text-[8px] opacity-50">|</span><span>今{selfInningPitchCount}球</span>
                                </span>
                            </div>
                        )
                    ) : (
                        <>
                            {currentBatter && (
                                <div className="bg-primary text-primary-foreground px-4 py-1.5 rounded-full text-xs font-bold shadow-md flex items-center gap-2 border-2 border-background whitespace-nowrap animate-in slide-in-from-top-2">
                                    <User className="h-3.5 w-3.5" /> {currentBatter.batting_order}番 {currentBatter.playerName}
                                </div>
                            )}
                            {nextBatter && (
                                <div className="bg-muted text-muted-foreground px-3 py-1.5 rounded-full text-[10px] font-bold shadow-sm flex items-center gap-1 border-2 border-background whitespace-nowrap animate-in slide-in-from-top-2 opacity-95">
                                    <span className="text-primary font-black ml-0.5">NEXT</span>
                                    <ChevronRight className="h-3 w-3 -mx-1 opacity-50" /> {nextBatter.batting_order}番 {nextBatter.playerName}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}