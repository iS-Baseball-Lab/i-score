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
import {
  UserCircle,
  LogOut,
  Menu,
  X,
  Home,
  ClipboardList,
  ShieldAlert,
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
    { name: "クラブ・チーム", href: "/teams", icon: RiTeamFill, show: !!session },
    { name: "システム管理", href: "/admin", icon: ShieldAlert, show: !!session && isManager },
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

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md text-foreground transition-all duration-300">
        <div className="container mx-auto max-w-4xl flex h-16 items-center justify-between px-4 sm:px-6">

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

          <div className="flex items-center gap-4">
            {session && (
              <div className="relative hidden md:block" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  // 💡 修正: 画像が丸く切り抜かれるように `overflow-hidden` と `p-0` などの微調整を追加
                  className={cn(
                    "flex items-center justify-center h-10 w-10 rounded-full border transition-all active:scale-95 overflow-hidden",
                    isUserMenuOpen ? "border-primary/30 ring-2 ring-primary/20 ring-offset-2 ring-offset-background" : "border-border/50 hover:border-primary/50",
                    !session.user.image && "bg-muted/50 text-foreground/70 hover:bg-muted hover:text-foreground"
                  )}
                >
                  {/* 💡 アバター画像があれば表示、なければデフォルトアイコン */}
                  {session.user.image ? (
                    <img src={session.user.image} alt={session.user.name} className="h-full w-full object-cover" />
                  ) : (
                    <UserCircle className="h-6 w-6" />
                  )}
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-3 w-72 bg-card/95 backdrop-blur-2xl rounded-[24px] shadow-[0_20px_60px_rgba(0,0,0,0.15)] border border-border/50 p-2 z-50 animate-in fade-in slide-in-from-top-2 zoom-in-95 duration-200">

                    <div className="px-4 py-4 border-b border-border/50 mb-2 bg-muted/20 rounded-[18px]">
                      <div className="font-black text-base truncate text-foreground mb-0.5">{session.user.name}</div>
                      <div className="text-xs font-bold text-muted-foreground truncate">{session.user.email}</div>
                    </div>

                    <div className="px-3 py-3 space-y-3">
                      <div className="flex items-center justify-between px-1">
                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">外観（テーマ）</span>
                        <ThemeToggle />
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
                {/* 💡 モバイルメニューのプロフィールアイコンも同様に対応 */}
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-background border border-border/50 text-foreground shadow-sm overflow-hidden">
                  {session.user.image ? (
                    <img src={session.user.image} alt={session.user.name} className="h-full w-full object-cover" />
                  ) : (
                    <UserCircle className="h-7 w-7" />
                  )}
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="text-sm font-black truncate">{session.user.name}</span>
                  <span className="text-xs font-bold text-muted-foreground truncate">{session.user.email}</span>
                </div>
              </div>

              <div className="flex items-center justify-between bg-background rounded-[16px] p-2 border border-border/50">
                <ThemeSwitcher />
                <ThemeToggle />
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