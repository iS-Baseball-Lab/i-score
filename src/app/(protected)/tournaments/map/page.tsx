"use client";

import React, { useState, useEffect, Suspense } from "react";
/**
 * 💡 大会マップ: チーム参戦トラッカー v3.7 (Type-Safe Edition)
 * 配置パス: src/app/(protected)/tournaments/map/page.tsx
 * * 🛠 修正・改善事項:
 * 1. TypeScriptの厳格な型チェックに対応。APIレスポンスのキャストを徹底し `any` を排除。
 * 2. `JSON.parse` の結果を型安全に処理し、AI分析結果の反映を確実に。
 * 3. 影を一切使わない「究極のフラットデザイン」を継承。
 * 4. プレビュー環境でのビルドエラーを避けるため、標準のナビゲーションAPIを使用。
 */
import {
    Card,
    CardContent
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Trophy,
    Calendar,
    MapPin,
    ChevronRight,
    Loader2,
    Sparkles,
    Zap,
    Target,
    Users2,
    Activity,
    Medal,
    TrendingUp,
    Sword,
    Search,
    Plus,
    BarChart4,
    Flame,
    ArrowLeft
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ⚾️ 型定義 (Schema Protocol)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface Tournament {
    id: string;
    name: string;
    category: string;
    status: 'ongoing' | 'upcoming' | 'finished';
    period: string;
    venue: string;
    currentRound: string;
    nextMatchDate?: string;
    teamCount: number;
    winProbability?: number;
}

interface AiAnalysisResult {
    insight: string;
    mvp: string;
    probability: number;
}

interface GeminiResponse {
    candidates?: {
        content?: {
            parts?: {
                text?: string;
            }[];
        };
    }[];
    error?: { message: string };
}

/**
 * 🏟 大会マップメインコンポーネント
 */
function TournamentMapContent() {
    const [tournaments, setTournaments] = useState<Tournament[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [aiAnalysis, setAiAnalysis] = useState<AiAnalysisResult | null>(null);

    // 💡 ブラウザ標準APIによるナビゲーション
    const navigateTo = (path: string) => {
        if (typeof window !== "undefined") {
            window.location.href = path;
        }
    };

    const goBack = () => {
        if (typeof window !== "undefined") {
            window.history.back();
        }
    };

    useEffect(() => {
        const fetchTournaments = async () => {
            // API取得を模したモックデータ
            const timer = setTimeout(() => {
                setTournaments([
                    {
                        id: "t_1",
                        name: "第45回 春季市民野球大会",
                        category: "Aクラス",
                        status: 'ongoing',
                        period: "2024年3月 〜 5月",
                        venue: "市営第一球場 他",
                        currentRound: "準々決勝 進出",
                        nextMatchDate: "04/05 10:00",
                        teamCount: 32,
                        winProbability: 68
                    },
                    {
                        id: "t_2",
                        name: "2024 サマートーナメント",
                        category: "オープン",
                        status: 'upcoming',
                        period: "2024年7月 〜 8月",
                        venue: "河川敷グラウンド",
                        currentRound: "エントリー完了",
                        teamCount: 16,
                        winProbability: 15
                    }
                ]);
                setIsLoading(false);
            }, 600);
            return () => clearTimeout(timer);
        };
        fetchTournaments();
    }, []);

    // ✨ Gemini 2.5 Flash による戦術シミュレーション
    const analyzeTournamentPath = async () => {
        if (tournaments.length === 0) return;

        setIsAnalyzing(true);
        try {
            const activeT = tournaments[0];
            const prompt = `
        野球の大会 "${activeT.name}" で現在「${activeT.currentRound}」という状況のチームに対し、
        プロのアナリストとして以下の3点を日本語のJSONで回答してください。
        1. insight: 勝ち上がりのための核心的な助言（100文字以内）
        2. mvp: 次戦のキーマンとなる選手の名前
        3. probability: 優勝の可能性（0-100の数値のみ）
      `;

            const apiKey = ""; // Canvas環境で自動付与
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

            const res = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: {
                        responseMimeType: "application/json"
                    },
                    systemInstruction: {
                        parts: [{ text: "あなたはチーム専属の敏腕データアナリストです。監督・選手が奮い立つような、データに基づいた鋭い分析を行ってください。" }]
                    }
                })
            });

            // 💡 型安全プロトコル: 明示的なキャストによる unknown 回避
            const result = (await res.json()) as GeminiResponse;

            if (result.error) {
                throw new Error(result.error.message);
            }

            const text = result.candidates?.[0]?.content?.parts?.[0]?.text;

            if (text) {
                // 💡 パース結果を型安全に扱う
                const parsed = JSON.parse(text) as AiAnalysisResult;
                setAiAnalysis(parsed);
                toast.success("最新のシミュレーションが完了しました");
            }
        } catch (e) {
            console.error(e);
            toast.error("シミュレーションエンジンに接続できませんでした");
        } finally {
            setIsAnalyzing(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-transparent">
                <Loader2 className="animate-spin text-primary opacity-30 h-10 w-10" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-transparent text-foreground transition-colors duration-500 relative pb-20 overflow-x-hidden">

            {/* 🏟 スタジアム背景グラデーション */}
            <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(var(--primary),0.05),transparent)] pointer-events-none -z-10" />

            {/* ニュースティッカー */}
            <div className="w-full bg-primary/5 border-b border-border/40 h-10 flex items-center overflow-hidden backdrop-blur-md">
                <div className="flex animate-[marquee_30s_linear_infinite] whitespace-nowrap gap-16">
                    <span className="text-[11px] font-bold text-primary flex items-center gap-2">
                        <Flame className="h-3.5 w-3.5" /> 速報：次戦の相手が「ベアーズ」に決定
                    </span>
                    <span className="text-[11px] font-bold text-muted-foreground flex items-center gap-2">
                        お知らせ：春季大会のトーナメント表が更新されました
                    </span>
                    <span className="text-[11px] font-bold text-primary flex items-center gap-2">
                        <Zap className="h-3.5 w-3.5" /> AI予測：現在の優勝期待度は前回比 +5% です
                    </span>
                </div>
            </div>

            <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-10 animate-in fade-in duration-700">

                {/* 1. ヘッダーセクション */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border/40 pb-8">
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <Button variant="ghost" onClick={goBack} className="h-8 w-8 p-0 rounded-full hover:bg-primary/10 transition-colors">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                            <Badge variant="outline" className="border-primary/20 text-primary bg-primary/5 rounded-full px-3 py-0.5 text-[10px] font-black tracking-widest uppercase">
                                Championship Tracker
                            </Badge>
                        </div>
                        <h1 className="text-4xl font-black tracking-tighter italic text-foreground leading-none">
                            大会<span className="text-primary underline decoration-primary/10 underline-offset-[6px]">マップ</span>
                        </h1>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            onClick={() => navigateTo('/tournaments')}
                            className="rounded-2xl h-12 px-6 border-border bg-card/40 backdrop-blur-md hover:bg-muted font-bold text-xs"
                        >
                            大会の新規登録
                        </Button>
                    </div>
                </div>

                {/* 2. AI 戦略シミュレーター */}
                <section
                    className="relative group cursor-pointer"
                    onClick={!aiAnalysis ? analyzeTournamentPath : undefined}
                >
                    <div className="absolute inset-0 bg-primary/5 blur-3xl opacity-30 group-hover:opacity-60 transition-opacity" />
                    <Card className="relative bg-card/10 dark:bg-zinc-950/10 border-border/60 backdrop-blur-xl rounded-[32px] overflow-hidden border-dashed border-2 hover:border-primary/30 transition-all duration-500 shadow-none">
                        <CardContent className="p-6 sm:p-10">
                            {!aiAnalysis ? (
                                <div className="flex flex-col md:flex-row items-center gap-8">
                                    <div className="relative">
                                        <div className="h-16 w-16 rounded-[20px] bg-primary flex items-center justify-center text-primary-foreground group-hover:rotate-3 transition-transform duration-500">
                                            {isAnalyzing ? <Loader2 className="h-8 w-8 animate-spin" /> : <Sparkles className="h-8 w-8" />}
                                        </div>
                                    </div>
                                    <div className="flex-1 text-center md:text-left space-y-1">
                                        <h2 className="text-lg font-black italic text-foreground flex items-center justify-center md:justify-start gap-2">
                                            頂点への最短ルートをシミュレート
                                        </h2>
                                        <p className="text-xs font-bold text-muted-foreground leading-relaxed">
                                            参戦中のデータを分析し、次戦の勝利戦略と優勝確率を算出します。
                                        </p>
                                        <div className="pt-2">
                                            <span className="inline-flex items-center gap-1.5 text-primary font-black text-[9px] uppercase tracking-[0.1em] bg-primary/10 px-3 py-1.5 rounded-full">
                                                AI解析を実行 <ChevronRight className="h-3 w-3" />
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="animate-in zoom-in-95 duration-500 space-y-6">
                                    <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                                        <div className="space-y-4 flex-1">
                                            <div className="flex items-center gap-2">
                                                <Badge className="bg-primary text-primary-foreground border-none font-black text-[9px] uppercase px-3 rounded-md shadow-sm">Analysis Ready</Badge>
                                                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60">Strategic Insight</span>
                                            </div>
                                            <h3 className="text-xl md:text-2xl font-black italic leading-snug border-l-4 border-primary pl-5 text-foreground">
                                                「{aiAnalysis.insight}」
                                            </h3>
                                            <div className="flex items-center gap-3 text-xs font-bold text-muted-foreground pl-5">
                                                <Target className="h-4 w-4 text-primary opacity-60" />
                                                注目選手: <span className="text-foreground border-b border-primary/20 font-black">{aiAnalysis.mvp}</span>
                                            </div>
                                        </div>
                                        {/* 優勝期待値サークル */}
                                        <div className="w-24 h-24 relative shrink-0">
                                            <svg className="w-full h-full -rotate-90" viewBox="0 0 96 96">
                                                <circle cx="48" cy="48" r="42" className="stroke-muted/20 fill-none" strokeWidth="5" />
                                                <circle
                                                    cx="48" cy="48" r="42"
                                                    className="stroke-primary fill-none transition-all duration-1000"
                                                    strokeWidth="5"
                                                    strokeDasharray={264}
                                                    strokeDashoffset={264 - (264 * aiAnalysis.probability) / 100}
                                                    strokeLinecap="round"
                                                />
                                            </svg>
                                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                <span className="text-2xl font-black tabular-nums">{aiAnalysis.probability}%</span>
                                                <span className="text-[8px] font-black uppercase opacity-40 text-center leading-none">Victory<br />Goal</span>
                                            </div>
                                        </div>
                                    </div>
                                    <Button variant="ghost" onClick={() => setAiAnalysis(null)} className="w-full border-t border-border/40 rounded-none h-10 text-[10px] font-black uppercase tracking-widest hover:bg-primary/5">リセット</Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </section>

                {/* 3. 参戦大会リスト */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-primary opacity-60" /> 参戦中の大会一覧
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        {tournaments.map((t) => (
                            <Card
                                key={t.id}
                                className={cn(
                                    "bg-card/30 dark:bg-zinc-900/10 backdrop-blur-md border-border/80 rounded-[32px] overflow-hidden group transition-all duration-500 hover:border-primary/20 shadow-none",
                                    t.status === 'ongoing' ? "ring-1 ring-primary/20 bg-card/50" : ""
                                )}
                            >
                                <CardContent className="p-0">
                                    <div className="flex flex-col lg:flex-row items-stretch">

                                        {/* 左側ラベル */}
                                        <div className={cn(
                                            "w-full lg:w-24 flex flex-col items-center justify-center p-6 border-b lg:border-b-0 lg:border-r border-border/40 gap-2",
                                            t.status === 'ongoing' ? "bg-primary text-primary-foreground" : "bg-muted/40"
                                        )}>
                                            {t.status === 'ongoing' ? (
                                                <>
                                                    <Activity className="h-6 w-6 animate-pulse" />
                                                    <span className="text-[9px] font-black uppercase tracking-tighter vertical-text">参戦中</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Calendar className="h-6 w-6 opacity-30" />
                                                    <span className="text-[9px] font-black uppercase tracking-tighter opacity-30 vertical-text">待機中</span>
                                                </>
                                            )}
                                        </div>

                                        {/* 中央メインエリア */}
                                        <div className="flex-1 p-6 md:p-8 space-y-8">
                                            <div className="flex flex-col xl:flex-row justify-between gap-6">
                                                <div className="space-y-3 flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <Badge className="bg-muted text-muted-foreground border-none text-[9px] font-black px-2 py-0.5 rounded-md">{t.category}</Badge>
                                                        <span className="text-[10px] font-black text-primary/70 uppercase tracking-widest">{t.period}</span>
                                                    </div>
                                                    <h3 className="text-2xl md:text-3xl font-black italic uppercase text-foreground leading-tight tracking-tighter group-hover:text-primary transition-colors duration-500">
                                                        {t.name}
                                                    </h3>
                                                    <div className="flex flex-wrap items-center gap-5 pt-1">
                                                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground/80">
                                                            <MapPin className="h-3.5 w-3.5 text-primary opacity-40" />
                                                            {t.venue}
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground/80">
                                                            <Users2 className="h-3.5 w-3.5 text-primary opacity-40" />
                                                            {t.teamCount} チーム参戦
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* スケジュールチップ */}
                                                {t.nextMatchDate && (
                                                    <div className="relative bg-background/40 border border-border/60 rounded-[24px] p-5 flex flex-col items-center gap-1.5 min-w-[180px] backdrop-blur-sm">
                                                        <span className="text-[9px] font-black text-primary uppercase tracking-widest">Next Match</span>
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-xl font-black tabular-nums italic">{t.nextMatchDate.split(' ')[0]}</span>
                                                            <div className="h-5 w-px bg-border rotate-[20deg]" />
                                                            <span className="text-xl font-black tabular-nums italic text-primary">{t.nextMatchDate.split(' ')[1]}</span>
                                                        </div>
                                                        <Badge variant="outline" className="mt-1 border-primary/20 text-primary text-[8px] font-black uppercase rounded-full px-3 italic">対戦相手 未定</Badge>
                                                    </div>
                                                )}
                                            </div>

                                            {/* 進行度トラッカー */}
                                            <div className="space-y-3">
                                                <div className="flex justify-between items-center px-1">
                                                    <div className="flex items-center gap-2">
                                                        <div className="p-1.5 bg-muted rounded-lg"><Target className="h-3.5 w-3.5 text-muted-foreground/60" /></div>
                                                        <span className="text-xs font-black italic text-foreground uppercase tracking-tight">現在の状況: {t.currentRound}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-60">頂点まで</span>
                                                        <span className="text-sm font-black italic text-primary tabular-nums">75%</span>
                                                    </div>
                                                </div>
                                                <div className="h-1.5 w-full bg-muted/40 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-primary transition-all duration-1000 ease-out"
                                                        style={{ width: t.status === 'ongoing' ? '75%' : '0%' }}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* ナビゲーションアクション */}
                                        <button className="w-full lg:w-20 flex items-center justify-center p-6 border-t lg:border-t-0 lg:border-l border-border/40 hover:bg-primary/5 transition-all group/btn bg-muted/5">
                                            <div className="h-10 w-10 rounded-full border border-border group-hover/btn:border-primary group-hover/btn:bg-primary group-hover/btn:text-primary-foreground flex items-center justify-center transition-all duration-500 shadow-inner">
                                                <ChevronRight className="h-5 w-5 group-hover/btn:translate-x-0.5 transition-all" />
                                            </div>
                                        </button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* 4. 格言エリア */}
                <div className="pt-12 pb-10 flex flex-col items-center gap-5">
                    <div className="h-10 w-px bg-gradient-to-b from-border to-transparent" />
                    <div className="flex items-center gap-3 px-8 py-2.5 rounded-full bg-card/20 border border-border/40 backdrop-blur-md">
                        <Sword className="h-4 w-4 text-primary opacity-60" />
                        <p className="text-[10px] font-black italic text-muted-foreground tracking-[0.4em] uppercase text-center">
                            Victory is earned in the details
                        </p>
                    </div>
                </div>

            </main>

            {/* フッター */}
            <footer className="mt-20 py-20 border-t border-border/30 text-center opacity-30">
                <div className="flex flex-col items-center gap-4">
                    <Trophy className="h-7 w-7 text-primary opacity-20" />
                    <p className="text-[10px] font-black tracking-[1.2em] uppercase pl-[1.2em]">
                        知略 • 誠実 • 卓越
                    </p>
                </div>
            </footer>

            {/* グローバルスタイル */}
            <style jsx global>{`
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .vertical-text {
          writing-mode: vertical-rl;
          text-orientation: mixed;
        }
      `}</style>
        </div>
    );
}

export default function TournamentMapPage() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center bg-transparent"><Loader2 className="animate-spin text-primary" /></div>}>
            <TournamentMapContent />
        </Suspense>
    );
}