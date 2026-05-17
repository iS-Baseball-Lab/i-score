// src/components/features/teams/team-member-summary-cards.tsx
"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface TeamMemberSummaryCardsProps {
  totalCount: number;
  pendingCount: number;
  managerCount: number;
}

export function TeamMemberSummaryCards({ totalCount, pendingCount, managerCount }: TeamMemberSummaryCardsProps) {
  const items = [
    { label: "Total Members", value: totalCount, color: "text-foreground" },
    { 
      label: "Pending", 
      value: pendingCount, 
      color: pendingCount > 0 ? "text-orange-500 animate-pulse" : "text-muted-foreground" 
    },
    { label: "Managers", value: managerCount, color: "text-amber-500" },
  ];

  return (
    <div className="grid grid-cols-3 gap-4">
      {items.map(({ label, value, color }) => (
        <Card key={label} className="bg-card/40 dark:bg-card/20 backdrop-blur-md border-border/50 rounded-2xl shadow-sm transition-all hover:border-border">
          <CardContent className="p-4 text-center">
            <p className={cn("text-3xl sm:text-4xl font-black tabular-nums tracking-tight", color)}>{value}</p>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1.5">{label}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
