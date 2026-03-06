// src/app/(protected)/matches/lineup/page.tsx
"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { PageHeader } from "@/components/PageHeader";
import { Save, Users, Loader2, Download, BookmarkPlus, Trash2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner"; // 💡 美しい通知のために追加

const POSITIONS = [
    { value: "1", label: "1 (投)" }, { value: "2", label: "2 (捕)" },
    { value: "3", label: "3 (一)" }, { value: "4", label: "4 (二)" },
    { value: "5", label: "5 (三)" }, { value: "6", label: "6 (遊)" },
    { value: "7", label: "7 (左)" }, { value: "8", label: "8 (中)" },
    { value: "9", label: "9 (右)" }, { value: "DH", label: "DH (指)" },
];

interface Player { id: string; name: string; uniformNumber: string; }
interface LineupEntry { battingOrder: number; playerId: string; position: string; }
interface Template { id: string; name: string; lineupData: string; }

function LineupContent() {
    const searchParams = useSearchParams();
    const matchId = searchParams.get("id");
    const teamId = searchParams.get("teamId") || (typeof window !== 'undefined' ? localStorage.getItem("iScore_selectedTeamId") : null);
    const router = useRouter();

    const [players, setPlayers] = useState<Player[]>([]);
    const [lineup, setLineup] = useState<LineupEntry[]>(
        Array.from({ length: 9 }, (_, i) => ({ battingOrder: i + 1, playerId: "", position: "" }))
    );
    const [isSaving, setIsSaving] = useState(false);

    const [templates, setTemplates] = useState<Template[]>([]);
    const [selectedTemplate, setSelectedTemplate] = useState("");
    const [templateName, setTemplateName] = useState("");
    const [isSavingTemplate, setIsSavingTemplate] = useState(false);

    useEffect(() => {
        if (!matchId || !teamId) return;
        const fetchPlayers = async () => {
            try {
                const res = await fetch(`/api/teams/${teamId}/players`);
                if (res.ok) setPlayers(await res.json());
            } catch (error) { console.error(error); }
        };
        const fetchLineup = async () => {
            try {
                const res = await fetch(`/api/matches/${matchId}/lineup`);
                if (res.ok) {
                    const data = (await res.json()) as any[];
                    if (data.length > 0) {
                        const formatted = data.map(d => ({ battingOrder: d.batting_order, playerId: d.player_id, position: d.position }));
                        setLineup(prev => prev.map(p => formatted.find(f => f.battingOrder === p.battingOrder) || p));
                    }
                }
            } catch (error) { console.error(error); }
        };
        const fetchTemplates = async () => {
            try {
                const res = await fetch(`/api/teams/${teamId}/lineup-templates`);
                if (res.ok) setTemplates(await res.json());
            } catch (error) { console.error(error); }
        };

        fetchPlayers();
        fetchLineup();
        fetchTemplates();
    }, [matchId, teamId]);

    const handleLineupChange = (order: number, field: 'playerId' | 'position', value: string) => {
        setLineup(prev => prev.map(entry => entry.battingOrder === order ? { ...entry, [field]: value } : entry));
    };

    const handleApplyTemplate = (templateId: string) => {
        setSelectedTemplate(templateId);
        if (!templateId) return;
        const tmpl = templates.find(t => t.id === templateId);
        if (tmpl) {
            const parsed = JSON.parse(tmpl.lineupData) as LineupEntry[];
            setLineup(prev => prev.map(p => parsed.find(f => f.battingOrder === p.battingOrder) || p));
            toast.success(`パターン「${tmpl.name}」を適用しました！`); // 💡 通知を追加
        }
    };

    const handleSaveTemplate = async () => {
        if (!teamId || !templateName.trim()) return;
        setIsSavingTemplate(true);
        try {
            const validLineup = lineup.filter(entry => entry.playerId !== "");
            if (validLineup.length === 0) {
                toast.error("選手が1人も入力されていません");
                return;
            }

            const res = await fetch(`/api/teams/${teamId}/lineup-templates`, {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: templateName, lineupData: validLineup }),
            });
            if (res.ok) {
                setTemplateName("");
                const refresh = await fetch(`/api/teams/${teamId}/lineup-templates`);
                if (refresh.ok) setTemplates(await refresh.json());
                toast.success("新しいパターンを保存しました！"); // 💡 通知を追加
            }
        } catch (error) { console.error(error); }
        finally { setIsSavingTemplate(false); }
    };

    const handleDeleteTemplate = async (templateId: string) => {
        if (!confirm("このパターンを削除しますか？")) return;
        try {
            await fetch(`/api/teams/${teamId}/lineup-templates/${templateId}`, { method: 'DELETE' });
            setTemplates(prev => prev.filter(t => t.id !== templateId));
            if (selectedTemplate === templateId) setSelectedTemplate("");
            toast.success("パターンを削除しました"); // 💡 通知を追加
        } catch (error) { console.error(error); }
    };

    const handleSave = async () => {
        if (!matchId) return;
        const validLineup = lineup.filter(entry => entry.playerId !== "");
        if (validLineup.length === 0) {
            toast.error("スタメンが入力されていません");
            return;
        }

        setIsSaving(true);
        try {
            const res = await fetch(`/api/matches/${matchId}/lineup`, {
                method: "PUT", headers: { "Content-Type": "application/json" },
                body: JSON.stringify(validLineup),
            });
            if (res.ok) {
                toast.success("スタメンを登録しました！");
                router.push(`/matches/score?id=${matchId}`);
            }
        } catch (error) { console.error(error); }
        finally { setIsSaving(false); }
    };

    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground pb-32 relative">
            <PageHeader href="/dashboard" icon={Users} title="スターティングメンバー" subtitle="打順と守備位置の登録をしてください。" />

            <main className="flex-1 p-4 max-w-2xl mx-auto w-full mt-4">
                
                {/* 💡 パターン呼び出しエリア */}
                {templates.length > 0 && (
                    <div className="bg-muted/30 border border-border/50 rounded-2xl p-4 mb-6 shadow-sm animate-in slide-in-from-top-4 fade-in duration-500">
                        <label className="text-xs font-extrabold text-muted-foreground flex items-center gap-1.5 mb-3 uppercase tracking-wider">
                            <Download className="h-4 w-4 text-primary" /> パターンを呼び出す
                        </label>
                        <div className="flex gap-2">
                            <Select value={selectedTemplate} onChange={(e) => handleApplyTemplate(e.target.value)} className="flex-1 h-12 bg-background font-bold shadow-sm rounded-xl border-border/50 focus:border-primary">
                                <option value="">選択してください...</option>
                                {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </Select>
                            {selectedTemplate && (
                                <Button variant="outline" size="icon" onClick={() => handleDeleteTemplate(selectedTemplate)} className="h-12 w-12 rounded-xl text-red-500 hover:text-red-600 hover:bg-red-50 shrink-0 border-border/50">
                                    <Trash2 className="h-5 w-5" />
                                </Button>
                            )}
                        </div>
                    </div>
                )}

                <div className="space-y-3 relative z-10">
                    {lineup.map((entry, index) => (
                        // 💡 カスケード・アニメーション（順番にフワッと表示）
                        <div 
                            key={entry.battingOrder} 
                            className="flex items-center gap-3 bg-card border border-border/60 shadow-sm hover:shadow-md transition-shadow rounded-2xl p-2.5 sm:p-3 animate-in slide-in-from-bottom-8 fade-in duration-500 fill-mode-both"
                            style={{ animationDelay: `${index * 60}ms` }}
                        >
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 shadow-inner">
                                <span className="text-lg sm:text-xl font-black text-primary">{entry.battingOrder}</span>
                            </div>
                            <div className="flex-1 grid grid-cols-5 gap-2">
                                <div className="col-span-3">
                                    <Select value={entry.playerId} onChange={(e) => handleLineupChange(entry.battingOrder, 'playerId', e.target.value)} className="h-10 sm:h-12 rounded-xl bg-muted/30 font-bold border-transparent focus:border-primary focus:bg-background transition-colors w-full px-3 text-sm sm:text-base">
                                        <option value="" disabled hidden>選手を選択...</option>
                                        {players.map(p => <option key={p.id} value={p.id} className="bg-background font-medium">背番号{p.uniformNumber} - {p.name}</option>)}
                                    </Select>
                                </div>
                                <div className="col-span-2">
                                    <Select value={entry.position} onChange={(e) => handleLineupChange(entry.battingOrder, 'position', e.target.value)} className="h-10 sm:h-12 rounded-xl bg-muted/30 font-bold border-transparent focus:border-primary focus:bg-background transition-colors w-full px-3 text-sm sm:text-base text-center">
                                        <option value="" disabled hidden>守備...</option>
                                        {POSITIONS.map(pos => <option key={pos.value} value={pos.value} className="bg-background font-medium">{pos.label}</option>)}
                                    </Select>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* 💡 パターン保存エリア */}
                <div className="pt-8 mt-6 mb-12">
                    <label className="text-xs font-extrabold text-muted-foreground flex items-center gap-1.5 mb-3 uppercase tracking-wider">
                        <BookmarkPlus className="h-4 w-4 text-primary" /> 今のスタメンをパターン保存
                    </label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="例: ベストメンバー、対左投手用"
                            className="flex h-12 w-full rounded-xl border border-border/50 bg-background px-4 text-sm font-bold shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                            value={templateName}
                            onChange={(e) => setTemplateName(e.target.value)}
                        />
                        <Button onClick={handleSaveTemplate} disabled={isSavingTemplate || !templateName.trim()} variant="secondary" className="h-12 px-6 rounded-xl font-bold shrink-0 shadow-sm border border-border/50 hover:bg-primary/10 hover:text-primary transition-colors">
                            {isSavingTemplate ? <Loader2 className="h-5 w-5 animate-spin" /> : "保存"}
                        </Button>
                    </div>
                </div>
            </main>

            {/* 💡 追従する決定ボタン（Sticky Bottom Bar） */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-xl border-t border-border/50 z-50 flex justify-center pb-8 sm:pb-6 animate-in slide-in-from-bottom-full duration-500">
                <div className="w-full max-w-2xl px-2">
                    <Button 
                        onClick={handleSave} 
                        disabled={isSaving} 
                        className="w-full h-14 text-base font-extrabold rounded-2xl shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90 text-primary-foreground transition-all hover:-translate-y-1 active:scale-[0.98]"
                    >
                        {isSaving ? <><Loader2 className="mr-2 h-6 w-6 animate-spin" /> 保存中...</> : <><CheckCircle2 className="mr-2 h-6 w-6" /> スタメンを決定してスコア入力へ</>}
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default function MatchLineupPage() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center bg-background text-foreground"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
            <LineupContent />
        </Suspense>
    );
}
