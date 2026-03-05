// src/app/(protected)/matches/lineup/page.tsx
"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { PageHeader } from "@/components/PageHeader";
import { Save, Users, Loader2, Download, BookmarkPlus, Trash2 } from "lucide-react";

const POSITIONS = [
    { value: "1", label: "1 (投)" }, { value: "2", label: "2 (捕)" },
    { value: "3", label: "3 (一)" }, { value: "4", label: "4 (二)" },
    { value: "5", label: "5 (三)" }, { value: "6", label: "6 (遊)" },
    { value: "7", label: "7 (左)" }, { value: "8", label: "8 (中)" },
    { value: "9", label: "9 (右)" }, { value: "DH", label: "DH (指)" },
];

interface Player { id: string; name: string; uniformNumber: string; }
interface LineupEntry { battingOrder: number; playerId: string; position: string; }
interface Template { id: string; name: string; lineupData: string; } // 💡 パターンの型

function LineupContent() {
    const searchParams = useSearchParams();
    const matchId = searchParams.get("id");
    const teamId = searchParams.get("teamId");
    const router = useRouter();

    const [players, setPlayers] = useState<Player[]>([]);
    const [lineup, setLineup] = useState<LineupEntry[]>(
        Array.from({ length: 9 }, (_, i) => ({ battingOrder: i + 1, playerId: "", position: "" }))
    );
    const [isSaving, setIsSaving] = useState(false);

    // 💡 パターン管理用のState
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
        fetchTemplates(); // 💡 パターン一覧も取得
    }, [matchId, teamId]);

    const handleLineupChange = (order: number, field: 'playerId' | 'position', value: string) => {
        setLineup(prev => prev.map(entry => entry.battingOrder === order ? { ...entry, [field]: value } : entry));
    };

    // 💡 パターンを呼び出して画面に適用する
    const handleApplyTemplate = (templateId: string) => {
        setSelectedTemplate(templateId);
        if (!templateId) return;
        const tmpl = templates.find(t => t.id === templateId);
        if (tmpl) {
            const parsed = JSON.parse(tmpl.lineupData) as LineupEntry[];
            setLineup(prev => prev.map(p => parsed.find(f => f.battingOrder === p.battingOrder) || p));
        }
    };

    // 💡 現在の入力を新しいパターンとして保存する
    const handleSaveTemplate = async () => {
        if (!teamId || !templateName.trim()) return;
        setIsSavingTemplate(true);
        try {
            const validLineup = lineup.filter(entry => entry.playerId !== "");
            const res = await fetch(`/api/teams/${teamId}/lineup-templates`, {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: templateName, lineupData: validLineup }),
            });
            if (res.ok) {
                setTemplateName("");
                const refresh = await fetch(`/api/teams/${teamId}/lineup-templates`);
                if (refresh.ok) setTemplates(await refresh.json());
                alert("新しいパターンを保存しました！");
            }
        } catch (error) { console.error(error); }
        finally { setIsSavingTemplate(false); }
    };

    // 💡 パターンの削除
    const handleDeleteTemplate = async (templateId: string) => {
        if (!confirm("このパターンを削除しますか？")) return;
        try {
            await fetch(`/api/teams/${teamId}/lineup-templates/${templateId}`, { method: 'DELETE' });
            setTemplates(prev => prev.filter(t => t.id !== templateId));
            if (selectedTemplate === templateId) setSelectedTemplate("");
        } catch (error) { console.error(error); }
    };

    const handleSave = async () => {
        if (!matchId) return;
        const validLineup = lineup.filter(entry => entry.playerId !== "");
        setIsSaving(true);
        try {
            const res = await fetch(`/api/matches/${matchId}/lineup`, {
                method: "PUT", headers: { "Content-Type": "application/json" },
                body: JSON.stringify(validLineup),
            });
            if (res.ok) router.push(`/matches/score?id=${matchId}`);
        } catch (error) { console.error(error); }
        finally { setIsSaving(false); }
    };

    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground pb-20">
            <PageHeader href="/dashboard" icon={Users} title="スターティングメンバー" subtitle="打順と守備位置の登録をしてください。" />

            <main className="flex-1 p-4 max-w-2xl mx-auto w-full mt-4 animate-in fade-in duration-500">

                {/* 💡 追加：パターン呼び出しエリア */}
                {templates.length > 0 && (
                    <div className="bg-muted/30 border border-border rounded-xl p-4 mb-6">
                        <label className="text-xs font-bold text-muted-foreground flex items-center gap-1.5 mb-2">
                            <Download className="h-3.5 w-3.5" /> 保存済みのパターンを呼び出す
                        </label>
                        <div className="flex gap-2">
                            <Select value={selectedTemplate} onChange={(e) => handleApplyTemplate(e.target.value)} className="flex-1 bg-background font-bold shadow-sm">
                                <option value="">選択してください...</option>
                                {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </Select>
                            {selectedTemplate && (
                                <Button variant="ghost" size="icon" onClick={() => handleDeleteTemplate(selectedTemplate)} className="text-red-500 hover:text-red-600 hover:bg-red-50 shrink-0 border border-transparent hover:border-red-200">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </div>
                )}

                <div className="space-y-3">
                    {lineup.map((entry) => (
                        <div key={entry.battingOrder} className="flex items-center gap-3 bg-muted/10 border border-border rounded-xl p-3">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                                <span className="text-lg font-black text-primary">{entry.battingOrder}</span>
                            </div>
                            <div className="flex-1 grid grid-cols-5 gap-2">
                                <div className="col-span-3">
                                    <Select value={entry.playerId} onChange={(e) => handleLineupChange(entry.battingOrder, 'playerId', e.target.value)} className="shadow-sm">
                                        <option value="" disabled hidden>選手を選択...</option>
                                        {players.map(p => <option key={p.id} value={p.id} className="bg-background">背番号{p.uniformNumber} - {p.name}</option>)}
                                    </Select>
                                </div>
                                <div className="col-span-2">
                                    <Select value={entry.position} onChange={(e) => handleLineupChange(entry.battingOrder, 'position', e.target.value)} className="shadow-sm">
                                        <option value="" disabled hidden>守備...</option>
                                        {POSITIONS.map(pos => <option key={pos.value} value={pos.value} className="bg-background">{pos.label}</option>)}
                                    </Select>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* 💡 追加：パターン保存エリア */}
                <div className="pt-6 mt-6 border-t border-border/50">
                    <label className="text-xs font-bold text-muted-foreground flex items-center gap-1.5 mb-2">
                        <BookmarkPlus className="h-3.5 w-3.5" /> 現在のスタメンをパターンとして保存
                    </label>
                    <div className="flex gap-2 mb-8">
                        <input
                            type="text"
                            placeholder="例: ベストメンバー、対左投手用"
                            className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                            value={templateName}
                            onChange={(e) => setTemplateName(e.target.value)}
                        />
                        <Button onClick={handleSaveTemplate} disabled={isSavingTemplate || !templateName.trim()} variant="secondary" className="font-bold shrink-0 shadow-sm border border-border">
                            {isSavingTemplate ? <Loader2 className="h-4 w-4 animate-spin" /> : "保存"}
                        </Button>
                    </div>

                    <Button onClick={handleSave} disabled={isSaving} className="w-full h-14 text-base font-bold rounded-xl shadow-md bg-primary hover:bg-primary/90 text-primary-foreground transition-all active:scale-[0.98]">
                        {isSaving ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> 保存中...</> : <><Save className="mr-2 h-5 w-5" /> スタメンを決定してスコア入力へ</>}
                    </Button>
                </div>
            </main>
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