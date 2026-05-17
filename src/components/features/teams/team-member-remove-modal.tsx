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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-card rounded-3xl border border-border/50 shadow-2xl p-6 space-y-5 animate-in slide-in-from-bottom-4 duration-300">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-red-500/10 flex items-center justify-center shrink-0">
            <AlertCircle className="h-6 w-6 text-red-500" />
          </div>
          <div>
            <h3 className="font-black text-base text-foreground">メンバーを除名しますか？</h3>
            <p className="text-xs text-muted-foreground mt-0.5">この操作は取り消せません</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 border border-border/40">
          <Avatar className="h-9 w-9 shrink-0">
            <AvatarImage src={member.avatarUrl ?? ""} />
            <AvatarFallback className="bg-primary/10 text-primary font-black text-xs">
              {(member.name || "?").slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-black">{member.name}</p>
            <p className="text-[11px] text-muted-foreground">{member.email}</p>
          </div>
        </div>

        <div className="flex gap-2 pt-1">
          <Button variant="outline" onClick={onCancel} disabled={isRemoving}
            className="flex-1 rounded-2xl font-bold border-border/50">
            キャンセル
          </Button>
          <Button onClick={onConfirm} disabled={isRemoving}
            className="flex-1 rounded-2xl font-black bg-red-500 hover:bg-red-600 text-white border-0">
            {isRemoving ? <Loader2 className="h-4 w-4 animate-spin" /> : "除名する"}
          </Button>
        </div>
      </div>
    </div>
  );
}
