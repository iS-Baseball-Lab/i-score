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
import {
  UserCircle,
  LogOut,
  Menu,
  X,
  Home,
  ClipboardList,
  ShieldAlert,
  Camera,
  Loader2
} from "lucide-react";
import { RiTeamFill } from "react-icons/ri";
import { cn } from "@/lib/utils";

export function Header() {
  const [mounted, setMounted] = React.useState(false);
  const pathname = usePathname();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (pathname?.includes("/matches/score")) {
    return null;
  }

  if (!mounted) {
    return (
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md text-foreground">
        <div className="container mx-auto max-w-4xl flex h-16 items-center justify-between px-4 sm:px-6">
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

  const [isUserMenuOpen, setIsUserMenuOpen] = React.useState(false);
  const userMenuRef = React.useRef<HTMLDivElement>(null);

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = React.useState(false);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const userRole = (session?.user as unknown as { role?: string })?.role;
  const isManager = canManageTeam(userRole);

  const navItems = [
    { name: "ホーム", href: "/", icon: Home, show: false },
    { name: "ダッシュボード", href: "/dashboard", icon: ClipboardList, show: !!session },
    { name: "チーム", href: "/teams", icon: RiTeamFill, show: !!session },
    { name: "システム", href: "/admin", icon: ShieldAlert, show: !!session && isManager },
  ];

  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          closeMenu();
          setIsUserMenuOpen(false);
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
        await authClient.updateUser({
          image: data.imageUrl
        });

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
      {/* 💡 【修正のキモ】PC・スマホ共通で使えるように、input要素を一番外側に移動しました！ */}
      <input
        type="file"
        accept="image/jpeg, image/png, image/webp"
        className="hidden"
        ref={fileInputRef}
        onChange={handleAvatarUpload}
      />

      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md text-foreground transition-all duration-300">
        <div className="container mx-auto max-w-5xl flex h-16 items-center justify-between px-4 sm:px-6">

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 -ml-2 rounded-full text-foreground hover:bg-muted/80 transition-all active:scale-95"
              aria-label="メニューを開く"
            >
              <Menu className="h-6 w-6" />
            </button>

            <Link href="/" className="flex items-center gap-1 group transition-opacity hover:opacity-80">
              <LogoIcon className="h-10 w-10 transition-transform group-hover:scale-110 duration-300" />
              <span className="font-black italic text-2xl tracking-tighter text-foreground group-hover:text-primary transition-colors">
                i-Score
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-2 ml-8 text-sm font-bold">
              {navItems.map((item) => {
                if (!item.show) return null;
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-200",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <item.icon className="h-[18px] w-[18px]" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <ThemeToggle />

            {session && (
              <div className="relative hidden md:block" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className={cn(
                    "flex items-center justify-center h-10 w-10 rounded-full border transition-all active:scale-95 overflow-hidden",
                    isUserMenuOpen ? "border-primary/30 ring-2 ring-primary/20 ring-offset-2 ring-offset-background" : "border-border/50 hover:border-primary/50",
                    !session.user.image && "bg-muted/50 text-foreground/70 hover:bg-muted hover:text-foreground"
                  )}
                >
                  {session.user.image ? (
                    <img src={session.user.image} alt={session.user.name} className="h-full w-full object-cover" />
                  ) : (
                    <UserCircle className="h-6 w-6" />
                  )}
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-3 w-72 bg-card/95 backdrop-blur-2xl rounded-[24px] shadow-[0_20px_60px_rgba(0,0,0,0.15)] border border-border/50 p-2 z-50 animate-in fade-in slide-in-from-top-2 zoom-in-95 duration-200">

                    <div className="px-4 py-4 border-b border-border/50 mb-2 bg-muted/20 rounded-[18px] flex items-center gap-3">
                      <div
                        className="relative group cursor-pointer shrink-0"
                        onClick={() => fileInputRef.current?.click()}
                        title="画像をアップロード"
                      >
                        <div className="h-12 w-12 rounded-full overflow-hidden border border-border/50 bg-background relative flex items-center justify-center shadow-sm">
                          {isUploadingAvatar ? (
                            <Loader2 className="h-5 w-5 animate-spin text-primary" />
                          ) : session.user.image ? (
                            <img src={session.user.image} alt="Avatar" className="h-full w-full object-cover" />
                          ) : (
                            <UserCircle className="h-8 w-8 text-muted-foreground" />
                          )}

                          {!isUploadingAvatar && (
                            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                              <Camera className="h-5 w-5 text-white" />
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col overflow-hidden">
                        <div className="font-black text-base truncate text-foreground mb-0.5">{session.user.name}</div>
                        <div className="text-[10px] font-bold text-muted-foreground truncate uppercase tracking-widest">{session.user.email}</div>
                      </div>
                    </div>

                    <div className="px-3 py-3 space-y-3">
                      <div className="px-1">
                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">テーマカラー</span>
                      </div>
                      <div className="px-1 flex justify-center">
                        <ThemeSwitcher />
                      </div>
                    </div>

                    <div className="h-px bg-border/50 my-2 mx-3" />

                    <div className="p-1">
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-500/10 rounded-[16px] h-12 font-extrabold transition-colors"
                        onClick={handleLogout}
                      >
                        <LogOut className="mr-3 h-5 w-5" /> ログアウト
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* --- モバイルメニュー --- */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm transition-opacity md:hidden"
          onClick={closeMenu}
        />
      )}

      <div
        className={cn(
          "fixed inset-y-0 left-0 z-[70] flex w-[300px] flex-col bg-card/95 backdrop-blur-xl border-r border-border/50 shadow-2xl transition-transform duration-300 ease-out md:hidden",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between px-6 pt-2">
          <div className="flex items-center gap-2">
            <LogoIcon className="h-8 w-8" />
            <span className="font-black italic text-xl tracking-tighter">i-Score</span>
          </div>
          <button
            onClick={closeMenu}
            className="p-2 -mr-2 rounded-full bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground transition-all active:scale-95"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-1 flex-col overflow-y-auto py-6">
          <nav className="flex flex-col gap-2 px-4">
            {navItems.map((item) => {
              if (!item.show) return null;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMenu}
                  className={cn(
                    "flex items-center gap-3 rounded-[16px] px-4 py-4 text-base font-bold transition-all duration-200",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 transform scale-[1.02]"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground active:scale-[0.98]"
                  )}
                >
                  <item.icon className={cn("h-5 w-5", isActive ? "text-primary-foreground" : "text-muted-foreground")} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {session && (
          <div className="p-4 pb-8 mt-auto">
            <div className="rounded-[24px] bg-muted/30 border border-border/50 p-4 space-y-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div
                  className="relative cursor-pointer shrink-0 active:scale-95 transition-transform"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-background border border-border/50 text-foreground shadow-sm overflow-hidden relative">
                    {isUploadingAvatar ? (
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    ) : session.user.image ? (
                      <img src={session.user.image} alt={session.user.name} className="h-full w-full object-cover" />
                    ) : (
                      <UserCircle className="h-8 w-8 text-muted-foreground" />
                    )}
                  </div>

                  {!isUploadingAvatar && (
                    <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground rounded-full p-1.5 shadow-md border-2 border-background">
                      <Camera className="h-3.5 w-3.5" />
                    </div>
                  )}
                </div>

                <div className="flex flex-col overflow-hidden">
                  <span className="text-base font-black truncate">{session.user.name}</span>
                  <span className="text-[10px] font-bold text-muted-foreground truncate uppercase tracking-widest">{session.user.email}</span>
                </div>
              </div>

              <div className="flex items-center justify-center bg-background rounded-[16px] p-3 border border-border/50">
                <ThemeSwitcher />
              </div>

              <Button
                variant="outline"
                className="w-full rounded-[16px] h-12 border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white font-extrabold transition-colors"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                ログアウト
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}