// src/components/logo.tsx
import * as React from "react";
import { cn } from "@/lib/utils";

// 💡 生成されたロゴ（image_4.png）のSVGデータ
export function LogoIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("text-primary", className)}
    >
      <circle cx="12" cy="12" r="10" />
      {/* 野球ボールの縫い目 */}
      <path d="M12 2a14.5 14.5 0 0 1 0 20" />
      <path d="M2 12h20" />
      {/* 💡 iの点としての星（★）は、テキスト部分で実装するため、ここではアイコンのみ */}
    </svg>
  );
}
