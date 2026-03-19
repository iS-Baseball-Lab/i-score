// src/components/score/FieldModal.tsx
"use client";

import { Swords, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";

// 💡 守備位置の定義 (ポジション番号と座標)
export const DEFENSIVE_POSITIONS = [
    { id: 1, name: "投", short: "P", cx: "50%", cy: "68%" },
    { id: 2, name: "捕", short: "C", cx: "50%", cy: "92%" },
    { id: 3, name: "一", short: "1B", cx: "78%", cy: "62%" },
    { id: 4, name: "二", short: "2B", cx: "65%", cy: "45%" },
    { id: 5, name: "三", short: "3B", cx: "22%", cy: "62%" },
    { id: 6, name: "遊", short: "SS", cx: "35%", cy: "45%" },
    { id: 7, name: "左", short: "LF", cx: "15%", cy: "25%" },
    { id: 8, name: "中", short: "CF", cx: "50%", cy: "15%" },
    { id: 9, name: "右", short: "RF", cx: "85%", cy: "25%" },
] as const;

export interface FieldModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    // 💡 ポジションを選択して「次へ」を押した時に呼ばれるコールバック
    onNext: (positionId: number) => void;
}

export function FieldModal({ open, onOpenChange, onNext }: FieldModalProps) {
    // 選択された守備位置のID
    const [selectedPosition, setSelectedPosition] = useState<number | null>(null);

    // モーダルが閉じる時に選択状態をリセットする
    const handleOpenChange = (newOpen: boolean) => {
        if (!newOpen) {
            setTimeout(() => setSelectedPosition(null), 200); // アニメーション終了後にリセット
        }
        onOpenChange(newOpen);
    };

    const handleNext = () => {
        if (selectedPosition) {
            onNext(selectedPosition);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent
                className="max-w-xl w-[95%] sm:w-[90%] rounded-[32px] border-border/50 bg-card/95 backdrop-blur-2xl p-0 shadow-2xl overflow-hidden"
                // 💡 閉じるボタンをカスタマイズするため、デフォルトのXボタンを非表示にする
                showCloseButton={false}
            >
                {/* 背景の光彩エフェクト */}
                <div className="absolute top-0 right-0 -mt-20 -mr-20 w-56 h-56 bg-primary/10 blur-[100px] rounded-full pointer-events-none" />

                {/* ヘッダーエリア */}
                <div className="p-6 pb-4 sm:p-8 sm:pb-6 relative z-10 flex items-start justify-between">
                    <DialogHeader>
                        <DialogTitle className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-3">
                            <div className="p-2.5 bg-primary/10 rounded-2xl text-primary border border-primary/20 shadow-sm">
                                <Swords className="h-6 w-6 sm:h-7 sm:w-7" />
                            </div>
                            打球方向
                        </DialogTitle>
                        <p className="text-sm font-bold text-muted-foreground mt-2">
                            打球が飛んだ場所（最初に触れた野手）をタップしてください。
                        </p>
                    </DialogHeader>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenChange(false)}
                        className="rounded-full h-10 w-10 text-muted-foreground hover:bg-muted shrink-0"
                    >
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                {/* グラウンドエリア */}
                <div className="px-6 sm:px-8 relative z-10">
                    <div className="relative aspect-[4/3] w-full rounded-[28px] bg-muted/30 border border-border/50 overflow-hidden shadow-inner flex items-center justify-center p-2 mb-6">

                        {/* ⚾️ SVGで野球場を描画 */}
                        <svg viewBox="0 0 200 150" className="absolute inset-0 h-full w-full opacity-40">
                            {/* 外野フェンス (円弧) */}
                            <path d="M 10 30 Q 100 -20 190 30 L 100 140 Z" fill="var(--muted)" stroke="currentColor" strokeWidth="0.5" className="text-border/50" />
                            {/* フェアゾーン (内野+外野の芝) */}
                            <path d="M100 140 L20 60 Q100 -20 180 60 Z" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-primary/30" />
                            {/* 内野の土 (ダイヤモンド) */}
                            <path d="M100 130 L60 90 L100 50 L140 90 Z" fill="none" stroke="currentColor" strokeWidth="1" className="text-amber-500/30" />
                            {/* ベース (1,2,3塁, 本塁) */}
                            <rect x="138" y="88" width="4" height="4" transform="rotate(45 140 90)" fill="currentColor" className="text-foreground/20" />
                            <rect x="98" y="48" width="4" height="4" transform="rotate(45 100 50)" fill="currentColor" className="text-foreground/20" />
                            <rect x="58" y="88" width="4" height="4" transform="rotate(45 60 90)" fill="currentColor" className="text-foreground/20" />
                            <polygon points="100,132 98,129 102,129" fill="currentColor" className="text-foreground/20" />
                            {/* マウンド */}
                            <circle cx="100" cy="90" r="6" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-amber-500/30" />
                            <rect x="98.5" y="89" width="3" height="1" fill="currentColor" className="text-foreground/20" />
                        </svg>

                        {/* ⚾️ 守備位置ボタンの配置 */}
                        {DEFENSIVE_POSITIONS.map((pos) => {
                            const isSelected = selectedPosition === pos.id;
                            return (
                                <button
                                    key={pos.id}
                                    onClick={() => setSelectedPosition(pos.id)}
                                    style={{ left: pos.cx, top: pos.cy }}
                                    className={cn(
                                        "absolute h-[12vw] w-[12vw] max-h-14 max-w-14 sm:h-14 sm:w-14 rounded-full border-2 font-black text-lg sm:text-xl shadow-lg transition-all duration-300 flex items-center justify-center -translate-x-1/2 -translate-y-1/2",
                                        isSelected
                                            ? "bg-primary border-primary text-primary-foreground scale-110 shadow-primary/40 ring-4 ring-primary/20"
                                            : "bg-background border-border/80 text-foreground hover:bg-muted hover:scale-105 active:scale-95"
                                    )}
                                >
                                    {pos.name}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* フッターアクションエリア */}
                <div className="p-6 sm:p-8 pt-0 flex flex-col sm:flex-row gap-3">
                    <Button
                        disabled={!selectedPosition}
                        onClick={handleNext}
                        className="w-full h-14 sm:h-16 rounded-[20px] font-black text-lg bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100"
                    >
                        {selectedPosition
                            ? `${DEFENSIVE_POSITIONS.find(p => p.id === selectedPosition)?.name} に飛んだ！`
                            : "守備位置を選択してください"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}