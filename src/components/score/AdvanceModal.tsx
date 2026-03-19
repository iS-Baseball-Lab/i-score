// src/components/score/AdvanceModal.tsx
"use client";

import { useState } from "react";
import { X, Trophy, ShieldAlert, Footprints, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

export interface AdvanceModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    // 💡 結果を確定した時に呼ばれるコールバック
    onComplete?: (result: string) => void;
}

// 💡 プレイ結果の選択肢マスター
const PLAY_RESULTS = {
    HITS: [
        { id: "1B", label: "単打", short: "1B", color: "emerald" },
        { id: "2B", label: "二塁打", short: "2B", color: "emerald" },
        { id: "3B", label: "三塁打", short: "3B", color: "emerald" },
        { id: "HR", label: "本塁打", short: "HR", color: "primary" }, // HRは特別色
    ],
    OUTS: [
        { id: "OUT", label: "ゴロ/フライ", short: "Out", color: "red" },
        { id: "DP", label: "併殺 (ゲッツー)", short: "DP", color: "red" },
        { id: "SAC", label: "犠打/犠飛", short: "Sac", color: "orange" },
        { id: "FC", label: "野手選択", short: "FC", color: "red" },
    ],
    ERRORS: [
        { id: "ERR", label: "エラー (失策)", short: "E", color: "amber" },
    ],
};

export function AdvanceModal({ open, onOpenChange, onComplete }: AdvanceModalProps) {
    // 選択された結果のID
    const [selectedResult, setSelectedResult] = useState<string | null>(null);

    const handleOpenChange = (newOpen: boolean) => {
        if (!newOpen) {
            setTimeout(() => setSelectedResult(null), 200);
        }
        onOpenChange(newOpen);
    };

    const handleComplete = () => {
        if (selectedResult) {
            onComplete?.(selectedResult);
            handleOpenChange(false);
        }
    };

    // 💡 カラーに応じたTailwindクラスを返すヘルパー
    const getColorClasses = (color: string, isSelected: boolean) => {
        switch (color) {
            case "emerald":
                return isSelected
                    ? "bg-emerald-500 border-emerald-500 text-white shadow-emerald-500/40 ring-4 ring-emerald-500/20 scale-[1.02]"
                    : "bg-emerald-500/5 border-emerald-500/20 text-emerald-600 hover:bg-emerald-500/10";
            case "primary":
                return isSelected
                    ? "bg-primary border-primary text-white shadow-primary/40 ring-4 ring-primary/20 scale-[1.02]"
                    : "bg-primary/5 border-primary/20 text-primary hover:bg-primary/10";
            case "red":
                return isSelected
                    ? "bg-red-500 border-red-500 text-white shadow-red-500/40 ring-4 ring-red-500/20 scale-[1.02]"
                    : "bg-red-500/5 border-red-500/20 text-red-500 hover:bg-red-500/10";
            case "orange":
                return isSelected
                    ? "bg-orange-500 border-orange-500 text-white shadow-orange-500/40 ring-4 ring-orange-500/20 scale-[1.02]"
                    : "bg-orange-500/5 border-orange-500/20 text-orange-500 hover:bg-orange-500/10";
            case "amber":
                return isSelected
                    ? "bg-amber-500 border-amber-500 text-white shadow-amber-500/40 ring-4 ring-amber-500/20 scale-[1.02]"
                    : "bg-amber-500/5 border-amber-500/20 text-amber-600 hover:bg-amber-500/10";
            default:
                return "bg-muted border-border/50 text-foreground";
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent
                className="max-w-xl w-[95%] sm:w-[90%] rounded-[32px] border-border/50 bg-card/95 backdrop-blur-2xl p-0 shadow-2xl overflow-hidden"
                showCloseButton={false}
            >
                {/* 背景の光彩エフェクト */}
                <div className="absolute top-0 left-0 -mt-20 -ml-20 w-56 h-56 bg-primary/10 blur-[100px] rounded-full pointer-events-none" />

                {/* ヘッダーエリア */}
                <div className="p-6 pb-2 sm:p-8 sm:pb-4 relative z-10 flex items-start justify-between">
                    <DialogHeader>
                        <DialogTitle className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-3">
                            <div className="p-2.5 bg-primary/10 rounded-2xl text-primary border border-primary/20 shadow-sm">
                                <Footprints className="h-6 w-6 sm:h-7 sm:w-7" />
                            </div>
                            プレイの結果
                        </DialogTitle>
                        <p className="text-sm font-bold text-muted-foreground mt-2">
                            バッターの打席結果を選択してください。
                        </p>
                    </DialogHeader>
                    <Button
                        variant="ghost" size="icon" onClick={() => handleOpenChange(false)}
                        className="rounded-full h-10 w-10 text-muted-foreground hover:bg-muted shrink-0"
                    >
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                {/* 選択ボタンエリア */}
                <div className="px-6 sm:px-8 relative z-10 space-y-6 sm:space-y-8 pb-6">

                    {/* ① 安打 (HITS) */}
                    <div className="space-y-3">
                        <label className="text-sm font-bold text-emerald-500 uppercase tracking-widest pl-1 flex items-center gap-1.5">
                            <Trophy className="h-4 w-4" /> 安打 (Hit)
                        </label>
                        <div className="grid grid-cols-4 gap-2 sm:gap-3">
                            {PLAY_RESULTS.HITS.map((item) => {
                                const isSelected = selectedResult === item.id;
                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => setSelectedResult(item.id)}
                                        className={cn(
                                            "flex flex-col items-center justify-center gap-1 h-16 sm:h-20 rounded-[20px] border-2 transition-all duration-200 shadow-sm active:scale-95",
                                            getColorClasses(item.color, isSelected)
                                        )}
                                    >
                                        <span className="font-black text-xl sm:text-2xl tracking-tighter leading-none">{item.short}</span>
                                        <span className="text-[10px] sm:text-xs font-bold opacity-90">{item.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* ② アウト (OUTS) */}
                    <div className="space-y-3">
                        <label className="text-sm font-bold text-red-500 uppercase tracking-widest pl-1 flex items-center gap-1.5">
                            <ShieldAlert className="h-4 w-4" /> アウト (Out)
                        </label>
                        <div className="grid grid-cols-4 gap-2 sm:gap-3">
                            {PLAY_RESULTS.OUTS.map((item) => {
                                const isSelected = selectedResult === item.id;
                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => setSelectedResult(item.id)}
                                        className={cn(
                                            "flex flex-col items-center justify-center gap-1 h-16 sm:h-20 rounded-[20px] border-2 transition-all duration-200 shadow-sm active:scale-95",
                                            getColorClasses(item.color, isSelected)
                                        )}
                                    >
                                        <span className="font-black text-lg sm:text-xl tracking-tighter leading-none">{item.short}</span>
                                        <span className="text-[10px] sm:text-xs font-bold opacity-90">{item.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* ③ エラー (ERRORS) */}
                    <div className="space-y-3">
                        <label className="text-sm font-bold text-amber-500 uppercase tracking-widest pl-1">
                            エラー・その他
                        </label>
                        <div className="grid grid-cols-4 gap-2 sm:gap-3">
                            {PLAY_RESULTS.ERRORS.map((item) => {
                                const isSelected = selectedResult === item.id;
                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => setSelectedResult(item.id)}
                                        className={cn(
                                            "flex flex-col items-center justify-center gap-1 h-16 sm:h-20 rounded-[20px] border-2 transition-all duration-200 shadow-sm active:scale-95",
                                            getColorClasses(item.color, isSelected)
                                        )}
                                    >
                                        <span className="font-black text-lg sm:text-xl tracking-tighter leading-none">{item.short}</span>
                                        <span className="text-[10px] sm:text-xs font-bold opacity-90">{item.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                </div>

                {/* フッターアクションエリア */}
                <div className="p-6 sm:p-8 pt-0 flex flex-col sm:flex-row gap-3 border-t border-border/40 mt-2">
                    <Button
                        disabled={!selectedResult}
                        onClick={handleComplete}
                        className="w-full h-14 sm:h-16 rounded-[20px] font-black text-lg bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2"
                    >
                        {selectedResult ? "結果を確定して次へ" : "結果を選択してください"}
                        {selectedResult && <ChevronRight className="h-5 w-5" />}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}