// src/components/features/teams/team-member-remove-modal.tsx
"use client";

import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { AlertCircle, Loader2 } from "lucide-react";
import type { TeamMember } from "./team-member-card";

interface TeamMemberRemoveModalProps {
  member: TeamMember;
  isRemoving: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function TeamMemberRemoveModal({ member, isRemoving, onConfirm, onCancel }: TeamMemberRemoveModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/40 dark:bg-background/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={onCancel} />
      <div className="w-full max-w-sm bg-card/95 dark:bg-card/90 backdrop-blur-xl rounded-3xl border border-border/60 shadow-2xl p-6 space-y-5 animate-in slide-in-from-bottom-4 duration-300 relative z-10">
        <div className="flex items-start gap-3.5">
          <div className="h-11 w-11 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0 border border-red-500/20">
            <AlertCircle className="h-5 w-5 text-red-500" />
          </div>
          <div className="space-y-0.5">
            <h3 className="font-black text-base text-foreground tracking-tight">メンバーを除名しますか？</h3>
            <p className="text-xs text-muted-foreground font-medium">この操作は取り消せません。対象ユーザーはチームへのアクセス権を失います。</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-2xl bg-muted/50 dark:bg-muted/20 border border-border/40 shadow-inner">
          <Avatar className="h-9 w-9 shrink-0 border border-border/50">
            <AvatarImage src={member.avatarUrl ?? ""} />
            <AvatarFallback className="bg-primary/10 text-primary font-black text-xs">
              {(member.name || "?").slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-black text-foreground truncate">{member.name}</p>
            <p className="text-[11px] text-muted-foreground truncate mt-0.5 font-medium">{member.email}</p>
          </div>
        </div>

        <div className="flex gap-2.5 pt-1">
          <Button variant="outline" onClick={onCancel} disabled={isRemoving}
            className="flex-1 rounded-xl font-bold border-border/60 hover:bg-muted hover:text-foreground h-11 transition-all">
            キャンセル
          </Button>
          <Button onClick={onConfirm} disabled={isRemoving}
            className="flex-1 rounded-xl font-black bg-red-500 hover:bg-red-600 text-white border-0 h-11 shadow-sm transition-all active:scale-98">
            {isRemoving ? <Loader2 className="h-4 w-4 animate-spin" /> : "除名する"}
          </Button>
        </div>
      </div>
    </div>
  );
}
