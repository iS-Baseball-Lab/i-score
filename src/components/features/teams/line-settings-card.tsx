// filepath: src/components/features/teams/line-settings-card.tsx
"use client";

import React, { useState } from "react";
import { MessageCircle, Save, ShieldCheck, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Team } from "@/types/match";
import { cn } from "@/lib/utils";

interface LineSettingsCardProps {
  team: Team;
  onSave: (settings: Partial<Team>) => Promise<void>;
}

export function LineSettingsCard({ team, onSave }: LineSettingsCardProps) {
  const [groupId, setGroupId] = useState(team.lineGroupId || "");
  const [isEnabled, setIsEnabled] = useState(team.isAutoReportEnabled);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await onSave({ lineGroupId: groupId, isAutoReportEnabled: isEnabled });
    setIsSaving(false);
  };

  return (
    <div className="bg-secondary/20 border-2 border-border/50 rounded-[30px] p-6 space-y-6 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="bg-[#06C755] p-2 rounded-xl">
          <MessageCircle className="w-6 h-6 text-white fill-white" />
        </div>
        <div>
          <h3 className="text-lg font-black tracking-tighter uppercase italic">LINE速報連携</h3>
          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Messaging API Protocol</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-black ml-2 text-primary uppercase">Group ID</label>
          <Input
            value={groupId}
            onChange={(e) => setGroupId(e.target.value)}
            placeholder="Cxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
            className="h-14 rounded-2xl bg-background border-2 focus-visible:ring-primary font-mono text-sm"
          />
          <p className="text-[10px] text-muted-foreground ml-2 flex items-center gap-1 font-bold">
            <Info className="w-3 h-3" />
            Webhookで取得した ID を入力してください
          </p>
        </div>

        {/* 💡 脱・グラスモーフィズム：ソリッドな背景で視認性を確保 */}
        <div className="bg-background rounded-2xl p-4 flex items-center justify-between border border-border/50">
          <div className="space-y-1">
            <span className="text-sm font-black italic">自動速報を有効にする</span>
            <p className="text-[10px] text-muted-foreground font-bold">試合経過が自動でグループに送信されます</p>
          </div>
          <Switch 
            checked={isEnabled} 
            onCheckedChange={setIsEnabled}
            className="data-[state=checked]:bg-[#06C755]"
          />
        </div>
      </div>

      <Button
        onClick={handleSave}
        disabled={isSaving}
        className={cn(
          "w-full h-16 rounded-[25px] text-xl font-black italic gap-2 shadow-lg transition-all active:scale-95",
          isSaving ? "bg-muted text-muted-foreground" : "bg-primary text-primary-foreground hover:bg-primary/90"
        )}
      >
        <Save className="w-6 h-6" />
        {isSaving ? "保存中..." : "設定を保存する"}
      </Button>
    </div>
  );
}
