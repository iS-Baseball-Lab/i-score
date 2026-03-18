// src/app/(protected)/tournaments/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Trophy, Plus, CalendarDays, ChevronRight, Loader2, Search, Trash2, Filter, Tag } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth-client";
import { canManageTeam } from "@/lib/roles";

// 💡 カテゴリーのマスターデータ
const CATEGORIES = [
    { id: "school", name: "学童 (小学生)" },
    { id: "junior", name: "中学 (硬式/軟式)" },
    { id: "high", name: "高校" },
    { id: "general", name: "一般 (草野球など)" },
    { id: "other", name: "その他" },
];

interface Tournament {
    id: string;
    name: string;
    season: string;
    category: string;
    startDate: string | null;
    endDate: string | null;
}

export default function TournamentsPage() {
    // 💡 権限チェック (一般ユーザーは閲覧のみ)
    const { data: session } = authClient.useSession();
    const userRole = (session?.user as unknown as { role?: string })?.role;
    const isManager = canManageTeam(userRole);

    const [tournaments, setTournaments] = useState<Tournament[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // 💡 絞り込み用のステート
    const [searchQuery, setSearchQuery] = useState("");
    const [filterSeason, setFilterSeason] = useState("all");
    const [filterCategory, setFilterCategory] = useState("all");

    const [isAdding, setIsAdding] = useState(false);
    const [newName, setNewName] = useState("");
    const [newSeason, setNewSeason] = useState(new Date().getFullYear().toString());
    const [newCategory, setNewCategory] = useState("junior");

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
        if (!newName.trim() || !newSeason || !isManager) return;

        setIsAdding(true);
        try {
            const res = await fetch('/api/tournaments', {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: newName, season: newSeason, category: newCategory }),
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
        if (!isManager || !confirm(`⚠️ 本当に「${name}」を削除しますか？\n(紐づく試合データが迷子になる可能性があります)`)) return;
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

    // 💡 複数条件での強力な絞り込みロジック
    const filteredTournaments = tournaments.filter(t => {
        const matchKeyword = t.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchSeason = filterSeason === "all" || t.season === filterSeason;
        const matchCategory = filterCategory === "all" || t.category === filterCategory;
        return matchKeyword && matchSeason && matchCategory;
    });

    // フィルター用に存在する年度のリストを抽出
    const uniqueSeasons = Array.from(new Set(tournaments.map(t => t.season))).sort((a, b) => Number(b) - Number(a));

    const getCategoryName = (id: string) => CATEGORIES.find(c => c.id === id)?.name || "その他";

    return (
        <div className="flex flex-col min-h-screen text-foreground pb-32 relative">
            <main className="flex-1 px-4 sm:px-6 max-w-5xl mx-auto w-full mt-6 sm:mt-10 relative z-10 animate-in fade-in duration-500">

                <div className="mb-8 flex flex-col gap-2 w-full">
                    <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-3">
                        <div className="p-2.5 bg-primary/10 rounded-2xl text-primary shadow-sm border border-primary/20">
                            <Trophy className="h-6 w-6 sm:h-7 sm:w-7" />
                        </div>
                        大会・トーナメント管理
                    </h1>
                    <p className="text-sm font-bold text-muted-foreground ml-1">
                        公式戦やリーグ戦の大会を管理します。
                    </p>
                </div>

                {/* 💡 権限ガード: 管理者(isManager)にのみ作成フォームを表示 */}
                {isManager && (
                    <Card className="mb-8 rounded-[28px] border-primary/20 bg-primary/5 shadow-sm overflow-hidden relative animate-in slide-in-from-top-4">
                        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-32 h-32 bg-primary/10 blur-[40px] rounded-full pointer-events-none" />
                        <CardContent className="p-5 sm:p-8 relative z-10">
                            <h2 className="text-lg sm:text-xl font-black text-primary/90 tracking-tight mb-4 flex items-center gap-2">
                                <Plus className="h-5 w-5" /> 新しい大会を作成 <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full ml-2">管理者専用</span>
                            </h2>
                            <form onSubmit={handleCreate} className="flex flex-col sm:flex-row items-end gap-4">
                                <div className="w-full sm:w-28 space-y-2">
                                    <label className="block text-sm sm:text-base font-bold text-muted-foreground uppercase tracking-widest pl-1">年度</label>
                                    <Input type="number" required className="h-14 rounded-[16px] border-primary/30 bg-background text-base font-bold focus-visible:ring-primary/50 text-center shadow-sm transition-all" value={newSeason} onChange={(e) => setNewSeason(e.target.value)} disabled={isAdding} />
                                </div>
                                <div className="w-full sm:w-48 space-y-2">
                                    <label className="block text-sm sm:text-base font-bold text-muted-foreground uppercase tracking-widest pl-1">カテゴリー</label>
                                    <select
                                        className="flex h-14 w-full appearance-none rounded-[16px] border border-primary/30 bg-background px-4 pr-10 text-base font-bold shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 cursor-pointer bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke-width%3D%222.5%22%20stroke%3D%22%2371717a%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20d%3D%22M19%209l-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] bg-[length:18px_18px] bg-[position:right_16px_center] bg-no-repeat"
                                        value={newCategory} onChange={(e) => setNewCategory(e.target.value)} disabled={isAdding}
                                    >
                                        {CATEGORIES.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                                    </select>
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
                )}

                {/* 3. 検索＆強力な絞り込みフィルター */}
                <div className="flex flex-col gap-4 mb-6 bg-muted/20 p-4 rounded-[24px] border border-border/50 shadow-inner">
                    <div className="flex items-center gap-2 text-primary font-black">
                        <Filter className="h-5 w-5" /> 絞り込み
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input type="text" placeholder="大会名で検索..." className="h-12 rounded-[16px] border-border/50 bg-background pl-9 text-base font-bold shadow-sm transition-all" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                        </div>
                        <select
                            className="h-12 w-full sm:w-36 appearance-none rounded-[16px] border border-border/50 bg-background px-4 pr-10 text-base font-bold shadow-sm cursor-pointer bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke-width%3D%222.5%22%20stroke%3D%22%2371717a%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20d%3D%22M19%209l-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] bg-[length:16px_16px] bg-[position:right_12px_center] bg-no-repeat"
                            value={filterSeason} onChange={(e) => setFilterSeason(e.target.value)}
                        >
                            <option value="all">すべての年度</option>
                            {uniqueSeasons.map(season => <option key={season} value={season}>{season}年度</option>)}
                        </select>
                        <select
                            className="h-12 w-full sm:w-48 appearance-none rounded-[16px] border border-border/50 bg-background px-4 pr-10 text-base font-bold shadow-sm cursor-pointer bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke-width%3D%222.5%22%20stroke%3D%22%2371717a%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20d%3D%22M19%209l-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] bg-[length:16px_16px] bg-[position:right_12px_center] bg-no-repeat"
                            value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}
                        >
                            <option value="all">すべてのカテゴリー</option>
                            {CATEGORIES.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                        </select>
                    </div>
                </div>

                {/* 4. 大会リスト */}
                {isLoading ? (
                    <div className="py-20 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary/50" /></div>
                ) : filteredTournaments.length === 0 ? (
                    <div className="text-center py-16 bg-muted/20 rounded-[32px] border border-dashed border-border/50 shadow-sm">
                        <Trophy className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                        <p className="text-muted-foreground font-bold">該当する大会が見つかりません。</p>
                    </div>
                ) : (
                    <div className="grid gap-4 sm:gap-6 sm:grid-cols-2">
                        {filteredTournaments.map((tournament) => (
                            <Card key={tournament.id} className="group relative overflow-hidden rounded-[24px] border-border/50 bg-card shadow-sm transition-all duration-300 hover:shadow-md hover:border-primary/40 flex flex-col">
                                <CardContent className="p-5 sm:p-6 flex flex-col h-full relative z-10">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex flex-wrap gap-2">
                                            <span className="inline-flex items-center rounded-full px-2.5 py-1 text-[10px] sm:text-xs font-black bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-sm">
                                                <CalendarDays className="h-3.5 w-3.5 mr-1" /> {tournament.season}年度
                                            </span>
                                            {/* 💡 カテゴリーバッジを表示 */}
                                            <span className="inline-flex items-center rounded-full px-2.5 py-1 text-[10px] sm:text-xs font-black bg-blue-500/10 text-blue-500 border border-blue-500/20 shadow-sm">
                                                <Tag className="h-3.5 w-3.5 mr-1" /> {getCategoryName(tournament.category)}
                                            </span>
                                        </div>
                                        {/* 💡 権限ガード: 管理者にのみ削除ボタンを表示 */}
                                        {isManager && (
                                            <Button variant="ghost" size="icon" onClick={() => handleDelete(tournament.id, tournament.name)} className="h-8 w-8 rounded-full text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors opacity-100 sm:opacity-0 sm:group-hover:opacity-100">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                    <h3 className="text-xl sm:text-2xl font-black tracking-tight mb-4 group-hover:text-primary transition-colors duration-300">
                                        {tournament.name}
                                    </h3>
                                    <div className="mt-auto pt-4 border-t border-border/40">
                                        <Button variant="secondary" className="w-full rounded-[14px] font-black justify-between group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                            大会の詳細・試合一覧へ <ChevronRight className="h-4 w-4" />
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