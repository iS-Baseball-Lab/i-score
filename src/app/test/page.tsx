// filepath: src/app/test/page.tsx
/* 💡 iScoreCloud 規約: 新機能検証用サンドボックス。 
   pathname監視による状態リセット機能を標準装備。 */
"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { SnsShareButton } from "@/components/matches/sns-share-button";
import { FeatureCard } from "@/components/feature-card";
import { TestTube2, ShieldCheck, Terminal } from "lucide-react";

export default function TestPage() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  // 💡 規約: コンテキスト（パス）変化時に状態をリセット
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, [pathname]);

  // 🧪 テストMatchデータ（サヨナラ勝ちの「x」表記検証用）
  const testMatch = {
    homeTeamName: "川崎シャークス",
    awayTeamName: "中原パイレーツ",
    scores: { home: 5, away: 4 },
    inning: "9回裏",
    lastAction: "サヨナラタイムリーヒット！",
    isWalkOff: true
  };

  if (!mounted) return null;

  return (
    <main className="min-h-screen p-6 pt-24 bg-background text-foreground">
      <div className="max-w-2xl mx-auto space-y-8">
        
        <div className="flex items-center justify-between border-b border-border/50 pb-4">
          <h1 className="text-3xl font-black italic tracking-tighter uppercase">
            Debug<span className="text-primary italic">Console</span>
          </h1>
          <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground tracking-widest uppercase">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <span>Field Unit Ready</span>
          </div>
        </div>

        <section className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="flex items-center gap-2 text-primary font-bold">
            <TestTube2 className="w-5 h-5" />
            <h2 className="text-lg">直接投稿機能・実戦テスト</h2>
          </div>

          <FeatureCard
            title="LINEダイレクト連携"
            description="iScoreCloudからLINEアプリへ直接メッセージを飛ばします。サヨナラの『x』表記も自動フォーマットされます。"
            icon={<Terminal className="w-8 h-8 text-orange-500" />}
            glowColor="rgba(249, 115, 22, 0.15)"
          />

          <div className="bg-primary/5 border border-primary/20 rounded-[24px] p-6">
            <SnsShareButton 
              homeTeamName={testMatch.homeTeamName}
              awayTeamName={testMatch.awayTeamName}
              scores={testMatch.scores}
              inning={testMatch.inning}
              lastAction={testMatch.lastAction}
              isWalkOff={testMatch.isWalkOff}
            />
            <p className="text-[11px] text-muted-foreground text-center mt-4 italic">
              ※タップするとLINEアプリが起動し、速報テキストが自動入力されます。
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
