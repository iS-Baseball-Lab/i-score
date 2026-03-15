// src/app/(protected)/teams/_components/team-modals.tsx
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, X, Trash2, Settings, Info, Check, Calendar, Layers, UserCircle } from "lucide-react";
import { RiTeamFill } from "react-icons/ri"; // 💡 ShieldからRiTeamFillに変更！
import { ROLES } from "@/lib/roles";
import { Team } from "../types";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 1. 編成新規作成モーダル
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
interface CreateTeamModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    isCreating: boolean;
    onSubmit: (name: string, role: string, year: number, tier: string) => Promise<void>;
}

export function CreateTeamModal({ isOpen, onOpenChange, isCreating, onSubmit }: CreateTeamModalProps) {
    const [name, setName] = useState("");
    const [role, setRole] = useState<string>(ROLES.SCORER);
    const [year, setYear] = useState<number>(new Date().getFullYear());
    const [tier, setTier] = useState<string>("");

    useEffect(() => {
        if (isOpen) {
            setName(""); setRole(ROLES.SCORER); setYear(new Date().getFullYear()); setTier("");
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="absolute inset-0" onClick={() => !isCreating && onOpenChange(false)} />
            <div className="relative w-full max-w-lg bg-card/95 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] rounded-[32px] sm:rounded-[36px] overflow-hidden animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-8 duration-500 border border-border/50 flex flex-col max-h-[90vh]">
                <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/10 blur-[100px] rounded-full pointer-events-none" />
                <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-primary/10 blur-[100px] rounded-full pointer-events-none" />
                <div className="mx-auto mt-4 h-1.5 w-16 rounded-full bg-border/50 sm:hidden" />

                <div className="relative z-10 text-left px-6 sm:px-8 pt-6 pb-4 flex items-center justify-between border-b border-border/50 bg-background/50">
                    <h2 className="text-xl sm:text-2xl font-black flex items-center gap-3 text-foreground drop-shadow-sm"><div className="p-2.5 bg-primary/10 rounded-2xl shadow-sm border border-primary/20 text-primary"><RiTeamFill className="h-6 w-6" /></div>編成を追加</h2>
                    <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="h-10 w-10 rounded-full hover:bg-muted text-muted-foreground"><X className="h-5 w-5" /></Button>
                </div>

                <div className="relative z-10 px-6 sm:px-8 py-6 space-y-6 overflow-y-auto">
                    <form onSubmit={(e) => { e.preventDefault(); onSubmit(name, role, year, tier); }} className="space-y-6">
                        <div className="space-y-3">
                            <label className="text-base font-black text-foreground/90 pl-1 flex items-center gap-2"><RiTeamFill className="h-4 w-4 text-primary/70" />編成名</label>
                            <input type="text" required placeholder="例: 1軍 / ジュニア" className="flex h-14 w-full rounded-[18px] border border-border/50 bg-background px-5 text-base font-bold shadow-sm focus-visible:ring-2 focus-visible:ring-primary/50 transition-all text-foreground" value={name} onChange={(e) => setName(e.target.value)} disabled={isCreating} autoFocus />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-3">
                                <label className="text-base font-black text-foreground/90 pl-1 flex items-center gap-2"><Calendar className="h-4 w-4 text-primary/70" />年度</label>
                                <input type="number" required className="flex h-14 w-full rounded-[18px] border border-border/50 bg-background px-5 text-base font-bold shadow-sm focus-visible:ring-2 focus-visible:ring-primary/50 transition-all text-foreground" value={year} onChange={(e) => setYear(Number(e.target.value))} disabled={isCreating} />
                            </div>
                            <div className="space-y-3">
                                <label className="text-base font-black text-foreground/90 pl-1 flex items-center gap-2"><Layers className="h-4 w-4 text-primary/70" />階層 (Tier)</label>
                                <input type="text" placeholder="例: 1軍, A" className="flex h-14 w-full rounded-[18px] border border-border/50 bg-background px-5 text-base font-bold shadow-sm focus-visible:ring-2 focus-visible:ring-primary/50 transition-all text-foreground" value={tier} onChange={(e) => setTier(e.target.value)} disabled={isCreating} />
                            </div>
                        </div>
                        <div className="space-y-3">
                            <label className="text-base font-black text-foreground/90 pl-1 flex items-center gap-2"><UserCircle className="h-4 w-4 text-primary/70" />あなたの役割（ロール）</label>
                            <select className="flex h-14 w-full appearance-none rounded-[18px] border border-border/50 bg-background px-5 pr-10 text-base font-bold text-foreground shadow-sm focus-visible:ring-2 focus-visible:ring-primary/50 transition-all cursor-pointer bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke-width%3D%222.5%22%20stroke%3D%22%2371717a%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20d%3D%22M19%209l-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] bg-[length:18px_18px] bg-[position:right_18px_center] bg-no-repeat" value={role} onChange={(e) => setRole(e.target.value)} disabled={isCreating}>
                                <option value={ROLES.MANAGER}>監督 / 代表</option>
                                <option value={ROLES.COACH}>コーチ</option>
                                <option value={ROLES.SCORER}>スコアラー</option>
                                <option value={ROLES.STAFF}>スタッフ</option>
                            </select>
                        </div>
                        <div className="pt-2">
                            <Button type="submit" disabled={isCreating} className="w-full h-14 rounded-[20px] font-black text-base bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20">
                                {isCreating ? <Loader2 className="h-6 w-6 animate-spin mx-auto" /> : "追加する"}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 2. 編成詳細・設定モーダル
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
interface TeamDetailModalProps {
    isOpen: boolean;
    data?: Team;
    selectedOrgRole?: string;
    isUpdating: boolean;
    onClose: () => void;
    onUpdate: (newName: string) => Promise<void>;
    onDelete: () => Promise<void>;
}

export function TeamDetailModal({ isOpen, data, selectedOrgRole, isUpdating, onClose, onUpdate, onDelete }: TeamDetailModalProps) {
    const [editName, setEditName] = useState("");

    useEffect(() => {
        if (data) setEditName(data.name);
    }, [data]);

    if (!isOpen || !data) return null;

    const canEdit = selectedOrgRole === 'OWNER';
    const hasChanges = editName.trim() !== "" && editName !== data.name;

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
                            <RiTeamFill className="h-5 w-5" /> {/* 💡 アイコン変更 */}
                        </div>
                        編成詳細情報
                    </h2>
                    <Button variant="ghost" size="icon" onClick={onClose} className="h-10 w-10 rounded-full hover:bg-muted text-muted-foreground transition-all"><X className="h-5 w-5" /></Button>
                </div>

                <div className="relative z-10 p-6 sm:p-8 space-y-6 overflow-y-auto">
                    <div className="space-y-4">
                        <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-[20px] border border-border/50 shadow-sm">
                            <div className="h-14 w-14 shrink-0 rounded-full bg-background border border-border flex items-center justify-center text-primary shadow-sm">
                                <RiTeamFill className="h-7 w-7" /> {/* 💡 アイコン変更 */}
                            </div>
                            <div className="overflow-hidden">
                                <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-0.5">編成名</div>
                                <div className="text-lg sm:text-xl font-black truncate">{data.name}</div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-muted/50 rounded-[20px] border border-border/50 shadow-sm">
                                <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">年度 / 階層</div>
                                <div className="flex flex-col gap-1 mt-1">
                                    {data.year && <span className="inline-flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-black bg-primary/10 text-primary border border-primary/20"><Calendar className="h-3 w-3" />{data.year}</span>}
                                    {data.tier && <span className="inline-flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-black bg-blue-500/10 text-blue-500 border border-blue-500/20"><Layers className="h-3 w-3" />{data.tier}</span>}
                                </div>
                            </div>
                            <div className="p-4 bg-muted/50 rounded-[20px] border border-border/50 shadow-sm">
                                <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">ID</div>
                                <div className="text-xs font-mono font-bold text-foreground/80 truncate mt-2">{data.id.split('-')[0]}...</div>
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
                                    <input type="text" placeholder="編成名" className="flex h-12 w-full rounded-[16px] border border-border/50 bg-background px-4 text-base font-bold shadow-sm focus-visible:ring-2 focus-visible:ring-primary/50 transition-all text-foreground" value={editName} onChange={(e) => setEditName(e.target.value)} disabled={isUpdating} />
                                    <Button onClick={() => onUpdate(editName)} disabled={isUpdating || !hasChanges} className="h-12 w-full rounded-[16px] font-black mt-2">
                                        {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Check className="h-4 w-4 mr-2" /> 更新を保存する</>}
                                    </Button>
                                </div>
                            </div>
                            <div className="pt-2">
                                <Button variant="outline" onClick={onDelete} disabled={isUpdating} className="w-full h-12 rounded-[16px] font-extrabold border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all">
                                    <Trash2 className="h-4 w-4 mr-2" /> この編成を完全に削除
                                </Button>
                            </div>
                        </>
                    ) : (
                        <div className="mt-4 p-4 bg-primary/5 rounded-[16px] border border-primary/10 text-center">
                            <p className="text-xs font-bold text-primary/70">設定を変更するにはチームの代表者権限が必要です。</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}