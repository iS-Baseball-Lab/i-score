// src/components/header.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogoIcon } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { authClient } from "@/lib/auth-client";
import { canManageTeam } from "@/lib/roles";
import { toast } from "sonner";
import { ClipboardList, ShieldAlert, UserCog, Menu, Users, Trophy, History, PlusSquare, UserCheck, Settings } from "lucide-react";
import { RiTeamFill } from "react-icons/ri";
import { cn } from "@/lib/utils";

import { Sidebar, NavItem } from "./sidebar";
import { MobileDrawer } from "./mobile-drawer";

export function Header() {
  const [mounted, setMounted] = React.useState(false);
  const pathname = usePathname();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (pathname?.includes("/matches/score")) return null;

  if (!mounted) {
    return (
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md text-foreground">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-4">
            <div className="md:hidden h-10 w-10" />
            <Link href="/" className="flex items-center space-x-2">
              <span className="font-extrabold italic text-2xl tracking-tighter text-primary">i-Score</span>
            </Link>
          </div>
        </div>
      </header>
    );
  }

  return <HeaderContent />;
}

function HeaderContent() {
  const { data: session } = authClient.useSession();
  const router = useRouter();
  const pathname = usePathname();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = React.useState(false);
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  const userRole = (session?.user as unknown as { role?: string })?.role;
  const isManager = canManageTeam(userRole);
  const isSaaSMode = !!session;

  React.useEffect(() => {
    const saved = localStorage.getItem("iScore_sidebarCollapsed");
    if (saved === "true") {
      setIsCollapsed(true);
      document.documentElement.style.setProperty('--sidebar-width', '84px');
    } else {
      document.documentElement.style.setProperty('--sidebar-width', '300px');
    }
  }, []);

  const toggleSidebar = () => {
    const next = !isCollapsed;
    setIsCollapsed(next);
    localStorage.setItem("iScore_sidebarCollapsed", String(next));
    document.documentElement.style.setProperty('--sidebar-width', next ? '84px' : '300px');
  };

  const mainNavItems: NavItem[] = [
    { name: "ダッシュボード", href: "/dashboard", icon: ClipboardList, show: !!session },
    // 💡 チームメニューに exact: true を指定！
    { name: "チーム", href: "/teams", icon: RiTeamFill, show: !!session, exact: true },
    { name: "選手名簿", href: "/teams/roster", icon: Users, show: !!session },
    { name: "大会管理", href: "/tournaments", icon: Trophy, show: !!session },
    { name: "試合記録", href: "/matches/history", icon: History, show: !!session },
  ];

  const bottomNavItems: NavItem[] = [
    { name: "アカウント設定", href: "/user", icon: UserCog, show: !!session },
    { name: "システム管理", href: "/admin", icon: ShieldAlert, show: !!session && isManager },
    { name: "大会管理", href: "/tournaments/register", icon: PlusSquare, show: !!session },
    { name: "参加申請", href: "/teams/requests", icon: UserCheck, show: !!session, badge: 1 },
    { name: "設定", href: "/settings", icon: Settings, show: !!session },
  ];

  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          setIsMobileMenuOpen(false);
          router.push("/login");
          router.refresh();
        },
      },
    });
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("画像サイズは5MB以下にしてください");
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/images/upload', { method: 'POST', body: formData });
      const data = await res.json() as { success: boolean; imageUrl?: string; error?: string };

      if (res.ok && data.success && data.imageUrl) {
        await authClient.updateUser({ image: data.imageUrl });
        toast.success('プロフィール画像を更新しました！');
        router.refresh();
      } else {
        toast.error(data.error || '画像のアップロードに失敗しました');
      }
    } catch (error) {
      toast.error('通信エラーが発生しました');
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <>
      <input type="file" accept="image/jpeg, image/png, image/webp" className="hidden" ref={fileInputRef} onChange={handleAvatarUpload} />

      <header className={cn(
        "sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md text-foreground transition-all duration-300",
        isSaaSMode ? "md:hidden" : "block"
      )}>
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden p-2 -ml-2 rounded-full hover:bg-muted/80 active:scale-95"><Menu className="h-6 w-6" /></button>
            <Link href="/" className="flex items-center gap-1 group transition-opacity hover:opacity-80">
              <LogoIcon className="h-10 w-10 transition-transform group-hover:scale-110 duration-300" />
              <span className="font-black italic text-2xl tracking-tighter text-foreground group-hover:text-primary transition-colors">i-Score</span>
            </Link>
          </div>
          <div className="flex items-center gap-2 sm:gap-4"><ThemeToggle /></div>
        </div>
      </header>

      {isSaaSMode && (
        <Sidebar
          session={session} pathname={pathname} isCollapsed={isCollapsed} toggleSidebar={toggleSidebar}
          mainNavItems={mainNavItems} bottomNavItems={bottomNavItems}
          onClickAvatar={() => fileInputRef.current?.click()} isUploadingAvatar={isUploadingAvatar} onLogout={handleLogout}
        />
      )}

      <MobileDrawer
        isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)}
        session={session} pathname={pathname}
        mainNavItems={mainNavItems} bottomNavItems={bottomNavItems}
        onClickAvatar={() => fileInputRef.current?.click()} isUploadingAvatar={isUploadingAvatar} onLogout={handleLogout}
      />
    </>
  );
}
