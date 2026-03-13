// src/app/(protected)/teams/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { RiTeamFill } from "react-icons/ri";
import { toast } from "sonner";
import { Organization, Team } from "./types";
import { OrgList, TeamList } from "./_components/team-lists";
import { CreateDrawer, DetailModal } from "./_components/team-modals";

export default function TeamsPage() {
    const router = useRouter();

    // --- State: 表示管理 ---
    const [view, setView] = useState<'orgs' | 'teams'>('orgs');
    const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);

    // --- State: データ ---
    const [orgs, setOrgs] = useState<Organization[]>([]);
    const [teams, setTeams] = useState<Team[]>([]);
    const [isLoadingOrgs, setIsLoadingOrgs] = useState(true);
    const [isLoadingTeams, setIsLoadingTeams] = useState(false);

    // --- State: ダイアログ制御 ---
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);

    const [detailModal, setDetailModal] = useState<{ type: 'org' | 'team', data: Organization | Team } | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);

    // --- API Fetchers ---
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

    // --- Handlers: ナビゲーション ---
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

    // --- Handlers: 作成 (Drawer) ---
    const handleCreateOrg = async (name: string) => {
        if (!name.trim()) return;
        setIsCreating(true);
        try {
            const res = await fetch('/api/organizations', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name }),
            });
            const data = await res.json() as { success: boolean; error?: string };
            if (res.ok && data.success) {
                toast.success("クラブを作成しました！");
                setIsDrawerOpen(false);
                fetchOrgs();
            } else toast.error(data.error || "作成に失敗しました");
        } catch (e) { toast.error("通信エラーが発生しました"); }
        finally { setIsCreating(false); }
    };

    const handleCreateTeam = async (name: string, role: string) => {
        if (!name.trim() || !selectedOrg) return;
        setIsCreating(true);
        try {
            const res = await fetch('/api/teams', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, role, organizationId: selectedOrg.id }),
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

    // --- Handlers: 更新・削除 (Modal) ---
    const handleUpdate = async (newName: string) => {
        if (!detailModal || !newName.trim()) return;
        setIsUpdating(true);
        try {
            const url = detailModal.type === 'org' ? `/api/organizations/${detailModal.data.id}` : `/api/teams/${detailModal.data.id}`;
            const res = await fetch(url, {
                method: 'PATCH', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newName })
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

    return (
        <div className="flex flex-col min-h-screen text-foreground pb-32 relative overflow-hidden">
            <PageHeader href="/dashboard" icon={RiTeamFill} title="クラブ・チーム管理" subtitle="所属するクラブとチームの作成・編集を行います。" />

            <main className="flex-1 px-4 sm:px-6 max-w-4xl mx-auto w-full mt-6 sm:mt-8 relative z-10">
                {view === 'orgs' ? (
                    <OrgList
                        orgs={orgs}
                        isLoading={isLoadingOrgs}
                        onSelectOrg={handleSelectOrg}
                        onOpenDetail={(e, type, data) => { e.preventDefault(); e.stopPropagation(); setDetailModal({ type, data }); }}
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

            {/* 新規作成フロー（FAB + Drawer） */}
            <Button onClick={() => setIsDrawerOpen(true)} className="fixed bottom-8 right-4 sm:bottom-10 sm:right-8 h-16 w-16 rounded-full shadow-2xl shadow-primary/40 bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300 hover:-translate-y-1 active:scale-[0.92] z-40 flex items-center justify-center">
                <Plus className="h-8 w-8" />
            </Button>

            <CreateDrawer
                isOpen={isDrawerOpen}
                onOpenChange={setIsDrawerOpen}
                view={view}
                isCreating={isCreating}
                onSubmitOrg={handleCreateOrg}
                onSubmitTeam={handleCreateTeam}
            />

            {/* 詳細・編集モーダル */}
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
        </div>
    );
}