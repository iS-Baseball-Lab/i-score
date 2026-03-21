// src/app/(protected)/matches/lineup/page.tsx
"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ChevronLeft, Users, Loader2, ArrowRight, Wand2, Shield } from "lucide-react";
import { toast } from "sonner";

function LineupContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // URLから matchId と teamId を取得
    const matchId = searchParams.get("id");
    const teamId = searchParams.get("teamId");

    const [isSubmitting, setIsSubmitting] = useState(false);

    // 💡 スタメン9人の状態管理
    const [lineup, setLineup] = useState(
        Array.from({ length: 9 }, (_, i) => ({
            order: i + 1,
            name: "",
            uniformNumber: "",
        }))
    );

    // 1人ずつの入力変更ハンドラー
    const handleLineupChange = (index: number, field: "name" | "uniformNumber", value: string) => {
        const newLineup = [...lineup];
        newLineup[index][field] = value;
        setLineup(newLineup);
    };

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🚀 相手スタメンを一括ダミー入力する関数
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const handleFillDummyLineup = () => {
        const dummyLineup = Array.from({ length: 9 }, (_, i) => ({
            order: i + 1,
            name: `相手打者${i + 1}`,
            uniformNumber: "", // 背番号は空欄
        }));
        setLineup(dummyLineup);
        toast.success("ダミーのスタメンを一括設定しました！");
    };

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🚀 スタメンを保存して、いざ試合画面へ！
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const handleSaveLineup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!matchId) {
            toast.error("試合IDが見つかりません");
            return;
        }

        setIsSubmitting(true);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";

            // 💡 PATCHメソッドでスタメン情報（battingOrder）を更新！
            const res = await fetch(`${apiUrl}/api/matches/${matchId}`, {
                method: "PATCH",
                credentials: "include", // 認証情報を送る
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    battingOrder: lineup,
                }),
            });

            if (res.ok) {
                toast.success("スタメンを登録しました！試合画面へ移動します");
                // ⚾️ ついにスコア画面（試合本番）へワープ！！
                router.push(`/matches/score?id=${matchId}`);
            } else {
                const errorData = await res.json().catch(() => ({})) as { error?: string };
                toast.error(errorData.error || "スタメンの保存に失敗しました");
            }
        } catch (error) {
            console.error(error);
            toast.error("通信エラーが発生しました");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!matchId) {
        return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    }

    return (
        <div className="flex flex-col min-h-screen text-foreground pb-32 relative overflow-x-hidden">
            <main className="flex-1 px-4 sm:px-6 max-w-3xl mx-auto w-full mt-6 sm:mt-10 relative z-10 animate-in fade-in duration-500">

                {/* ヘッダー部分 */}
                <div className="mb-8 flex flex-col items-start gap-4">
                    <Button variant="ghost" onClick={() => router.back()} className="rounded-full pl-2 pr-4 hover:bg-muted text-muted-foreground font-extrabold -ml-2 transition-transform active:scale-95">
                        <ChevronLeft className="h-5 w-5 mr-1" /> 試合設定に戻る
                    </Button>
                    <div className="flex flex-col gap-2 w-full">
                        <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-3">
                            <div className="p-2.5 bg-primary/10 rounded-2xl text-primary shadow-sm border border-primary/20">
                                <Users className="h-6 w-6 sm:h-7 sm:w-7" />
                            </div>
                            スターティングメンバー
                        </h1>
                        <p className="text-sm font-bold text-muted-foreground ml-1">
                            打順と背番号を入力してください。分からない場合はダミー入力も可能です。
                        </p>
                    </div>
                </div>

                {/* 入力フォーム */}
                <Card className="rounded-[32px] border-border/50 bg-card/80 backdrop-blur-xl shadow-sm relative overflow-hidden">
                    <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/5 blur-[80px] rounded-full pointer-events-none" />

                    <CardHeader className="flex flex-row items-center justify-between pb-4 relative z-10 border-b border-border/50">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Shield className="w-5 h-5 text-primary" />
                            打順設定
                        </CardTitle>

                        {/* 🪄 ダミー一括入力ボタン */}
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleFillDummyLineup}
                            className="text-xs sm:text-sm font-bold border-primary/30 text-primary hover:bg-primary/10 rounded-full px-4"
                        >
                            <Wand2 className="w-4 h-4 mr-1.5" />
                            ダミーで一括入力
                        </Button>
                    </CardHeader>

                    <CardContent className="p-4 sm:p-8 relative z-10">
                        <form onSubmit={handleSaveLineup} className="space-y-8">

                            {/* 9人分の入力リスト */}
                            <div className="space-y-3">
                                {lineup.map((player, index) => (
                                    <div key={index} className="flex items-center gap-2 sm:gap-4 p-3 rounded-[16px] bg-muted/30 border border-border/50 hover:border-primary/30 transition-colors">
                                        <div className="w-8 h-8 rounded-full bg-background border border-border/50 flex items-center justify-center font-black text-muted-foreground shrink-0 shadow-sm">
                                            {player.order}
                                        </div>
                                        <Input
                                            placeholder="背番号"
                                            value={player.uniformNumber}
                                            onChange={(e) => handleLineupChange(index, "uniformNumber", e.target.value)}
                                            className="w-20 sm:w-24 h-12 rounded-[12px] font-mono text-center font-bold bg-background shadow-inner"
                                        />
                                        <Input
                                            placeholder="選手名 (例: 山田 太郎)"
                                            value={player.name}
                                            onChange={(e) => handleLineupChange(index, "name", e.target.value)}
                                            className="flex-1 h-12 rounded-[12px] font-bold bg-background shadow-inner"
                                        />
                                    </div>
                                ))}
                            </div>

                            {/* 試合開始ボタン */}
                            <div className="pt-4">
                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full h-16 rounded-[24px] text-lg sm:text-xl font-black bg-primary text-primary-foreground hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all active:scale-[0.98]"
                                >
                                    {isSubmitting ? (
                                        <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                                    ) : (
                                        <>⚾️ このオーダーで試合開始！ <ArrowRight className="ml-2 h-6 w-6" /></>
                                    )}
                                </Button>
                            </div>

                        </form>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}

// Next.jsの仕様上、useSearchParamsを使うコンポーネントはSuspenseで囲む必要があります
export default function LineupPage() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
            <LineupContent />
        </Suspense>
    );
}