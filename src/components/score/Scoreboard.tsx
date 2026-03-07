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

    const displayInnings = Math.max(match.innings || 9, Math.max(9, inning));

    return (
        <header className="px-2 pt-2 pb-1 sm:p-4 shrink-0 z-20">
            {/* 💡 修正1: overflow-hiddenを外し、美しいグラデーション（味）を追加 */}
            <div className="bg-gradient-to-b from-background/95 to-background/70 backdrop-blur-2xl border border-border/50 rounded-[28px] shadow-[0_8px_30px_rgba(0,0,0,0.08)] flex flex-col relative">
                
                {/* 上段：ヘッダー情報 */}
                <div className="flex items-center justify-between px-3 py-2.5">
                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full bg-muted/50 hover:bg-muted text-foreground border-none transition-all" asChild>
                        <Link href="/dashboard"><ChevronLeft className="h-5 w-5 pr-0.5" /></Link>
                    </Button>

                    <div className="flex flex-col items-center">
                        <span className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-0.5 opacity-80">
                            {match.season} {match.matchType === 'practice' ? 'Practice' : 'Official'}
                        </span>
                        {/* 💡 修正2: タイトルをプライマリカラーにし、少し光らせる（ドロップシャドウ） */}
                        <h1 className="font-black text-sm sm:text-base tracking-tight truncate max-w-[180px] sm:max-w-[250px] text-primary drop-shadow-sm">
                            VS {match.opponent}
                        </h1>
                    </div>

                    <div className="flex items-center gap-1.5">
                        <Button onClick={onFinish} size="sm" className="bg-[#ef4444]/10 text-[#ef4444] hover:bg-[#ef4444] hover:text-white font-black rounded-full px-4 shadow-none text-[10px] h-8 border-none transition-colors">
                            終了
                        </Button>
                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full bg-muted/50 hover:bg-muted text-foreground border-none transition-all hidden sm:flex" onClick={onToggleFullScreen}>
                            <Maximize className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* 中段：スコアボード本体（バッジが重なるように下部の余白 pb-6 を確保） */}
                <div className="bg-gradient-to-b from-muted/30 to-transparent px-3 pt-3 pb-6 border-t border-border/30 rounded-b-[28px] relative">
                    <div className="flex items-center justify-between overflow-x-auto scrollbar-hide">
                        {/* 左側：チーム名 */}
                        <div className="flex flex-col gap-2.5 w-[70px] sm:w-[90px] shrink-0 font-bold text-xs sm:text-sm">
                            <div className="truncate text-muted-foreground">{match.opponent}</div>
                            <div className="truncate text-primary font-black drop-shadow-sm">Self</div>
                        </div>

                        {/* 中央：イニングスコア */}
                        <div className="flex-1 flex px-2 sm:px-4 gap-1 sm:gap-1.5 min-w-[260px]">
                            {[...Array(displayInnings)].map((_, i) => (
                                <div key={i} className="flex flex-col gap-2 w-6 sm:w-7 items-center justify-center shrink-0">
                                    {/* 表のスコア */}
                                    <div className={cn("text-xs sm:text-sm w-full text-center py-0.5 rounded-md font-bold", inning === i + 1 && isTop ? "bg-foreground/10 text-foreground" : "text-muted-foreground/80")}>
                                        {guestInningScores[i] ?? '-'}
                                    </div>
                                    {/* 裏のスコア */}
                                    <div className={cn("text-xs sm:text-sm w-full text-center py-0.5 rounded-md font-bold", inning === i + 1 && !isTop ? "bg-primary/20 text-primary shadow-sm" : "text-muted-foreground/80")}>
                                        {selfInningScores[i] ?? '-'}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* 右側：合計スコア */}
                        <div className="flex flex-col gap-1 w-[40px] sm:w-[50px] shrink-0 items-end">
                            <div className="text-xl sm:text-2xl font-black text-foreground leading-none">{guestScore}</div>
                            <div className="text-xl sm:text-2xl font-black text-primary leading-none drop-shadow-md">{selfScore}</div>
                        </div>
                    </div>

                    {/* 💡 修正3: バッジを枠の内側（上）に重ね、絶対に切れないように配置 */}
                    <div className="absolute left-0 right-0 bottom-1.5 flex justify-center items-end pointer-events-none z-30">
                        <div className="pointer-events-auto flex gap-2">
                            {isTop ? (
                                currentPitcher && (
                                    /* ピッチャーのバッジも美しいグラデーションに！ */
                                    <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-4 py-1.5 rounded-full text-[10px] sm:text-xs font-bold shadow-md border border-blue-400/30 flex items-center gap-2 animate-in slide-in-from-bottom-2">
                                        <div className="flex items-center gap-1.5">
                                            <Activity className="h-3.5 w-3.5 opacity-80" /> <span>P: {currentPitcher.playerName}</span>
                                        </div>
                                        <span className="bg-black/20 px-2 py-0.5 rounded-full text-[9px] flex items-center gap-1.5">
                                            <span className="opacity-80">計{selfPitchCount}球</span><span className="opacity-40">|</span><span className="font-black drop-shadow-sm">今{selfInningPitchCount}球</span>
                                        </span>
                                    </div>
                                )
                            ) : (
                                <>
                                    {currentBatter && (
                                        /* バッターのバッジもプライマリカラーのグラデーションに！ */
                                        <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground px-4 py-1.5 rounded-full text-[10px] sm:text-xs font-bold shadow-md border border-primary-foreground/20 flex items-center gap-1.5 animate-in slide-in-from-bottom-2">
                                            <User className="h-3.5 w-3.5 opacity-80" /> {currentBatter.batting_order}番 {currentBatter.playerName}
                                        </div>
                                    )}
                                    {nextBatter && (
                                        <div className="bg-background/95 backdrop-blur-md text-muted-foreground px-3 py-1.5 rounded-full text-[9px] sm:text-[10px] font-bold shadow-sm border border-border/50 flex items-center gap-1 animate-in slide-in-from-bottom-2">
                                            <span className="text-primary font-black ml-0.5 text-[8px]">NEXT</span>
                                            <ChevronRight className="h-3 w-3 -mx-1 opacity-40" /> {nextBatter.batting_order}番 {nextBatter.playerName}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
