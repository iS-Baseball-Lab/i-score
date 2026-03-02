// src/app/(protected)/admin/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Users, ShieldAlert, Shield, Search, Trash2, User as UserIcon, Loader2, Building2, UserPlus, UserMinus, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { PageHeader } from "@/components/PageHeader";
import { cn } from "@/lib/utils";
import { ROLES } from "@/lib/roles"; // 💡 ロール定義をインポート

interface AppUser { id: string; name: string; email: string; role: string; createdAt: string; }
interface AppTeam { id: string; name: string; memberCount: number; createdAt: string; }
interface TeamMember { id: string; name: string; email: string; role: string; } // 💡 チームメンバー用

export default function AdminPage() {
    const [activeTab, setActiveTab] = useState<"users" | "teams">("users");
    const [users, setUsers] = useState<AppUser[]>([]);
    const [teams, setTeams] = useState<AppTeam[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // 💡 チームメンバー管理用の状態
    const [managingTeamId, setManagingTeamId] = useState<string | null>(null);
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
    const [isMembersLoading, setIsMembersLoading] = useState(false);
    const [newMemberId, setNewMemberId] = useState("");
    const [newMemberRole, setNewMemberRole] = useState<string>(ROLES.SCORER);

    const fetchUsers = async () => {
        try { const res = await fetch('/api/users'); if (res.ok) setUsers(await res.json()); } 
        catch (error) { console.error(error); }
    };

    const fetchTeams = async () => {
        try { const res = await fetch('/api/admin/teams'); if (res.ok) setTeams(await res.json()); } 
        catch (error) { console.error(error); }
    };

    useEffect(() => {
        setIsLoading(true);
        setSearchTerm("");
        setManagingTeamId(null); // タブ切り替え時はメンバー管理を閉じる
        if (activeTab === "users") fetchUsers().finally(() => setIsLoading(false));
        else fetchTeams().finally(() => setIsLoading(false));
    }, [activeTab]);

    // 💡 特定チームのメンバーを管理モードで開く
    const toggleManageMembers = async (teamId: string) => {
        if (managingTeamId === teamId) {
            setManagingTeamId(null); // 既に開いていれば閉じる
            return;
        }
        setManagingTeamId(teamId);
        setIsMembersLoading(true);
        try {
            const res = await fetch(`/api/admin/teams/${teamId}/members`);
            if (res.ok) setTeamMembers(await res.json());
        } catch (e) { console.error(e); }
        finally { setIsMembersLoading(false); }
    };

    // 💡 ユーザーをチームに紐付ける
    const handleAddMemberToTeam = async (teamId: string) => {
        if (!newMemberId) return;
        try {
            const res = await fetch(`/api/admin/teams/${teamId}/members`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: newMemberId, role: newMemberRole })
            });
            if (res.ok) {
                setNewMemberId("");
                fetchTeams(); // 外側の人数表示を更新
                
                // 💡 無理やり画面を閉じて開くハックをやめ、APIから直接メンバーリストを再取得する
                const membersRes = await fetch(`/api/admin/teams/${teamId}/members`);
                if (membersRes.ok) {
                    setTeamMembers(await membersRes.json());
                }
            } else {
                alert("追加に失敗しました");
            }
        } catch (e) { 
            console.error("メンバー追加処理エラー:", e); 
        }
    };

    // 💡 ユーザーをチームから解除する
    const handleRemoveMemberFromTeam = async (teamId: string, userId: string, userName: string) => {
        if (!confirm(`「${userName}」をこのチームから外しますか？`)) return;
        try {
            const res = await fetch(`/api/admin/teams/${teamId}/members/${userId}`, { method: 'DELETE' });
            if (res.ok) {
                setTeamMembers(teamMembers.filter(m => m.id !== userId));
                fetchTeams(); // 人数表示を更新
            } else alert("解除に失敗しました");
        } catch (e) { console.error(e); }
    };

    const handleRoleChange = async (userId: string, newRole: string) => {
        try {
            const res = await fetch(`/api/users/${userId}/role`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: newRole })
            });
            if (res.ok) setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
            else alert("権限の更新に失敗しました");
        } catch (e) { console.error(e); }
    };

    const handleDeleteUser = async (userId: string, userName: string) => {
        if (!confirm(`⚠️ 本当にユーザー「${userName}」を削除しますか？`)) return;
        try {
            const res = await fetch(`/api/users/${userId}`, { method: 'DELETE' });
            if (res.ok) setUsers(users.filter(u => u.id !== userId));
            else alert("ユーザーの削除に失敗しました");
        } catch (e) { console.error(e); }
    };

    const handleDeleteTeam = async (teamId: string, teamName: string) => {
        if (!confirm(`🚨 本当にチーム「${teamName}」を完全に削除しますか？`)) return;
        try {
            const res = await fetch(`/api/teams/${teamId}`, { method: 'DELETE' });
            if (res.ok) setTeams(teams.filter(t => t.id !== teamId));
            else alert("チームの削除に失敗しました");
        } catch (e) { console.error(e); }
    };

    const filteredUsers = users.filter(u => u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || u.email?.toLowerCase().includes(searchTerm.toLowerCase()));
    const filteredTeams = teams.filter(t => t.name?.toLowerCase().includes(searchTerm.toLowerCase()));
    const adminCount = users.filter(u => u.role === 'admin').length;

    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground pb-20">
            <PageHeader 
                href="/dashboard" 
                icon={ShieldAlert} 
                title="システム管理 (Admin)" 
                subtitle="全ユーザーとチームの管理" 
            />

            <main className="flex-1 p-4 max-w-4xl mx-auto w-full space-y-6 mt-2">
                
                <div className="flex bg-muted/30 p-1.5 rounded-xl border border-border shadow-inner">
                    <button onClick={() => setActiveTab("users")} className={cn("flex-1 py-2.5 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2", activeTab === "users" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}>
                        <Users className="h-4 w-4" /> ユーザー
                    </button>
                    <button onClick={() => setActiveTab("teams")} className={cn("flex-1 py-2.5 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2", activeTab === "teams" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}>
                        <Building2 className="h-4 w-4" /> チーム
                    </button>
                </div>

                {activeTab === "users" && (
                    <div className="grid grid-cols-2 gap-4 animate-in fade-in zoom-in duration-300">
                        <div className="bg-muted/20 border border-border rounded-2xl p-4 flex flex-col justify-center items-center shadow-sm">
                            <Users className="h-6 w-6 text-muted-foreground mb-2" />
                            <div className="text-3xl font-black text-foreground">{users.length}</div>
                            <div className="text-xs font-bold text-muted-foreground tracking-widest uppercase mt-1">Total Users</div>
                        </div>
                        <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 flex flex-col justify-center items-center shadow-sm">
                            <Shield className="h-6 w-6 text-primary mb-2" />
                            <div className="text-3xl font-black text-primary">{adminCount}</div>
                            <div className="text-xs font-bold text-primary/70 tracking-widest uppercase mt-1">Admins</div>
                        </div>
                    </div>
                )}

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <input type="text" placeholder={activeTab === "users" ? "名前やメールアドレスで検索..." : "チーム名で検索..."} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-sm" />
                </div>

                {isLoading ? (
                    <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                ) : activeTab === "users" ? (
                    /* 👥 ユーザー一覧 (省略なし) */
                    filteredUsers.length === 0 ? (
                        <div className="text-center py-12 bg-muted/10 rounded-2xl border border-dashed border-border text-muted-foreground font-medium">ユーザーが見つかりません</div>
                    ) : (
                        <div className="space-y-3 animate-in fade-in duration-300">
                            {filteredUsers.map((user) => (
                                <div key={user.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-background border border-border rounded-xl p-4 shadow-sm hover:border-primary/40 transition-colors">
                                    <div className="flex items-center gap-4 overflow-hidden">
                                        <div className={cn("w-12 h-12 rounded-full flex items-center justify-center shrink-0 border-2", user.role === 'admin' ? "bg-primary/10 border-primary/30 text-primary" : "bg-muted border-border text-muted-foreground")}>
                                            {user.role === 'admin' ? <Shield className="h-6 w-6" /> : <UserIcon className="h-6 w-6" />}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h3 className="font-bold text-base truncate flex items-center gap-2">
                                                {user.name}
                                                {user.role === 'admin' && <span className="text-[9px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded leading-none uppercase font-black">Admin</span>}
                                            </h3>
                                            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-end gap-2 shrink-0 pt-3 sm:pt-0 border-t border-border/50 sm:border-0">
                                        <Select value={user.role || 'user'} onChange={(e) => handleRoleChange(user.id, e.target.value)} className="h-9 w-[130px] rounded-lg border-border bg-muted/30 text-xs font-bold cursor-pointer">
                                            <option value="user">一般ユーザー</option>
                                            <option value="admin">システム管理者</option>
                                        </Select>
                                        <Button size="icon-sm" variant="ghost" className="h-9 w-9 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg shrink-0" onClick={() => handleDeleteUser(user.id, user.name)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                ) : (
                    /* 🏢 チーム一覧 ＋ メンバー管理 */
                    filteredTeams.length === 0 ? (
                        <div className="text-center py-12 bg-muted/10 rounded-2xl border border-dashed border-border text-muted-foreground font-medium">チームが見つかりません</div>
                    ) : (
                        <div className="space-y-3 animate-in fade-in duration-300">
                            {filteredTeams.map((team) => (
                                <div key={team.id} className="bg-background border border-border rounded-xl shadow-sm overflow-hidden transition-all">
                                    {/* チームの基本情報 */}
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 hover:bg-muted/30">
                                        <div className="flex items-center gap-4 overflow-hidden">
                                            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border-2 border-blue-500/20 text-blue-500 flex items-center justify-center shrink-0">
                                                <Building2 className="h-6 w-6" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <h3 className="font-bold text-base truncate tracking-tight">{team.name}</h3>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <span className="text-xs font-bold text-muted-foreground flex items-center gap-1">
                                                        <Users className="h-3 w-3" /> {team.memberCount}名
                                                    </span>
                                                    <span className="text-[10px] text-muted-foreground/60">
                                                        {new Date(team.createdAt).toLocaleDateString('ja-JP')}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-end gap-2 shrink-0 pt-3 sm:pt-0 border-t border-border/50 sm:border-0">
                                            {/* 💡 メンバー管理を開くボタン */}
                                            <Button size="sm" variant={managingTeamId === team.id ? "secondary" : "outline"} className="h-9 rounded-lg font-bold" onClick={() => toggleManageMembers(team.id)}>
                                                <Settings2 className="h-4 w-4 mr-1.5" /> メンバー管理
                                            </Button>
                                            <Button size="icon-sm" variant="ghost" className="h-9 w-9 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg shrink-0" onClick={() => handleDeleteTeam(team.id, team.name)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    {/* 💡 メンバー管理展開エリア */}
                                    {managingTeamId === team.id && (
                                        <div className="bg-muted/10 border-t border-border p-4 animate-in slide-in-from-top-2">
                                            {isMembersLoading ? (
                                                <div className="flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
                                            ) : (
                                                <div className="space-y-4">
                                                    {/* 所属メンバー一覧 */}
                                                    <div className="space-y-2">
                                                        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">現在のメンバー</h4>
                                                        {teamMembers.length === 0 ? (
                                                            <p className="text-sm text-muted-foreground">所属メンバーがいません</p>
                                                        ) : (
                                                            teamMembers.map(m => (
                                                                <div key={m.id} className="flex items-center justify-between bg-background border border-border/50 rounded-lg p-2 px-3 shadow-sm">
                                                                    <div>
                                                                        <div className="text-sm font-bold">{m.name}</div>
                                                                        <div className="text-[10px] text-muted-foreground">{m.role} • {m.email}</div>
                                                                    </div>
                                                                    <Button size="icon-sm" variant="ghost" className="h-7 w-7 text-red-400 hover:text-red-500 hover:bg-red-500/10 rounded-md" onClick={() => handleRemoveMemberFromTeam(team.id, m.id, m.name)}>
                                                                        <UserMinus className="h-3 w-3" />
                                                                    </Button>
                                                                </div>
                                                            ))
                                                        )}
                                                    </div>

                                                    {/* 新規メンバー追加フォーム */}
                                                    <div className="pt-2 border-t border-border/50">
                                                        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-1"><UserPlus className="h-3 w-3" /> ユーザーの紐付け</h4>
                                                        <div className="flex flex-col sm:flex-row gap-2">
                                                            <Select 
                                                                className="flex-1 h-9"
                                                                value={newMemberId}
                                                                onChange={(e) => setNewMemberId(e.target.value)}
                                                            >
                                                                <option value="">ユーザーを選択...</option>
                                                                {users.filter(u => !teamMembers.some(tm => tm.id === u.id)).map(u => (
                                                                    <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                                                                ))}
                                                            </Select>
                                                            
                                                            <Select 
                                                                className="w-full sm:w-[130px] h-9"
                                                                value={newMemberRole}
                                                                onChange={(e) => setNewMemberRole(e.target.value)}
                                                            >
                                                                <option value={ROLES.MANAGER}>代表(Manager)</option>
                                                                <option value={ROLES.COACH}>コーチ</option>
                                                                <option value={ROLES.SCORER}>スコアラー</option>
                                                                <option value={ROLES.STAFF}>スタッフ</option>
                                                            </Select>
                                                            <Button size="sm" className="h-9 font-bold shrink-0" onClick={() => handleAddMemberToTeam(team.id)}>追加</Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )
                )}
            </main>
        </div>
    );
}

