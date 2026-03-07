// src/components/ui/select.tsx
import * as React from "react"
import { cn } from "@/lib/utils"

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, ...props }, ref) => {
    return (
      <select
        className={cn(
          // 💡 修正: `flex` を削除
          "block h-14 w-full appearance-none rounded-2xl border border-border/60 bg-muted/20 px-4 pr-10 text-base font-bold shadow-xs transition-all duration-300 cursor-pointer",
          "focus-visible:outline-none focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/20 focus-visible:bg-background focus-visible:shadow-md",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke-width%3D%222%22%20stroke%3D%22currentColor%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20d%3D%22M19%209l-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] bg-[length:16px_16px] bg-[position:right_16px_center] bg-no-repeat",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Select.displayName = "Select"

export { Select }
