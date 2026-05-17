// src/components/features/teams/team-summary-cards.tsx
"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface TeamSummaryCardsProps {
  totalCount: number;
  pendingCount: number;
  managerCount: number;
}

export function TeamSummaryCards({ totalCount, pendingCount, managerCount }: TeamSummaryCardsProps) {
  const items = [
    { label: "Total Members", value: totalCount, color: "text-foreground" },
    { 
      label: "Pending", 
      value: pendingCount, 
      color: pendingCount > 0 ? "text-orange-500" : "text-muted-foreground" 
    },
    { label: "Managers", value: managerCount, color: "text-amber-500" },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {items.map(({ label, value, color }) => (
        <Card key={label} className="bg-card/40 border-border/40 rounded-2xl shadow-none">
          <CardContent className="p-4 text-center">
            <p className={cn("text-3xl font-black tabular-nums", color)}>{value}</p>
            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-wider mt-1">{label}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
