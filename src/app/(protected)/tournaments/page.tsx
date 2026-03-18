// src/app/(protected)/tournaments/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Trophy, Plus, CalendarDays, ChevronRight, Loader2, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface Tournament {
    id: string;
    name: string;
    season: string;
    startDate: string | null;
    endDate: string | null;
}

export default function TournamentsPage() {
    const [tournaments, setTournaments] = useState<Tournament[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    // 新規作成用ステート
    const [isAdding, setIsAdding] = useState(false);
    const [newName, setNewName] = useState("");
    const [newSeason, setNewSeason] = useState(new Date().getFullYear().toString());

    useEffect(() => {
        fetchTournaments();
    }, []);

    const fetchTournaments = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/tournaments');
            if (res.ok) setTournaments(await res.json());
        } catch (error) {
            toast.error("大会一覧の取得に失敗しました");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName.trim() || !newSeason) return;

        setIsAdding(true);
        try {
            const res = await fetch('/api/tournaments', {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: newName, season: newSeason }),
            });
            if (res.ok) {
                toast.success("新しい大会を作成しました！");
                setNewName("");
                fetchTournaments();
            } else {
                toast.error("作成に失敗しました");
            }
        } catch (error) {
            toast.error("通信エラーが発生しました");
        } finally {
            setIsAdding(false);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`⚠️ 本当に「${name}」を削除しますか？`)) return;
        try {
            const res = await fetch(`/api/tournaments/${id}`, { method: "DELETE" });
            if (res.ok) {
                toast.success("大会を削除しました");
                fetchTournaments();
            } else {
                toast.error("削除に失敗しました");
            }
        } catch (error) {
            toast.error("通信エラーが発生しました");
        }
    };

    const filteredTournaments = tournaments.filter(t => 
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) || t.season.includes(searchQuery)
    );

    return (
        <div className="flex flex-col min-h-screen text-foreground pb-32 relative">
            <main className="flex-1 px-4 sm:px-6 max-w-5xl mx-auto w-full mt-6 sm:mt-10 relative z-10 animate-in fade-in duration-500">
                
                {/* 1. ヘッダー部分 */}
                <div className="mb-8 flex flex-col gap-2 w-full">
                    <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-3">
                        <div className="p-2.5 bg-primary/10 rounded-2xl text-primary shadow-sm border border-primary/20">
                            <Trophy className="h-6 w-6 sm:h-7 sm:w-7" />
                        </div>
                        大会・トーナメント管理
                    </h1>
                    <p className="text-sm font-bold text-muted-foreground ml-1">
                        公式戦やリーグ戦の大会を作成し、試合を紐付けて管理します。
                    </p>
                </div>

                {/* 2. 大会作成パネル */}
                <Card className="mb-8 rounded-[28px] border-primary/20 bg-primary/5 shadow-sm overflow-hidden relative">
                    <div className="absolute top-0 right-0 -mt-10 -mr-10 w-32 h-32 bg-primary/10 blur-[40px] rounded-full pointer-events-none" />
                    <CardContent className="p-5 sm:p-8 relative z-10">
                        <h2 className="text-lg sm:text-xl font-black text-primary/90 tracking-tight mb-4 flex items-center gap-2">
                            <Plus className="h-5 w-5" /> 新しい大会を作成
                        </h2>
                        <form onSubmit={handleCreate} className="flex flex-col sm:flex-row items-end gap-4">
                            <div className="w-full sm:w-32 space-y-2">
                                <label className="block text-sm sm:text-base font-bold text-muted-foreground uppercase tracking-widest pl-1">年度(Season)</label>
                                <Input type="number" required className="h-14 rounded-[16px] border-primary/30 bg-background text-base font-bold focus-visible:ring-primary/50 text-center shadow-sm transition-all" value={newSeason} onChange={(e) => setNewSeason(e.target.value)} disabled={isAdding} />
                            </div>
                            <div className="w-full flex-1 space-y-2">
                                <label className="block text-sm sm:text-base font-bold text-muted-foreground uppercase tracking-widest pl-1">大会名</label>
                                <Input type="text" placeholder="例: 第15回 関東秋季大会" required className="h-14 rounded-[16px] border-primary/30 bg-background text-base font-bold focus-visible:ring-primary/50 shadow-sm transition-all" value={newName} onChange={(e) => setNewName(e.target.value)} disabled={isAdding} />
                            </div>
                            <Button type="submit" disabled={isAdding || !newName} className="w-full sm:w-auto h-14 rounded-[16px] text-base font-black px-8 bg-primary hover:bg-primary/90 shadow-md shadow-primary/20 transition-all active:scale-95">
                                {isAdding ? <Loader2 className="h-5 w-5 animate-spin" /> : "作成する"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* 3. 検索＆リスト */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                    <h2 className="text-lg sm:text-xl font-black tracking-tight flex items-center gap-2">
                        登録済みの大会 <span className="text-muted-foreground/50 text-base">({tournaments.length})</span>
                    </h2>
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input type="text" placeholder="大会名で検索..." className="h-10 rounded-full border-border/50 bg-muted/30 pl-9 text-base sm:text-sm font-bold focus-visible:ring-primary/30 shadow-sm transition-all" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                    </div>
                </div>

                {isLoading ? (
                    <div className="py-20 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary/50" /></div>
                ) : filteredTournaments.length === 0 ? (
                    <div className="text-center py-16 bg-muted/20 rounded-[32px] border border-dashed border-border/50 shadow-sm">
                        <Trophy className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                        <p className="text-muted-foreground font-bold">
                            {tournaments.length === 0 ? "大会が登録されていません。\n上部のフォームから作成してください。" : "該当する大会が見つかりません。"}
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-4 sm:gap-6 sm:grid-cols-2">
                        {filteredTournaments.map((tournament) => (
                            <Card key={tournament.id} className="group relative overflow-hidden rounded-[24px] border-border/50 bg-card shadow-sm transition-all duration-300 hover:shadow-md hover:border-primary/40 flex flex-col">
                                <CardContent className="p-5 sm:p-6 flex flex-col h-full relative z-10">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="inline-flex items-center rounded-full px-2.5 py-1 text-[10px] sm:text-xs font-black bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-sm">
                                            <CalendarDays className="h-3.5 w-3.5 mr-1" /> {tournament.season}年度
                                        </div>
                                        <Button variant="ghost" size="icon" onClick={() => handleDelete(tournament.id, tournament.name)} className="h-8 w-8 rounded-full text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors opacity-100 sm:opacity-0 sm:group-hover:opacity-100">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <h3 className="text-xl sm:text-2xl font-black tracking-tight mb-4 group-hover:text-primary transition-colors duration-300">
                                        {tournament.name}
                                    </h3>
                                    <div className="mt-auto pt-4 border-t border-border/40">
                                        <Button variant="secondary" className="w-full rounded-[14px] font-black justify-between group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                            大会の詳細を開く <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
