// src/components/score/SubstitutionModal.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { X, RefreshCcw } from "lucide-react";

interface Player { id: string; name: string; uniformNumber: string; }
interface LineupPlayer { player_id: string; batting_order: number; playerName: string; uniformNumber: string; position: string; }

interface SubstitutionModalProps {
    show: boolean;
    onClose: () => void;
    roster: Player[];
    currentLineup: LineupPlayer[];
    onSubstitute: (outPlayerId: string, inPlayerId: string, logText: string) => void;
}

export function SubstitutionModal({ show, onClose, roster, currentLineup, onSubstitute }: SubstitutionModalProps) {
    const [outPlayerId, setOutPlayerId] = useState("");
    const [inPlayerId, setInPlayerId] = useState("");

    if (!show) return null;

    // ベンチにいる選手（現在のスタメンに含まれていない選手）だけを抽出
    const benchPlayers = roster.filter(r => !currentLineup.some(l => l.player_id === r.id));

    const handleSub = () => {
        if (!outPlayerId || !inPlayerId) return;
        const outP = currentLineup.find(p => p.player_id === outPlayerId);
        const inP = benchPlayers.find(p => p.id === inPlayerId);
        if (outP && inP) {
            onSubstitute(outPlayerId, inPlayerId, `選手交代: [OUT] ${outP.playerName} ➔ [IN] ${inP.name}`);
        }
        setOutPlayerId(""); setInPlayerId("");
    };

    return (
        <div className="fixed inset-0 bg-background/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-[320px] bg-card border border-border rounded-2xl p-5 shadow-2xl flex flex-col relative animate-in zoom-in-95 duration-200">
                <Button variant="ghost" size="icon" className="absolute top-3 right-3 rounded-full text-muted-foreground hover:bg-muted" onClick={onClose}>
                    <X className="h-5 w-5" />
                </Button>

                <h2 className="text-lg font-black tracking-tight mb-4 flex items-center gap-2">
                    <RefreshCcw className="h-5 w-5 text-blue-500" /> 選手交代
                </h2>

                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-red-500">下げる選手 (OUT)</label>
                        <select className="flex h-10 w-full rounded-xl border border-input bg-background px-3 text-sm font-bold shadow-sm" value={outPlayerId} onChange={(e) => setOutPlayerId(e.target.value)}>
                            <option value="">選択してください</option>
                            {currentLineup.map(p => (
                                <option key={p.player_id} value={p.player_id}>{p.batting_order}番 {p.position}: {p.playerName}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-blue-500">入れる選手 (IN)</label>
                        <select className="flex h-10 w-full rounded-xl border border-input bg-background px-3 text-sm font-bold shadow-sm" value={inPlayerId} onChange={(e) => setInPlayerId(e.target.value)}>
                            <option value="">選択してください</option>
                            {benchPlayers.map(p => (
                                <option key={p.id} value={p.id}>背番号{p.uniformNumber}: {p.name}</option>
                            ))}
                        </select>
                    </div>

                    <Button onClick={handleSub} disabled={!outPlayerId || !inPlayerId} className="w-full rounded-xl font-bold mt-2 bg-blue-600 hover:bg-blue-700 text-white">
                        交代を実行する
                    </Button>
                </div>
            </div>
        </div>
    );
}