// src/app/(protected)/teams/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Shield, Plus, ChevronRight, X, ChevronLeft, Trash2, Settings, Info, Check, CalendarDays } from "lucide-react";
import { RiTeamFill } from "react-icons/ri";
import { ROLES } from "@/lib/roles";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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

    // 新規作成用ステート
    const [showOrgCreate, setShowOrgCreate] = useState(false);
    const [isCreatingOrg, setIsCreatingOrg] = useState(false);
    const [newOrgName, setNewOrgName] = useState("");

    const [showTeamCreate, setShowTeamCreate] = useState(false);
    const [isCreatingTeam, setIsCreatingTeam] = useState(false);
    const [newTeamName, setNewTeamName] = useState("");
    const [newTeamRole, setNewTeamRole] = useState<string>(ROLES.SCORER);

    // 💡 究極UI化：詳細・設定モーダル用ステート
    const [detailModal, setDetailModal] = useState<{ type: 'org' | 'team', data: Organization | Team } | null>(null);
    const [editName, setEditName] = useState("");
    const [isUpdating, setIsUpdating] = useState(false);

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

    const handleCreateOrg = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newOrgName.trim()) return;
        setIsCreatingOrg(true);
        try {
            const res = await fetch('/api/organizations', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newOrgName }),
            });
            const data = await res.json() as { success: boolean; error?: string };
            if (res.ok && data.success) {
                toast.success("クラブを作成しました！");
                setNewOrgName("");
                setShowOrgCreate(false);
                fetchOrgs();
            } else toast.error(data.error || "作成に失敗しました");
        } catch (e) { toast.error("通信エラーが発生しました"); }
        finally { setIsCreatingOrg(false); }
    };

    const handleCreateTeam = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTeamName.trim() || !selectedOrg) return;
        setIsCreatingTeam(true);
        try {
            const res = await fetch('/api/teams', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newTeamName, role: newTeamRole, organizationId: selectedOrg.id }),
            });
            const data = await res.json() as any;
            if (res.ok && data.success) {
                toast.success("チームを作成しました！");
                localStorage.setItem("iScore_selectedTeamId", data.teamId);
                localStorage.setItem("iScore_selectedOrgId", selectedOrg.id);
                router.push('/dashboard');
            } else toast.error(data.error || "作成に失敗しました");
        } catch (e) { toast.error("通信エラーが発生しました"); }
        finally { setIsCreatingTeam(false); }
    };

    // 💡 更新・削除処理
    const handleUpdate = async () => {
        if (!detailModal || !editName.trim()) return;
        setIsUpdating(true);
        try {
            const url = detailModal.type === 'org' ? `/api/organizations/${detailModal.data.id}` : `/api/teams/${detailModal.data.id}`;
            const res = await fetch(url, {
                method: 'PATCH', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: editName })
            });
            if (res.ok) {
                toast.success("名前を更新しました");
                setDetailModal(null);
                if (detailModal.type === 'org') fetchOrgs();
                else if (selectedOrg) fetchTeams(selectedOrg.id);
            } else toast.error("更新に失敗しました");
        } catch (e) { toast.error("通信エラーが発生しました"); }
        finally { setIsUpdating(false); }
    };

    const handleDelete = async () => {
        if (!detailModal) return;
        const typeName = detailModal.type === 'org' ? 'クラブ' : 'チーム';
        if (!confirm(`⚠️ 本当に${typeName}「${detailModal.data.name}」を削除しますか？\n（復旧はできません！）`)) return;

        setIsUpdating(true);
        try {
            const url = detailModal.type === 'org' ? `/api/organizations/${detailModal.data.id}` : `/api/teams/${detailModal.data.id}`;
            const res = await fetch(url, { method: 'DELETE' });
            if (res.ok) {
                toast.success(`${typeName}を削除しました`);
                setDetailModal(null);
                if (detailModal.type === 'org') {
                    if (selectedOrg?.id === detailModal.data.id) { setSelectedOrg(null); setView('orgs'); }
                    fetchOrgs();
                } else if (selectedOrg) fetchTeams(selectedOrg.id);
            } else toast.error("削除に失敗しました");
        } catch (e) { toast.error("通信エラーが発生しました"); }
        finally { setIsUpdating(false); }
    };

    const openDetail = (e: React.MouseEvent, type: 'org' | 'team', data: Organization | Team) => {
        e.preventDefault();
        e.stopPropagation();
        setDetailModal({ type, data });
        setEditName(data.name);
    };

    if (isLoadingOrgs && view === 'orgs') {
        return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    }

    return (
        <div className="flex flex-col min-h-screen text-foreground pb-32 relative overflow-hidden">
            <PageHeader href="/dashboard" icon={RiTeamFill} title="クラブ・チーム管理" subtitle="所属するクラブとチームの作成・編集を行います。" />

            <main className="flex-1 px-4 sm:px-6 max-w-4xl mx-auto w-full mt-6 sm:mt-8 relative z-10">

                {/* クラブ一覧 */}
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
                                    <Card key={org.id} onClick={() => handleSelectOrg(org)} className="group relative overflow-hidden rounded-[28px] border-border/50 bg-card shadow-sm transition-all duration-300 hover:shadow-lg hover:border-primary/40 active:border-primary/40 active:scale-[0.96] cursor-pointer">
                                        <CardContent className="p-6 sm:p-8 relative z-10 flex flex-col h-full pointer-events-none">
                                            <div className="flex justify-between items-start mb-6">
                                                <div className="p-3.5 bg-muted/50 rounded-[18px] text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors shadow-sm border border-border/50">
                                                    <RiTeamFill className="h-7 w-7" />
                                                </div>

                                                <div className="flex items-center gap-2 pointer-events-auto">
                                                    <div className="inline-flex items-center rounded-full px-3 py-1.5 text-[10px] sm:text-xs font-black bg-muted/50 text-muted-foreground uppercase tracking-widest border border-border/50 shadow-sm pointer-events-none">
                                                        {org.myRole}
                                                    </div>
                                                    {/* 💡 権限に応じたアイコンを表示 */}
                                                    <Button variant="ghost" size="icon" onClick={(e) => openDetail(e, 'org', org)} className={cn("h-8 w-8 rounded-full transition-colors z-20", org.myRole === 'OWNER' ? "text-primary/70 hover:bg-primary/10 hover:text-primary" : "text-muted-foreground hover:bg-muted")}>
                                                        {org.myRole === 'OWNER' ? <Settings className="h-4 w-4" /> : <Info className="h-4 w-4" />}
                                                    </Button>
                                                </div>
                                            </div>
                                            <h3 className="text-2xl sm:text-3xl font-black tracking-tight mb-2 truncate drop-shadow-sm mt-auto">{org.name}</h3>
                                            <div className="flex items-center text-sm font-extrabold text-muted-foreground mt-4 transition-colors">
                                                チーム一覧を開く <ChevronRight className="h-5 w-5 ml-1 transition-transform group-hover:translate-x-1" />
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* チーム一覧 */}
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
                                    <Card key={team.id} onClick={() => handleTeamClick(team.id)} className="group relative overflow-hidden rounded-[28px] border-border/50 bg-card shadow-sm transition-all duration-300 hover:shadow-lg hover:border-primary/40 active:border-primary/40 active:scale-[0.96] cursor-pointer">
                                        <CardContent className="p-6 sm:p-8 relative z-10 flex flex-col h-full pointer-events-none">
                                            <div className="flex justify-between items-start mb-6">
                                                <div className="p-3.5 bg-muted/50 rounded-[18px] text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors shadow-sm border border-border/50">
                                                    <Shield className="h-7 w-7" />
                                                </div>
                                                <div className="flex items-center gap-2 pointer-events-auto">
                                                    <div className="inline-flex items-center rounded-full px-3 py-1.5 text-[10px] sm:text-xs font-black bg-muted/50 text-muted-foreground uppercase tracking-widest border border-border/50 shadow-sm pointer-events-none">TEAM</div>
                                                    <Button variant="ghost" size="icon" onClick={(e) => openDetail(e, 'team', team)} className={cn("h-8 w-8 rounded-full transition-colors z-20", selectedOrg.myRole === 'OWNER' ? "text-primary/70 hover:bg-primary/10 hover:text-primary" : "text-muted-foreground hover:bg-muted")}>
                                                        {selectedOrg.myRole === 'OWNER' ? <Settings className="h-4 w-4" /> : <Info className="h-4 w-4" />}
                                                    </Button>
                                                </div>
                                            </div>
                                            <h3 className="text-2xl sm:text-3xl font-black tracking-tight mb-2 truncate drop-shadow-sm mt-auto">{team.name}</h3>
                                            <div className="flex items-center text-sm font-extrabold text-muted-foreground mt-4 transition-colors">
                                                ダッシュボードを開く <ChevronRight className="h-5 w-5 ml-1 transition-transform group-hover:translate-x-1" />
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* 新規作成FAB */}
            <Button onClick={() => view === 'orgs' ? setShowOrgCreate(true) : setShowTeamCreate(true)} className="fixed bottom-8 right-4 sm:bottom-10 sm:right-8 h-16 w-16 rounded-full shadow-2xl shadow-primary/40 bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300 hover:-translate-y-1 active:scale-[0.92] z-40 flex items-center justify-center">
                <Plus className="h-8 w-8" />
            </Button>

            {/* 新規作成モーダル（省略・既存のまま） */}
            {(showOrgCreate || showTeamCreate) && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-0 bg-background/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="absolute inset-0" onClick={() => { if (!isCreatingOrg && !isCreatingTeam) { setShowOrgCreate(false); setShowTeamCreate(false); } }} />
                    <div className="relative w-full max-w-lg bg-gradient-to-br from-primary via-primary to-green-900 shadow-[0_20px_60px_rgba(0,0,0,0.4)] rounded-[32px] sm:rounded-[36px] overflow-hidden animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-8 duration-500 text-white">
                        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-white/20 blur-[60px] rounded-full pointer-events-none" />
                        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-64 h-64 bg-black/30 blur-[60px] rounded-full pointer-events-none" />
                        <div className="relative z-10 flex items-center justify-between p-6 sm:p-8 pb-4">
                            <h2 className="text-xl sm:text-2xl font-black flex items-center gap-3 tracking-tight"><div className="p-2.5 bg-white/20 rounded-2xl shadow-inner backdrop-blur-md">{showOrgCreate ? <RiTeamFill className="h-6 w-6" /> : <Shield className="h-6 w-6" />}</div>{showOrgCreate ? "クラブを作る" : "チームを追加"}</h2>
                            <Button variant="ghost" size="icon" onClick={() => { setShowOrgCreate(false); setShowTeamCreate(false); }} className="h-10 w-10 rounded-full hover:bg-white/20 text-white transition-all"><X className="h-6 w-6" /></Button>
                        </div>
                        <form onSubmit={showOrgCreate ? handleCreateOrg : handleCreateTeam} className="relative z-10 p-6 sm:p-8 pt-2 space-y-6">
                            {showOrgCreate && (
                                <div className="space-y-3"><label className="text-sm font-extrabold text-white/90">クラブ名</label><input type="text" required placeholder="例: 川崎中央シニア" className="flex h-14 w-full rounded-2xl border border-white/30 bg-white/10 px-4 text-base font-bold text-white shadow-inner placeholder:text-white/50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/30" value={newOrgName} onChange={(e) => setNewOrgName(e.target.value)} disabled={isCreatingOrg} autoFocus /></div>
                            )}
                            {showTeamCreate && (
                                <>
                                    <div className="space-y-3"><label className="text-sm font-extrabold text-white/90">チーム名</label><input type="text" required placeholder="例: 1軍 / ジュニア" className="flex h-14 w-full rounded-2xl border border-white/30 bg-white/10 px-4 text-base font-bold text-white shadow-inner placeholder:text-white/50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/30" value={newTeamName} onChange={(e) => setNewTeamName(e.target.value)} disabled={isCreatingTeam} autoFocus /></div>
                                    <div className="space-y-3"><label className="text-sm font-extrabold text-white/90">あなたの役割</label><select className="flex h-14 w-full appearance-none rounded-2xl border border-white/30 bg-white/10 px-4 pr-10 text-base font-bold text-white shadow-inner focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/30" value={newTeamRole} onChange={(e) => setNewTeamRole(e.target.value)} disabled={isCreatingTeam}><option value={ROLES.MANAGER} className="text-foreground">監督 / 代表</option><option value={ROLES.COACH} className="text-foreground">コーチ</option><option value={ROLES.SCORER} className="text-foreground">スコアラー</option><option value={ROLES.STAFF} className="text-foreground">スタッフ</option></select></div>
                                </>
                            )}
                            <div className="pt-4"><Button type="submit" disabled={isCreatingOrg || isCreatingTeam} className="w-full h-14 rounded-2xl font-extrabold bg-white text-primary hover:bg-white/90 shadow-xl transition-all hover:-translate-y-1">{(isCreatingOrg || isCreatingTeam) ? <Loader2 className="h-6 w-6 animate-spin mx-auto" /> : "作成する"}</Button></div>
                        </form>
                    </div>
                </div>
            )}

            {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                💡 究極UI化：詳細・設定モーダル（Read-Only / Edit）
            ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            {detailModal && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-0 bg-background/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="absolute inset-0" onClick={() => !isUpdating && setDetailModal(null)} />
                    <div className="relative w-full max-w-lg bg-card shadow-[0_20px_60px_rgba(0,0,0,0.15)] rounded-[32px] sm:rounded-[36px] overflow-hidden animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-8 duration-500 border border-border/50">

                        <div className="relative z-10 flex items-center justify-between p-6 sm:p-8 pb-4 border-b border-border/50 bg-muted/20">
                            <h2 className="text-xl font-black flex items-center gap-3 text-foreground">
                                <div className="p-2.5 bg-background rounded-2xl shadow-sm border border-border/50 text-primary">
                                    {detailModal.type === 'org' ? <RiTeamFill className="h-5 w-5" /> : <Shield className="h-5 w-5" />}
                                </div>
                                {detailModal.type === 'org' ? "クラブ詳細情報" : "チーム詳細情報"}
                            </h2>
                            <Button variant="ghost" size="icon" onClick={() => setDetailModal(null)} className="h-10 w-10 rounded-full hover:bg-muted text-muted-foreground transition-all"><X className="h-5 w-5" /></Button>
                        </div>

                        <div className="relative z-10 p-6 sm:p-8 space-y-6">

                            {/* Read-Only: 共通の表示情報 */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-[20px] border border-border/50">
                                    <div className="h-14 w-14 shrink-0 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                                        {detailModal.type === 'org' ? <RiTeamFill className="h-7 w-7" /> : <Shield className="h-7 w-7" />}
                                    </div>
                                    <div className="overflow-hidden">
                                        <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-0.5">登録名</div>
                                        <div className="text-lg font-black truncate">{detailModal.data.name}</div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-muted/30 rounded-[20px] border border-border/50">
                                        <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">ID</div>
                                        <div className="text-xs font-mono font-bold text-foreground/80 truncate">{detailModal.data.id.split('-')[0]}...</div>
                                    </div>
                                    <div className="p-4 bg-muted/30 rounded-[20px] border border-border/50">
                                        <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">権限・ロール</div>
                                        <div className="text-xs font-black text-primary truncate">{(detailModal.data as Organization).myRole || selectedOrg?.myRole}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Edit: OWNER（代表者）のみ表示される編集フォームと危険エリア */}
                            {((detailModal.type === 'org' && (detailModal.data as Organization).myRole === 'OWNER') || (detailModal.type === 'team' && selectedOrg?.myRole === 'OWNER')) ? (
                                <>
                                    <div className="h-px w-full bg-border/50 my-2" />
                                    <div className="space-y-3">
                                        <label className="text-sm font-extrabold text-foreground/80 flex items-center gap-2">
                                            <Settings className="h-4 w-4" /> 名前を変更する
                                        </label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                className="flex h-12 w-full rounded-[16px] border border-border/50 bg-background px-4 text-base font-bold shadow-inner focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 transition-all"
                                                value={editName}
                                                onChange={(e) => setEditName(e.target.value)}
                                                disabled={isUpdating}
                                            />
                                            <Button onClick={handleUpdate} disabled={isUpdating || editName === detailModal.data.name || !editName.trim()} className="h-12 px-6 rounded-[16px] font-black shrink-0">
                                                {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="pt-2">
                                        <Button variant="outline" onClick={handleDelete} disabled={isUpdating} className="w-full h-12 rounded-[16px] font-extrabold border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all">
                                            <Trash2 className="h-4 w-4 mr-2" /> この{detailModal.type === 'org' ? 'クラブ' : 'チーム'}を完全に削除
                                        </Button>
                                    </div>
                                </>
                            ) : (
                                <div className="mt-4 p-4 bg-primary/5 rounded-[16px] border border-primary/10 text-center">
                                    <p className="text-xs font-bold text-primary/70">設定を変更するには代表者（OWNER）権限が必要です。</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}