// src/components/score/Scoreboard.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Maximize, Activity, ChevronRight, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface Match {
    id: string; opponent: string; date: string;
    location: string | null; matchType: string; status: string; season: string;
    innings?: number;
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

    const displayInnings = Math.max(match.innings || 9, inning);

    return (
        <header className="bg-primary text-primary-foreground pt-2 px-4 pb-0 shrink-0 z-10 shadow-md transition-colors duration-300">
            <div className="flex items-center justify-between mb-2">
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-primary-foreground/20 hover:bg-primary-foreground/20 text-primary-foreground border-none transition-all group shrink-0" asChild>
                    <Link href="/dashboard"><ChevronLeft className="h-5 w-5 pr-0.5" /></Link>
                </Button>

                <div className="flex flex-col items-center">
                    <span className="text-[9px] font-bold text-primary-foreground/80 uppercase tracking-widest mb-0 leading-tight">
                        {match.season} {match.matchType === 'practice' ? 'Practice' : 'Official'}
                    </span>
                    <h1 className="font-black text-base sm:text-lg tracking-tight truncate max-w-[200px]">VS {match.opponent}</h1>
                </div>

                <div className="flex items-center gap-1.5">
                    <Button onClick={onFinish} size="sm" className="bg-red-500 hover:bg-red-600 text-white font-bold rounded-full px-3 shadow-sm text-[10px] h-7 border-none">試合終了</Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-primary-foreground/20 hover:bg-primary-foreground/20 text-primary-foreground border-none transition-all" onClick={onToggleFullScreen}>
                        <Maximize className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className="relative -mx-4 mb-1 mt-1">
                <div className="bg-background text-foreground border-b border-border overflow-x-auto scrollbar-hide pb-2 shadow-inner">
                    <div className="min-w-[400px] px-2 pt-1">
                        <table className="w-full text-center text-sm table-fixed">
                            <thead>
                                <tr className="text-muted-foreground border-b border-border text-xs">
                                    {/* 💡 修正：左余白を極限まで削り(pl-1)、幅を固定化 */}
                                    <th className="text-left font-bold pb-1 pl-1 w-20 sm:w-24 sticky left-0 bg-background z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">TEAM</th>
                                    {[...Array(displayInnings)].map((_, i) => (
                                        <th key={i} className={cn("font-bold pb-1 w-8", inning === i + 1 ? "text-primary font-black text-sm" : "")}>{i + 1}</th>
                                    ))}
                                    <th className="font-black pb-1 w-10 text-primary sticky right-0 bg-background z-10 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.1)]">R</th>
                                </tr>
                            </thead>
                            <tbody className="font-black text-sm sm:text-base">
                                <tr className="border-b border-border/50">
                                    <td className="text-left py-1.5 pl-1 sticky left-0 bg-background z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                                        {/* 💡 修正：文字がはみ出さないように max-w を指定 */}
                                        <span className="truncate max-w-[70px] sm:max-w-[85px] inline-block align-middle">{match.opponent}</span>
                                    </td>
                                    {[...Array(displayInnings)].map((_, i) => (
                                        <td key={i} className={cn("py-1.5", inning === i + 1 && isTop ? "bg-primary/10 text-primary rounded-sm" : "text-muted-foreground")}>
                                            {guestInningScores[i] ?? '-'}
                                        </td>
                                    ))}
                                    <td className="py-1.5 text-lg sm:text-xl text-foreground sticky right-0 bg-background z-10 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.1)]">{guestScore}</td>
                                </tr>
                                <tr>
                                    <td className="text-left py-1.5 pl-1 sticky left-0 bg-background z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                                        <span className="truncate max-w-[70px] sm:max-w-[85px] inline-block align-middle text-primary">Self</span>
                                    </td>
                                    {[...Array(displayInnings)].map((_, i) => (
                                        <td key={i} className={cn("py-1.5", inning === i + 1 && !isTop ? "bg-primary/10 text-primary rounded-sm" : "text-muted-foreground")}>
                                            {selfInningScores[i] ?? '-'}
                                        </td>
                                    ))}
                                    <td className="py-1.5 text-lg sm:text-xl text-primary sticky right-0 bg-background z-10 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.1)]">{selfScore}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="absolute -bottom-3 left-0 right-0 flex justify-center items-end gap-2 px-2 z-20 pointer-events-none">
                    {isTop ? (
                        currentPitcher && (
                            <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-[10px] font-bold shadow-md flex items-center gap-1.5 border-2 border-background whitespace-nowrap animate-in slide-in-from-top-2">
                                <Activity className="h-3 w-3" /> P: {currentPitcher.playerName}
                                <span className="bg-blue-800/60 px-1.5 py-0.5 rounded text-[8px] ml-0.5 flex items-center gap-1">
                                    <span>計{selfPitchCount}球</span><span className="text-[6px] opacity-50">|</span><span>今{selfInningPitchCount}球</span>
                                </span>
                            </div>
                        )
                    ) : (
                        <>
                            {currentBatter && (
                                <div className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-[10px] font-bold shadow-md flex items-center gap-1.5 border-2 border-background whitespace-nowrap animate-in slide-in-from-top-2">
                                    <User className="h-3 w-3" /> {currentBatter.batting_order}番 {currentBatter.playerName}
                                </div>
                            )}
                            {nextBatter && (
                                <div className="bg-muted text-muted-foreground px-2.5 py-1 rounded-full text-[9px] font-bold shadow-sm flex items-center gap-1 border-2 border-background whitespace-nowrap animate-in slide-in-from-top-2 opacity-95">
                                    <span className="text-primary font-black ml-0.5">NEXT</span>
                                    <ChevronRight className="h-2.5 w-2.5 -mx-1 opacity-50" /> {nextBatter.batting_order}番 {nextBatter.playerName}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}