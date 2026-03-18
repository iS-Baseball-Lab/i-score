// src/components/logo.tsx
import Image from "next/image";
import { cn } from "@/lib/utils";

export function LogoIcon({ className }: { className?: string }) {
  return (
    <div className={cn("relative overflow-hidden rounded-full", className)}>
      <Image
        src="/logo.png"
        alt="i-Score Logo"
        fill
        className="object-contain"
      />
    </div>
  );
}