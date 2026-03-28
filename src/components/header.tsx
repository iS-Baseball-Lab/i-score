// src/components/header.tsx
"use client";

import React, { useEffect, useState } from "react";
/**
 * 💡 グローバルヘッダー・コンポーネント (Type-Safe 厳格版)
 * 1. デザイン: NO SHADOW ルールを厳守。透過・ブラー・微細ボーダーで構成。
 * 2. 型安全: anyを排除し、APIレスポンスやパス名のnullチェックを徹底。
 * 3. 機能: 現在のパスから動的にページタイトルとパンくずリストを生成。
 * 4. 連携: ログイン中のチーム情報をD1からフェッチし表示。
 */
import { usePathname } from "next/navigation";
import {
  ChevronRight,
  Search,
  Bell,
  Command,
  Shield,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ⚾️ 型定義 (Schema Protocol)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// APIレスポンス用の型定義
interface UserProfileResponse {
  organizationName?: string;
  name?: string;
  role?: string;
  image?: string | null;
}

// ページ名マッピングの型定義
const routeMap: Record<string, string> = {
  "dashboard": "ダッシュボード",
  "teams": "チーム管理",
  "profile": "プロフィール",
  "players": "選手名簿",
  "tournaments": "大会マップ",
  "map": "大会マップ",
  "register": "大会管理",
  "requests": "参加申請",
  "matches": "試合記録",
  "history": "試合履歴",
  "score": "スコア入力",
  "result": "試合結果",
  "stats": "成績分析",
  "settings": "設定",
  "user": "アカウント"
};

export function Header() {
  // 💡 修正: usePathname() は null を返す可能性があるため空文字でフォールバック
  const pathname = usePathname() || "";
  const [teamName, setTeamName] = useState<string>("Loading Team...");

  // パスを分割してパンくずリストを生成
  const pathSegments = pathname.split("/").filter(Boolean).filter(s => s !== "(protected)");

  // 現在のページタイトルを決定
  const currentKey = pathSegments[pathSegments.length - 1] || "dashboard";
  const pageTitle = routeMap[currentKey] || "i-Score";

  useEffect(() => {
    /**
     * 🚀 D1データベースから所属チーム名を取得
     */
    const fetchTeamInfo = async () => {
      try {
        const res = await fetch("/api/user/profile");
        if (res.ok) {
          // 💡 修正: res.json() を UserProfileResponse でキャストして any を排除
          const data = (await res.json()) as UserProfileResponse;
          setTeamName(data.organizationName || "プライム・ベアーズ");
        }
      } catch (e) {
        console.error("Header data fetch failed:", e);
        setTeamName("プライム・ベアーズ");
      }
    };
    fetchTeamInfo();
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full bg-background/40 backdrop-blur-md border-b border-border/40 transition-all duration-300">
      <div className="flex h-16 items-center justify-between px-4 sm:px-8">

        {/* 1. 左側：タイトル & パンくず */}
        <div className="flex items-center gap-4 overflow-hidden">
          {/* モバイル用ロゴ（サイドバー非表示時） */}
          <div className="md:hidden flex h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 items-center justify-center shrink-0">
            <img src="/logo.png" alt="logo" className="h-5 w-5 object-contain" />
          </div>

          <div className="flex flex-col min-w-0">
            {/* パンくずリスト */}
            <nav className="hidden sm:flex items-center gap-1.5 text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60 mb-0.5">
              <span>i-Score</span>
              {pathSegments.map((seg, i) => (
                <React.Fragment key={seg + i}>
                  <ChevronRight className="h-2.5 w-2.5 opacity-40" />
                  <span className={cn(i === pathSegments.length - 1 && "text-primary/80")}>
                    {routeMap[seg] || seg}
                  </span>
                </React.Fragment>
              ))}
            </nav>
            {/* メインタイトル */}
            <h1 className="text-xl sm:text-2xl font-black italic tracking-tighter text-foreground truncate uppercase">
              {pageTitle}
            </h1>
          </div>
        </div>

        {/* 2. 右側：ツール & ステータス */}
        <div className="flex items-center gap-2 sm:gap-4">

          {/* 検索 (Desktop) */}
          <div className="hidden lg:flex items-center relative group">
            <Search className="absolute left-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Search data..."
              className="h-10 w-64 pl-10 pr-4 rounded-full bg-muted/30 border border-border/40 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-background/60 transition-all"
            />
            <div className="absolute right-3 hidden xl:flex items-center gap-1 px-1.5 py-0.5 rounded border border-border/60 bg-muted/50 text-[9px] font-black text-muted-foreground">
              <Command className="h-2.5 w-2.5" /> K
            </div>
          </div>

          {/* チーム表示バッジ */}
          <div className="hidden sm:flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/5 border border-primary/20 text-primary">
            <Shield className="h-3.5 w-3.5" />
            <span className="text-[11px] font-black tracking-tight">{teamName}</span>
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse ml-1" />
          </div>

          {/* 通知・クイックアクション */}
          <div className="flex items-center gap-1">
            <button className="relative p-2.5 rounded-full hover:bg-muted/50 text-muted-foreground transition-colors group" aria-label="Notifications">
              <Bell className="h-5 w-5 group-hover:scale-110 transition-transform" />
              <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-red-500 border-2 border-background" />
            </button>
            <button className="p-2.5 rounded-full hover:bg-primary/10 text-primary transition-colors lg:hidden" aria-label="Quick Action">
              <Zap className="h-5 w-5" />
            </button>
          </div>

        </div>

      </div>

      {/* STADIUM SYNC: ヘッダー直下の装飾ライン */}
      <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
    </header>
  );
}