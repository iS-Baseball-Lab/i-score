// src/app/(protected)/teams/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Shield, Plus, ChevronRight, X, ChevronLeft, Trash2 } from "lucide-react";
import { RiTeamFill } from "react-icons/ri";
import { ROLES } from "@/lib/roles";
import { toast } from "sonner";

interface Organization {
    id: string;
    name: string;
    myRole: string;
}

interface Team {
    id: string;
    name: string;
    organizationId: string | null;
}

export default function TeamsPage() {
    const router = useRouter();

    const [view, setView] = useState<'orgs' | 'teams'>('orgs');
    const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);

    const [orgs, setOrgs] = useState<Organization[]>([]);
    const [teams, setTeams] = useState<Team[]>([]);
    const [isLoadingOrgs, setIsLoadingOrgs] = useState(true);
    const [isLoadingTeams, setIsLoadingTeams] = useState(false);

    const [showOrgCreate, setShowOrgCreate] = useState(false);
    const [isCreatingOrg, setIsCreatingOrg] = useState(false);
    const [newOrgName, setNewOrgName] = useState("");

    const [showTeamCreate, setShowTeamCreate] = useState(false);
    const [isCreatingTeam, setIsCreatingTeam] = useState(false);
    const [newTeamName, setNewTeamName] = useState("");
    const [newTeamRole, setNewTeamRole] = useState<string>(ROLES.SCORER);

    const fetchOrgs = async () => {
        setIsLoadingOrgs(true);
        try {
            const res = await fetch('/api/organizations');
            if (res.ok) setOrgs(await res.json());
        } catch (e) { console.error(e); }
        finally { setIsLoadingOrgs(false); }
    };

    const fetchTeams = async (orgId: string) => {
        setIsLoadingTeams(true);
        try {
            const res = await fetch(`/api/organizations/${orgId}/teams`);
            if (res.ok) setTeams(await res.json());
        } catch (e) { console.error(e); }
        finally { setIsLoadingTeams(false); }
    };

    useEffect(() => { fetchOrgs(); }, []);

    const handleSelectOrg = (org: Organization) => {
        setSelectedOrg(org);
        setView('teams');
        setShowTeamCreate(false);
        fetchTeams(org.id);
    };

    const handleBackToOrgs = () => {
        setView('orgs');
        setSelectedOrg(null);
        setShowOrgCreate(false);
    };

    const handleTeamClick = (teamId: string) => {
        localStorage.setItem("iScore_selectedTeamId", teamId);
        if (selectedOrg) localStorage.setItem("iScore_selectedOrgId", selectedOrg.id);
        router.push('/dashboard');
    };

    // 💡 修正：バックエンドから返ってきたエラーメッセージ（重複など）をトーストで表示する
    const handleCreateOrg = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newOrgName.trim()) return;
        setIsCreatingOrg(true);
        try {
            const res = await fetch('/api/organizations', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newOrgName }),
            });
            const data = await res.json();

            if (res.ok && data.success) {
                toast.success("クラブを作成しました！");
                setNewOrgName("");
                setShowOrgCreate(false);
                fetchOrgs();
            } else {
                toast.error(data.error || "クラブの作成に失敗しました");
            }
        } catch (e) {
            console.error(e);
            toast.error("通信エラーが発生しました");
        }
        finally { setIsCreatingOrg(false); }
    };

    const handleDeleteOrg = async (e: React.MouseEvent, orgId: string, orgName: string) => {
        e.preventDefault();
        e.stopPropagation();

        if (!confirm(`⚠️ 本当にクラブ「${orgName}」を削除しますか？\n（所属するすべてのチームと試合データが完全に消去され、復旧できません！）`)) return;

        try {
            const res = await fetch(`/api/organizations/${orgId}`, { method: 'DELETE' });
            if (res.ok) {
                toast.success(`${orgName} を削除しました`);
                if (selectedOrg?.id === orgId) {
                    setSelectedOrg(null);
                    setView('orgs');
                }
                fetchOrgs();
            } else {
                toast.error("クラブの削除に失敗しました（代表者権限が必要です）");
            }
        } catch (e) { console.error(e); }
    };

    // 💡 修正：チーム作成時もバックエンドのエラーを正しく処理するよう強化
    const handleCreateTeam = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTeamName.trim() || !selectedOrg) return;
        setIsCreatingTeam(true);
        try {
            const res = await fetch('/api/teams', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: newTeamName,
                    role: newTeamRole,
                    organizationId: selectedOrg.id
                }),
            });
            const data = await res.json() as any;

            if (res.ok && data.success) {
                toast.success("チームを作成しました！");
                localStorage.setItem("iScore_selectedTeamId", data.teamId);
                localStorage.setItem("iScore_selectedOrgId", selectedOrg.id);
                router.push('/dashboard');
            } else {
                toast.error(data.error || "チームの作成に失敗しました");
            }
        } catch (e) {
            console.error(e);
            toast.error("通信エラーが発生しました");
        }
        finally { setIsCreatingTeam(false); }
    };

    if (isLoadingOrgs && view === 'orgs') {
        return <div className="flex h-screen items-center justify-center bg-background"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    }

    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground pb-32 relative overflow-hidden">
            <PageHeader
                href="/dashboard"
                icon={RiTeamFill}
                title="クラブ・チーム管理"
                subtitle="所属するクラブとチームの作成・編集を行います。"
            />

            <main className="flex-1 px-4 sm:px-6 max-w-4xl mx-auto w-full mt-6 sm:mt-8 relative z-10">

                {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                    💡 View 1: クラブ（組織）一覧画面
                ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
                {view === 'orgs' && (
                    <div className="animate-in slide-in-from-left-4 fade-in duration-300">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2.5">
                                <RiTeamFill className="h-6 w-6 text-primary" />
                                所属クラブ <span className="text-muted-foreground/50 text-base sm:text-lg">({orgs.length})</span>
                            </h2>
                        </div>

                        {orgs.length === 0 ? (
                            <div className="text-center py-24 bg-primary/5 rounded-[32px] border border-dashed border-primary/20 mt-6 shadow-sm">
                                <div className="h-24 w-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-primary/20 shadow-inner">
                                    <RiTeamFill className="h-12 w-12 text-primary/60" />
                                </div>
                                <h3 className="text-xl font-black text-primary/90 mb-2 tracking-tight">クラブが登録されていません</h3>
                                <p className="text-primary/70 font-extrabold text-sm mb-8">右下の＋ボタンから、最初のクラブを作成しましょう。</p>
                            </div>
                        ) : (
                            <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 mt-4">
                                {orgs.map((org) => (
                                    <Card
                                        key={org.id}
                                        onClick={() => handleSelectOrg(org)}
                                        className="group relative overflow-hidden rounded-[28px] border-border/50 bg-background shadow-sm transition-all duration-300 hover:shadow-lg hover:border-primary/40 active:border-primary/40 active:scale-[0.96] cursor-pointer"
                                    >
                                        <div className="absolute top-0 right-0 pointer-events-none">
                                            <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-bl-full -mr-16 -mt-16 transition-transform duration-500 group-hover:scale-110 group-active:scale-110" />
                                            <div className="absolute top-0 right-0 w-36 h-36 bg-primary/5 rounded-bl-full -mr-10 -mt-10 transition-transform duration-500 delay-75 group-hover:scale-110 group-active:scale-110 group-hover:bg-primary/10 group-active:bg-primary/10" />
                                            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-bl-full -mr-4 -mt-4 transition-transform duration-500 delay-150 group-hover:scale-[1.2] group-active:scale-[1.2] group-hover:bg-primary/20 group-active:bg-primary/20" />
                                        </div>

                                        <CardContent className="p-6 sm:p-8 relative z-10 flex flex-col h-full pointer-events-none">
                                            <div className="flex justify-between items-start mb-6">
                                                <div className="p-3.5 bg-muted/50 rounded-[18px] text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary group-active:bg-primary/10 group-active:text-primary transition-colors duration-300 shadow-sm border border-border/50 group-hover:border-primary/20 group-active:border-primary/20">
                                                    <RiTeamFill className="h-7 w-7" />
                                                </div>

                                                <div className="flex items-center gap-2 pointer-events-auto">
                                                    {org.myRole === 'OWNER' && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={(e) => handleDeleteOrg(e, org.id, org.name)}
                                                            className="h-8 w-8 rounded-full text-muted-foreground/50 hover:text-red-500 hover:bg-red-500/10 transition-colors z-20"
                                                            title="クラブを削除"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                    <div className="inline-flex items-center rounded-full px-3 py-1.5 text-[10px] sm:text-xs font-black bg-muted/50 text-muted-foreground uppercase tracking-widest group-hover:bg-primary/10 group-hover:text-primary group-active:bg-primary/10 group-active:text-primary transition-colors duration-300 border border-border/50 group-hover:border-primary/20 group-active:border-primary/20 shadow-sm pointer-events-none">
                                                        {org.myRole}
                                                    </div>
                                                </div>
                                            </div>

                                            <h3 className="text-2xl sm:text-3xl font-black tracking-tight mb-2 truncate group-hover:text-primary group-active:text-primary transition-colors duration-300 drop-shadow-sm mt-auto">
                                                {org.name}
                                            </h3>

                                            <div className="flex items-center text-sm font-extrabold text-muted-foreground mt-4 group-hover:text-primary/80 group-active:text-primary/80 transition-colors duration-300">
                                                チーム一覧を開く <ChevronRight className="h-5 w-5 ml-1 transition-transform duration-300 group-hover:translate-x-1 group-active:translate-x-1" />
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                )}


                {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                    💡 View 2: 選択したクラブ内の「チーム」一覧画面
                ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
                {view === 'teams' && selectedOrg && (
                    <div className="animate-in slide-in-from-right-4 fade-in duration-300">
                        <div className="mb-6 flex flex-col items-start gap-4">
                            <Button variant="ghost" onClick={handleBackToOrgs} className="rounded-full pl-2 pr-4 hover:bg-muted text-muted-foreground font-extrabold">
                                <ChevronLeft className="h-5 w-5 mr-1" /> クラブ一覧へ戻る
                            </Button>

                            <div className="flex items-center justify-between w-full pl-2">
                                <div>
                                    <div className="text-xs font-black text-primary tracking-wider uppercase mb-1">{selectedOrg.name}</div>
                                    <h2 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2.5">
                                        <Shield className="h-6 w-6 text-primary" />
                                        所属チーム <span className="text-muted-foreground/50 text-base sm:text-lg">({teams.length})</span>
                                    </h2>
                                </div>
                            </div>
                        </div>

                        {isLoadingTeams ? (
                            <div className="py-20 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary/50" /></div>
                        ) : teams.length === 0 ? (
                            <div className="text-center py-24 bg-primary/5 rounded-[32px] border border-dashed border-primary/20 mt-6 shadow-sm">
                                <div className="h-24 w-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-primary/20 shadow-inner">
                                    <Shield className="h-12 w-12 text-primary/60" />
                                </div>
                                <h3 className="text-xl font-black text-primary/90 mb-2 tracking-tight">チームが登録されていません</h3>
                                <p className="text-primary/70 font-extrabold text-sm mb-8">右下の＋ボタンから、最初のチームを追加しましょう。</p>
                            </div>
                        ) : (
                            <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 mt-4">
                                {teams.map((team) => (
                                    <Card
                                        key={team.id}
                                        onClick={() => handleTeamClick(team.id)}
                                        className="group relative overflow-hidden rounded-[28px] border-border/50 bg-background shadow-sm transition-all duration-300 hover:shadow-lg hover:border-primary/40 active:border-primary/40 active:scale-[0.96] cursor-pointer"
                                    >
                                        <div className="absolute top-0 right-0 pointer-events-none">
                                            <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-bl-full -mr-16 -mt-16 transition-transform duration-500 group-hover:scale-110 group-active:scale-110" />
                                            <div className="absolute top-0 right-0 w-36 h-36 bg-primary/5 rounded-bl-full -mr-10 -mt-10 transition-transform duration-500 delay-75 group-hover:scale-110 group-active:scale-110 group-hover:bg-primary/10 group-active:bg-primary/10" />
                                            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-bl-full -mr-4 -mt-4 transition-transform duration-500 delay-150 group-hover:scale-[1.2] group-active:scale-[1.2] group-hover:bg-primary/20 group-active:bg-primary/20" />
                                        </div>

                                        <CardContent className="p-6 sm:p-8 relative z-10 flex flex-col h-full pointer-events-none">
                                            <div className="flex justify-between items-start mb-6">
                                                <div className="p-3.5 bg-muted/50 rounded-[18px] text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary group-active:bg-primary/10 group-active:text-primary transition-colors duration-300 shadow-sm border border-border/50 group-hover:border-primary/20 group-active:border-primary/20">
                                                    <Shield className="h-7 w-7" />
                                                </div>
                                                <div className="inline-flex items-center rounded-full px-3 py-1.5 text-[10px] sm:text-xs font-black bg-muted/50 text-muted-foreground uppercase tracking-widest group-hover:bg-primary/10 group-hover:text-primary group-active:bg-primary/10 group-active:text-primary transition-colors duration-300 border border-border/50 group-hover:border-primary/20 group-active:border-primary/20 shadow-sm">
                                                    TEAM
                                                </div>
                                            </div>

                                            <h3 className="text-2xl sm:text-3xl font-black tracking-tight mb-2 truncate group-hover:text-primary group-active:text-primary transition-colors duration-300 drop-shadow-sm mt-auto">
                                                {team.name}
                                            </h3>

                                            <div className="flex items-center text-sm font-extrabold text-muted-foreground mt-4 group-hover:text-primary/80 group-active:text-primary/80 transition-colors duration-300">
                                                ダッシュボードを開く <ChevronRight className="h-5 w-5 ml-1 transition-transform duration-300 group-hover:translate-x-1 group-active:translate-x-1" />
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                💡 究極のFAB（右下に浮遊する完全な丸型＋ボタン）
            ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            <Button
                onClick={() => view === 'orgs' ? setShowOrgCreate(true) : setShowTeamCreate(true)}
                className="fixed bottom-8 right-4 sm:bottom-10 sm:right-8 h-16 w-16 rounded-full shadow-2xl shadow-primary/40 bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300 hover:-translate-y-1 active:scale-[0.92] z-40 flex items-center justify-center"
            >
                <Plus className="h-8 w-8" />
            </Button>

            {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                💡 究極のモーダル：のっぺら感ゼロのPrimary背景
            ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            {(showOrgCreate || showTeamCreate) && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-0 bg-background/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="absolute inset-0" onClick={() => {
                        if (!isCreatingOrg && !isCreatingTeam) {
                            setShowOrgCreate(false);
                            setShowTeamCreate(false);
                        }
                    }} />

                    <div className="relative w-full max-w-lg bg-gradient-to-br from-primary via-primary to-green-900 shadow-[0_20px_60px_rgba(0,0,0,0.4)] rounded-[32px] sm:rounded-[36px] overflow-hidden animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-8 duration-500 text-white">

                        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-white/20 blur-[60px] rounded-full pointer-events-none" />
                        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-64 h-64 bg-black/30 blur-[60px] rounded-full pointer-events-none" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />

                        <div className="relative z-10 flex items-center justify-between p-6 sm:p-8 pb-4">
                            <h2 className="text-xl sm:text-2xl font-black flex items-center gap-3 tracking-tight drop-shadow-sm">
                                <div className="p-2.5 bg-white/20 rounded-2xl text-white shadow-inner backdrop-blur-md">
                                    {showOrgCreate ? <RiTeamFill className="h-6 w-6" /> : <Shield className="h-6 w-6" />}
                                </div>
                                {showOrgCreate ? "クラブを新しく作る" : "チームを新しく追加"}
                            </h2>
                            <Button variant="ghost" size="icon" onClick={() => { setShowOrgCreate(false); setShowTeamCreate(false); }} className="h-10 w-10 rounded-full hover:bg-white/20 text-white transition-all">
                                <X className="h-6 w-6" />
                            </Button>
                        </div>

                        <form onSubmit={showOrgCreate ? handleCreateOrg : handleCreateTeam} className="relative z-10 p-6 sm:p-8 pt-2 space-y-6">

                            {showOrgCreate && (
                                <div className="space-y-3">
                                    <label className="text-sm font-extrabold text-white/90 tracking-wide pl-1">クラブ（組織）名</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="例: 川崎中央シニア"
                                        className="flex h-14 w-full rounded-2xl border border-white/30 bg-white/10 px-4 text-base font-bold shadow-inner placeholder:text-white/50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/30 focus-visible:bg-white/20 transition-all text-white"
                                        value={newOrgName}
                                        onChange={(e) => setNewOrgName(e.target.value)}
                                        disabled={isCreatingOrg}
                                        autoFocus
                                    />
                                </div>
                            )}

                            {showTeamCreate && (
                                <>
                                    <div className="space-y-3">
                                        <label className="text-sm font-extrabold text-white/90 tracking-wide pl-1">チーム名</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="例: 1軍 / ジュニア"
                                            className="flex h-14 w-full rounded-2xl border border-white/30 bg-white/10 px-4 text-base font-bold shadow-inner placeholder:text-white/50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/30 focus-visible:bg-white/20 transition-all text-white"
                                            value={newTeamName}
                                            onChange={(e) => setNewTeamName(e.target.value)}
                                            disabled={isCreatingTeam}
                                            autoFocus
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-sm font-extrabold text-white/90 tracking-wide pl-1">あなたの役割（ロール）</label>
                                        <select
                                            className="flex h-14 w-full appearance-none rounded-2xl border border-white/30 bg-white/10 px-4 pr-10 text-base font-bold shadow-inner text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/30 focus-visible:bg-white/20 transition-all cursor-pointer bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke-width%3D%222%22%20stroke%3D%22white%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20d%3D%22M19%209l-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] bg-[length:16px_16px] bg-[position:right_16px_center] bg-no-repeat"
                                            value={newTeamRole}
                                            onChange={(e) => setNewTeamRole(e.target.value)}
                                            disabled={isCreatingTeam}
                                        >
                                            <option value={ROLES.MANAGER} className="text-foreground">監督 / 代表 (Manager)</option>
                                            <option value={ROLES.COACH} className="text-foreground">コーチ (Coach)</option>
                                            <option value={ROLES.SCORER} className="text-foreground">スコアラー (Scorer)</option>
                                            <option value={ROLES.STAFF} className="text-foreground">スタッフ (Staff)</option>
                                        </select>
                                    </div>
                                </>
                            )}

                            <div className="pt-4">
                                <Button
                                    type="submit"
                                    disabled={isCreatingOrg || isCreatingTeam}
                                    className="w-full h-14 rounded-2xl font-extrabold bg-white text-primary hover:bg-white/90 shadow-xl shadow-black/20 transition-all hover:-translate-y-1 active:scale-[0.98]"
                                >
                                    {(isCreatingOrg || isCreatingTeam) ? <Loader2 className="h-6 w-6 animate-spin mx-auto" /> : (showOrgCreate ? "クラブを作成する" : "チームを追加する")}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}