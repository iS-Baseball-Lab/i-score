// src/components/score/ControlPanel.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FieldModal } from "./FieldModal";
import { AdvanceModal } from "./AdvanceModal";
import { SubstitutionModal } from "./SubstitutionModal";

export function ControlPanel() {
    // 💡 各種モーダルの開閉ステート（ここから各モーダルコンポーネントに渡します）
    const [isFieldModalOpen, setIsFieldModalOpen] = useState(false);
    const [isAdvanceModalOpen, setIsAdvanceModalOpen] = useState(false);
    const [isSubstitutionModalOpen, setIsSubstitutionModalOpen] = useState(false);

    // 💡 アクションハンドラー (実際のアプリではここでAPI通信やグローバルステートの更新を行います)
    const handleBall = () => console.log("ボール！");
    const handleStrike = () => console.log("ストライク（見逃し）！");
    const handleFoul = () => console.log("ファウル！");
    const handleSwingAndMiss = () => console.log("空振り！");
    const handleOut = () => console.log("アウト！");

    return (
        <>
            {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            {/* 🎮 画面下部固定: アクションパネル */}
            {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            <div className="fixed bottom-0 left-0 right-0 p-4 sm:p-6 bg-background/90 backdrop-blur-xl border-t border-border/50 z-40 md:pl-[var(--sidebar-width,300px)] transition-[padding] animate-in slide-in-from-bottom-8 duration-500 shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
                <div className="max-w-5xl mx-auto flex flex-col gap-3 sm:gap-4">

                    {/* メインアクション (B, S, F, IN PLAY) */}
                    <div className="grid grid-cols-4 gap-2 sm:gap-4">
                        <Button
                            onClick={handleBall}
                            className="h-16 sm:h-20 rounded-[20px] bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xl sm:text-2xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex flex-col gap-0.5"
                        >
                            <span>B</span>
                            <span className="text-[10px] sm:text-xs font-bold opacity-80 tracking-widest">ボール</span>
                        </Button>

                        <Button
                            onClick={handleStrike}
                            className="h-16 sm:h-20 rounded-[20px] bg-amber-500 hover:bg-amber-600 text-white font-black text-xl sm:text-2xl shadow-lg shadow-amber-500/20 active:scale-95 transition-all flex flex-col gap-0.5"
                        >
                            <span>S</span>
                            <span className="text-[10px] sm:text-xs font-bold opacity-80 tracking-widest">見逃し</span>
                        </Button>

                        <Button
                            onClick={handleFoul}
                            className="h-16 sm:h-20 rounded-[20px] bg-amber-500/80 hover:bg-amber-600 text-white font-black text-xl sm:text-2xl shadow-lg shadow-amber-500/20 active:scale-95 transition-all flex flex-col gap-0.5"
                        >
                            <span>F</span>
                            <span className="text-[10px] sm:text-xs font-bold opacity-80 tracking-widest">ファウル</span>
                        </Button>

                        {/* 💡 IN PLAYボタン（打球方向モーダルを開く） */}
                        <Button
                            onClick={() => setIsFieldModalOpen(true)}
                            className="h-16 sm:h-20 rounded-[20px] bg-primary hover:bg-primary/90 text-primary-foreground font-black text-sm sm:text-xl shadow-lg shadow-primary/30 active:scale-95 transition-all flex flex-col gap-0.5 relative overflow-hidden group"
                        >
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                            <span className="leading-tight mt-1 relative z-10">IN PLAY</span>
                            <span className="text-[10px] sm:text-xs font-bold opacity-90 tracking-widest relative z-10">打って</span>
                        </Button>
                    </div>

                    {/* サブアクション (空振り、牽制、盗塁、アウト、選手交代など) */}
                    <div className="grid grid-cols-5 gap-2 sm:gap-3">
                        <Button onClick={handleSwingAndMiss} variant="outline" className="h-12 sm:h-14 rounded-[16px] border-border/50 bg-background/50 backdrop-blur-sm font-bold text-[10px] sm:text-xs shadow-sm hover:bg-muted active:scale-95 transition-all text-muted-foreground">
                            空振り
                        </Button>

                        <Button variant="outline" className="h-12 sm:h-14 rounded-[16px] border-border/50 bg-background/50 backdrop-blur-sm font-bold text-[10px] sm:text-xs shadow-sm hover:bg-muted active:scale-95 transition-all text-muted-foreground">
                            牽制
                        </Button>

                        <Button variant="outline" className="h-12 sm:h-14 rounded-[16px] border-border/50 bg-background/50 backdrop-blur-sm font-bold text-[10px] sm:text-xs shadow-sm hover:bg-muted active:scale-95 transition-all text-muted-foreground">
                            盗塁/暴投
                        </Button>

                        {/* 💡 選手交代ボタン（交代モーダルを開く） */}
                        <Button onClick={() => setIsSubstitutionModalOpen(true)} variant="outline" className="h-12 sm:h-14 rounded-[16px] border-primary/20 bg-primary/5 hover:bg-primary/10 font-bold text-[10px] sm:text-xs shadow-sm active:scale-95 transition-all text-primary">
                            選手交代
                        </Button>

                        <Button onClick={handleOut} variant="outline" className="h-12 sm:h-14 rounded-[16px] border-red-500/20 bg-red-500/5 hover:bg-red-500/10 hover:text-red-600 font-bold text-[10px] sm:text-xs shadow-sm active:scale-95 transition-all text-red-500">
                            アウト
                        </Button>
                    </div>

                </div>
            </div>

            {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            {/* 💡 各種モーダルのマウント領域 */}
            {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            <FieldModal
                open={isFieldModalOpen}
                onOpenChange={setIsFieldModalOpen}
                onNext={(positionId) => {
                    // 1. 打球方向が決まったら FieldModal を閉じる
                    setIsFieldModalOpen(false);
                    // 2. ほんの少し遅延させて AdvanceModal を開く（滑らかなUXのため）
                    setTimeout(() => setIsAdvanceModalOpen(true), 150);
                }}
            />

            <AdvanceModal
                open={isAdvanceModalOpen}
                onOpenChange={setIsAdvanceModalOpen}
                onComplete={(resultId) => {
                    // 3. 全ての結果が確定したら、ここでDBに保存処理などを走らせる！
                    console.log("プレイ確定！", resultId);
                }}
            />
        </>
    );
}