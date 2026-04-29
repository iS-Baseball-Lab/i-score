// filepath: `src/components/score/TestDataGenerator.tsx`
"use client";

import { useScore } from "@/contexts/ScoreContext";
import { Button } from "@/components/ui/button";
import { DatabaseZap, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function TestDataGenerator() {
  const { state, updateScore, recordPitch } = useScore();
  const [isGenerating, setIsGenerating] = useState(false);

  const generateScenario = async () => {
    if (!state.matchId) {
      toast.error("試合が初期化されていません");
      return;
    }

    setIsGenerating(true);
    const loadingToast = toast.loading("熱戦のデータを生成中...");

    try {
      /**
       * 💡 シナリオ：7回裏 2死満塁、逆転のチャンス
       * 1. 序盤のスコアをセット（5-3で負けている状態）
       * 2. カウントを「2-3（フルカウント）」へ
       * 3. ランナーをフルベースへ
       */
      
      // スコアとイニングの更新（API経由で永続化）
      await updateScore({
        inning: 7,
        isTop: false, // 裏の攻撃
        myScore: 3,
        opponentScore: 5,
        // イニングごとのスコアを流し込む（掲示板が賑やかになります）
        myInningScores: [0, 1, 0, 0, 2, 0, 0],
        opponentInningScores: [2, 0, 0, 3, 0, 0, 0],
        runners: {
          base1: { id: "p1", name: "鈴木" },
          base2: { id: "p2", name: "佐藤" },
          base3: { id: "p3", name: "田中" },
        },
        balls: 3,
        strikes: 2,
        outs: 2
      });

      // ログに熱いメッセージを刻む
      await fetch(`/api/matches/${state.matchId}/logs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inningText: "7回裏",
          resultType: "info",
          description: "🔥 2死満塁！一打逆転の絶好機で4番・高橋が打席に入る！",
        }),
      });

      toast.dismiss(loadingToast);
      toast.success("テストデータ注入完了！");
      
      // 💡 状態を即時反映させるためにリロード
      window.location.reload();
      
    } catch (e) {
      console.error(e);
      toast.dismiss(loadingToast);
      toast.error("生成に失敗しました");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed bottom-32 right-6 z-[200]">
      <Button 
        onClick={generateScenario}
        disabled={isGenerating}
        variant="destructive"
        className="h-14 px-6 rounded-2xl shadow-[0_10px_40px_rgba(220,38,38,0.4)] border-2 border-white/20 bg-red-600 hover:bg-red-500 text-white font-black italic gap-3 animate-bounce-subtle active:scale-90 transition-all"
      >
        {isGenerating ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <DatabaseZap className="h-5 w-5" />
        )}
        DEBUG: FILL DRAMA
      </Button>

      <style jsx global>{`
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 2s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
}
