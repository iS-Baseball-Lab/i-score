// src/components/features/teams/team-invite-card.tsx
"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Check, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";

interface TeamInviteCardProps {
  inviteCode: string;
}

export function TeamInviteCard({ inviteCode }: TeamInviteCardProps) {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopyCode = async () => {
    if (!inviteCode) return;
    try {
      await navigator.clipboard.writeText(inviteCode);
      setIsCopied(true);
      toast.success("招待コードをコピーしました！");
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      toast.error("クリップボードへのコピーに失敗しました");
    }
  };

  return (
    <Card className="bg-primary/5 border-primary/20 rounded-2xl overflow-hidden relative">
      <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
      <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-black flex items-center gap-1.5 text-primary">
            <UserPlus className="h-4 w-4" />
            チーム招待コード
          </h3>
          <p className="text-xs text-muted-foreground mt-1 font-medium">
            このコードを共有して、新しいメンバーをチームに招待しましょう。
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="bg-background border border-border/50 rounded-xl px-4 py-2 flex-1 sm:flex-none text-center sm:text-left min-w-[140px]">
            <code className="text-lg font-black tracking-widest text-foreground select-all">
              {inviteCode}
            </code>
          </div>
          <Button
            onClick={handleCopyCode}
            variant={isCopied ? "default" : "outline"}
            className={cn(
              "h-11 px-4 rounded-xl transition-all font-bold shrink-0",
              isCopied 
                ? "bg-green-500 hover:bg-green-600 text-white border-green-500" 
                : "border-border/50 hover:bg-muted"
            )}
          >
            {isCopied ? (
              <><Check className="h-4 w-4 mr-1.5" /> コピー完了</>
            ) : (
              <><Copy className="h-4 w-4 mr-1.5" /> コピー</>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
