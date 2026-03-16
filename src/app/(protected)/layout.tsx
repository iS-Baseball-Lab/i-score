// src/app/(protected)/layout.tsx
"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import React from "react";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();

  React.useEffect(() => {
    if (!isPending && !session) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  if (isPending) {
    return <div className="flex h-screen items-center justify-center">読み込み中...</div>;
  }

  if (!session) {
    return null;
  }

  return (
    // 💡 幅を 260px から 280px に拡張
    <div className="md:pl-[280px] flex flex-col min-h-screen w-full transition-all duration-300">
      {children}
    </div>
  );
}