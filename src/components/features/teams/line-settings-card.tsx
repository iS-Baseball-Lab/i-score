// filepath: src/components/features/teams/line-settings-card.tsx
/* 💡 iScoreCloud 規約: 
   1. コンポーネント内で直接 fetch せず、Props の onSave を実行して責務を分離する。
   2. 脱・グラスモーフィズム。ソリッドな背景（bg-secondary/10）でコントラストを最大化。
   3. 現場での操作性を考え、スイッチやボタンを大型化する。 */

"use client";

import React, { useState } from "react";
import { MessageCircle, Save, Info, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

interface LineSettingsCardProps {
    teamId: string;
    initialGroupId?: string;
    initialIsEnabled: boolean;
    // 🌟 修正：親コンポーネント（page.tsx）から保存関数を受け取る
    onSave: (settings: { lineGroupId: string; isAutoReportEnabled: boolean }) => Promise<void>;
}

export function LineSettingsCard({ teamId, initialGroupId, initialIsEnabled, onSave }: LineSettingsCardProps) {
    const [groupId, setGroupId] = useState(initialGroupId || "");
    const [isEnabled, setIsEnabled] = useState(initialIsEnabled);
    const [isSaving, setIsSaving] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    // 🌟 修正：内部で fetch せず、親の関数を呼ぶ
    const handleSaveClick = async () => {
        setIsSaving(true);
        setIsSuccess(false);

        try {
            // 親（page.tsx）の handleSave を実行
            await onSave({ 
                lineGroupId: groupId, 
                isAutoReportEnabled: isEnabled 
            });
            
            // 成功時の演出
            setIsSuccess(true);
            setTimeout(() => setIsSuccess(false), 3000);
        } catch (error) {
            console.error("Card save interaction failed", error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="w-full bg-secondary/10 border-2 border-border/80 rounded-[40px] p-6 space-y-6">
            <div className="flex items-center gap-4">
                <div className="bg-[#06C755] p-3 rounded-2xl">
                    <MessageCircle className="w-8 h-8 text-white fill-white" />
                </div>
                <div>
                    <h2 className="text-xl font-black italic tracking-tighter uppercase text-primary">LINE速報・連携設定</h2>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">Messaging API Protocol</p>
                </div>
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="text-xs font-black ml-2 uppercase text-primary">連携先グループ ID</label>
                    <Input
                        value={groupId}
                        onChange={(e) => setGroupId(e.target.value)}
                        placeholder="Cxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                        className="h-14 rounded-2xl border-2 bg-background font-mono text-sm focus-visible:ring-primary"
                    />
                    <div className="flex items-start gap-2 ml-2">
                        <Info className="w-3 h-3 mt-0.5 text-muted-foreground" />
                        <p className="text-[10px] font-medium text-muted-foreground leading-tight">
                            公式アカウントを招待し、「ID」と送信して取得したIDを入力してください。
                        </p>
                    </div>
                </div>

                <div className="flex items-center justify-between p-5 bg-background rounded-2xl border-2 border-border/50">
                    <div className="space-y-0.5">
                        <p className="text-sm font-black italic">自動速報を有効にする</p>
                        <p className="text-[10px] font-bold text-muted-foreground">試合中の得点経過などを自動で送信します</p>
                    </div>
                    <Switch
                        checked={isEnabled}
                        onCheckedChange={setIsEnabled}
                        className="data-[state=checked]:bg-[#06C755]"
                    />
                </div>
            </div>

            <Button
                onClick={handleSaveClick} // 🌟 修正したハンドラをセット
                disabled={isSaving}
                className={`w-full h-16 rounded-[25px] text-xl font-black italic gap-2 transition-all active:scale-95 shadow-lg ${
                    isSuccess ? "bg-green-600 hover:bg-green-600 text-white" : "bg-primary text-primary-foreground"
                }`}
            >
                {isSaving ? (
                    "保存中..."
                ) : isSuccess ? (
                    <><CheckCircle2 className="w-6 h-6" />保存完了</>
                ) : (
                    <><Save className="w-6 h-6" />設定を保存する</>
                )}
            </Button>
        </div>
    );
}
