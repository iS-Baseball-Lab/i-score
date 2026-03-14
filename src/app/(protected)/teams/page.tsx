// src/app/(protected)/teams/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { RiTeamFill } from "react-icons/ri";
import { toast } from "sonner";
import { Organization, Team, Opponent } from "./types";
import { OrgList, TeamList } from "./_components/team-lists";
import { CreateModal, DetailModal, OpponentDetailModal } from "./_components/team-modals";

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

    // 💡 外部（対戦相手）クラブを作成するかどうかのフラグ
    const [isExternalOrgCreate, setIsExternalOrgCreate] = useState(false);

    // 💡 カテゴリの記憶用 State
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    // 💡 マウント時に localStorage から復元
    useEffect(() => {
        const saved = localStorage.getItem('iScore_selectedCategory');
        if (saved) setSelectedCategory(saved);
        fetchOrgs(); // ついでにここで初期フェッチ
    }, []);

    // 💡 カテゴリが変更されたら保存する関数
    const handleCategoryChange = (cat: string) => {
        setSelectedCategory(cat);
        localStorage.setItem('iScore_selectedCategory', cat);
    };

    const [detailModal, setDetailModal] = useState<{ type: 'org' | 'team', data: Organization | Team } | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);

    const [selectedOpponent, setSelectedOpponent] = useState<Opponent | null>(null);

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
        fetchTeams(org.id);
    };

    const handleBackToOrgs = () => {
        setView('orgs');
        setSelectedOrg(null);
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
            // 💡 外部クラブの場合は isExternal フラグを付与してAPIへ送信
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

            if (detailModal.type === 'org' && newCategory) {
                bodyPayload.category = newCategory;
            }

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
            <PageHeader href="/dashboard" icon={RiTeamFill} title="クラブ・チーム管理" subtitle="所属するクラブとチームの作成・編集を行います。" />

            <main className="flex-1 px-4 sm:px-6 max-w-4xl mx-auto w-full mt-6 sm:mt-8 relative z-10">
                {view === 'orgs' ? (
                    <OrgList
                        orgs={orgs}
                        isLoading={isLoadingOrgs}
                        selectedCategory={selectedCategory}
                        onCategoryChange={handleCategoryChange}
                        onSelectOrg={handleSelectOrg}
                        onOpenDetail={(e, type, data) => { e.preventDefault(); e.stopPropagation(); setDetailModal({ type, data }); }}
                        onOpponentClick={(opp) => setSelectedOpponent(opp)}
                        // 💡 OrgList側にDrawer起動用の関数を渡す
                        onAddOrg={(isExternal) => { setIsExternalOrgCreate(isExternal); setIsDrawerOpen(true); }}
                    />
                ) : (
                    selectedOrg && (
                        <TeamList
                            teams={teams}
                            selectedOrg={selectedOrg}
                            isLoading={isLoadingTeams}
                            onBack={handleBackToOrgs}
                            onTeamClick={handleTeamClick}
                            onOpenDetail={(e, type, data) => { e.preventDefault(); e.stopPropagation(); setDetailModal({ type, data }); }}
                        />
                    )
                )}
            </main>

            {/* FABは通常クラブ作成用（view切り替え時はチーム作成） */}
            <Button onClick={() => { setIsExternalOrgCreate(false); setIsDrawerOpen(true); }} className="fixed bottom-8 right-4 sm:bottom-10 sm:right-8 h-16 w-16 rounded-full shadow-2xl shadow-primary/40 bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300 hover:-translate-y-1 active:scale-[0.92] z-40 flex items-center justify-center">
                <Plus className="h-8 w-8" />
            </Button>

            <CreateModal
                isOpen={isDrawerOpen}
                onOpenChange={setIsDrawerOpen}
                view={view}
                isCreating={isCreating}
                isExternalOrgCreate={isExternalOrgCreate}
                defaultCategory={selectedCategory === 'all' ? 'other' : selectedCategory}
                onSubmitOrg={handleCreateOrg}
                onSubmitTeam={handleCreateTeam}
            />

            <DetailModal
                isOpen={!!detailModal}
                type={detailModal?.type}
                data={detailModal?.data}
                selectedOrgRole={selectedOrg?.myRole}
                isUpdating={isUpdating}
                onClose={() => setDetailModal(null)}
                onUpdate={handleUpdate}
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