// src/components/score/PlayLog.tsx
"use client";

import { Activity, Swords, XCircle, Star, Footprints, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useScore, PlayEvent } from "@/contexts/ScoreContext";

// 💡 プレイログ（1球ごとの結果や打席結果）の型定義
export type PlayResultType = "hit" | "out" | "run" | "walk" | "other";

export interface PlayEvent {
    id: string;
    inningText: string; // 例: "3回裏"
    resultType: PlayResultType;
    batterName: string;
    description: string; // 例: "レフト前へのタイムリーヒット！"
    timestamp: string; // 例: "14:23"
}

export interface PlayLogProps {
    logs?: PlayEvent[];
}

export function PlayLog() {
    // 💡 Contextから「生きたログデータ」を取得！
    const { logs } = useScore();

    const getEventStyle = (type: PlayEvent["resultType"]) => {
        switch (type) {
            case "hit": return { icon: Swords, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" };
            case "run": return { icon: Star, color: "text-primary", bg: "bg-primary/10", border: "border-primary/20" };
            case "out": return { icon: XCircle, color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20" };
            case "walk": return { icon: Footprints, color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20" };
            default: return { icon: Info, color: "text-muted-foreground", bg: "bg-muted", border: "border-border/50" };
        }
    };

    return (
        <Card className="rounded-[28px] border-border/50 bg-card/80 backdrop-blur-xl shadow-sm overflow-hidden animate-in slide-in-from-bottom-4 duration-500 delay-200 mb-8 sm:mb-12">
            <CardHeader className="pb-4 border-b border-border/40 bg-muted/20">
                <CardTitle className="text-lg sm:text-xl font-black flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary" />
                    プレイログ・実況
                </CardTitle>
            </CardHeader>

            <CardContent className="p-4 sm:p-6">
                {/* スマホで画面が長くなりすぎないよう、高さを固定してスクロール可能に */}
                <div className="max-h-[300px] sm:max-h-[400px] overflow-y-auto custom-scrollbar pr-2">

                    {logs.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground font-bold">
                            まだプレイ記録がありません。
                        </div>
                    ) : (
                        <div className="relative border-l-2 border-border/50 ml-3 sm:ml-4 pl-6 sm:pl-8 space-y-6 sm:space-y-8 py-2">
                            {logs.map((log, index) => {
                                const style = getEventStyle(log.resultType);
                                const Icon = style.icon;

                                // 💡 イニングが変わったタイミングで区切り線を入れるロジック
                                // (新しいログが配列の先頭に来るため、"次のログ" とイニングが違うかをチェック)
                                const showInningDivider = index === logs.length - 1 || logs[index + 1].inningText !== log.inningText;

                                return (
                                    <div key={log.id} className="relative group">

                                        {/* イニングの区切り表示 */}
                                        {showInningDivider && (
                                            <div className="absolute -left-[54px] sm:-left-[60px] -top-5 bg-background border border-border/50 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-black text-muted-foreground shadow-sm z-10">
                                                {log.inningText}
                                            </div>
                                        )}

                                        {/* タイムラインの丸いアイコン */}
                                        <div className={cn("absolute -left-[35px] sm:-left-[43px] top-0.5 h-7 w-7 sm:h-8 sm:w-8 rounded-full border shadow-sm flex items-center justify-center transition-transform group-hover:scale-110", style.bg, style.border)}>
                                            <Icon className={cn("h-3.5 w-3.5 sm:h-4 sm:w-4", style.color)} />
                                        </div>

                                        {/* ログの内容 */}
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-black text-sm sm:text-base text-foreground">{log.batterName}</span>
                                                <span className="text-[10px] sm:text-xs font-bold text-muted-foreground">{log.timestamp}</span>
                                            </div>
                                            <p className="text-sm sm:text-base font-bold text-muted-foreground leading-relaxed">
                                                {log.description}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                </div>
            </CardContent>
        </Card>
    );
}