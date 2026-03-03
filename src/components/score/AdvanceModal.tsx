// src/components/score/AdvanceModal.tsx
import { Button } from "@/components/ui/button";
import { X, FastForward } from "lucide-react";

interface AdvanceModalProps {
    show: boolean;
    onClose: () => void;
    firstBase: boolean;
    secondBase: boolean;
    thirdBase: boolean;
    // どの塁から、どの塁へ、アウトになったか、ログに表示するテキスト
    onAdvance: (fromBase: 1 | 2 | 3, toBase: 2 | 3 | 4, isOut: boolean, logText: string) => void;
}

export function AdvanceModal({ show, onClose, firstBase, secondBase, thirdBase, onAdvance }: AdvanceModalProps) {
    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-background/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-[320px] bg-card border border-border rounded-2xl p-5 shadow-2xl flex flex-col relative animate-in zoom-in-95 duration-200">
                <Button variant="ghost" size="icon" className="absolute top-3 right-3 rounded-full text-muted-foreground hover:bg-muted" onClick={onClose}>
                    <X className="h-5 w-5" />
                </Button>

                <h2 className="text-lg font-black tracking-tight mb-1 flex items-center gap-2">
                    <FastForward className="h-5 w-5 text-primary" /> 盗塁・進塁
                </h2>
                <p className="text-xs text-muted-foreground mb-4">結果を選択してください</p>

                {/* 塁上に誰もいない場合の表示 */}
                {!firstBase && !secondBase && !thirdBase && (
                    <div className="text-sm font-bold text-muted-foreground text-center py-6 bg-muted/20 rounded-xl">
                        現在、塁上にランナーがいません
                    </div>
                )}

                <div className="space-y-3">
                    {/* 3塁ランナーの操作 */}
                    {thirdBase && (
                        <div className="space-y-1.5 bg-orange-500/10 border border-orange-500/20 p-3 rounded-xl">
                            <p className="text-xs font-black text-orange-600">3塁ランナー</p>
                            <div className="grid grid-cols-2 gap-2">
                                <Button size="sm" className="bg-background text-foreground border border-border shadow-sm hover:bg-blue-500 hover:text-white hover:border-blue-500 font-bold" onClick={() => onAdvance(3, 4, false, '本盗 (ホームスチール) 成功')}>本盗 成功</Button>
                                <Button size="sm" className="bg-background text-foreground border border-border shadow-sm hover:bg-red-500 hover:text-white hover:border-red-500 font-bold" onClick={() => onAdvance(3, 4, true, '本盗 失敗 (タッチアウト)')}>本盗 失敗</Button>
                            </div>
                        </div>
                    )}

                    {/* 2塁ランナーの操作 */}
                    {secondBase && (
                        <div className="space-y-1.5 bg-primary/5 border border-primary/10 p-3 rounded-xl">
                            <p className="text-xs font-black text-primary">2塁ランナー</p>
                            <div className="grid grid-cols-2 gap-2">
                                <Button size="sm" className="bg-background text-foreground border border-border shadow-sm hover:bg-blue-500 hover:text-white hover:border-blue-500 font-bold" onClick={() => onAdvance(2, 3, false, '三盗 成功')}>三盗 成功</Button>
                                <Button size="sm" className="bg-background text-foreground border border-border shadow-sm hover:bg-red-500 hover:text-white hover:border-red-500 font-bold" onClick={() => onAdvance(2, 3, true, '三盗 失敗 (タッチアウト)')}>三盗 失敗</Button>
                            </div>
                        </div>
                    )}

                    {/* 1塁ランナーの操作 */}
                    {firstBase && (
                        <div className="space-y-1.5 bg-primary/5 border border-primary/10 p-3 rounded-xl">
                            <p className="text-xs font-black text-primary">1塁ランナー</p>
                            <div className="grid grid-cols-2 gap-2">
                                <Button size="sm" className="bg-background text-foreground border border-border shadow-sm hover:bg-blue-500 hover:text-white hover:border-blue-500 font-bold" onClick={() => onAdvance(1, 2, false, '二盗 成功')}>二盗 成功</Button>
                                <Button size="sm" className="bg-background text-foreground border border-border shadow-sm hover:bg-red-500 hover:text-white hover:border-red-500 font-bold" onClick={() => onAdvance(1, 2, true, '二盗 失敗 (タッチアウト)')}>二盗 失敗</Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}