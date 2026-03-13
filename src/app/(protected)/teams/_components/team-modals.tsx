// src/app/(protected)/teams/_components/team-modals.tsx
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Shield, X, Trash2, Settings, Info, Check, Swords, MapPin, CalendarDays, PlusCircle, Tag, UserCircle, Building2 } from "lucide-react";
import { RiTeamFill } from "react-icons/ri";
import { ROLES } from "@/lib/roles";
import { Organization, Team, Opponent } from "../types";
import { cn } from "@/lib/utils";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 1. 新規作成モーダル（洗練されたクリーンデザイン！）
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
interface CreateModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    view: 'orgs' | 'teams';
    isCreating: boolean;
    isExternalOrgCreate?: boolean;
    defaultCategory?: string;
    onSubmitOrg: (name: string, category: string) => Promise<void>;
    onSubmitTeam: (name: string, role: string) => Promise<void>;
}

export function CreateModal({ isOpen, onOpenChange, view, isCreating, isExternalOrgCreate, defaultCategory, onSubmitOrg, onSubmitTeam }: CreateModalProps) {
    const [orgName, setOrgName] = useState("");
    const [orgCategory, setOrgCategory] = useState("other");
    const [teamName, setTeamName] = useState("");
    const [teamRole, setTeamRole] = useState<string>(ROLES.SCORER);

    useEffect(() => {
        if (isOpen) {
            setOrgName("");
            setOrgCategory(defaultCategory || "other");
            setTeamName("");
            setTeamRole(ROLES.SCORER);
        }
    }, [isOpen, defaultCategory]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (view === 'orgs') await onSubmitOrg(orgName, orgCategory);
        else await onSubmitTeam(teamName, teamRole);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="absolute inset-0" onClick={() => !isCreating && onOpenChange(false)} />

            {/* 💡 緑ベタ塗りをやめ、クリーンなbg-card（白/黒）＋プライマリーの光彩（blur）に変更！ */}
            <div className="relative w-full max-w-lg bg-card/95 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] rounded-[32px] sm:rounded-[36px] overflow-hidden animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-8 duration-500 border border-border/50 flex flex-col max-h-[90vh]">

                {/* 💡 さりげないプライマリーカラーの光彩エフェクト */}
                <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/10 blur-[100px] rounded-full pointer-events-none" />
                <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-primary/10 blur-[100px] rounded-full pointer-events-none" />

                <div className="mx-auto mt-4 h-1.5 w-16 rounded-full bg-border/50 sm:hidden" />

                <div className="relative z-10 text-left px-6 sm:px-8 pt-6 pb-4 flex items-center justify-between border-b border-border/50 bg-background/50">
                    <h2 className="text-xl sm:text-2xl font-black flex items-center gap-3 tracking-tight drop-shadow-sm text-foreground">
                        <div className="relative p-2.5 bg-primary/10 rounded-2xl shadow-sm border border-primary/20 text-primary">
                            {view === 'orgs' ? (isExternalOrgCreate ? <Swords className="h-6 w-6 relative z-10" /> : <RiTeamFill className="h-6 w-6 relative z-10" />) : <Shield className="h-6 w-6 relative z-10" />}
                        </div>
                        {view === 'orgs' ? (isExternalOrgCreate ? "対戦相手を新しく追加" : "クラブを新しく作る") : "チームを新しく追加"}
                    </h2>
                    <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="h-10 w-10 rounded-full hover:bg-muted text-muted-foreground transition-all"><X className="h-5 w-5" /></Button>
                </div>

                <div className="relative z-10 px-6 sm:px-8 py-6 space-y-6 overflow-y-auto">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {view === 'orgs' ? (
                            <>
                                <div className="space-y-3">
                                    {/* 💡 ラベルを text-base font-black に大きくし、アイコンを付けて視認性アップ */}
                                    <label className="text-base font-black text-foreground/90 tracking-tight pl-1 flex items-center gap-2">
                                        <Building2 className="h-4 w-4 text-primary/70" />
                                        {isExternalOrgCreate ? "対戦相手のクラブ名" : "クラブ（組織）名"}
                                    </label>
                                    <input
                                        type="text" required
                                        placeholder={isExternalOrgCreate ? "例: 世田谷西シニア" : "例: 川崎中央シニア"}
                                        className="flex h-14 w-full rounded-[18px] border border-border/50 bg-background px-5 text-base font-bold shadow-sm placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 transition-all text-foreground"
                                        value={orgName} onChange={(e) => setOrgName(e.target.value)} disabled={isCreating} autoFocus
                                    />
                                </div>

                                <div className="space-y-3">
                                    {/* 💡 ラベルを大きく */}
                                    <label className="text-base font-black text-foreground/90 tracking-tight pl-1 flex items-center gap-2">
                                        <Tag className="h-4 w-4 text-primary/70" />
                                        カテゴリ
                                    </label>
                                    <select
                                        className="flex h-14 w-full appearance-none rounded-[18px] border border-border/50 bg-background px-5 pr-10 text-base font-bold text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 transition-all cursor-pointer bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke-width%3D%222.5%22%20stroke%3D%22%2371717a%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20d%3D%22M19%209l-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] bg-[length:18px_18px] bg-[position:right_18px_center] bg-no-repeat"
                                        value={orgCategory} onChange={(e) => setOrgCategory(e.target.value)} disabled={isCreating}
                                    >
                                        <option value="gakudo" className="text-foreground">🧢 学童野球（少年野球）</option>
                                        <option value="junior" className="text-foreground">⚾️ 中学野球（シニア/ボーイズ等）</option>
                                        <option value="high" className="text-foreground">🏫 高校野球</option>
                                        <option value="adult" className="text-foreground">🍺 一般・草野球</option>
                                        <option value="other" className="text-foreground">📝 その他</option>
                                    </select>
                                    {isExternalOrgCreate && (
                                        <p className="text-xs font-bold text-muted-foreground pl-1 mt-2 flex items-center gap-1.5">
                                            <Info className="h-3.5 w-3.5 text-primary" /> 作成後、相手のチーム（1軍など）を追加してください。
                                        </p>
                                    )}
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="space-y-3">
                                    <label className="text-base font-black text-foreground/90 tracking-tight pl-1 flex items-center gap-2">
                                        <Shield className="h-4 w-4 text-primary/70" />
                                        チーム名
                                    </label>
                                    <input type="text" required placeholder="例: 1軍 / ジュニア" className="flex h-14 w-full rounded-[18px] border border-border/50 bg-background px-5 text-base font-bold shadow-sm placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 transition-all text-foreground" value={teamName} onChange={(e) => setTeamName(e.target.value)} disabled={isCreating} autoFocus />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-base font-black text-foreground/90 tracking-tight pl-1 flex items-center gap-2">
                                        <UserCircle className="h-4 w-4 text-primary/70" />
                                        あなたの役割（ロール）
                                    </label>
                                    <select className="flex h-14 w-full appearance-none rounded-[18px] border border-border/50 bg-background px-5 pr-10 text-base font-bold text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 transition-all cursor-pointer bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke-width%3D%222.5%22%20stroke%3D%22%2371717a%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20d%3D%22M19%209l-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] bg-[length:18px_18px] bg-[position:right_18px_center] bg-no-repeat" value={teamRole} onChange={(e) => setTeamRole(e.target.value)} disabled={isCreating}>
                                        <option value={ROLES.MANAGER} className="text-foreground">監督 / 代表 (Manager)</option>
                                        <option value={ROLES.COACH} className="text-foreground">コーチ (Coach)</option>
                                        <option value={ROLES.SCORER} className="text-foreground">スコアラー (Scorer)</option>
                                        <option value={ROLES.STAFF} className="text-foreground">スタッフ (Staff)</option>
                                    </select>
                                </div>
                            </>
                        )}
                        <div className="pt-4 pb-2">
                            <Button type="submit" disabled={isCreating} className="w-full h-14 rounded-[20px] font-black text-base bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all hover:-translate-y-1 active:scale-[0.98]">
                                {isCreating ? <Loader2 className="h-6 w-6 animate-spin mx-auto" /> : (view === 'orgs' ? (isExternalOrgCreate ? "対戦相手を追加する" : "クラブを作成する") : "チームを追加する")}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 2. 詳細・設定モーダル（デザイン統一）
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
interface DetailModalProps {
    isOpen: boolean;
    type?: 'org' | 'team';
    data?: Organization | Team;
    selectedOrgRole?: string;
    isUpdating: boolean;
    onClose: () => void;
    onUpdate: (newName: string, newCategory?: string) => Promise<void>;
    onDelete: () => Promise<void>;
}

export function DetailModal({ isOpen, type, data, selectedOrgRole, isUpdating, onClose, onUpdate, onDelete }: DetailModalProps) {
    const [editName, setEditName] = useState("");
    const [editCategory, setEditCategory] = useState("other");

    useEffect(() => {
        if (data) {
            setEditName(data.name);
            if (type === 'org') {
                setEditCategory((data as Organization).category || "other");
            }
        }
    }, [data, type]);

    if (!isOpen || !data || !type) return null;

    const myRole = type === 'org' ? (data as Organization).myRole : selectedOrgRole;
    const canEdit = myRole === 'OWNER' || myRole === 'OPPONENT_MANAGER';

    const hasChanges = editName.trim() !== "" && (
        editName !== data.name || (type === 'org' && editCategory !== (data as Organization).category)
    );

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="absolute inset-0" onClick={() => !isUpdating && onClose()} />

            <div className="relative w-full max-w-lg bg-card/95 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] rounded-[32px] sm:rounded-[36px] overflow-hidden animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-8 duration-500 border border-border/50 flex flex-col max-h-[90vh]">
                <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/10 blur-[100px] rounded-full pointer-events-none" />
                <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-primary/10 blur-[100px] rounded-full pointer-events-none" />

                <div className="mx-auto mt-4 h-1.5 w-16 rounded-full bg-border/50 sm:hidden" />

                <div className="relative z-10 flex items-center justify-between p-6 sm:p-8 pb-4 border-b border-border/50 bg-background/50 shrink-0">
                    <h2 className="text-xl sm:text-2xl font-black flex items-center gap-3 text-foreground tracking-tight drop-shadow-sm">
                        <div className="p-2.5 bg-primary/10 rounded-2xl shadow-sm border border-primary/20 text-primary">
                            {type === 'org' ? ((data as Organization).myRole === 'OPPONENT_MANAGER' ? <Swords className="h-5 w-5" /> : <RiTeamFill className="h-5 w-5" />) : <Shield className="h-5 w-5" />}
                        </div>
                        {type === 'org' ? ((data as Organization).myRole === 'OPPONENT_MANAGER' ? "対戦相手 詳細情報" : "クラブ詳細情報") : "チーム詳細情報"}
                    </h2>
                    <Button variant="ghost" size="icon" onClick={onClose} className="h-10 w-10 rounded-full hover:bg-muted text-muted-foreground transition-all"><X className="h-5 w-5" /></Button>
                </div>

                <div className="relative z-10 p-6 sm:p-8 space-y-6 overflow-y-auto">
                    <div className="space-y-4">
                        <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-[20px] border border-border/50 shadow-sm">
                            <div className="h-14 w-14 shrink-0 rounded-full bg-background border border-border flex items-center justify-center text-primary shadow-sm">
                                {type === 'org' ? ((data as Organization).myRole === 'OPPONENT_MANAGER' ? <Swords className="h-7 w-7" /> : <RiTeamFill className="h-7 w-7" />) : <Shield className="h-7 w-7" />}
                            </div>
                            <div className="overflow-hidden">
                                <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-0.5">登録名</div>
                                <div className="text-lg sm:text-xl font-black truncate">{data.name}</div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-muted/50 rounded-[20px] border border-border/50 shadow-sm">
                                <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">ID</div>
                                <div className="text-xs font-mono font-bold text-foreground/80 truncate">{data.id.split('-')[0]}...</div>
                            </div>
                            <div className="p-4 bg-muted/50 rounded-[20px] border border-border/50 shadow-sm">
                                <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">権限・ロール</div>
                                <div className="text-xs font-black text-primary truncate">{myRole === 'OPPONENT_MANAGER' ? '対戦相手' : (myRole === 'OWNER' ? '代表' : myRole)}</div>
                            </div>
                        </div>
                    </div>

                    {canEdit ? (
                        <>
                            <div className="h-px w-full bg-border/50 my-2" />
                            <div className="space-y-4">
                                <label className="text-base font-black text-foreground/90 flex items-center gap-2">
                                    <Settings className="h-4 w-4 text-primary/70" /> 情報の編集
                                </label>

                                <div className="space-y-3">
                                    <input
                                        type="text"
                                        placeholder="クラブ・チーム名"
                                        className="flex h-12 w-full rounded-[16px] border border-border/50 bg-background px-4 text-base font-bold shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 transition-all text-foreground"
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        disabled={isUpdating}
                                    />

                                    {type === 'org' && (
                                        <select
                                            className="flex h-12 w-full appearance-none rounded-[16px] border border-border/50 bg-background px-4 pr-10 text-base font-bold text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 transition-all cursor-pointer bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke-width%3D%222.5%22%20stroke%3D%22%2371717a%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20d%3D%22M19%209l-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] bg-[length:18px_18px] bg-[position:right_16px_center] bg-no-repeat"
                                            value={editCategory} onChange={(e) => setEditCategory(e.target.value)} disabled={isUpdating}
                                        >
                                            <option value="gakudo" className="text-foreground">🧢 学童野球（少年野球）</option>
                                            <option value="junior" className="text-foreground">⚾️ 中学野球（シニア/ボーイズ等）</option>
                                            <option value="high" className="text-foreground">🏫 高校野球</option>
                                            <option value="adult" className="text-foreground">🍺 一般・草野球</option>
                                            <option value="other" className="text-foreground">📝 その他</option>
                                        </select>
                                    )}

                                    <Button
                                        onClick={() => onUpdate(editName, type === 'org' ? editCategory : undefined)}
                                        disabled={isUpdating || !hasChanges}
                                        className="h-12 w-full rounded-[16px] font-black mt-2"
                                    >
                                        {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Check className="h-4 w-4 mr-2" /> 更新を保存する</>}
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
                            <p className="text-xs font-bold text-primary/70">設定を変更するには権限が必要です。</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 3. 対戦相手詳細モーダル（デザイン統一）
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
interface OpponentDetailModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    opponent: Opponent | null;
}

export function OpponentDetailModal({ isOpen, onOpenChange, opponent }: OpponentDetailModalProps) {
    if (!opponent || !isOpen) return null;

    const getResultColor = (result: string) => {
        if (result === 'win') return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
        if (result === 'loss') return 'text-red-500 bg-red-500/10 border-red-500/20';
        return 'text-zinc-500 bg-zinc-500/10 border-zinc-500/20';
    };

    const getResultText = (result: string) => {
        if (result === 'win') return '勝利';
        if (result === 'loss') return '敗北';
        return '引分';
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="absolute inset-0" onClick={() => onOpenChange(false)} />

            <div className="relative w-full max-w-lg bg-card/95 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] rounded-[32px] sm:rounded-[36px] overflow-hidden animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-8 duration-500 border border-border/50 flex flex-col max-h-[90vh]">

                <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/10 blur-[100px] rounded-full pointer-events-none" />
                <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-primary/10 blur-[100px] rounded-full pointer-events-none" />
                <div className="mx-auto mt-4 h-1.5 w-16 rounded-full bg-border/50 sm:hidden" />

                <div className="relative z-10 text-left px-6 sm:px-8 pt-6 pb-4 flex items-start justify-between border-b border-border/50 shrink-0 bg-background/50">
                    <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black text-2xl border border-primary/20 shrink-0 shadow-sm">
                            {opponent.name.charAt(0)}
                        </div>
                        <div>
                            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-foreground drop-shadow-sm mb-1">
                                {opponent.name}
                            </h2>
                            <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                                <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> 神奈川県</span>
                                <span>•</span>
                                <span>ID: {opponent.id.split('-')[0]}</span>
                            </div>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="h-10 w-10 rounded-full hover:bg-muted text-muted-foreground transition-all shrink-0"><X className="h-5 w-5" /></Button>
                </div>

                <div className="relative z-10 px-6 sm:px-8 py-6 space-y-8 overflow-y-auto flex-1">
                    <div>
                        <h3 className="text-sm font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2 mb-3">
                            <Swords className="h-4 w-4 text-primary/70" /> 通算対戦成績
                        </h3>
                        <div className="grid grid-cols-3 gap-3">
                            <div className="bg-blue-500/5 border border-blue-500/10 rounded-[20px] p-4 flex flex-col items-center justify-center text-center shadow-sm">
                                <span className="text-[10px] font-black text-blue-500/70 uppercase tracking-widest">Wins</span>
                                <span className="text-2xl font-black text-blue-500">{opponent.wins} <span className="text-sm">勝</span></span>
                            </div>
                            <div className="bg-red-500/5 border border-red-500/10 rounded-[20px] p-4 flex flex-col items-center justify-center text-center shadow-sm">
                                <span className="text-[10px] font-black text-red-500/70 uppercase tracking-widest">Losses</span>
                                <span className="text-2xl font-black text-red-500">{opponent.losses} <span className="text-sm">敗</span></span>
                            </div>
                            <div className="bg-zinc-500/5 border border-zinc-500/10 rounded-[20px] p-4 flex flex-col items-center justify-center text-center shadow-sm">
                                <span className="text-[10px] font-black text-zinc-500/70 uppercase tracking-widest">Draws</span>
                                <span className="text-2xl font-black text-zinc-500">{opponent.draws} <span className="text-sm">分</span></span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2 mb-3">
                            <CalendarDays className="h-4 w-4 text-primary/70" /> 直近の対戦履歴
                        </h3>
                        <div className="space-y-3">
                            {opponent.recentMatches.map((match) => (
                                <div key={match.id} className="bg-muted/30 border border-border/50 rounded-[20px] p-4 hover:bg-muted/50 transition-colors cursor-pointer shadow-sm">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-[10px] font-black text-muted-foreground tracking-widest bg-background px-2 py-0.5 rounded-full border border-border/50">{match.date}</span>
                                        <span className={cn("text-[10px] font-black px-2 py-0.5 rounded-full border uppercase tracking-widest", getResultColor(match.result))}>
                                            {getResultText(match.result)}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between mt-3">
                                        <div className="flex flex-col flex-1">
                                            <span className="text-xs font-bold text-muted-foreground">自チーム</span>
                                            <span className="font-black text-foreground">{match.myTeamName}</span>
                                        </div>
                                        <div className="px-4 text-2xl font-black font-mono tracking-tighter">
                                            {match.myScore} - {match.opponentScore}
                                        </div>
                                        <div className="flex flex-col flex-1 text-right">
                                            <span className="text-xs font-bold text-muted-foreground">相手チーム</span>
                                            <span className="font-black text-foreground">{match.opponentTeamName}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="relative z-10 px-6 sm:px-8 py-4 border-t border-border/50 bg-background/50 shrink-0">
                    <Button className="w-full h-14 rounded-[20px] font-black text-base bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all active:scale-[0.98]">
                        <PlusCircle className="mr-2 h-5 w-5" /> このクラブとの新しい試合を記録
                    </Button>
                </div>
            </div>
        </div>
    );
}