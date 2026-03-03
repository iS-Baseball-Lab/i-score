// src/components/score/Scoreboard.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Maximize, Activity, ChevronRight, User } from "lucide-react";
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
        <header className="bg-primary text-primary-foreground pt-3 px-4 pb-0 shrink-0 z-10 shadow-md transition-colors duration-300">
            <div className="flex items-center justify-between mb-3">
                {/* 💡 修正2: 戻るボタンをPageHeaderと同じ立体的な半透明ボタンに */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 text-primary-foreground border-none transition-all group shrink-0 -ml-2"
                    asChild
                >
                    <Link href="/dashboard">
                        <ChevronLeft className="h-6 w-6 pr-0.5" />
                    </Link>
                </Button>

                <div className="flex flex-col items-left">
                    {/* 💡 修正3: サブタイトルも半透明の白に変更し、タイトル文字を大きく */}
                    <span className="text-[10px] font-bold text-primary-foreground/80 uppercase tracking-widest mb-0.5">
                        {match.season} {match.matchType === 'practice' ? 'Practice' : 'Official'}
                    </span>
                    <h1 className="font-black text-lg sm:text-xl tracking-tight truncate max-w-[200px]">VS {match.opponent}</h1>
                </div>

                <div className="flex items-center gap-1.5">
                    {/* 💡 修正4: 全画面ボタンも半透明の白に変更 */}
                    <Button onClick={onFinish} size="sm" className="bg-red-500 hover:bg-red-600 text-white font-bold rounded-full px-3 sm:px-4 shadow-sm text-xs h-10 border-none">
                        試合終了
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 text-primary-foreground border-none transition-all"
                        onClick={onToggleFullScreen}
                    >
                        <Maximize className="h-5 w-5" />
                    </Button>
                </div>
            </div>

            <div className="relative -mx-4 mb-2 mt-2">
                {/* 💡 修正5: テーブル部分は元の背景色・文字色(bg-background text-foreground)に戻すことで見やすさを維持 */}
                <div className="bg-background text-foreground border-b border-border overflow-x-auto scrollbar-hide pb-3 shadow-inner">
                    <div className="min-w-[500px] px-2 pt-2">
                        <table className="w-full text-center text-base table-fixed">
                            <thead>
                                <tr className="text-muted-foreground border-b border-border text-sm">
                                    <th className="text-left font-bold pb-2 pl-3 w-28 sticky left-0 bg-background z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] dark:shadow-[2px_0_5px_-2px_rgba(255,255,255,0.05)]">TEAM</th>
                                    {[...Array(9)].map((_, i) => (
                                        <th key={i} className={cn("font-bold pb-2 w-10", inning === i + 1 ? "text-primary font-black text-base" : "")}>{i + 1}</th>
                                    ))}
                                    <th className="font-black pb-2 w-12 text-primary sticky right-0 bg-background z-10 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.1)] dark:shadow-[-2px_0_5px_-2px_rgba(255,255,255,0.05)]">R</th>
                                </tr>
                            </thead>

                            <tbody className="font-black text-base sm:text-lg">
                                <tr className="border-b border-border/50">
                                    <td className="text-left py-3 pl-3 sticky left-0 bg-background z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] dark:shadow-[2px_0_5px_-2px_rgba(255,255,255,0.05)]">
                                        <span className="truncate max-w-[105px] inline-block align-middle">{match.opponent}</span>
                                    </td>
                                    {[...Array(9)].map((_, i) => (
                                        <td key={i} className={cn("py-3", inning === i + 1 && isTop ? "bg-primary/10 text-primary rounded-sm" : "text-muted-foreground")}>
                                            {guestInningScores[i] !== null ? guestInningScores[i] : '-'}
                                        </td>
                                    ))}
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

                {/* 投手とネクストバッターの表示 */}
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