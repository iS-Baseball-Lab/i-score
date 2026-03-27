// src/app/(protected)/teams/requests/page.tsx
"use client";

import React, { useState, useEffect, Suspense } from "react";
/**
 * 💡 チーム参加リクエスト管理
 * 1. 「入部」ではなく「チームへの参加申請」に特化した文言とフロー。
 * 2. Gemini API を使用し、リクエスト主の意気込みや経歴から AI スカウトが助言。
 * 3. 他の画面と背景を完全に同期 (bg-transparent + radial-gradient)。
 * 4. チームページ譲りの「角丸40px」「低シャドウ」のプロフェッショナルUI。
 */
import {
    Card,
    CardContent
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Check,
    X,
    UserPlus,
    Loader2,
    Sparkles,
    MessageSquare,
    Clock,
    UserCircle2,
    Info,
    ChevronLeft,
    Trophy,
    History
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// --- 型定義 ---
interface JoinRequest {
    id: string;
    name: string;
    nameKana: string;
    age: number;
    position: string;
    experience: string;
    message: string;
    requestDate: string;
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

function TeamRequestsContent() {
    const [requests, setRequests] = useState<JoinRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [analyzingId, setAnalyzingId] = useState<string | null>(null);
    const [aiInsights, setAiInsights] = useState<Record<string, string>>({});

    useEffect(() => {
        // 参加リクエストデータの取得シミュレーション
        const fetchRequests = async () => {
            setTimeout(() => {
                setRequests([
                    {
                        id: "req_1",
                        name: "河村 翼",
                        nameKana: "カワムラ ツバサ",
                        age: 24,
                        position: "遊撃手 / 二塁手",
                        experience: "高校野球（レギュラー）、現在は草野球チームで活動中",
                        message: "守備の連携を大切にするチームと聞いて興味を持ちました。機動力で貢献したいです！",
                        requestDate: "2024-03-27"
                    },
                    {
                        id: "req_2",
                        name: "佐々木 大輔",
                        nameKana: "ササキ ダイスケ",
                        age: 29,
                        position: "捕手 / 一塁手",
                        experience: "大学野球まで現役。ブランクがありますが、体力には自信があります。",
                        message: "仕事が落ち着いたので、また真剣に野球がしたいと思い申請しました。キャッチャーとしてチームを支えたいです。",
                        requestDate: "2024-03-28"
                    }
                ]);
                setIsLoading(false);
            }, 800);
        };
        fetchRequests();
    }, []);

    // ✨ AI スカウトの助言 (Gemini API)
    const generateAiInsight = async (req: JoinRequest) => {
        setAnalyzingId(req.id);
        try {
            const prompt = `
        野球チームへの「参加リクエスト」を分析し、監督へスカウト視点のアドバイスを日本語で提供してください。
        名前: ${req.name} (${req.age}歳, ${req.position})
        経験: ${req.experience}
        メッセージ: ${req.message}
        
        内容: この選手がチームに加わった際の「戦術的なメリット」と「監督が面談で確認すべき1点」を、100文字以内でプロのスカウト風に記述してください。
      `;

            const apiKey = "";
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

            const res = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
            });
            const result = (await res.json()) as GeminiResponse;
            const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) setAiInsights(prev => ({ ...prev, [req.id]: text.trim() }));
        } catch (e) {
            toast.error("AI分析に失敗しました");
        } finally {
            setAnalyzingId(null);
        }
    };

    const handleAction = (id: string, action: 'accept' | 'reject') => {
        toast.success(action === 'accept' ? "チームへの参加を承認しました" : "リクエストを見送りました");
        setRequests(prev => prev.filter(r => r.id !== id));
    };

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-transparent">
                <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-transparent text-foreground transition-colors duration-500 relative pb-20 overflow-x-hidden">
            {/* スタジアム統一背景 */}
            <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(var(--primary),0.05),transparent)] pointer-events-none -z-10" />

            <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-10 animate-in fade-in duration-1000">

                {/* ヘッダーセクション */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <Badge variant="outline" className="border-primary/30 text-primary bg-primary/5 rounded-full px-4 py-1 text-[10px] font-black tracking-[0.2em] uppercase">
                                チーム運営
                            </Badge>
                            <div className="flex items-center gap-1.5 text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-40">
                                <Clock className="h-3 w-3" /> 待機中のリクエスト: {requests.length}件
                            </div>
                        </div>
                        <h1 className="text-5xl font-black tracking-tighter italic uppercase text-foreground leading-none">
                            参加<span className="text-primary underline decoration-primary/20 underline-offset-8">リクエスト</span>
                        </h1>
                        <p className="text-sm font-bold text-muted-foreground">新しい戦力がチームの門を叩いています。</p>
                    </div>

                    <Button
                        variant="ghost"
                        onClick={() => window.history.back()}
                        className="rounded-2xl h-14 px-6 font-black text-xs tracking-widest uppercase hover:bg-muted group"
                    >
                        <ChevronLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" /> 戻る
                    </Button>
                </div>

                {/* リクエストリスト */}
                <div className="space-y-6">
                    {requests.map((req) => (
                        <Card key={req.id} className="bg-card/40 dark:bg-zinc-900/20 backdrop-blur-md border-border rounded-[40px] overflow-hidden shadow-sm border-t-primary/5 group transition-all duration-300 hover:border-primary/30">
                            <CardContent className="p-0">
                                <div className="p-8 space-y-8">

                                    {/* リクエスト主の情報 */}
                                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                                        <div className="flex items-center gap-5">
                                            <div className="h-16 w-16 rounded-[22px] bg-muted/50 flex items-center justify-center border border-border group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all duration-500">
                                                <UserCircle2 className="h-8 w-8" />
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{req.nameKana}</p>
                                                    <Badge variant="outline" className="text-[9px] font-black border-zinc-200 dark:border-zinc-800 rounded-md">{req.age}歳</Badge>
                                                </div>
                                                <h3 className="text-3xl font-black text-foreground leading-none tracking-tighter italic uppercase">{req.name}</h3>
                                                <Badge className="bg-primary/10 text-primary border-none text-[10px] font-black rounded-md px-2 py-0.5 uppercase tracking-wider">{req.position}</Badge>
                                            </div>
                                        </div>

                                        {/* アクションボタン */}
                                        <div className="flex gap-2">
                                            <Button
                                                onClick={() => handleAction(req.id, 'reject')}
                                                variant="outline"
                                                className="rounded-2xl h-12 w-12 border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                                            >
                                                <X className="h-5 w-5" />
                                            </Button>
                                            <Button
                                                onClick={() => handleAction(req.id, 'accept')}
                                                className="rounded-2xl h-12 px-8 bg-emerald-600 text-white font-black hover:bg-emerald-500 flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-emerald-500/20"
                                            >
                                                <Check className="h-5 w-5 stroke-[3px]" /> 加入を承認
                                            </Button>
                                        </div>
                                    </div>

                                    {/* 詳細情報グリッド */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2 px-1">
                                                <History className="h-3.5 w-3.5 text-muted-foreground" />
                                                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">経験・経歴</span>
                                            </div>
                                            <div className="bg-muted/20 p-5 rounded-[24px] border border-border/50 text-sm font-bold italic leading-relaxed">
                                                {req.experience}
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2 px-1">
                                                <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
                                                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">メッセージ</span>
                                            </div>
                                            <div className="bg-muted/20 p-5 rounded-[24px] border border-border/50 text-sm font-bold italic leading-relaxed">
                                                {req.message}
                                            </div>
                                        </div>
                                    </div>

                                    {/* ✨ AI スカウト・インサイト */}
                                    <div className="pt-2">
                                        {aiInsights[req.id] ? (
                                            <div className="bg-primary/5 p-6 rounded-[28px] border border-primary/10 animate-in fade-in zoom-in-95 duration-500 relative overflow-hidden">
                                                <div className="absolute top-0 right-0 p-4 opacity-5"><Sparkles className="h-12 w-12 text-primary" /></div>
                                                <div className="flex items-center gap-2 mb-3">
                                                    <Sparkles className="h-4 w-4 text-primary" />
                                                    <span className="text-[10px] font-black uppercase text-primary tracking-widest">AI Scout Insight</span>
                                                </div>
                                                <p className="text-xs font-bold leading-relaxed text-foreground italic border-l-2 border-primary/20 pl-4 py-0.5 relative z-10">
                                                    {aiInsights[req.id]}
                                                </p>
                                            </div>
                                        ) : (
                                            <Button
                                                onClick={() => generateAiInsight(req)}
                                                disabled={analyzingId === req.id}
                                                variant="outline"
                                                className="w-full h-14 rounded-2xl border-dashed border-primary/30 bg-primary/5 text-primary font-black flex items-center justify-center gap-2 hover:bg-primary/10 transition-all group"
                                            >
                                                {analyzingId === req.id ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Sparkles className="h-4 w-4 group-hover:rotate-12 transition-transform" />
                                                )}
                                                AIスカウトにこの選手を分析させる
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                            {/* 下部の装飾ライン */}
                            <div className="h-1 w-full bg-gradient-to-r from-transparent via-primary/10 to-transparent" />
                        </Card>
                    ))}

                    {/* リクエストなしの表示 */}
                    {requests.length === 0 && (
                        <div className="py-24 flex flex-col items-center justify-center text-center space-y-5 opacity-20">
                            <div className="p-6 rounded-full bg-muted/50">
                                <Trophy className="h-12 w-12" />
                            </div>
                            <div className="space-y-1">
                                <p className="font-black text-2xl italic uppercase tracking-tighter">No Active Requests</p>
                                <p className="text-sm font-bold">現在、新規の参加リクエストはありません。</p>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* フッター */}
            <footer className="mt-20 py-12 border-t border-border text-center opacity-30">
                <p className="text-[10px] font-black tracking-[0.6em] text-muted-foreground uppercase">
                    Team Management • Scouting Module • i-Score
                </p>
            </footer>
        </div>
    );
}

export default function TeamRequestsPage() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center bg-transparent"><Loader2 className="animate-spin text-primary" /></div>}>
            <TeamRequestsContent />
        </Suspense>
    );
}