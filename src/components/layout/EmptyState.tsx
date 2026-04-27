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
      // 💡 視認性向上：透過を抑え、カードの存在感を強調
      "bg-card border-2 border-dashed border-border/60 shadow-sm",
      className
    )}>
      <div className="p-4 bg-primary/5 rounded-full mb-4 border border-primary/10">
        <Icon className="h-8 w-8 text-primary/40" />
      </div>
      <h3 className="text-base font-black text-foreground/80 uppercase tracking-wider leading-tight">
        {title}
      </h3>
      {description && (
        <p className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-[0.2em] mt-3">
          {description}
        </p>
      )}
    </div>
  );
}
