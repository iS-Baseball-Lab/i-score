// filepath: `src/components/layout/EmptyState.tsx`
import React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, className }: EmptyStateProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center text-center p-10 rounded-3xl transition-all",
      // 💡 透過度を 60% (bg-card/60) に設定。backdrop-blurを薄くかけて洗練さをプラス。
      "bg-card/50 border-2 border-dashed border-border/40 shadow-xs",
      className
    )}>
      {/* アイコン周りも少し透けさせて馴染ませる */}
      <div className="p-4 bg-primary/5 rounded-full mb-4 border border-primary/5">
        <Icon className="h-8 w-8 text-primary/30" />
      </div>

      <h3 className="text-base font-black text-foreground/70 uppercase tracking-wider leading-tight">
        {title}
      </h3>

      {description && (
        <p className="text-[10px] sm:text-xs font-bold text-muted-foreground/50 uppercase tracking-[0.3em] mt-3">
          {description}
        </p>
      )}
    </div>
  );
}
