// src/app/(protected)/teams/roster/page.tsx
"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Plus, Edit2, Trash2, X, Save, Loader2, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

interface Player {
    id: string;
    teamId: string;
    name: string;
    uniformNumber: string;
}

function RosterContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    
    // URLパラメータからチームIDを取得（なければローカルストレージから）
    const teamId = searchParams.get("id") || (typeof window !== 'undefined' ? localStorage.getItem("iScore_selectedTeamId") : null);

    const [players, setPlayers] = useState<Player[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    
    const [formData, setFormData] = useState({
        name: "",
        uniformNumber: "",
    });

    // 💡 1. データベースから本物の選手リストを取得するAPI通信
    const fetchPlayers = async () => {
        if (!teamId) return;
        setIsLoading(true);
        try {
            // 💡 実際のAPIのパスに合わせました！
            const res = await fetch(`/api/teams/${teamId}/players`);
            if (res.ok) {
                const data = await res.json() as Player[];
                setPlayers(data);
            } else {
                toast.error("選手データの取得に失敗しました");
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!teamId) {
            toast.error("対象チームが選択されていません");
            router.push('/dashboard');
            return;
        }
        fetchPlayers();
    }, [teamId, router]);

    // 💡 2. 新規選手をデータベースに保存するAPI通信
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
                fetchPlayers(); // 保存後に再取得して画面を更新
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

    // 💡 3. 選手をデータベースから削除するAPI通信
    const handleDeletePlayer = async (playerId: string, playerName: string) => {
        if (!teamId || !confirm(`本当に選手「${playerName}」を削除しますか？`)) return;
        
        try {
            const res = await fetch(`/api/teams/${teamId}/players/${playerId}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                toast.success(`${playerName} を削除しました`);
                fetchPlayers(); // 削除後に再取得
            } else {
                toast.error("選手の削除に失敗しました");
            }
        } catch (e) {
            console.error(e);
        }
    };

    if (!teamId) return null;

    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground pb-24 relative">
            <PageHeader 
                href="/dashboard" 
                icon={Users} 
                title="選手名簿 (ロースター)" 
                subtitle="チーム所属選手の管理" 
            />

            <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-6xl mx-auto w-full space-y-6 animate-in fade-in duration-500">
                {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-40 rounded-2xl w-full" />)}
                    </div>
                ) : players.length === 0 ? (
                    <div className="text-center py-20 bg-muted/20 rounded-3xl border border-dashed border-border/60">
                        <ShieldAlert className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-foreground mb-2">まだ選手が登録されていません</h3>
                        <p className="text-sm text-muted-foreground mb-6">右下の追加ボタンから、チームの選手を登録しましょう。</p>
                        <Button onClick={() => setIsModalOpen(true)} className="font-bold rounded-xl shadow-sm">
                            <Plus className="h-4 w-4 mr-2" /> 最初の選手を登録
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                        {players.map((player) => (
                            <Card key={player.id} className="relative overflow-hidden group border-border/60 bg-gradient-to-br from-background via-background to-muted/30 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1.5 rounded-2xl">
                                <div className="absolute -bottom-6 -right-2 text-[220px] sm:-bottom-8 sm:-right-2 sm:text-[280px] font-black italic text-foreground/5 group-hover:text-primary/10 transition-colors select-none z-0 tracking-tighter leading-none">{player.uniformNumber}</div>
                                <div className="absolute top-0 left-0 w-1.5 h-full bg-primary/20 group-hover:bg-primary transition-colors z-10" />
                                <CardContent className="p-6 relative z-10 flex flex-col h-full pl-8">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary font-black text-xl border border-primary/20 shadow-inner group-hover:scale-110 transition-transform">{player.uniformNumber}</div>
                                        {/* DBにないためダミーのバッジを表示 */}
                                        <span className="px-3 py-1 text-[10px] font-extrabold rounded-full bg-muted text-muted-foreground tracking-widest border border-border/50 shadow-sm opacity-50">Player</span>
                                    </div>
                                    <h3 className="text-2xl font-black tracking-tight mb-4 truncate group-hover:text-primary transition-colors">{player.name}</h3>
                                    
                                    <div className="mt-auto pt-4 border-t border-border/30 flex justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                        {/* 今回は削除ボタンのみ有効化 */}
                                        <Button variant="outline" size="icon" onClick={() => handleDeletePlayer(player.id, player.name)} className="h-8 w-8 rounded-full border-border/50 text-muted-foreground hover:text-red-500 hover:border-red-500/50 hover:bg-red-500/10 z-20 relative">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </main>

            <Button 
                onClick={() => setIsModalOpen(true)}
                className="fixed bottom-16 right-4 sm:bottom-8 sm:right-8 h-14 w-14 sm:h-16 sm:w-16 rounded-full shadow-2xl shadow-primary/40 bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300 hover:scale-110 active:scale-95 z-40 flex items-center justify-center"
            >
                <Plus className="h-6 w-6 sm:h-8 sm:w-8" />
                <span className="sr-only">選手を追加</span>
            </Button>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-0 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="absolute inset-0" onClick={() => !isSaving && setIsModalOpen(false)} />
                    <div className="relative w-full max-w-lg bg-background border border-border shadow-2xl rounded-3xl sm:rounded-2xl overflow-hidden animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-4 duration-300">
                        <div className="flex items-center justify-between p-6 border-b border-border/50 bg-muted/20">
                            <h2 className="text-xl font-extrabold flex items-center gap-2 tracking-tight">
                                <Users className="h-5 w-5 text-primary" /> 新規選手の登録
                            </h2>
                            <Button variant="ghost" size="icon" onClick={() => setIsModalOpen(false)} disabled={isSaving} className="h-8 w-8 rounded-full hover:bg-muted">
                                <X className="h-5 w-5" />
                            </Button>
                        </div>
                        
                        <form onSubmit={handleSavePlayer} className="p-6 space-y-5">
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2 col-span-2">
                                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">選手名</label>
                                    <input type="text" required placeholder="例: 山田 太郎" className="flex h-12 w-full rounded-xl border border-input bg-background px-4 text-sm font-bold shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} disabled={isSaving} />
                                </div>
                                <div className="space-y-2 col-span-1">
                                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">背番号</label>
                                    <input type="text" required placeholder="1" className="flex h-12 w-full rounded-xl border border-input bg-background px-4 text-sm font-bold shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary text-center" value={formData.uniformNumber} onChange={(e) => setFormData({...formData, uniformNumber: e.target.value})} disabled={isSaving} />
                                </div>
                            </div>

                            <div className="pt-4 mt-2 border-t border-border/50 flex gap-3">
                                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} disabled={isSaving} className="flex-1 h-12 rounded-xl font-bold">キャンセル</Button>
                                <Button type="submit" disabled={isSaving} className="flex-1 h-12 rounded-xl font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-md">
                                    {isSaving ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : <><Save className="h-4 w-4 mr-2" /> 登録する</>}
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




