// src/components/logo.tsx
import * as React from "react";
import { cn } from "@/lib/utils";

export function LogoIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("text-primary", className)}
    >
      {/* ボールの外枠 */}
      <circle cx="12" cy="12" r="10" strokeWidth="2.5" />

      {/* 野球ボールの美しい縫い目のカーブ */}
      <path d="M6.5 3.5a9.5 9.5 0 0 1 0 17" className="opacity-80" />
      <path d="M17.5 3.5a9.5 9.5 0 0 0 0 17" className="opacity-80" />

      {/* 真ん中に浮かぶデジタルスコア「0-0」の意匠 */}
      <rect x="9.5" y="9.5" width="1.5" height="5" rx="0.5" fill="currentColor" stroke="none" />
      <rect x="13" y="9.5" width="1.5" height="5" rx="0.5" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  );
}