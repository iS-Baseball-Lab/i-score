"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FieldModal } from "./FieldModal";
import { AdvanceModal } from "./AdvanceModal";
import { SubstitutionModal } from "./SubstitutionModal";
import { useScore } from "@/contexts/ScoreContext";

export function ControlPanel() {
    // 💡 ここでContextから「操作するための関数（アクション）」を受け取る！
    const { addBall, addStrike, addFoul, addOut, addPlayResult, logs, playBall } = useScore();
    // モーダルの開閉ステート
    const [isFieldModalOpen, setIsFieldModalOpen] = useState(false);
    const [isAdvanceModalOpen, setIsAdvanceModalOpen] = useState(false);
    const [isSubstitutionModalOpen, setIsSubstitutionModalOpen] = useState(false);
    const [hitPositionId, setHitPositionId] = useState<number | null>(null);
    // 💡 試合が始まっているか（ログが1件以上あるか）を判定
    const isGameStarted = logs.length > 0;

    return (
        <>
            {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            {/* 🎮 画面下部固定: アクションパネル */}
            {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            <div className="fixed bottom-0 left-0 right-0 p-4 sm:p-6 bg-background/90 backdrop-blur-xl border-t border-border/50 z-40 md:pl-[var(--sidebar-width,300px)] transition-[padding] animate-in slide-in-from-bottom-8 duration-500 shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
                <div className="max-w-5xl mx-auto flex flex-col gap-3 sm:gap-4">

                    {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
                    {/* ⚾️ 分岐: 試合前 or 試合中 */}
                    {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
                    {!isGameStarted ? (

                        // 🟥 試合開始前: プレイボールボタンのみ表示！他の操作は一切不可！
                        <Button
                            onClick={playBall}
                            className="w-full h-24 sm:h-32 rounded-[24px] bg-primary hover:bg-primary/90 text-white font-black text-3xl sm:text-5xl shadow-[0_10px_40px_rgba(0,0,0,0.2)] shadow-primary/40 active:scale-95 transition-all animate-pulse tracking-widest border-4 border-primary-foreground/20"
                        >
                            ⚾️ プレイボール！！
                        </Button>

                    ) : (

                        // 🟩 試合中: いつもの操作パネルを表示
                        <>
                            {/* メインアクション (B, S, F, IN PLAY) */}
                            <div className="grid grid-cols-4 gap-2 sm:gap-4">
                                {/* 💡 onClickにContextのアクションをセット！ */}
                                <Button
                                    onClick={addBall}
                                    className="h-16 sm:h-20 rounded-[20px] bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xl sm:text-2xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex flex-col gap-0.5"
                                >
                                    <span>B</span>
                                    <span className="text-[10px] sm:text-xs font-bold opacity-80 tracking-widest">ボール</span>
                                </Button>

                                <Button
                                    onClick={() => addStrike(false)}
                                    className="h-16 sm:h-20 rounded-[20px] bg-amber-500 hover:bg-amber-600 text-white font-black text-xl sm:text-2xl shadow-lg shadow-amber-500/20 active:scale-95 transition-all flex flex-col gap-0.5"
                                >
                                    <span>S</span>
                                    <span className="text-[10px] sm:text-xs font-bold opacity-80 tracking-widest">見逃し</span>
                                </Button>

                                <Button
                                    onClick={addFoul}
                                    className="h-16 sm:h-20 rounded-[20px] bg-amber-500/80 hover:bg-amber-600 text-white font-black text-xl sm:text-2xl shadow-lg shadow-amber-500/20 active:scale-95 transition-all flex flex-col gap-0.5"
                                >
                                    <span>F</span>
                                    <span className="text-[10px] sm:text-xs font-bold opacity-80 tracking-widest">ファウル</span>
                                </Button>

                                {/* IN PLAYボタン */}
                                <Button
                                    onClick={() => setIsFieldModalOpen(true)}
                                    className="h-16 sm:h-20 rounded-[20px] bg-primary hover:bg-primary/90 text-primary-foreground font-black text-sm sm:text-xl shadow-lg shadow-primary/30 active:scale-95 transition-all flex flex-col gap-0.5 relative overflow-hidden group"
                                >
                                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                                    <span className="leading-tight mt-1 relative z-10">IN PLAY</span>
                                    <span className="text-[10px] sm:text-xs font-bold opacity-90 tracking-widest relative z-10">打って</span>
                                </Button>
                            </div>

                            {/* サブアクション */}
                            <div className="grid grid-cols-5 gap-2 sm:gap-3">
                                <Button onClick={() => addStrike(true)} variant="outline" className="h-12 sm:h-14 rounded-[16px] border-border/50 bg-background/50 backdrop-blur-sm font-bold text-[10px] sm:text-xs shadow-sm hover:bg-muted active:scale-95 transition-all text-muted-foreground">
                                    空振り
                                </Button>

                                <Button variant="outline" className="h-12 sm:h-14 rounded-[16px] border-border/50 bg-background/50 backdrop-blur-sm font-bold text-[10px] sm:text-xs shadow-sm hover:bg-muted active:scale-95 transition-all text-muted-foreground">
                                    牽制
                                </Button>

                                <Button variant="outline" className="h-12 sm:h-14 rounded-[16px] border-border/50 bg-background/50 backdrop-blur-sm font-bold text-[10px] sm:text-xs shadow-sm hover:bg-muted active:scale-95 transition-all text-muted-foreground">
                                    盗塁/暴投
                                </Button>

                                <Button onClick={() => setIsSubstitutionModalOpen(true)} variant="outline" className="h-12 sm:h-14 rounded-[16px] border-primary/20 bg-primary/5 hover:bg-primary/10 font-bold text-[10px] sm:text-xs shadow-sm active:scale-95 transition-all text-primary">
                                    選手交代
                                </Button>

                                {/* 💡 onClickにContextのアクションをセット！ */}
                                <Button onClick={addOut} variant="outline" className="h-12 sm:h-14 rounded-[16px] border-red-500/20 bg-red-500/5 hover:bg-red-500/10 hover:text-red-600 font-bold text-[10px] sm:text-xs shadow-sm active:scale-95 transition-all text-red-500">
                                    アウト
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            {/* 💡 モーダル群のマウント */}
            {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            <FieldModal
                open={isFieldModalOpen}
                onOpenChange={setIsFieldModalOpen}
                onNext={(positionId) => {
                    setHitPositionId(positionId);
                    setIsFieldModalOpen(false);
                    setTimeout(() => setIsAdvanceModalOpen(true), 150);
                }}
            />

            <AdvanceModal
                open={isAdvanceModalOpen}
                onOpenChange={setIsAdvanceModalOpen}
                onComplete={(resultId) => {
                    addPlayResult(resultId, hitPositionId);
                    setHitPositionId(null);
                }}
            />

            <SubstitutionModal
                open={isSubstitutionModalOpen}
                onOpenChange={setIsSubstitutionModalOpen}
            />
        </>
    );
}