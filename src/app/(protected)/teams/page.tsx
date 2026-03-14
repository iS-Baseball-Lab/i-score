// src/app/(protected)/teams/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Plus, DatabaseZap } from "lucide-react";
import { RiTeamFill } from "react-icons/ri";
import { toast } from "sonner";
import { Organization, Team, Opponent } from "./types";

// 💡 美しく分割されたコンポーネント群をインポート
import { OrgList } from "./_components/org-list";
import { TeamList } from "./_components/team-list";
import { CreateOrgModal, OrgDetailModal, OpponentDetailModal } from "./_components/org-modals";
import { CreateTeamModal, TeamDetailModal } from "./_components/team-modals";

export default function TeamsPage() {
    const router = useRouter();

    const [view, setView] = useState<'orgs' | 'teams'>('orgs');
    const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);

    const [orgs, setOrgs] = useState<Organization[]>([]);
    const [teams, setTeams] = useState<Team[]>([]);
    const [isLoadingOrgs, setIsLoadingOrgs] = useState(true);
    const [isLoadingTeams, setIsLoadingTeams] = useState(false);

    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);

    const [isExternalOrgCreate, setIsExternalOrgCreate] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    const [detailModal, setDetailModal] = useState<{ type: 'org' | 'team', data: Organization | Team } | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);

    const [selectedOpponent, setSelectedOpponent] = useState<Opponent | null>(null);

    useEffect(() => {
        const saved = localStorage.getItem('iScore_selectedCategory');
        if (saved) setSelectedCategory(saved);
        fetchOrgs();
    }, []);

    const fetchOrgs = async () => {
        setIsLoadingOrgs(true);
        try {
            const res = await fetch('/api/organizations');
            if (res.ok) setOrgs(await res.json());
        } catch (e) { console.error(e); }
        finally { setIsLoadingOrgs(false); }
    };

    const handleSeedData = async () => {
        if (!confirm('【開発用】テストデータを一括生成します。よろしいですか？\n（※既存のデータは消えません）')) return;

        const loadingToast = toast.loading('データを生成中...');
        try {
            const res = await fetch('/api/seed', { method: 'POST' });
            if (res.ok) {
                toast.success('テストデータの生成が完了しました！', { id: loadingToast });
                fetchOrgs(); // リストを再取得して画面を更新
            } else {
                toast.error('生成に失敗しました。', { id: loadingToast });
            }
        } catch (e) {
            toast.error('通信エラーが発生しました。', { id: loadingToast });
        }
    };

    const fetchTeams = async (orgId: string) => {
        setIsLoadingTeams(true);
        try {
            const res = await fetch(`/api/organizations/${orgId}/teams`);
            if (res.ok) setTeams(await res.json());
        } catch (e) { console.error(e); }
        finally { setIsLoadingTeams(false); }
    };

    const handleCategoryChange = (cat: string) => {
        setSelectedCategory(cat);
        localStorage.setItem('iScore_selectedCategory', cat);
    };

    const handleSelectOrg = (org: Organization) => {
        setSelectedOrg(org);
        setView('teams');
        fetchTeams(org.id);
    };

    const handleTeamClick = (teamId: string) => {
        localStorage.setItem("iScore_selectedTeamId", teamId);
        if (selectedOrg) localStorage.setItem("iScore_selectedOrgId", selectedOrg.id);
        router.push('/dashboard');
    };

    const handleCreateOrg = async (name: string, category: string) => {
        if (!name.trim()) return;
        setIsCreating(true);
        try {
            const res = await fetch('/api/organizations', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, isExternal: isExternalOrgCreate, category }),
            });
            const data = await res.json() as { success: boolean; error?: string };
            if (res.ok && data.success) {
                toast.success(isExternalOrgCreate ? "対戦相手を追加しました！" : "クラブを作成しました！");
                setIsDrawerOpen(false);
                handleCategoryChange(category);
                fetchOrgs();
            } else toast.error(data.error || "作成に失敗しました");
        } catch (e) { toast.error("通信エラーが発生しました"); }
        finally { setIsCreating(false); }
    };

    const handleCreateTeam = async (name: string, role: string, year: number, tier: string) => {
        if (!name.trim() || !selectedOrg) return;
        setIsCreating(true);
        try {
            const res = await fetch('/api/teams', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, role, organizationId: selectedOrg.id, year, tier }),
            });
            const data = await res.json() as any;
            if (res.ok && data.success) {
                toast.success("チームを作成しました！");
                setIsDrawerOpen(false);
                localStorage.setItem("iScore_selectedTeamId", data.teamId);
                localStorage.setItem("iScore_selectedOrgId", selectedOrg.id);
                router.push('/dashboard');
            } else toast.error(data.error || "作成に失敗しました");
        } catch (e) { toast.error("通信エラーが発生しました"); }
        finally { setIsCreating(false); }
    };

    const handleUpdate = async (newName: string, newCategory?: string) => {
        if (!detailModal || !newName.trim()) return;
        setIsUpdating(true);
        try {
            const url = detailModal.type === 'org' ? `/api/organizations/${detailModal.data.id}` : `/api/teams/${detailModal.data.id}`;
            const bodyPayload: any = { name: newName };
            if (detailModal.type === 'org' && newCategory) bodyPayload.category = newCategory;

            const res = await fetch(url, {
                method: 'PATCH', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bodyPayload)
            });

            if (res.ok) {
                toast.success("情報を更新しました");
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

    return (
        <div className="flex flex-col min-h-screen text-foreground pb-32 relative overflow-hidden">
            {/* 💡 ヘッダーとテスト生成ボタンを横並びに！ */}
            <div className="flex items-center justify-between px-4 sm:px-6 max-w-4xl mx-auto w-full pt-4">
                <PageHeader href="/dashboard" icon={RiTeamFill} title="クラブ・チーム管理" subtitle="所属するクラブとチームの作成・編集を行います。" />

                {/* 開発環境限定（または開発時のみ）のシークレットボタン */}
                {process.env.NODE_ENV === 'development' && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSeedData}
                        className="hidden sm:flex border-orange-500/30 text-orange-500 hover:bg-orange-500 hover:text-white transition-all bg-background/50 shadow-sm"
                    >
                        <DatabaseZap className="h-4 w-4 mr-2" /> テストデータを生成
                    </Button>
                )}
            </div>
            <main className="flex-1 px-4 sm:px-6 max-w-4xl mx-auto w-full mt-6 sm:mt-8 relative z-10">
                {view === 'orgs' ? (
                    <OrgList
                        orgs={orgs}
                        isLoading={isLoadingOrgs}
                        selectedCategory={selectedCategory}
                        onCategoryChange={handleCategoryChange}
                        onSelectOrg={handleSelectOrg}
                        onOpenDetail={(e, org) => { e.preventDefault(); e.stopPropagation(); setDetailModal({ type: 'org', data: org }); }}
                        onOpponentClick={(opp) => setSelectedOpponent(opp)}
                        onAddOrg={(isExternal) => { setIsExternalOrgCreate(isExternal); setIsDrawerOpen(true); }}
                    />
                ) : (
                    selectedOrg && (
                        <TeamList
                            teams={teams}
                            selectedOrg={selectedOrg}
                            isLoading={isLoadingTeams}
                            onBack={() => { setView('orgs'); setSelectedOrg(null); }}
                            onTeamClick={handleTeamClick}
                            onOpenDetail={(e, team) => { e.preventDefault(); e.stopPropagation(); setDetailModal({ type: 'team', data: team }); }}
                        />
                    )
                )}
            </main>

            <Button onClick={() => { setIsExternalOrgCreate(false); setIsDrawerOpen(true); }} className="fixed bottom-8 right-4 sm:bottom-10 sm:right-8 h-16 w-16 rounded-full shadow-2xl shadow-primary/40 bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300 hover:-translate-y-1 active:scale-[0.92] z-40 flex items-center justify-center">
                <Plus className="h-8 w-8" />
            </Button>

            {/* 💡 分割されたモーダル群をシンプルに呼び出す */}
            <CreateOrgModal
                isOpen={isDrawerOpen && view === 'orgs'}
                onOpenChange={setIsDrawerOpen}
                isCreating={isCreating}
                isExternalOrgCreate={isExternalOrgCreate}
                defaultCategory={selectedCategory === 'all' ? 'other' : selectedCategory}
                onSubmit={handleCreateOrg}
            />

            <CreateTeamModal
                isOpen={isDrawerOpen && view === 'teams'}
                onOpenChange={setIsDrawerOpen}
                isCreating={isCreating}
                onSubmit={handleCreateTeam}
            />

            <OrgDetailModal
                isOpen={!!detailModal && detailModal.type === 'org'}
                data={detailModal?.data as Organization}
                isUpdating={isUpdating}
                onClose={() => setDetailModal(null)}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
            />

            <TeamDetailModal
                isOpen={!!detailModal && detailModal.type === 'team'}
                data={detailModal?.data as Team}
                selectedOrgRole={selectedOrg?.myRole}
                isUpdating={isUpdating}
                onClose={() => setDetailModal(null)}
                onUpdate={(name) => handleUpdate(name)} // Teamはカテゴリなし
                onDelete={handleDelete}
            />

            <OpponentDetailModal
                isOpen={!!selectedOpponent}
                onOpenChange={(open) => !open && setSelectedOpponent(null)}
                opponent={selectedOpponent}
            />
        </div>
    );
}