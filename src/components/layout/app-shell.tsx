"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { FloatingNavigation } from "@/components/floating-nav";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("dashboard");

  useEffect(() => {
    if (pathname?.startsWith("/team")) setActiveTab("team");
    else if (pathname?.startsWith("/players")) setActiveTab("players");
    else if (pathname?.startsWith("/tournaments/map")) setActiveTab("map");
    else if (pathname?.startsWith("/dashboard")) setActiveTab("dashboard");
  }, [pathname]);

  const handleNavigate = (path: string, tabId: string) => {
    setActiveTab(tabId);
    router.push(path);
  };

  const handleOpenDrawer = () => {
    console.log("Drawer open");
  };

  const isAuthPage = pathname === "/" || pathname?.startsWith("/login") || pathname?.startsWith("/register");

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    // 🔥 修正ポイント: bg-background を bg-transparent に変更！
    // これにより、globals.css の背景がバッチリ透けて見えます！
    <div className="relative min-h-screen flex flex-col bg-transparent">

      <Header />

      <main className="flex-1 w-full relative">
        {children}
      </main>

      <FloatingNavigation
        activeTab={activeTab}
        onNavigate={handleNavigate}
        onOpenDrawer={handleOpenDrawer}
      />
    </div>
  );
}
