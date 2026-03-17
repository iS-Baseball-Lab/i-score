// src/app/(protected)/teams/roster/page.tsx
"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Users, Plus, Edit2, Trash2, ChevronLeft, Loader2, Save, CalendarDays, Layers, Search, Tag, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Team } from "../types";

interface Player {
    id: string;
    name: string;
    uniformNumber: string;
}

const getTeamTypeLabel = (type?: string) => {
    switch (type) {
        case 'regular': return '通常';
        case 'selection': return '選抜・合同';
        case 'practice': return '練習・紅白戦';
        case 'ob': return 'OB・その他';
        default: return '通常';
    }
};

function RosterContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [teamId, setTeamId] = useState<string | null>(null);
    const [team, setTeam] = useState<Team | null>(null);

    const [players, setPlayers] = useState<Player[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    const [newNumber, setNewNumber] = useState("");
    const [newName, setNewName] = useState("");
    const [isAdding, setIsAdding] = useState(false);

    const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        const id = searchParams.get("id") || localStorage.getItem("iScore_selectedTeamId");
        if (id) {
            setTeamId(id);
            fetchTeamInfo(id);
            fetchPlayers(id);
        } else {
            router.push("/teams");
        }
    }, [searchParams, router]);

    const fetchTeamInfo = async (id: string) => {
        try {
            const res = await fetch('/api/teams');
            if (res.ok) {
                const teams: Team[] = await res.json();
                const current = teams.find(t => t.id === id);
                if (current) setTeam(current);
            }
        } catch (e) { console.error("編成情報の取得に失敗しました"); }
    };

    const fetchPlayers = async (id: string) => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/teams/${id}/players`);
            if (res.ok) setPlayers(await res.json());
        } catch (e) { toast.error("選手の取得に失敗しました"); }
        finally { setIsLoading(false); }
    };

    const handleAddPlayer = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!teamId || !newNumber.trim() || !newName.trim()) return;

        setIsAdding(true);
        try {
            const res = await fetch(`/api/teams/${teamId}/players`, {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: newName, uniformNumber: newNumber }),
            });
            if (res.ok) {
                toast.success(`${newName} 選手を名簿に登録しました！`);
                setNewNumber(""); setNewName("");
                fetchPlayers(teamId);
                document.getElementById("newNumberInput")?.focus();
            } else {
                toast.error("登録に失敗しました");
            }
        } catch (e) { toast.error("通信エラーが発生しました"); }
        finally { setIsAdding(false); }
    };

    const handleUpdatePlayer = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!teamId || !editingPlayer || !editingPlayer.name.trim() || !editingPlayer.uniformNumber.trim()) return;

        setIsUpdating(true);
        try {
            const res = await fetch(`/api/teams/${teamId}/players/${editingPlayer.id}`, {
                method: "PATCH", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: editingPlayer.name, uniformNumber: editingPlayer.uniformNumber }),
            });
            if (res.ok) {
                toast.success("選手情報を更新しました");
                setEditingPlayer(null);
                fetchPlayers(teamId);
            } else {
                toast.error("更新に失敗しました");
            }
        } catch (e) { toast.error("通信エラーが発生しました"); }
        finally { setIsUpdating(false); }
    };

    const handleDeletePlayer = async (playerId: string, playerName: string) => {
        if (!teamId || !confirm(`⚠️ 本当に ${playerName} 選手を名簿から削除しますか？\n（過去の試合データに影響が出る可能性があります）`)) return;
        try {
            const res = await fetch(`/api/teams/${teamId}/players/${playerId}`, { method: "DELETE" });
            if (res.ok) {
                toast.success("選手を削除しました");
                fetchPlayers(teamId);
            } else {
                toast.error("削除に失敗しました");
            }
        } catch (e) { toast.error("通信エラーが発生しました"); }
    };

    const filteredPlayers = players.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.uniformNumber.includes(searchQuery)
    );

    return (
        <div className="flex flex-col min-h-screen text-foreground pb-32 relative">
            <main className="flex-1 px-4 sm:px-6 max-w-4xl mx-auto w-full mt-6 sm:mt-10 relative z-10 animate-in fade-in duration-500">

                {/* 1. ヘッダー部分 */}
                <div className="mb-8 flex flex-col items-start gap-4">
                    <Button variant="ghost" onClick={() => router.back()} className="rounded-full pl-2 pr-4 hover:bg-muted text-muted-foreground font-extrabold -ml-2 transition-transform active:scale-95">
                        <ChevronLeft className="h-5 w-5 mr-1" /> 戻る
                    </Button>
                    <div className="flex flex-col gap-2 w-full">
                        {team ? (
                            <div className="flex flex-wrap items-center gap-2 mb-1 animate-in fade-in zoom-in duration-300">
                                {team.year && <span className="inline-flex items-center rounded-full px-2.5 py-1 text-[10px] sm:text-xs font-black bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-sm"><CalendarDays className="h-3 w-3 mr-1" />{team.year}年度</span>}
                                {team.tier && <span className="inline-flex items-center rounded-full px-2.5 py-1 text-[10px] sm:text-xs font-black bg-blue-500/10 text-blue-500 border border-blue-500/20 shadow-sm"><Layers className="h-3 w-3 mr-1" />{team.tier}</span>}
                                {team.generation && <span className="inline-flex items-center rounded-full px-2.5 py-1 text-[10px] sm:text-xs font-black bg-purple-500/10 text-purple-500 border border-purple-500/20 shadow-sm"><Users className="h-3 w-3 mr-1" />{team.generation}</span>}
                                {team.teamType && team.teamType !== 'regular' && <span className="inline-flex items-center rounded-full px-2.5 py-1 text-[10px] sm:text-xs font-black bg-orange-500/10 text-orange-500 border border-orange-500/20 shadow-sm"><Tag className="h-3 w-3 mr-1" />{getTeamTypeLabel(team.teamType)}</span>}
                                <span className="text-sm sm:text-base font-black text-muted-foreground ml-1">{team.name}</span>
                            </div>
                        ) : (
                            <div className="h-6 w-64 bg-muted rounded-md animate-pulse mb-1" />
                        )}
                        {/* 💡 基準1: ページタイトル H1 */}
                        <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-3">
                            <div className="p-2.5 bg-primary/10 rounded-2xl text-primary shadow-sm border border-primary/20"><Users className="h-6 w-6 sm:h-7 sm:w-7" /></div>
                            選手名簿
                        </h1>
                    </div>
                </div>

                {/* 2. 連続追加パネル（サクサク入力用） */}
                <Card className="mb-8 rounded-[28px] border-primary/20 bg-primary/5 shadow-sm overflow-hidden relative">
                    <div className="absolute top-0 right-0 -mt-10 -mr-10 w-32 h-32 bg-primary/10 blur-[40px] rounded-full pointer-events-none" />
                    <CardContent className="p-5 sm:p-6 relative z-10">
                        {/* 💡 基準2: セクションタイトル H2 */}
                        <h2 className="text-lg sm:text-xl font-black text-primary/90 tracking-tight mb-4 flex items-center gap-2">
                            <Plus className="h-5 w-5" /> 選手を名簿に追加
                        </h2>
                        <form onSubmit={handleAddPlayer} className="flex flex-col sm:flex-row items-end gap-4">
                            <div className="w-full sm:w-32 space-y-2">
                                {/* 💡 基準3: ラベル（大きく視認性高く！） */}
                                <label className="block text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-widest pl-1">背番号</label>
                                {/* 💡 基準4: 入力エリア */}
                                <Input id="newNumberInput" type="number" placeholder="例: 1" required className="h-12 rounded-[16px] border-primary/30 bg-background text-base font-bold focus-visible:ring-primary/50 text-center shadow-sm transition-all" value={newNumber} onChange={(e) => setNewNumber(e.target.value)} disabled={isAdding} autoFocus />
                            </div>
                            <div className="w-full flex-1 space-y-2">
                                {/* 💡 基準3: ラベル */}
                                <label className="block text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-widest pl-1">選手名</label>
                                {/* 💡 基準4: 入力エリア */}
                                <Input type="text" placeholder="例: 山田 太郎" required className="h-12 rounded-[16px] border-primary/30 bg-background text-base font-bold focus-visible:ring-primary/50 shadow-sm transition-all" value={newName} onChange={(e) => setNewName(e.target.value)} disabled={isAdding} />
                            </div>
                            <Button type="submit" disabled={isAdding || !newNumber || !newName} className="w-full sm:w-auto h-12 rounded-[16px] text-base font-black px-8 bg-primary hover:bg-primary/90 shadow-md shadow-primary/20 transition-all active:scale-95">
                                {isAdding ? <Loader2 className="h-5 w-5 animate-spin" /> : "追加する"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* 3. 検索＆リスト */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                    {/* 💡 基準2: セクションタイトル H2 */}
                    <h2 className="text-lg sm:text-xl font-black tracking-tight flex items-center gap-2">
                        登録済みの選手 <span className="text-muted-foreground/50 text-base">({players.length})</span>
                    </h2>
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        {/* 💡 基準4: 検索入力エリア */}
                        <Input type="text" placeholder="名前・背番号で検索..." className="h-10 rounded-full border-border/50 bg-muted/30 pl-9 text-base sm:text-sm font-bold focus-visible:ring-primary/30 shadow-sm transition-all" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                    </div>
                </div>

                {isLoading ? (
                    <div className="py-20 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary/50" /></div>
                ) : filteredPlayers.length === 0 ? (
                    <div className="text-center py-16 bg-muted/20 rounded-[32px] border border-dashed border-border/50 shadow-sm">
                        <Users className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                        <p className="text-muted-foreground font-bold">
                            {players.length === 0 ? "まだ選手が登録されていません。\n上部のフォームから追加してください。" : "該当する選手が見つかりません。"}
                        </p>
                    </div>
                ) : (
                    <div className="bg-card border border-border/50 rounded-[28px] shadow-sm overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
                        {filteredPlayers.map((player, index) => (
                            <div key={player.id} className={cn("group flex items-center justify-between p-4 sm:px-6 hover:bg-muted/50 transition-colors", index !== filteredPlayers.length - 1 && "border-b border-border/50")}>
                                <div className="flex items-center gap-4 sm:gap-6">
                                    <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shrink-0 shadow-sm relative overflow-hidden group-hover:scale-105 transition-transform">
                                        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-primary/5" />
                                        <span className="font-black text-xl sm:text-2xl z-10 font-mono tracking-tighter">{player.uniformNumber}</span>
                                    </div>
                                    {/* 💡 基準5: リストテキスト */}
                                    <div className="text-base sm:text-lg font-black text-foreground group-hover:text-primary transition-colors">
                                        {player.name}
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 sm:gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                    <Button variant="ghost" size="icon" onClick={() => setEditingPlayer(player)} className="h-10 w-10 rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors shadow-sm bg-background sm:bg-transparent">
                                        <Edit2 className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => handleDeletePlayer(player.id, player.name)} className="h-10 w-10 rounded-full text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors shadow-sm bg-background sm:bg-transparent">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* 4. 編集モーダル */}
            {!!editingPlayer && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="absolute inset-0" onClick={() => !isUpdating && setEditingPlayer(null)} />

                    <div className="relative w-full max-w-md bg-card/95 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] rounded-[32px] sm:rounded-[36px] overflow-hidden animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-8 duration-500 border border-border/50 flex flex-col max-h-[90vh]">
                        <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/10 blur-[100px] rounded-full pointer-events-none" />

                        <div className="px-6 pt-8 pb-4 border-b border-border/50 bg-muted/20 relative z-10 text-left flex justify-between items-start">
                            {/* 💡 基準2: モーダルタイトル H2 */}
                            <h2 className="text-lg sm:text-xl font-black flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-xl border border-primary/20 text-primary shadow-sm"><Edit2 className="h-5 w-5" /></div>
                                選手情報の編集
                            </h2>
                            <Button variant="ghost" size="icon" onClick={() => !isUpdating && setEditingPlayer(null)} className="h-8 w-8 rounded-full hover:bg-muted text-muted-foreground transition-all">
                                <X className="h-5 w-5" />
                            </Button>
                        </div>

                        <form onSubmit={handleUpdatePlayer} className="p-6 sm:p-8 space-y-6 relative z-10">
                            <div className="flex gap-4">
                                <div className="w-24 space-y-2">
                                    {/* 💡 基準3: ラベル */}
                                    <label className="block text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-widest pl-1">背番号</label>
                                    <Input type="number" required className="h-14 rounded-[16px] bg-muted/30 border-border/50 text-base font-black text-center focus-visible:ring-primary/50 shadow-inner" value={editingPlayer.uniformNumber} onChange={(e) => setEditingPlayer({ ...editingPlayer, uniformNumber: e.target.value })} disabled={isUpdating} />
                                </div>
                                <div className="flex-1 space-y-2">
                                    {/* 💡 基準3: ラベル */}
                                    <label className="block text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-widest pl-1">選手名</label>
                                    <Input type="text" required className="h-14 rounded-[16px] bg-muted/30 border-border/50 text-base font-black focus-visible:ring-primary/50 shadow-inner" value={editingPlayer.name} onChange={(e) => setEditingPlayer({ ...editingPlayer, name: e.target.value })} disabled={isUpdating} />
                                </div>
                            </div>
                            <Button type="submit" disabled={isUpdating || !editingPlayer.name || !editingPlayer.uniformNumber} className="w-full h-14 rounded-[20px] text-base font-black bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all active:scale-[0.98]">
                                {isUpdating ? <Loader2 className="h-6 w-6 animate-spin" /> : <><Save className="mr-2 h-5 w-5" /> 保存する</>}
                            </Button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function RosterPage() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
            <RosterContent />
        </Suspense>
    );
}