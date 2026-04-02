// src/app/page.tsx
"use client"; // 💡 テーマ切り替えの状態を持つために Client Component に変更します

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Smartphone,
  Users,
  FileSpreadsheet,
  Zap,
  TrendingUp,
  Sparkles,
  ShieldCheck,
  Moon,
  Sun
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { FeatureCard } from "@/components/feature-card";

/**
 * 💡 トップページ (Landing Page)
 * 1. 白モヤ完全解消: ライトモードは blur を外し薄い白ヴェールのみに。ダークモードは blur でナイター感を演出。
 * 2. テーマスイッチャー: ヘッダー右上に Sun/Moon アイコンを配置し、ダーク/ライトを切り替え可能に。
 * 3. タイトル文字アップ＆線画アイコン: 違和感をなくしつつ、より力強いカードUIへ。
 */
export default function LandingPage() {
  // 💡 テーマ切り替え用のステート管理
  const [isDarkMode, setIsDarkMode] = useState(true);

  // 初期ロード時にシステムのテーマ設定などを読み込む（簡略化版）
  useEffect(() => {
    // htmlタグに 'dark' クラスがついているか確認
    setIsDarkMode(document.documentElement.classList.contains("dark"));
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    if (newTheme) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const features = [
    // 🔥 fill="currentColor" を外し、美しい線画に戻しました。
    { icon: <Smartphone className="h-10 w-10 text-orange-500" strokeWidth={1.5} />, title: "現場至上主義UI", desc: "太陽光下でも視認性抜群。片手で絶対に間違えない入力設計。", glowColor: "rgba(249, 115, 22, 0.15)" },
    { icon: <Users className="h-10 w-10 text-blue-500" strokeWidth={1.5} />, title: "チーム完全連携", desc: "マネージャーも監督も。リアルタイムでスタッツと戦況を共有。", glowColor: "rgba(59, 130, 246, 0.15)" },
    { icon: <FileSpreadsheet className="h-10 w-10 text-green-500" strokeWidth={1.5} />, title: "早稲田式スコア出力", desc: "入力されたデータを、伝統的で美しいスコアブック形式に一発変換。", glowColor: "rgba(34, 197, 94, 0.15)" },
    { icon: <Zap className="h-10 w-10 text-amber-500" strokeWidth={1.5} />, title: "1球速報システム", desc: "球場に来られないメンバーへ。プロ野球のような1球速報を配信。", glowColor: "rgba(245, 158, 11, 0.15)" },
    { icon: <TrendingUp className="h-10 w-10 text-purple-500" strokeWidth={1.5} />, title: "プロ級の成績分析", desc: "打率や防御率だけでなく、OPSやWHIPなど高度な指標を自動計算。", glowColor: "rgba(168, 85, 247, 0.15)" },
    { icon: <Sparkles className="h-10 w-10 text-cyan-500" strokeWidth={1.5} />, title: "AI戦況アシスト", desc: "次のプレイの予測や、打者の傾向分析をAIがベンチにアドバイス。", glowColor: "rgba(6, 182, 212, 0.15)" },
    { icon: <ShieldCheck className="h-10 w-10 text-rose-500" strokeWidth={1.5} />, title: "鉄壁のセキュリティ", desc: "ゲスト権限と承認フローにより、チームの機密データを安全に保護。", glowColor: "rgba(244, 63, 94, 0.15)" },
  ];

  return (
    <div className="relative min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/30 overflow-hidden transition-colors duration-300">

      {/* 🌟 究極の透明ヘッダー（テーマスイッチャー搭載） */}
      <header className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 h-24 bg-transparent">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <img src="/logo.png" alt="i-Score Logo" className="h-10 w-10 object-contain drop-shadow-sm" />
          <span className="text-3xl font-black italic tracking-tighter text-foreground drop-shadow-sm">
            i-Score
          </span>
        </Link>
        <div className="flex items-center gap-4">
          {/* 🔥 冗長なボタンを消し、美しいテーマ切り替えボタンを配置！ */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="rounded-full hover:bg-background/40 transition-colors h-12 w-12"
            title="テーマ切り替え"
          >
            {isDarkMode ? (
              <Sun className="h-6 w-6 text-yellow-400 drop-shadow-sm" />
            ) : (
              <Moon className="h-6 w-6 text-slate-700 drop-shadow-sm" />
            )}
          </Button>
        </div>
      </header>

      {/* 🌟 背景セクション（白モヤ完全撲滅版！） */}
      <div className="absolute inset-0 z-0">
        {/* スタジアム画像（存在感はしっかりキープ） */}
        <div className="absolute inset-0 bg-[url('/stadium.webp')] bg-cover bg-center bg-no-repeat opacity-60 dark:opacity-50" />

        {/* 💡 究極の白モヤ対策：
            ライトモード (dark:以外): blurを外し、単純な白背景(bg-background)を 85% の透過度で重ねる。モヤらずクリア！
            ダークモード (dark:): 黒背景(bg-background)を 30% に抑え、blur-[8px] で美しいナイターのぼけ味を出す！
        */}
        <div className="absolute inset-0 bg-background/85 dark:bg-background/30 dark:backdrop-blur-[8px] transition-colors duration-300" />

        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(circle at center, transparent 0%, transparent 20%, hsl(var(--background)) 90%, hsl(var(--background)) 100%)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent pointer-events-none" />
      </div>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 w-full max-w-5xl mx-auto pt-32 pb-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">

        <div className="space-y-6 text-center w-full max-w-4xl">
          <h1 className="text-5xl md:text-[5rem] lg:text-7xl md:leading-[1.1] font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-br from-foreground to-foreground/70 drop-shadow-sm md:whitespace-nowrap">
            野球の<span className="text-primary drop-shadow-md transition-colors duration-300">今</span>を、<br className="md:hidden" />
            <span className="text-primary drop-shadow-md transition-colors duration-300">次世代</span>へ。
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground font-medium leading-relaxed tracking-widest mt-6">
            草野球・アマチュア野球のための究極のスコアブック。
            <br className="hidden md:block" />
            現場の熱気をそのままに、指先一つでプロ並みのデータ分析を。
          </p>
        </div>

        <div className="mt-12 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <Link href="/login" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto rounded-full h-14 px-8 text-base font-bold gap-2 shadow-lg shadow-primary/20 hover:scale-105 transition-transform duration-300">
              無料で始める
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>

        <div id="features" className="mt-28 w-full max-w-5xl flex flex-wrap justify-center gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex-grow-0 flex-shrink-0 w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]"
            >
              {/* 💡 FeatureCard コンポーネントはそのままに、このページ側から渡す props を変更しました */}
              <FeatureCard
                icon={feature.icon}
                title={feature.title}
                description={feature.desc}
                glowColor={feature.glowColor}
              />
            </div>
          ))}
        </div>

      </main>
    </div>
  );
}