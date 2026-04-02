// src/app/page.tsx
import React from "react";
import Link from "next/link";
import { ArrowRight, Activity, Users, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * 💡 トップページ (Landing Page)
 * 1. 究極の第一印象: スタジアムの熱気をより前面に出す透過度調整。
 * 2. ヴィネット効果の最適化: 中央の透明エリアを広げ、画像をより見やすく。
 * 3. キャッチフレーズの研ぎ澄まし: 「今」と「次世代」をダブルハイライト。
 */
export default function LandingPage() {
  return (
    <div className="relative min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/30 overflow-hidden">

      {/* 🌟 究極の背景セクション */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 bg-[url('/stadium.webp')] bg-cover bg-center bg-no-repeat opacity-60 dark:opacity-40"
        />
        <div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(circle at center, transparent 0%, transparent 20%, hsl(var(--background)) 90%, hsl(var(--background)) 100%)"
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
      </div>

      {/* 🌟 ヒーローコンテンツ */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 w-full max-w-5xl mx-auto pt-20 pb-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">

        {/* 🔥 魂のキャッチフレーズ（短縮＆ダブルハイライト版） */}
        <div className="space-y-6 text-center max-w-3xl">
          <h1 className="text-5xl md:text-7xl md:leading-[1.1] font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-foreground to-foreground/70 drop-shadow-sm">
            野球の<span className="text-primary drop-shadow-md">今</span>を、<br className="md:hidden" />
            <span className="text-primary drop-shadow-md">次世代</span>へ。
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground font-medium leading-relaxed tracking-wide">
            草野球・アマチュア野球のための究極のスコアブック。
            <br className="hidden md:block" />
            現場の熱気をそのままに、指先一つでプロ並みのデータ分析を。
          </p>
        </div>

        {/* コールトゥアクション（CTA）ボタン */}
        <div className="mt-12 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <Link href="/login" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto rounded-full h-14 px-8 text-base font-bold gap-2 shadow-lg shadow-primary/20 hover:scale-105 transition-transform duration-300">
              プレイボール (ログイン)
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
          <Link href="#features" className="w-full sm:w-auto">
            <Button variant="outline" size="lg" className="w-full sm:w-auto rounded-full h-14 px-8 text-base font-bold bg-background/50 backdrop-blur-md hover:bg-background/80 transition-colors duration-300">
              機能を見る
            </Button>
          </Link>
        </div>

        {/* 🌟 特徴を直感的に伝えるマイクロカード */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
          <FeatureCard
            icon={<Activity className="h-6 w-6 text-primary" />}
            title="現場至上主義UI"
            description="太陽光の下でも見やすい。片手で絶対に間違えない入力システム。"
          />
          <FeatureCard
            icon={<Users className="h-6 w-6 text-blue-500" />}
            title="チーム完全連携"
            description="権限管理で安全に。スタッツや試合結果をリアルタイム共有。"
          />
          <FeatureCard
            icon={<FileSpreadsheet className="h-6 w-6 text-green-500" />}
            title="美しい出力"
            description="伝統的な早稲田式スコアブックフォーマットへ一発出力。"
          />
        </div>

      </main>
    </div>
  );
}

// 💡 ヒーローセクション下部の機能紹介カード用コンポーネント
function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="flex flex-col items-center text-center p-6 rounded-[32px] bg-card/40 backdrop-blur-xl border border-border/50 shadow-xl hover:-translate-y-1 transition-transform duration-300">
      <div className="p-3 bg-background/80 rounded-full shadow-sm mb-4 border border-border/30">
        {icon}
      </div>
      <h3 className="text-lg font-black tracking-tight mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground font-medium leading-relaxed">
        {description}
      </p>
    </div>
  );
}