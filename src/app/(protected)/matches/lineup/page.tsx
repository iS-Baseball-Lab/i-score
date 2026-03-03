// src/app/(protected)/matches/lineup/page.tsx
"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { PageHeader } from "@/components/PageHeader";
// 💡 Loader2 を追加インポート
import { ClipboardList, Save, Users, Loader2 } from "lucide-react";

const POSITIONS = [
    { value: "1", label: "1 (投)" }, { value: "2", label: "2 (捕)" },
    { value: "3", label: "3 (一)" }, { value: "4", label: "4 (二)" },
    { value: "5", label: "5 (三)" }, { value: "6", label: "6 (遊)" },
    { value: "7", label: "7 (左)" }, { value: "8", label: "8 (中)" },
    { value: "9", label: "9 (右)" }, { value: "DH", label: "DH (指)" },
];

interface Player { id: string; name: string; uniformNumber: string; }
interface LineupEntry { battingOrder: number; playerId: string; position: string; }

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
        fetchPlayers();
        fetchLineup();
    }, [matchId, teamId]);

    const handleLineupChange = (order: number, field: 'playerId' | 'position', value: string) => {
        setLineup(prev => prev.map(entry => entry.battingOrder === order ? { ...entry, [field]: value } : entry));
    };

    const handleSave = async () => {
        if (!matchId) return;
        const validLineup = lineup.filter(entry => entry.playerId !== "");
        setIsSaving(true);
        try {
            const res = await fetch(`/api/matches/${matchId}/lineup`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(validLineup),
            });
            if (res.ok) {
                // アラートは消して、スムーズに遷移させてもUI的に綺麗です
                router.push(`/matches/score?id=${matchId}`);
            }
        } catch (error) { console.error(error); }
        finally { setIsSaving(false); }
    };

    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground pb-20">
            <PageHeader
                href="/dashboard"
                icon={Users}
                title="スターティングメンバー"
                subtitle="打順と守備位置の登録をしてください。"
            />

            <main className="flex-1 p-4 max-w-2xl mx-auto w-full space-y-3 mt-4">
                {lineup.map((entry) => (
                    <div key={entry.battingOrder} className="flex items-center gap-3 bg-muted/10 border border-border rounded-xl p-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/20 border-2 border-primary/30 flex items-center justify-center shrink-0">
                            <span className="text-lg font-black text-primary">{entry.battingOrder}</span>
                        </div>
                        <div className="flex-1 grid grid-cols-5 gap-2">
                            <div className="col-span-3">
                                <Select value={entry.playerId} onChange={(e) => handleLineupChange(entry.battingOrder, 'playerId', e.target.value)}>
                                    <option value="" disabled hidden>選手を選択...</option>
                                    {players.map(p => <option key={p.id} value={p.id} className="bg-background">背番号{p.uniformNumber} - {p.name}</option>)}
                                </Select>
                            </div>
                            <div className="col-span-2">
                                <Select value={entry.position} onChange={(e) => handleLineupChange(entry.battingOrder, 'position', e.target.value)}>
                                    <option value="" disabled hidden>守備...</option>
                                    {POSITIONS.map(pos => <option key={pos.value} value={pos.value} className="bg-background">{pos.label}</option>)}
                                </Select>
                            </div>
                        </div>
                    </div>
                ))}

                {/* 💡 追加：保存ボタンを9番バッターの下に設置 */}
                <div className="pt-6 pb-8">
                    <Button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="w-full h-14 text-base font-bold rounded-xl shadow-md bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                        {isSaving ? (
                            <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> 保存中...</>
                        ) : (
                            <><Save className="mr-2 h-5 w-5" /> スタメンを保存してスコア入力へ</>
                        )}
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