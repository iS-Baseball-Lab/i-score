// src/app/(protected)/teams/roster/page.tsx
"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link"; // 💡 スタッツ画面への遷移用
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Plus, Trash2, X, Save, Loader2, ShieldAlert, BarChart3, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Player {
    id: string;
    teamId: string;
    name: string;
    uniformNumber: string;
}

function RosterContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    
    const teamId = searchParams.get("id") || (typeof window !== 'undefined' ? localStorage.getItem("iScore_selectedTeamId") : null);

    const [players, setPlayers] = useState<Player[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    
    const [formData, setFormData] = useState({
        name: "",
        uniformNumber: "",
    });

    const fetchPlayers = async () => {
        if (!teamId) return;
        setIsLoading(true);
        try {
            const res = await fetch(`/api/teams/${teamId}/players`);
            if (res.ok) {
                const data = await res.json() as Player[];
                // 💡 背番号順に並び替え（実用性アップ）
                setPlayers(data.sort((a, b) => {
                    const numA = parseInt(a.uniformNumber) || 999;
                    const numB = parseInt(b.uniformNumber) || 999;
                    return numA - numB;
                }));
            } else {
                toast.error("選手データの取得に失敗しました");
            }
        } catch (e) { console.error(e); } 
        finally { setIsLoading(false); }
    };

    useEffect(() => {
        if (!teamId) {
            toast.error("対象チームが選択されていません");
            router.push('/dashboard');
            return;
        }
        fetchPlayers();
    }, [teamId, router]);

    const handleSavePlayer = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.uniformNumber || !teamId) return;

        setIsSaving(true);
        try {
            const res = await fetch(`/api/teams/${teamId}/players`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    uniformNumber: formData.uniformNumber,
                }),
            });

            if (res.ok) {
                toast.success("選手を名簿に登録しました！");
                setIsModalOpen(false);
                setFormData({ name: "", uniformNumber: "" });
                fetchPlayers();
            } else {
                toast.error("選手の登録に失敗しました");
            }
        } catch (e) {
            console.error(e);
            toast.error("通信エラーが発生しました");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeletePlayer = async (e: React.MouseEvent, playerId: string, playerName: string) => {
        e.preventDefault(); // 💡 カードのリンク遷移をブロックする
        e.stopPropagation();

        if (!teamId || !confirm(`本当に選手「${playerName}」を名簿から削除しますか？\n（スコアブック上の記録は残ります）`)) return;
        
        try {
            const res = await fetch(`/api/teams/${teamId}/players/${playerId}`, { method: 'DELETE' });
            if (res.ok) {
                toast.success(`${playerName} を削除しました`);
                fetchPlayers();
            } else {
                toast.error("選手の削除に失敗しました");
            }
        } catch (e) { console.error(e); }
    };

    if (!teamId) return null;

    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground pb-24 relative">
            <PageHeader 
                href="/dashboard" 
                icon={Users} 
                title="選手名簿・ロースター" 
                subtitle="チーム所属選手の管理と成績確認" 
            />

            <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-6xl mx-auto w-full space-y-6 animate-in fade-in duration-500">
                {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                        {[1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} className="h-48 rounded-[32px] w-full" />)}
                    </div>
                ) : players.length === 0 ? (
                    <div className="text-center py-20 bg-muted/20 rounded-[32px] border border-dashed border-border/60 shadow-sm">
                        <div className="h-20 w-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-5 border border-primary/10">
                            <ShieldAlert className="h-10 w-10 text-primary/40" />
                        </div>
                        <h3 className="text-xl font-black text-foreground mb-2">まだ選手が登録されていません</h3>
                        <p className="text-sm font-bold text-muted-foreground mb-8">右下の追加ボタンから、チームの選手を登録しましょう。</p>
                        <Button onClick={() => setIsModalOpen(true)} className="font-extrabold rounded-full h-12 px-8 shadow-lg shadow-primary/20 hover:-translate-y-1 transition-all">
                            <Plus className="h-5 w-5 mr-2" /> 最初の選手を登録
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                        {players.map((player) => (
                            /* 💡 究極UI: カード全体をリンク化し、スタッツ画面へ美しく遷移 */
                            <Link 
                                href={`/players/detail?teamId=${teamId}&playerName=${encodeURIComponent(player.name)}&uniformNumber=${encodeURIComponent(player.uniformNumber)}`}
                                key={player.id} 
                                className="block group outline-none"
                            >
                                <Card className="relative overflow-hidden rounded-[32px] border-border/50 bg-background shadow-xs transition-all duration-300 hover:shadow-lg hover:border-primary/40 active:scale-[0.96] cursor-pointer h-full">
                                    
                                    {/* 背景の巨大背番号ウォーターマーク */}
                                    <div className="absolute -bottom-6 -right-2 text-[180px] sm:text-[220px] font-black italic text-foreground/[0.03] group-hover:text-primary/10 transition-colors duration-500 select-none z-0 tracking-tighter leading-none pointer-events-none">
                                        {player.uniformNumber}
                                    </div>
                                    
                                    {/* 左端のアクセントカラー帯 */}
                                    <div className="absolute top-0 left-0 w-2 h-full bg-primary/20 group-hover:bg-primary transition-colors duration-300 z-10" />
                                    
                                    <CardContent className="p-6 relative z-10 flex flex-col h-full pl-8">
                                        <div className="flex justify-between items-start mb-6">
                                            {/* アイコンと背番号 */}
                                            <div className="flex items-center justify-center w-14 h-14 rounded-[20px] bg-primary/10 text-primary font-black text-2xl border border-primary/20 shadow-sm group-hover:scale-110 group-active:scale-95 transition-all duration-300">
                                                {player.uniformNumber}
                                            </div>
                                            {/* 削除ボタン（独立して機能するように e.preventDefault() を設定済み） */}
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                onClick={(e) => handleDeletePlayer(e, player.id, player.name)} 
                                                className="h-10 w-10 rounded-full text-muted-foreground/50 hover:text-red-500 hover:bg-red-500/10 z-20 relative transition-colors"
                                                title="選手を削除"
                                            >
                                                <Trash2 className="h-5 w-5" />
                                            </Button>
                                        </div>
                                        
                                        <h3 className="text-2xl font-black tracking-tight mb-2 truncate group-hover:text-primary transition-colors duration-300 drop-shadow-sm mt-auto">
                                            {player.name}
                                        </h3>
                                        
                                        <div className="flex items-center text-sm font-extrabold text-muted-foreground mt-2 group-hover:text-primary/80 transition-colors duration-300">
                                            <BarChart3 className="h-4 w-4 mr-1.5 opacity-70" />
                                            スタッツを見る <ChevronRight className="h-4 w-4 ml-0.5 transition-transform group-hover:translate-x-1" />
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                )}
            </main>

            {/* 💡 追従する登録ボタン */}
            <Button 
                onClick={() => setIsModalOpen(true)}
                className="fixed bottom-8 right-4 sm:bottom-10 sm:right-8 h-16 w-16 rounded-[24px] shadow-2xl shadow-primary/40 bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300 hover:-translate-y-1 active:scale-[0.92] z-40 flex items-center justify-center"
            >
                <Plus className="h-8 w-8" />
                <span className="sr-only">選手を追加</span>
            </Button>

            {/* 💡 新規登録モーダル（グラスモーフィズム） */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-0 bg-background/60 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="absolute inset-0" onClick={() => !isSaving && setIsModalOpen(false)} />
                    <div className="relative w-full max-w-lg bg-background/95 backdrop-blur-xl border border-border/50 shadow-[0_20px_60px_rgba(0,0,0,0.15)] rounded-[32px] sm:rounded-[36px] overflow-hidden animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-4 duration-300">
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary/50 to-primary" />
                        
                        <div className="flex items-center justify-between p-6 sm:p-8 pb-4">
                            <h2 className="text-xl sm:text-2xl font-black flex items-center gap-3 tracking-tight">
                                <div className="p-2.5 bg-primary/10 rounded-2xl text-primary"><Users className="h-6 w-6" /></div>
                                新規選手の登録
                            </h2>
                            <Button variant="ghost" size="icon" onClick={() => setIsModalOpen(false)} disabled={isSaving} className="h-10 w-10 rounded-full hover:bg-muted/50 transition-all">
                                <X className="h-6 w-6" />
                            </Button>
                        </div>
                        
                        <form onSubmit={handleSavePlayer} className="p-6 sm:p-8 pt-2 space-y-6">
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-3 col-span-2">
                                    <label className="text-xs sm:text-sm font-extrabold text-foreground tracking-wide pl-1">選手名</label>
                                    <input 
                                        type="text" 
                                        required 
                                        placeholder="例: 山田 太郎" 
                                        className="flex h-14 w-full rounded-2xl border border-border/60 bg-muted/20 px-4 text-base font-bold shadow-xs focus-visible:outline-none focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/20 focus-visible:bg-background transition-all" 
                                        value={formData.name} 
                                        onChange={(e) => setFormData({...formData, name: e.target.value})} 
                                        disabled={isSaving} 
                                        autoFocus
                                    />
                                </div>
                                <div className="space-y-3 col-span-1">
                                    <label className="text-xs sm:text-sm font-extrabold text-foreground tracking-wide pl-1 text-center block">背番号</label>
                                    <input 
                                        type="number" 
                                        required 
                                        placeholder="1" 
                                        className="flex h-14 w-full rounded-2xl border border-border/60 bg-muted/20 px-4 text-xl font-black shadow-xs focus-visible:outline-none focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/20 focus-visible:bg-background transition-all text-center placeholder:text-muted-foreground/30" 
                                        value={formData.uniformNumber} 
                                        onChange={(e) => setFormData({...formData, uniformNumber: e.target.value})} 
                                        disabled={isSaving} 
                                    />
                                </div>
                            </div>

                            <div className="pt-6 mt-4 border-t border-border/50 flex gap-3">
                                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} disabled={isSaving} className="flex-1 h-14 rounded-2xl font-extrabold border-border/60 hover:bg-muted/50 shadow-xs">キャンセル</Button>
                                <Button type="submit" disabled={isSaving} className="flex-1 h-14 rounded-2xl font-extrabold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:-translate-y-1 active:scale-[0.98]">
                                    {isSaving ? <Loader2 className="h-6 w-6 animate-spin mx-auto" /> : <><Save className="h-5 w-5 mr-2" /> 登録する</>}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function RosterWrapper() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
            <RosterContent />
        </Suspense>
    );
}
