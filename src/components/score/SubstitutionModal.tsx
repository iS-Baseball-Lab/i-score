// src/components/score/SubstitutionModal.tsx
"use client";

import { useState } from "react";
import { Repeat, X, ArrowDown, UserMinus, UserPlus, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

export interface SubstitutionModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onComplete?: (subData: any) => void;
}

// 💡 交代種別のマスター
const SUB_TYPES = [
    { id: "PH", label: "代打", color: "primary" },
    { id: "PR", label: "代走", color: "emerald" },
    { id: "P", label: "投手交代", color: "red" },
    { id: "DEF", label: "守備交代", color: "amber" },
];

// 💡 ダミーデータ (ベンチ入りメンバー)
const BENCH_PLAYERS = [
    { id: "p1", number: "7", name: "伊藤 健太", positions: ["外", "一"] },
    { id: "p2", number: "10", name: "渡辺 翔", positions: ["内"] },
    { id: "p3", number: "15", name: "小林 達也", positions: ["投", "外"] },
    { id: "p4", number: "22", name: "加藤 翼", positions: ["捕"] },
    { id: "p5", number: "51", name: "高橋 誠", positions: ["外"] },
];

export function SubstitutionModal({ open, onOpenChange, onComplete }: SubstitutionModalProps) {
    const [subType, setSubType] = useState("PH"); // デフォルトは代打
    const [selectedBenchPlayer, setSelectedBenchPlayer] = useState<string | null>(null);

    const handleOpenChange = (newOpen: boolean) => {
        if (!newOpen) {
            setTimeout(() => {
                setSubType("PH");
                setSelectedBenchPlayer(null);
            }, 200);
        }
        onOpenChange(newOpen);
    };

    const handleComplete = () => {
        if (selectedBenchPlayer) {
            onComplete?.({ type: subType, playerId: selectedBenchPlayer });
            handleOpenChange(false);
        }
    };

    // 💡 交代種別に応じた「今下がろうとしている選手」のダミー取得ロジック
    const getOutPlayer = () => {
        switch (subType) {
            case "PH": return { number: "18", name: "山田 太郎", desc: "現在のバッター" };
            case "PR": return { number: "6", name: "中村 蓮", desc: "1塁ランナー" };
            case "P": return { number: "11", name: "佐藤 一郎", desc: "現在のピッチャー" };
            default: return { number: "4", name: "鈴木 大地", desc: "セカンド" };
        }
    };

    const outPlayer = getOutPlayer();

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent
                className="max-w-xl w-[95%] sm:w-[90%] rounded-[32px] border-border/50 bg-card/95 backdrop-blur-2xl p-0 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                showCloseButton={false}
            >
                <div className="absolute top-0 right-0 -mt-20 -mr-20 w-56 h-56 bg-primary/10 blur-[100px] rounded-full pointer-events-none" />

                {/* 1. ヘッダーエリア */}
                <div className="p-5 sm:p-6 pb-4 relative z-10 flex items-start justify-between bg-card/50 border-b border-border/40 shrink-0">
                    <DialogHeader>
                        <DialogTitle className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-xl text-primary border border-primary/20 shadow-sm">
                                <Repeat className="h-5 w-5 sm:h-6 sm:w-6" />
                            </div>
                            選手交代
                        </DialogTitle>
                    </DialogHeader>
                    <Button
                        variant="ghost" size="icon" onClick={() => handleOpenChange(false)}
                        className="rounded-full h-10 w-10 text-muted-foreground hover:bg-muted shrink-0 -mr-2 -mt-2"
                    >
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                {/* スクロール可能なコンテンツエリア */}
                <div className="overflow-y-auto custom-scrollbar flex-1 relative z-10 p-5 sm:p-6 space-y-6">

                    {/* 2. 交代種別のタブ (PH, PR, P, DEF) */}
                    <div className="flex bg-muted/30 p-1.5 rounded-[20px] border border-border/50 shadow-inner overflow-x-auto hide-scrollbar">
                        {SUB_TYPES.map((type) => (
                            <button
                                key={type.id}
                                onClick={() => {
                                    setSubType(type.id);
                                    setSelectedBenchPlayer(null); // タブを切り替えたら選択をリセット
                                }}
                                className={cn(
                                    "flex-1 min-w-[70px] py-2.5 sm:py-3 text-sm sm:text-base font-black rounded-[16px] transition-all duration-300",
                                    subType === type.id
                                        ? `bg-background shadow-sm text-${type.color === 'primary' ? 'primary' : type.color + '-500'} border border-border/50 scale-[1.02]`
                                        : "text-muted-foreground hover:text-foreground active:scale-95"
                                )}
                            >
                                {type.label}
                            </button>
                        ))}
                    </div>

                    {/* 3. 交代のフロー (OUT ➡️ IN) */}
                    <div className="flex flex-col gap-2">

                        {/* 🔴 下がる選手 (OUT) */}
                        <div className="rounded-[20px] border border-border/50 bg-muted/20 p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-background border border-border flex items-center justify-center shrink-0 shadow-sm">
                                    <UserMinus className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />
                                </div>
                                <div>
                                    <div className="text-[10px] sm:text-xs font-bold text-muted-foreground mb-0.5">{outPlayer.desc}</div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono text-base sm:text-lg font-black text-muted-foreground">#{outPlayer.number}</span>
                                        <span className="text-base sm:text-lg font-black text-foreground">{outPlayer.name}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="px-3 py-1 bg-red-500/10 text-red-500 rounded-full text-xs font-black uppercase tracking-wider border border-red-500/20">
                                Out
                            </div>
                        </div>

                        {/* ⬇️ 矢印 */}
                        <div className="flex justify-center -my-3 relative z-10">
                            <div className="bg-background rounded-full p-1 border border-border/50 shadow-sm">
                                <ArrowDown className="h-5 w-5 text-muted-foreground" />
                            </div>
                        </div>

                        {/* 🟢 入る選手 (IN) - 選択状況 */}
                        <div className={cn(
                            "rounded-[20px] border p-4 flex items-center justify-between transition-colors duration-300",
                            selectedBenchPlayer ? "bg-primary/5 border-primary/30" : "bg-card border-border/50 border-dashed"
                        )}>
                            <div className="flex items-center gap-3">
                                <div className={cn(
                                    "h-10 w-10 sm:h-12 sm:w-12 rounded-full border flex items-center justify-center shrink-0 shadow-sm transition-colors",
                                    selectedBenchPlayer ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border text-muted-foreground/50"
                                )}>
                                    <UserPlus className="h-5 w-5 sm:h-6 sm:w-6" />
                                </div>
                                <div>
                                    <div className="text-[10px] sm:text-xs font-bold text-muted-foreground mb-0.5">ベンチから選択</div>
                                    {selectedBenchPlayer ? (
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono text-base sm:text-lg font-black text-primary">#{BENCH_PLAYERS.find(p => p.id === selectedBenchPlayer)?.number}</span>
                                            <span className="text-base sm:text-lg font-black text-foreground">{BENCH_PLAYERS.find(p => p.id === selectedBenchPlayer)?.name}</span>
                                        </div>
                                    ) : (
                                        <div className="text-base sm:text-lg font-bold text-muted-foreground/50">未選択</div>
                                    )}
                                </div>
                            </div>
                            <div className={cn(
                                "px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border transition-colors",
                                selectedBenchPlayer ? "bg-primary/10 text-primary border-primary/20" : "bg-muted text-muted-foreground border-border/50"
                            )}>
                                In
                            </div>
                        </div>

                    </div>

                    {/* 4. ベンチメンバー一覧 (タップで選択) */}
                    <div className="space-y-3 pt-2">
                        <label className="text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-widest pl-1">
                            ベンチメンバー ({BENCH_PLAYERS.length}名)
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {BENCH_PLAYERS.map((player) => {
                                const isSelected = selectedBenchPlayer === player.id;
                                return (
                                    <button
                                        key={player.id}
                                        onClick={() => setSelectedBenchPlayer(player.id)}
                                        className={cn(
                                            "flex items-center p-3 rounded-[16px] border text-left transition-all duration-200 active:scale-[0.98]",
                                            isSelected
                                                ? "bg-primary/10 border-primary/40 ring-2 ring-primary/20 shadow-sm"
                                                : "bg-background border-border/50 hover:bg-muted hover:border-border"
                                        )}
                                    >
                                        <div className={cn(
                                            "h-10 w-10 rounded-full flex items-center justify-center shrink-0 mr-3 border font-mono font-black text-lg transition-colors",
                                            isSelected ? "bg-primary text-primary-foreground border-primary" : "bg-muted border-border/50 text-muted-foreground"
                                        )}>
                                            {player.number}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-black text-base truncate text-foreground">{player.name}</div>
                                            <div className="flex gap-1 mt-0.5">
                                                {player.positions.map((pos, idx) => (
                                                    <span key={idx} className="text-[9px] px-1.5 py-0.5 rounded-sm bg-muted-foreground/10 text-muted-foreground font-bold">
                                                        {pos}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                </div>

                {/* 5. フッターアクションエリア */}
                <div className="p-5 sm:p-6 pt-0 bg-card/50 border-t border-border/40 shrink-0 mt-auto">
                    <Button
                        disabled={!selectedBenchPlayer}
                        onClick={handleComplete}
                        className="w-full h-14 sm:h-16 rounded-[20px] font-black text-lg bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 mt-4"
                    >
                        {selectedBenchPlayer ? "選手交代を確定する" : "入る選手を選択してください"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}