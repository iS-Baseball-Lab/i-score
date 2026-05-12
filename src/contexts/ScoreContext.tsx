// filepath: src/contexts/ScoreContext.tsx
/* 💡 iScoreCloud 規約: 
   1. 型の共通化: src/types/score.ts からインポートし、二重管理を廃止。
   2. 堅牢な同期: updateMatchSettings を実装し、Scoreboard等のUI操作をDBへ反映。
   3. 野球脳の維持: 状態更新と同時に PlayLog への自動記録を行う。 */

"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
// 🌟 切り出した型をインポート
import {
  ScoreState,
  ScoreContextType,
  MatchResponse,
  PlayLogEntry,
  BaseAdvance
} from "@/types/score";

const ScoreContext = createContext<ScoreContextType | undefined>(undefined);

export function ScoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ScoreState>({
    matchId: "",
    inning: 1,
    isTop: true,
    balls: 0,
    strikes: 0,
    outs: 0,
    runners: { base1: null, base2: null, base3: null },
    myScore: 0,
    opponentScore: 0,
    myInningScores: [],
    opponentInningScores: [],
    myHits: 0,
    opponentHits: 0,
    myErrors: 0,
    opponentErrors: 0,
    maxInnings: 7, // デフォルト
    isGuestFirst: true,
    batterId: null,
    pitcherId: null,
    pitchCount: 0,
    logs: [],
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  // 💡 内部用：ログ記録ヘルパー
  const appendLog = useCallback((description: string, s: ScoreState): PlayLogEntry[] => {
    const newEntry: PlayLogEntry = {
      id: crypto.randomUUID(),
      description,
      inning: s.inning,
      isTop: s.isTop,
      timestamp: Date.now(),
    };
    return [newEntry, ...s.logs].slice(0, 50);
  }, []);

  // 🚀 1. バックエンド同期
  const syncWithBackend = useCallback(async (updatedState: ScoreState, actionNote: string) => {
    setIsSyncing(true);
    try {
      await fetch("/api/matches/update-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matchId: updatedState.matchId,
          myScore: updatedState.myScore,
          opponentScore: updatedState.opponentScore,
          inning: updatedState.inning,
          isBottom: !updatedState.isTop,
          action: actionNote,
          // 必要に応じて hits/errors 等も送信
        }),
      });
    } catch (e) {
      console.error("Sync Error:", e);
      toast.error("同期に失敗しました");
    } finally {
      setIsSyncing(false);
    }
  }, []);

  // 🚀 2. 試合初期化 (DBデータ -> Stateへの変換)
  const initMatch = useCallback(async (matchId: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/matches/${matchId}`);
      const data = (await res.json()) as MatchResponse;
      if (data.success && data.match) {
        const m = data.match;
        setState(prev => ({
          ...prev,
          matchId: m.id,
          tournamentName: m.tournament,
          venueName: m.venue,
          opponentTeamName: m.opponent,
          inning: m.currentInning || 1,
          isTop: !m.isBottom,
          myScore: m.myScore || 0,
          opponentScore: m.opponentScore || 0,
          myInningScores: JSON.parse(m.myInningScores || "[]"),
          opponentInningScores: JSON.parse(m.opponentInningScores || "[]"),
          maxInnings: m.innings || 7,
          isGuestFirst: m.battingOrder === 'first', // DBの文字列をbooleanに変換
        }));
      }
    } catch (error) {
      toast.error("情報の読み込みに失敗しました");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 🚀 3. 試合設定の更新 (Scoreboard等からの呼び出し用)
  const updateMatchSettings = useCallback((settings: Partial<ScoreState>) => {
    setState(prev => {
      const next = { ...prev, ...settings };
      syncWithBackend(next, "試合設定の変更");
      return next;
    });
  }, [syncWithBackend]);

  // 🚀 4. 投球記録
  const recordPitch = async (result: "ball" | "strike" | "foul" | "swinging_strike" | "out") => {
    setState(prev => {
      let newStrikes = prev.strikes;
      let newBalls = prev.balls;
      let newOuts = prev.outs;
      let description = "";

      if (result === "strike" || result === "swinging_strike") {
        newStrikes++;
        description = "ストライク";
      } else if (result === "ball") {
        newBalls++;
        description = "ボール";
      } else if (result === "out") {
        newOuts++;
        description = "アウト";
      } else if (result === "foul") {
        if (newStrikes < 2) newStrikes++;
        description = "ファウル";
      }

      let isAtBatEnd = false;
      if (newStrikes >= 3) {
        newOuts++;
        description = "三振";
        isAtBatEnd = true;
      } else if (newBalls >= 4) {
        description = "フォアボール";
        isAtBatEnd = true;
      } else if (result === "out") {
        isAtBatEnd = true;
      }

      const next = {
        ...prev,
        balls: isAtBatEnd ? 0 : newBalls,
        strikes: isAtBatEnd ? 0 : newStrikes,
        outs: newOuts,
        pitchCount: isAtBatEnd ? 0 : prev.pitchCount + 1,
        logs: appendLog(description, prev),
      };

      if (isAtBatEnd || result === "out") syncWithBackend(next, description);
      return next;
    });
  };

  // 🚀 5. インプレイ記録
  const recordInPlay = async (result: string, rbi: number, hits: number, errors: number, advances?: BaseAdvance[]) => {
    setState(prev => {
      const isTopRow = prev.isTop;
      const currentInningIdx = prev.inning - 1;

      const updatedOpponentInningScores = [...prev.opponentInningScores];
      const updatedMyInningScores = [...prev.myInningScores];

      if (isTopRow) {
        while (updatedOpponentInningScores.length <= currentInningIdx) updatedOpponentInningScores.push(0);
        updatedOpponentInningScores[currentInningIdx] += rbi;
      } else {
        while (updatedMyInningScores.length <= currentInningIdx) updatedMyInningScores.push(0);
        updatedMyInningScores[currentInningIdx] += rbi;
      }

      const next = {
        ...prev,
        opponentScore: isTopRow ? prev.opponentScore + rbi : prev.opponentScore,
        myScore: !isTopRow ? prev.myScore + rbi : prev.myScore,
        opponentHits: isTopRow ? prev.opponentHits + hits : prev.opponentHits,
        myHits: !isTopRow ? prev.myHits + hits : prev.myHits,
        opponentErrors: !isTopRow ? prev.opponentErrors + errors : prev.opponentErrors,
        myErrors: isTopRow ? prev.myErrors + errors : prev.myErrors,
        opponentInningScores: updatedOpponentInningScores,
        myInningScores: updatedMyInningScores,
        balls: 0,
        strikes: 0,
        outs: result.includes("アウト") ? prev.outs + 1 : prev.outs,
        logs: appendLog(`${result} (${rbi}打点)`, prev),
      };

      syncWithBackend(next, result);
      return next;
    });
  };

  // 🚀 6. コントロール
  const changeInning = () => {
    setState(prev => {
      const next = {
        ...prev,
        isTop: !prev.isTop,
        inning: prev.isTop ? prev.inning : prev.inning + 1,
        balls: 0, strikes: 0, outs: 0,
        runners: { base1: null, base2: null, base3: null },
        logs: appendLog("イニング交代", prev),
      };
      syncWithBackend(next, "イニング交代");
      return next;
    });
  };

  const updateRunners = (newRunners: { base1: string | null; base2: string | null; base3: string | null }) => {
    setState(prev => ({ ...prev, runners: newRunners }));
  };

  const resetBatter = (playerId: string | null) => {
    setState(prev => ({ ...prev, batterId: playerId, balls: 0, strikes: 0, pitchCount: 0 }));
  };

  const finishMatch = async () => {
    setIsSyncing(true);
    try {
      await fetch(`/api/matches/${state.matchId}/finish`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ myScore: state.myScore, opponentScore: state.opponentScore }),
      });
      toast.success("試合終了を記録しました");
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <ScoreContext.Provider value={{
      state, isLoading, isSyncing, initMatch, recordPitch, recordInPlay,
      changeInning, updateRunners, resetBatter, finishMatch,
      updateMatchSettings
    }}>
      {children}
    </ScoreContext.Provider>
  );
}

export function useScore() {
  const context = useContext(ScoreContext);
  if (context === undefined) throw new Error("useScore must be used within a ScoreProvider");
  return context;
}