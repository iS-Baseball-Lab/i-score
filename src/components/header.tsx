// src/components/header.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogoIcon } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { canManageTeam } from "@/lib/roles";
import { toast } from "sonner";
import { UserCircle, LogOut, Menu, X, Home, ClipboardList, ShieldAlert, Camera, Loader2, UserCog, ChevronLeft, ChevronRight } from "lucide-react";
import { RiTeamFill } from "react-icons/ri";
import { cn } from "@/lib/utils";

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
          <div className="h-8 w-8" />
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
  const closeMenu = () => setIsMobileMenuOpen(false);

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = React.useState(false);

  const userRole = (session?.user as unknown as { role?: string })?.role;
  const isManager = canManageTeam(userRole);

  const isSaaSMode = !!session;

  const [isCollapsed, setIsCollapsed] = React.useState(false);

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

  const mainNavItems = [
    { name: "ダッシュボード", href: "/dashboard", icon: ClipboardList, show: !!session },
    { name: "チーム", href: "/teams", icon: RiTeamFill, show: !!session },
  ];

  const bottomNavItems = [
    { name: "アカウント設定", href: "/user", icon: UserCog, show: !!session },
    { name: "システム管理", href: "/admin", icon: ShieldAlert, show: !!session && isManager },
  ];

  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          closeMenu();
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

      const res = await fetch('/api/images/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json() as { success: boolean; imageUrl?: string; error?: string };

      if (res.ok && data.success && data.imageUrl) {
        await authClient.updateUser({ image: data.imageUrl });
        toast.success('プロフィール画像を更新しました！');
        router.refresh();
      } else {
        toast.error(data.error || '画像のアップロードに失敗しました');
      }
    } catch (error) {
      console.error(error);
      toast.error('通信エラーが発生しました');
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <>
      <input type="file" accept="image/jpeg, image/png, image/webp" className="hidden" ref={fileInputRef} onChange={handleAvatarUpload} />

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {/* 📱 トップヘッダー (未ログインPC ＆ 全スマホ用) */}
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
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

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {/* 💻 PC用 左サイドバー (SaaSモード) */}
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {isSaaSMode && (
        <aside className="hidden md:flex fixed inset-y-0 left-0 z-50 flex-col border-r border-border/50 bg-card/95 backdrop-blur-xl shadow-[4px_0_24px_rgba(0,0,0,0.02)] transition-[width] duration-300 ease-in-out w-[var(--sidebar-width,300px)]">

          <button
            onClick={toggleSidebar}
            className="absolute -right-3.5 top-10 bg-background border border-border/50 rounded-full p-1.5 shadow-sm text-muted-foreground hover:text-primary hover:scale-110 transition-all z-50 flex items-center justify-center"
          >
            {isCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
          </button>

          {/* 1. ロゴエリア */}
          <div className={cn("h-20 flex items-center border-b border-border/40 shrink-0 transition-all duration-300", isCollapsed ? "justify-center px-0" : "px-8")}>
            <Link href="/" className="flex items-center gap-2 group transition-opacity hover:opacity-80">
              <LogoIcon className={cn("transition-transform duration-300", isCollapsed ? "h-8 w-8" : "h-9 w-9 group-hover:scale-110")} />
              {!isCollapsed && <span className="font-black italic text-2xl tracking-tighter text-foreground group-hover:text-primary transition-colors">i-Score</span>}
            </Link>
          </div>

          {/* 2. メインメニューリンク */}
          <div className={cn("flex-1 overflow-y-auto py-6 scrollbar-hide flex flex-col transition-all duration-300", isCollapsed ? "px-3" : "px-5")}>
            {/* 💡 gap-1.5 を gap-1 に縮小 */}
            <nav className="flex flex-col gap-1">
              {!isCollapsed && <div className="px-3 mb-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Main Menu</div>}
              {mainNavItems.map((item) => {
                if (!item.show) return null;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href} href={item.href} title={isCollapsed ? item.name : undefined}
                    className={cn(
                      "flex items-center transition-all duration-300 group",
                      // 💡 py-3.5 を py-2.5 に縮め、丸みも少しシャープに(rounded-[14px])
                      isCollapsed ? "justify-center h-10 w-10 rounded-[14px] mx-auto" : "gap-3 px-4 py-2.5 rounded-[14px]",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 font-black scale-[1.02]"
                        : "text-muted-foreground font-bold hover:bg-muted/80 hover:text-foreground active:scale-[0.98]"
                    )}
                  >
                    <item.icon className={cn("transition-transform duration-300", isCollapsed ? "h-[20px] w-[20px]" : "h-[18px] w-[18px]", isActive && !isCollapsed ? "scale-110" : "group-hover:scale-110")} />
                    {!isCollapsed && <span>{item.name}</span>}
                  </Link>
                );
              })}
            </nav>

            {/* 3. 設定・管理メニュー（下部に配置） */}
            {/* 💡 gap-1.5 を gap-1 に縮小 */}
            <nav className="flex flex-col gap-1 mt-auto pt-8">
              {!isCollapsed && <div className="px-3 mb-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Settings & Admin</div>}
              {bottomNavItems.map((item) => {
                if (!item.show) return null;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href} href={item.href} title={isCollapsed ? item.name : undefined}
                    className={cn(
                      "flex items-center transition-all duration-300 group",
                      // 💡 py-3.5 を py-2.5 に縮め、丸みも少しシャープに(rounded-[14px])
                      isCollapsed ? "justify-center h-10 w-10 rounded-[14px] mx-auto" : "gap-3 px-4 py-2.5 rounded-[14px]",
                      isActive
                        ? "bg-primary/10 text-primary font-black"
                        : "text-muted-foreground font-bold hover:bg-muted/80 hover:text-foreground active:scale-[0.98]"
                    )}
                  >
                    <item.icon className={cn("transition-transform duration-300", isCollapsed ? "h-[20px] w-[20px]" : "h-[18px] w-[18px]", isActive && !isCollapsed ? "scale-110" : "group-hover:scale-110")} />
                    {!isCollapsed && <span>{item.name}</span>}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* 4. ユーザープロフィール ＆ 設定エリア (下部固定) */}
          <div className={cn("mt-auto border-t border-border/40 bg-muted/10 flex flex-col shrink-0 transition-all duration-300", isCollapsed ? "p-3 gap-4 items-center" : "p-5 gap-4")}>
            <div className={cn("flex items-center", isCollapsed ? "justify-center" : "gap-3")}>
              <div
                className="relative h-11 w-11 rounded-full border border-border/50 shadow-sm bg-background flex items-center justify-center overflow-hidden cursor-pointer group shrink-0 transition-transform hover:border-primary/50 active:scale-95"
                onClick={() => fileInputRef.current?.click()}
                title={isCollapsed ? "プロフィール画像を変更" : undefined}
              >
                {isUploadingAvatar ? (
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                ) : session.user.image ? (
                  <img src={session.user.image} alt={session.user.name} className="h-full w-full object-cover" />
                ) : (
                  <UserCircle className="h-7 w-7 text-muted-foreground" />
                )}
                {!isUploadingAvatar && (
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <Camera className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>
              {!isCollapsed && (
                <div className="flex flex-col overflow-hidden">
                  <span className="text-sm font-black text-foreground truncate">{session.user.name}</span>
                  <span className="text-[10px] font-bold text-muted-foreground truncate uppercase tracking-widest">{session.user.email}</span>
                </div>
              )}
            </div>

            <div className={cn("flex items-center", isCollapsed ? "flex-col gap-3" : "gap-2")}>
              <div className={cn("bg-background rounded-[12px] border border-border/50 shadow-sm flex items-center justify-center gap-2 transition-all", isCollapsed ? "h-11 w-11 p-0" : "flex-1 h-[42px] p-1")}>
                <ThemeToggle />
                {!isCollapsed && <span className="text-xs font-bold text-muted-foreground mr-2">テーマ</span>}
              </div>
              <Button variant="outline" size="icon" onClick={handleLogout} className={cn("shrink-0 rounded-[12px] border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-colors shadow-sm", isCollapsed ? "h-11 w-11" : "h-[42px] w-[42px]")} title="ログアウト">
                <LogOut className="h-[16px] w-[16px]" />
              </Button>
            </div>
          </div>
        </aside>
      )}

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {/* 📱 スマホ用 ドロワーメニュー */}
      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm transition-opacity md:hidden" onClick={closeMenu} />
      )}
      <div className={cn(
        "fixed inset-y-0 left-0 z-[70] flex w-[300px] flex-col bg-card/95 backdrop-blur-xl border-r border-border/50 shadow-2xl transition-transform duration-300 ease-out md:hidden",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-16 items-center justify-between px-6 pt-2">
          <div className="flex items-center gap-2">
            <LogoIcon className="h-8 w-8" />
            <span className="font-black italic text-xl tracking-tighter">i-Score</span>
          </div>
          <button onClick={closeMenu} className="p-2 -mr-2 rounded-full bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground transition-all active:scale-95">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-1 flex-col overflow-y-auto py-6">
          {/* 💡 スマホメニューも gap-1, py-3 に縮小 */}
          <nav className="flex flex-col gap-1 px-4">
            <div className="px-4 mb-1 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Main Menu</div>
            {mainNavItems.map((item) => {
              if (!item.show) return null;
              const isActive = pathname === item.href;
              return (
                <Link key={item.href} href={item.href} onClick={closeMenu} className={cn("flex items-center gap-3 rounded-[14px] px-4 py-3 text-base font-bold transition-all duration-200", isActive ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 transform scale-[1.02]" : "text-muted-foreground hover:bg-muted hover:text-foreground active:scale-[0.98]")}>
                  <item.icon className={cn("h-5 w-5", isActive ? "text-primary-foreground" : "text-muted-foreground")} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <nav className="flex flex-col gap-1 px-4 mt-auto pt-8">
            <div className="px-4 mb-1 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Settings & Admin</div>
            {bottomNavItems.map((item) => {
              if (!item.show) return null;
              const isActive = pathname === item.href;
              return (
                <Link key={item.href} href={item.href} onClick={closeMenu} className={cn("flex items-center gap-3 rounded-[14px] px-4 py-3 text-base font-bold transition-all duration-200", isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground active:scale-[0.98]")}>
                  <item.icon className={cn("h-5 w-5", isActive ? "text-primary" : "text-muted-foreground")} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {session && (
          <div className="p-4 pb-8 mt-auto border-t border-border/40 bg-muted/10">
            <div className="rounded-[24px] bg-background border border-border/50 p-4 space-y-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="relative cursor-pointer shrink-0 active:scale-95 transition-transform" onClick={() => fileInputRef.current?.click()}>
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-muted border border-border/50 text-foreground shadow-sm overflow-hidden relative">
                    {isUploadingAvatar ? <Loader2 className="h-6 w-6 animate-spin text-primary" /> : session.user.image ? <img src={session.user.image} alt={session.user.name} className="h-full w-full object-cover" /> : <UserCircle className="h-8 w-8 text-muted-foreground" />}
                  </div>
                  {!isUploadingAvatar && <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground rounded-full p-1.5 shadow-md border-2 border-background"><Camera className="h-3.5 w-3.5" /></div>}
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="text-base font-black truncate">{session.user.name}</span>
                  <span className="text-[10px] font-bold text-muted-foreground truncate uppercase tracking-widest">{session.user.email}</span>
                </div>
              </div>
              <div className="flex items-center justify-center bg-muted/30 rounded-[16px] p-3 border border-border/50"><ThemeSwitcher /></div>
              <Button variant="outline" className="w-full rounded-[16px] h-12 border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white font-extrabold transition-colors" onClick={handleLogout}><LogOut className="mr-2 h-4 w-4" />ログアウト</Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}