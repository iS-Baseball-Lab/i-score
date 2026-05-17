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
    <Card className="bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-md border-border/60 rounded-2xl overflow-hidden relative shadow-md group">
      <div className="absolute top-0 left-0 w-1 h-full bg-primary transition-all duration-300 group-hover:h-full group-hover:w-1.5" />
      <CardContent className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
        <div className="space-y-1">
          <h3 className="text-sm font-black flex items-center gap-2 text-primary uppercase tracking-wider">
            <UserPlus className="h-4 w-4" />
            Invitation Code
          </h3>
          <p className="text-xs text-muted-foreground font-medium leading-relaxed">
            このコードを共有して、新しいメンバーをチームに招待しましょう。
          </p>
        </div>
        <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0">
          <div className="bg-muted/60 dark:bg-muted/30 border border-border/50 rounded-xl px-4 py-2 flex-1 sm:flex-none text-center sm:text-left min-w-[150px] shadow-inner">
            <code className="text-lg font-black tracking-widest text-foreground font-mono select-all">
              {inviteCode}
            </code>
          </div>
          <Button
            onClick={handleCopyCode}
            variant={isCopied ? "default" : "outline"}
            className={cn(
              "h-11 px-4 rounded-xl transition-all duration-200 font-black tracking-wide shrink-0 shadow-sm",
              isCopied 
                ? "bg-green-600 hover:bg-green-600 text-white border-green-600" 
                : "border-border/60 hover:bg-muted hover:text-foreground"
            )}
          >
            {isCopied ? (
              <><Check className="h-4 w-4 mr-1.5 stroke-[3]" /> COPIED</>
            ) : (
              <><Copy className="h-4 w-4 mr-1.5" /> COPY</>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
