// src/app/(protected)/teams/_components/team-modals.tsx
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Loader2, Shield, X, Trash2, Settings, Info, Check } from "lucide-react";
import { RiTeamFill } from "react-icons/ri";
import { ROLES } from "@/lib/roles";
import { Organization, Team } from "../types";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 1. 新規作成ドロワー
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
interface CreateDrawerProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    view: 'orgs' | 'teams';
    isCreating: boolean;
    onSubmitOrg: (name: string) => Promise<void>;
    onSubmitTeam: (name: string, role: string) => Promise<void>;
}

export function CreateDrawer({ isOpen, onOpenChange, view, isCreating, onSubmitOrg, onSubmitTeam }: CreateDrawerProps) {
    // 💡 入力状態はDrawer内部で管理（親を綺麗に保つため）
    const [orgName, setOrgName] = useState("");
    const [teamName, setTeamName] = useState("");
    const [teamRole, setTeamRole] = useState<string>(ROLES.SCORER);

    // ドロワーが開くたびにフォームをリセット
    useEffect(() => {
        if (isOpen) {
            setOrgName("");
            setTeamName("");
            setTeamRole(ROLES.SCORER);
        }
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (view === 'orgs') await onSubmitOrg(orgName);
        else await onSubmitTeam(teamName, teamRole);
    };

    return (
        <Drawer open={isOpen} onOpenChange={onOpenChange}>
            <DrawerContent className="border-none bg-card rounded-t-[36px] shadow-[0_-20px_60px_rgba(0,0,0,0.1)] mx-auto sm:fixed sm:top-1/2 sm:left-1/2 sm:inset-auto sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-lg sm:rounded-[36px] sm:shadow-[0_20px_60px_rgba(0,0,0,0.15)] sm:animate-in sm:fade-in-0 sm:slide-in-from-bottom-12 sm:duration-500 transition-all duration-300 ease-out relative overflow-hidden">
                <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/5 blur-[100px] rounded-full pointer-events-none" />
                <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-primary/5 blur-[100px] rounded-full pointer-events-none" />
                <div className="mx-auto mt-4 h-1.5 w-16 rounded-full bg-border/40 backdrop-blur-sm sm:hidden" />

                <DrawerHeader className="relative z-10 text-left px-6 sm:px-10 pt-8 pb-3 flex items-center justify-between">
                    <DrawerTitle className="text-xl sm:text-2xl font-black flex items-center gap-4 tracking-tight text-foreground drop-shadow-sm">
                        <div className="relative p-3 bg-muted rounded-2xl border border-border shadow-sm text-primary overflow-hidden">
                            <div className="absolute inset-0 opacity-[0.03] scale-150" style={{ backgroundImage: 'var(--pattern-wavy)' }} />
                            {view === 'orgs' ? <RiTeamFill className="h-6 w-6 relative z-10" /> : <Shield className="h-6 w-6 relative z-10" />}
                        </div>
                        {view === 'orgs' ? "クラブを新しく作る" : "チームを新しく追加"}
                    </DrawerTitle>
                    <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="h-10 w-10 rounded-full hover:bg-muted text-muted-foreground transition-all hidden sm:flex"><X className="h-5 w-5" /></Button>
                </DrawerHeader>

                <div className="relative z-10 px-6 sm:px-10 pt-4 pb-14 space-y-7">
                    <form onSubmit={handleSubmit} className="space-y-7">
                        {view === 'orgs' ? (
                            <div className="space-y-3.5">
                                <label className="text-sm font-black text-muted-foreground uppercase tracking-widest pl-1">クラブ（組織）名</label>
                                <input type="text" required placeholder="例: 川崎中央シニア" className="flex h-14 w-full rounded-[18px] border border-border/50 bg-muted/30 px-5 text-base font-bold shadow-inner placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20 focus-visible:bg-background transition-all" value={orgName} onChange={(e) => setOrgName(e.target.value)} disabled={isCreating} autoFocus />
                            </div>
                        ) : (
                            <>
                                <div className="space-y-3.5">
                                    <label className="text-sm font-black text-muted-foreground uppercase tracking-widest pl-1">チーム名</label>
                                    <input type="text" required placeholder="例: 1軍 / ジュニア" className="flex h-14 w-full rounded-[18px] border border-border/50 bg-muted/30 px-5 text-base font-bold shadow-inner placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20 focus-visible:bg-background transition-all" value={teamName} onChange={(e) => setTeamName(e.target.value)} disabled={isCreating} autoFocus />
                                </div>
                                <div className="space-y-3.5">
                                    <label className="text-sm font-black text-muted-foreground uppercase tracking-widest pl-1">あなたの役割（ロール）</label>
                                    <select className="flex h-14 w-full appearance-none rounded-[18px] border border-border/50 bg-muted/30 px-5 pr-10 text-base font-bold text-foreground shadow-inner focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20 focus-visible:bg-background transition-all cursor-pointer bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke-width%3D%222.5%22%20stroke%3D%22%2371717a%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20d%3D%22M19%209l-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] bg-[length:18px_18px] bg-[position:right_18px_center] bg-no-repeat" value={teamRole} onChange={(e) => setTeamRole(e.target.value)} disabled={isCreating}>
                                        <option value={ROLES.MANAGER} className="text-foreground">監督 / 代表 (Manager)</option>
                                        <option value={ROLES.COACH} className="text-foreground">コーチ (Coach)</option>
                                        <option value={ROLES.SCORER} className="text-foreground">スコアラー (Scorer)</option>
                                        <option value={ROLES.STAFF} className="text-foreground">スタッフ (Staff)</option>
                                    </select>
                                </div>
                            </>
                        )}
                        <div className="pt-3">
                            <Button type="submit" disabled={isCreating} className="w-full h-15 rounded-[20px] font-black text-base bg-primary text-primary-foreground hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all hover:-translate-y-1 active:scale-[0.98]">
                                {isCreating ? <Loader2 className="h-6 w-6 animate-spin mx-auto" /> : (view === 'orgs' ? "クラブを作成する" : "チームを追加する")}
                            </Button>
                        </div>
                    </form>
                </div>
            </DrawerContent>
        </Drawer>
    );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 2. 詳細・設定モーダル
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
interface DetailModalProps {
    isOpen: boolean;
    type?: 'org' | 'team';
    data?: Organization | Team;
    selectedOrgRole?: string;
    isUpdating: boolean;
    onClose: () => void;
    onUpdate: (newName: string) => Promise<void>;
    onDelete: () => Promise<void>;
}

export function DetailModal({ isOpen, type, data, selectedOrgRole, isUpdating, onClose, onUpdate, onDelete }: DetailModalProps) {
    const [editName, setEditName] = useState("");

    // 開かれたデータが変わるたびに編集フォームのテキストを初期化
    useEffect(() => {
        if (data) setEditName(data.name);
    }, [data]);

    if (!isOpen || !data || !type) return null;

    const myRole = type === 'org' ? (data as Organization).myRole : selectedOrgRole;
    const canEdit = myRole === 'OWNER';

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-0 bg-background/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="absolute inset-0" onClick={() => !isUpdating && onClose()} />
            <div className="relative w-full max-w-lg bg-card shadow-[0_20px_60px_rgba(0,0,0,0.15)] rounded-[32px] sm:rounded-[36px] overflow-hidden animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-8 duration-500 border border-border/50">

                <div className="relative z-10 flex items-center justify-between p-6 sm:p-8 pb-4 border-b border-border/50 bg-muted/20">
                    <h2 className="text-xl font-black flex items-center gap-3 text-foreground">
                        <div className="p-2.5 bg-background rounded-2xl shadow-sm border border-border/50 text-primary">
                            {type === 'org' ? <RiTeamFill className="h-5 w-5" /> : <Shield className="h-5 w-5" />}
                        </div>
                        {type === 'org' ? "クラブ詳細情報" : "チーム詳細情報"}
                    </h2>
                    <Button variant="ghost" size="icon" onClick={onClose} className="h-10 w-10 rounded-full hover:bg-muted text-muted-foreground transition-all"><X className="h-5 w-5" /></Button>
                </div>

                <div className="relative z-10 p-6 sm:p-8 space-y-6">
                    <div className="space-y-4">
                        <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-[20px] border border-border/50">
                            <div className="h-14 w-14 shrink-0 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                                {type === 'org' ? <RiTeamFill className="h-7 w-7" /> : <Shield className="h-7 w-7" />}
                            </div>
                            <div className="overflow-hidden">
                                <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-0.5">登録名</div>
                                <div className="text-lg font-black truncate">{data.name}</div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-muted/30 rounded-[20px] border border-border/50">
                                <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">ID</div>
                                <div className="text-xs font-mono font-bold text-foreground/80 truncate">{data.id.split('-')[0]}...</div>
                            </div>
                            <div className="p-4 bg-muted/30 rounded-[20px] border border-border/50">
                                <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">権限・ロール</div>
                                <div className="text-xs font-black text-primary truncate">{myRole}</div>
                            </div>
                        </div>
                    </div>

                    {canEdit ? (
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
                                    <Button onClick={() => onUpdate(editName)} disabled={isUpdating || editName === data.name || !editName.trim()} className="h-12 px-6 rounded-[16px] font-black shrink-0">
                                        {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                                    </Button>
                                </div>
                            </div>

                            <div className="pt-2">
                                <Button variant="outline" onClick={onDelete} disabled={isUpdating} className="w-full h-12 rounded-[16px] font-extrabold border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all">
                                    <Trash2 className="h-4 w-4 mr-2" /> この{type === 'org' ? 'クラブ' : 'チーム'}を完全に削除
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
    );
}