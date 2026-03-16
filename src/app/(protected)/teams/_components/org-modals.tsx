// src/app/(protected)/teams/_components/org-modals.tsx
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, X, Trash2, Settings, Info, Check, Swords, MapPin, CalendarDays, PlusCircle, Tag, Building2 } from "lucide-react";
import { RiTeamFill } from "react-icons/ri";
import { Organization, Opponent } from "../types";
import { cn } from "@/lib/utils";

interface CreateOrgModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    isCreating: boolean;
    isExternalOrgCreate?: boolean;
    defaultCategory?: string;
    onSubmit: (name: string, category: string) => Promise<void>;
}

export function CreateOrgModal({ isOpen, onOpenChange, isCreating, isExternalOrgCreate, defaultCategory, onSubmit }: CreateOrgModalProps) {
    const [name, setName] = useState("");
    const [category, setCategory] = useState("other");

    useEffect(() => {
        if (isOpen) {
            setName("");
            setCategory(defaultCategory || "other");
        }
    }, [isOpen, defaultCategory]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="absolute inset-0" onClick={() => !isCreating && onOpenChange(false)} />
            <div className="relative w-full max-w-lg bg-card/95 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] rounded-[32px] sm:rounded-[36px] overflow-hidden animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-8 duration-500 border border-border/50 flex flex-col max-h-[90vh]">
                <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/10 blur-[100px] rounded-full pointer-events-none" />
                <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-primary/10 blur-[100px] rounded-full pointer-events-none" />

                <div className="relative z-10 text-left px-6 sm:px-8 pt-6 pb-4 flex items-center justify-between border-b border-border/50 bg-background/50">
                    <h2 className="text-xl sm:text-2xl font-black flex items-center gap-3 tracking-tight drop-shadow-sm text-foreground">
                        <div className="p-2.5 bg-primary/10 rounded-2xl shadow-sm border border-primary/20 text-primary">
                            {isExternalOrgCreate ? <Swords className="h-6 w-6" /> : <RiTeamFill className="h-6 w-6" />}
                        </div>
                        {isExternalOrgCreate ? "対戦相手を追加" : "チームを作る"}
                    </h2>
                    <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="h-10 w-10 rounded-full hover:bg-muted text-muted-foreground"><X className="h-5 w-5" /></Button>
                </div>

                <div className="relative z-10 px-6 sm:px-8 py-6 space-y-6 overflow-y-auto">
                    <form onSubmit={(e) => { e.preventDefault(); onSubmit(name, category); }} className="space-y-6">
                        <div className="space-y-3">
                            <label className="text-base font-black text-foreground/90 pl-1 flex items-center gap-2"><Building2 className="h-4 w-4 text-primary/70" />{isExternalOrgCreate ? "対戦相手のチーム名" : "チーム名"}</label>
                            <input type="text" required placeholder={isExternalOrgCreate ? "例: 世田谷西シニア" : "例: 川崎中央シニア"} className="flex h-14 w-full rounded-[18px] border border-border/50 bg-background px-5 text-base font-bold shadow-sm focus-visible:ring-2 focus-visible:ring-primary/50 transition-all text-foreground" value={name} onChange={(e) => setName(e.target.value)} disabled={isCreating} autoFocus />
                        </div>
                        <div className="space-y-3">
                            <label className="text-base font-black text-foreground/90 pl-1 flex items-center gap-2"><Tag className="h-4 w-4 text-primary/70" />カテゴリ</label>
                            <select className="flex h-14 w-full appearance-none rounded-[18px] border border-border/50 bg-background px-5 pr-10 text-base font-bold text-foreground shadow-sm focus-visible:ring-2 focus-visible:ring-primary/50 transition-all cursor-pointer bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke-width%3D%222.5%22%20stroke%3D%22%2371717a%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20d%3D%22M19%209l-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] bg-[length:18px_18px] bg-[position:right_16px_center] bg-no-repeat" value={category} onChange={(e) => setCategory(e.target.value)} disabled={isCreating}>
                                <option value="gakudo">🧢 学童野球（少年野球）</option>
                                <option value="junior">⚾️ 中学野球（シニア/ボーイズ等）</option>
                                <option value="high">🏫 高校野球</option>
                                <option value="adult">🍺 一般・草野球</option>
                                <option value="other">📝 その他</option>
                            </select>
                            {isExternalOrgCreate && (
                                <p className="text-xs font-bold text-muted-foreground pl-1 mt-2 flex items-center gap-1.5">
                                    <Info className="h-3.5 w-3.5 text-primary" /> 作成後、相手の編成（1軍など）を追加してください。
                                </p>
                            )}
                        </div>
                        <Button type="submit" disabled={isCreating} className="w-full h-14 rounded-[20px] font-black text-base bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20">
                            {isCreating ? <Loader2 className="h-6 w-6 animate-spin mx-auto" /> : "作成する"}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}

interface OrgDetailModalProps {
    isOpen: boolean;
    data?: Organization;
    isUpdating: boolean;
    onClose: () => void;
    onUpdate: (newName: string, newCategory?: string) => Promise<void>;
    onDelete: () => Promise<void>;
}

export function OrgDetailModal({ isOpen, data, isUpdating, onClose, onUpdate, onDelete }: OrgDetailModalProps) {
    const [editName, setEditName] = useState("");
    const [editCategory, setEditCategory] = useState("other");

    useEffect(() => {
        if (data) {
            setEditName(data.name);
            setEditCategory(data.category || "other");
        }
    }, [data]);

    if (!isOpen || !data) return null;

    const myRole = data.myRole;
    const canEdit = myRole === 'OWNER' || myRole === 'OPPONENT_MANAGER';
    const isOpponent = myRole === 'OPPONENT_MANAGER';

    const hasChanges = editName.trim() !== "" && (editName !== data.name || editCategory !== data.category);

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
                            {isOpponent ? <Swords className="h-5 w-5" /> : <RiTeamFill className="h-5 w-5" />}
                        </div>
                        {isOpponent ? "対戦相手 詳細情報" : "チーム詳細情報"}
                    </h2>
                    <Button variant="ghost" size="icon" onClick={onClose} className="h-10 w-10 rounded-full hover:bg-muted text-muted-foreground transition-all"><X className="h-5 w-5" /></Button>
                </div>

                <div className="relative z-10 p-6 sm:p-8 space-y-6 overflow-y-auto">
                    <div className="space-y-4">
                        <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-[20px] border border-border/50 shadow-sm">
                            <div className="h-14 w-14 shrink-0 rounded-full bg-background border border-border flex items-center justify-center text-primary shadow-sm">
                                {isOpponent ? <Swords className="h-7 w-7" /> : <RiTeamFill className="h-7 w-7" />}
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
                                    <input type="text" placeholder="チーム名" className="flex h-12 w-full rounded-[16px] border border-border/50 bg-background px-4 text-base font-bold shadow-sm focus-visible:ring-2 focus-visible:ring-primary/50 transition-all text-foreground" value={editName} onChange={(e) => setEditName(e.target.value)} disabled={isUpdating} />
                                    <select className="flex h-12 w-full appearance-none rounded-[16px] border border-border/50 bg-background px-4 pr-10 text-base font-bold text-foreground shadow-sm focus-visible:ring-2 focus-visible:ring-primary/50 transition-all cursor-pointer bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke-width%3D%222.5%22%20stroke%3D%22%2371717a%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20d%3D%22M19%209l-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] bg-[length:18px_18px] bg-[position:right_16px_center] bg-no-repeat" value={editCategory} onChange={(e) => setEditCategory(e.target.value)} disabled={isUpdating}>
                                        <option value="gakudo">🧢 学童野球（少年野球）</option>
                                        <option value="junior">⚾️ 中学野球（シニア/ボーイズ等）</option>
                                        <option value="high">🏫 高校野球</option>
                                        <option value="adult">🍺 一般・草野球</option>
                                        <option value="other">📝 その他</option>
                                    </select>
                                    <Button onClick={() => onUpdate(editName, editCategory)} disabled={isUpdating || !hasChanges} className="h-12 w-full rounded-[16px] font-black mt-2">
                                        {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Check className="h-4 w-4 mr-2" /> 更新を保存する</>}
                                    </Button>
                                </div>
                            </div>
                            <div className="pt-2">
                                <Button variant="outline" onClick={onDelete} disabled={isUpdating} className="w-full h-12 rounded-[16px] font-extrabold border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all">
                                    <Trash2 className="h-4 w-4 mr-2" /> このチームを完全に削除
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
