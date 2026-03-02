// src/components/score/Scoreboard.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Maximize, Activity, ChevronRight, User } from "lucide-react";
import { cn } from "@/lib/utils";

// ... (Match や LineupPlayer などの interface はそのまま残す) ...
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
        // 💡 修正1: border-b を削除し、pb-1 を pb-0 に変更
        <header className="bg-muted/10 p-4 pb-0 shrink-0 z-10">
            <div className="flex items-center justify-between mb-2">
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted -ml-2" asChild>
                    <Link href="/dashboard"><ArrowLeft className="h-5 w-5" /></Link>
                </Button>
                <div className="flex flex-col items-center">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">
                        {match.season} {match.matchType === 'practice' ? 'Practice' : 'Official'}
                    </span>
                    <h1 className="font-black text-sm tracking-tight truncate max-w-[200px]">VS {match.opponent}</h1>
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

            {/* 💡 修正2: mb-4 を mb-2 に減らし、下の無駄な隙間をカット */}
            <div className="relative -mx-4 mb-2 mt-2">
                <div className="bg-background border-y border-border overflow-x-auto scrollbar-hide pb-3">
                    <div className="min-w-[360px] px-2 pt-2">
                        <table className="w-full text-center text-sm table-fixed">
                            <thead>
                                <tr className="text-muted-foreground border-b border-border text-[10px] sm:text-xs">
                                    <th className="text-left font-medium pb-1 pl-3 w-16 sticky left-0 bg-background z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] dark:shadow-[2px_0_5px_-2px_rgba(255,255,255,0.05)]">TEAM</th>
                                    {[...Array(9)].map((_, i) => (
                                        <th key={i} className={cn("font-medium pb-1 w-7", inning === i + 1 ? "text-primary font-black" : "")}>{i + 1}</th>
                                    ))}
                                    <th className="font-black pb-1 w-8 text-primary sticky right-0 bg-background z-10 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.1)] dark:shadow-[-2px_0_5px_-2px_rgba(255,255,255,0.05)]">R</th>
                                </tr>
                            </thead>
                            <tbody className="font-bold text-xs sm:text-sm">
                                <tr className="border-b border-border/50">
                                    <td className="text-left py-2 pl-3 sticky left-0 bg-background z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] dark:shadow-[2px_0_5px_-2px_rgba(255,255,255,0.05)]">
                                        <span className="truncate max-w-[55px] inline-block align-middle">{match.opponent}</span>
                                    </td>
                                    {[...Array(9)].map((_, i) => (
                                        <td key={i} className={cn("py-2", inning === i + 1 && isTop ? "bg-primary/10 text-primary rounded-sm" : "text-muted-foreground")}>
                                            {guestInningScores[i] !== null ? guestInningScores[i] : '-'}
                                        </td>
                                    ))}
                                    <td className="py-2 text-sm text-foreground sticky right-0 bg-background z-10 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.1)] dark:shadow-[-2px_0_5px_-2px_rgba(255,255,255,0.05)]">{guestScore}</td>
                                </tr>
                                <tr>
                                    <td className="text-left py-2 pl-3 sticky left-0 bg-background z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] dark:shadow-[2px_0_5px_-2px_rgba(255,255,255,0.05)]">
                                        <span className="truncate max-w-[55px] inline-block align-middle text-primary">Self</span>
                                    </td>
                                    {[...Array(9)].map((_, i) => (
                                        <td key={i} className={cn("py-2", inning === i + 1 && !isTop ? "bg-primary/10 text-primary rounded-sm" : "text-muted-foreground")}>
                                            {selfInningScores[i] !== null ? selfInningScores[i] : '-'}
                                        </td>
                                    ))}
                                    <td className="py-2 text-sm text-primary sticky right-0 bg-background z-10 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.1)] dark:shadow-[-2px_0_5px_-2px_rgba(255,255,255,0.05)]">{selfScore}</td>
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