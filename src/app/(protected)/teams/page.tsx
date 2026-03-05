// src/app/(protected)/teams/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Loader2, Users, Shield, Plus, ChevronRight } from "lucide-react";
import { ROLES } from "@/lib/roles";

interface Team {
    id: string;
    name: string;
    myRole: string;
    isFounder: boolean;
}

export default function TeamsPage() {
    const router = useRouter();
    const [teams, setTeams] = useState<Team[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // 新規チーム作成用のState
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [newTeamName, setNewTeamName] = useState("");
    const [newTeamRole, setNewTeamRole] = useState<string>(ROLES.SCORER);

    const fetchTeams = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/teams');
            if (res.ok) setTeams(await res.json());
        } catch (e) { console.error(e); }
        finally { setIsLoading(false); }
    };

    useEffect(() => { fetchTeams(); }, []);

    // 💡 チームのカードをクリックしたら、そのチームを選択状態にしてダッシュボードへ飛ぶ
    const handleTeamClick = (teamId: string) => {
        localStorage.setItem("iScore_selectedTeamId", teamId);
        router.push('/dashboard');
    };

    const handleCreateTeam = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTeamName.trim()) return;
        setIsCreating(true);
        try {
            const res = await fetch('/api/teams', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newTeamName, role: newTeamRole }),
            });
            if (res.ok) {
                const data = await res.json() as { teamId: string };
                // 新しく作ったチームを即座に選択状態にしてダッシュボードへ
                localStorage.setItem("iScore_selectedTeamId", data.teamId);
                router.push('/dashboard');
            } else {
                alert("チームの作成に失敗しました");
            }
        } catch (e) { console.error(e); }
        finally { setIsCreating(false); }
    };

    if (isLoading) return <div className="flex h-screen items-center justify-center bg-background"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground pb-20">
            <PageHeader 
                href="/dashboard" 
                icon={Shield} 
                title="マイチーム一覧" 
                subtitle="所属チームの切り替えと新規作成" 
            />

            <main className="flex-1 p-4 max-w-4xl mx-auto w-full mt-4 space-y-6 animate-in fade-in duration-500">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-xl font-extrabold tracking-tight flex items-center gap-2">
                        <Users className="h-5 w-5 text-primary" /> 所属チーム ({teams.length})
                    </h2>
                    <Button 
                        onClick={() => setShowCreateForm(!showCreateForm)} 
                        variant={showCreateForm ? "outline" : "default"} 
                        className="font-bold rounded-xl shadow-sm transition-all"
                    >
                        {showCreateForm ? "キャンセル" : <><Plus className="h-4 w-4 mr-1" /> 新しく作る</>}
                    </Button>
                </div>

                {/* 💡 新規チーム作成フォーム（スライドダウンで美しく表示） */}
                {showCreateForm && (
                    <Card className="border-primary/20 shadow-xs animate-in slide-in-from-top-2 overflow-hidden pt-0 gap-0">
                        <CardHeader className="bg-primary/5 pt-6 pb-4 border-b border-primary/10">
                            <CardTitle className="flex items-center gap-2 text-primary"><Plus className="h-5 w-5" /> チームを新しく作る</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <form onSubmit={handleCreateTeam} className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold">チーム名</label>
                                    <input type="text" required placeholder="例: 川崎中央シニア" className="flex h-12 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-sm" value={newTeamName} onChange={(e) => setNewTeamName(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold">あなたの役割（ロール）</label>
                                    <Select className="flex h-12 w-full rounded-xl border border-input bg-background px-4 py-2 text-sm focus-visible:ring-primary font-medium shadow-sm" value={newTeamRole} onChange={(e) => setNewTeamRole(e.target.value)}>
                                        <option value={ROLES.MANAGER}>監督 / 代表 (Manager)</option>
                                        <option value={ROLES.COACH}>コーチ (Coach)</option>
                                        <option value={ROLES.SCORER}>スコアラー (Scorer)</option>
                                        <option value={ROLES.STAFF}>スタッフ (Staff)</option>
                                    </Select>
                                </div>
                                <Button type="submit" className="w-full h-12 text-base font-bold rounded-xl mt-4 shadow-md bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isCreating}>
                                    {isCreating ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "チームを作成してダッシュボードへ"}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                )}

                {teams.length === 0 && !showCreateForm ? (
                    <div className="text-center py-16 bg-muted/30 rounded-2xl border border-dashed border-border mt-6">
                        <Shield className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                        <p className="text-muted-foreground font-medium mb-4">現在所属しているチームはありません。</p>
                        <Button onClick={() => setShowCreateForm(true)} className="font-bold rounded-xl">最初のチームを作成する</Button>
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 mt-4">
                        {teams.map((team) => (
                            <Card
                                key={team.id}
                                onClick={() => handleTeamClick(team.id)}
                                className="group relative overflow-hidden rounded-2xl border-border bg-background shadow-xs transition-all hover:shadow-md hover:border-primary/40 active:scale-[0.98] cursor-pointer"
                            >
                                {/* 背景のうっすらとしたアクセント装飾 */}
                                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-[100px] -mr-4 -mt-4 transition-transform group-hover:scale-110" />
                                
                                <CardContent className="p-6 relative z-10">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-3 bg-muted rounded-xl text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors shadow-sm">
                                            <Shield className="h-6 w-6" />
                                        </div>
                                        <div className="inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-extrabold bg-muted text-muted-foreground uppercase tracking-wider group-hover:bg-primary/10 group-hover:text-primary transition-colors shadow-sm">
                                            {team.myRole}
                                        </div>
                                    </div>
                                    <h3 className="text-xl sm:text-2xl font-black tracking-tight mb-1 truncate group-hover:text-primary transition-colors">{team.name}</h3>
                                    <div className="flex items-center text-sm font-bold text-muted-foreground mt-4 group-hover:text-primary transition-colors">
                                        ダッシュボードを開く <ChevronRight className="h-4 w-4 ml-1" />
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
