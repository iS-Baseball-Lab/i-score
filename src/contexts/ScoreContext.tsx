// filepath: src/contexts/ScoreContext.tsx
/* 💡 試合の状態管理とAPI同期を担当。Sonner通知を廃止し、state.logs を通じて PlayLog へ即時反映する。 */

"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ⚾️ 型定義
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface BaseAdvance {
  runnerId: string;
  fromBase: 0 | 1 | 2 | 3;
  toBase: 1 | 2 | 3 | 4;
}

export interface PlayLogEntry {
  id: string;
  description: string;
  inning: number;
  isTop: boolean;
  timestamp: number;
}

interface MatchResponse {
  success: boolean;
  match?: {
    id: string;
    status: string;
    myScore: number;
    opponentScore: number;
    myInningScores: string;
    opponentInningScores: string;
    battingOrder: string;
    currentInning: number;
    isBottom: boolean;
  };
}

interface ScoreState {
  matchId: string;
  inning: number;
  isTop: boolean;
  balls: number;
  strikes: number;
  outs: number;
  runners: { base1: string | null; base2: string | null; base3: string | null };
  myScore: number;
  opponentScore: number;
  myInningScores: number[];
  opponentInningScores: number[];
  batterId: string | null;
  pitcherId: string | null;
  pitchCount: number;
  logs: PlayLogEntry[]; // 🌟 ログを状態として保持
}

interface ScoreContextType {
  state: ScoreState;
  isLoading: boolean;
  isSyncing: boolean;
  initMatch: (matchId: string) => Promise<void>;
  recordPitch: (result: "ball" | "strike" | "foul" | "swinging_strike" | "out") => Promise<void>;
  recordInPlay: (result: string, rbi: number, advances: BaseAdvance[], attackTeam?: number) => Promise<void>;
  changeInning: () => void;
  updateRunners: (runners: { base1: string | null; base2: string | null; base3: string | null }) => void;
  resetBatter: (playerId: string | null) => void;
  finishMatch: () => Promise<void>;
}

const ScoreContext = createContext<ScoreContextType | undefined>(undefined);

export function ScoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ScoreState>({
    matchId: "", inning: 1, isTop: true, balls: 0, strikes: 0, outs: 0,
    runners: { base1: null, base2: null, base3: null },
    myScore: 0, opponentScore: 0, myInningScores: [], opponentInningScores: [],
    batterId: null, pitcherId: null, pitchCount: 0,
    logs: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  // 💡 内部用：新しいログエントリを作成するヘルパー
  const appendLog = (description: string, s: ScoreState): PlayLogEntry[] => {
    const newEntry: PlayLogEntry = {
      id: crypto.randomUUID(),
      description,
      inning: s.inning,
      isTop: s.isTop,
      timestamp: Date.now(),
    };
    // 最新を先頭に、最大50件保持
    return [newEntry, ...s.logs].slice(0, 50);
  };

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🚀 1. バックエンド同期
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
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
        }),
      });
      // ✅ 成功時の通知(toast)を廃止。更新はログで確認。
    } catch (e) {
      console.error("Sync Error:", e);
      toast.error("通信エラーが発生しました。"); 
    } finally {
      setIsSyncing(false);
    }
  }, []);

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🚀 2. 試合初期化
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
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
          inning: m.currentInning || 1,
          myScore: m.myScore || 0,
          opponentScore: m.opponentScore || 0,
          myInningScores: JSON.parse(m.myInningScores || "[]"),
          opponentInningScores: JSON.parse(m.opponentInningScores || "[]"),
          isTop: !m.isBottom,
        }));
      }
    } catch (error) {
      toast.error("情報の読み込みに失敗しました");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🚀 3. 投球記録 (Ball, Strike, Out)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
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
        logs: appendLog(description, prev), // 🌟 即座にログへ反映
      };

      if (isAtBatEnd || result === "out") {
        syncWithBackend(next, description);
      }
      
      return next;
    });
  };

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🚀 4. 打球・インプレイ記録
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const recordInPlay = async (result: string, rbi: number, advances: BaseAdvance[], attackTeam?: number) => {
    setState(prev => {
      const isTopAttack = attackTeam !== undefined ? attackTeam === 1 : prev.isTop;
      const currentScores = isTopAttack ? [...prev.myInningScores] : [...prev.opponentInningScores];
      const idx = prev.inning - 1;
      while (currentScores.length <= idx) currentScores.push(0);
      currentScores[idx] += rbi;

      const actionNote = `${result}${rbi > 0 ? ` (${rbi}点)` : ""}`;
      const next = {
        ...prev,
        balls: 0, strikes: 0, pitchCount: 0,
        myScore: isTopAttack ? prev.myScore + rbi : prev.myScore,
        opponentScore: isTopAttack ? prev.opponentScore : prev.opponentScore + rbi,
        myInningScores: isTopAttack ? currentScores : prev.myInningScores,
        opponentInningScores: isTopAttack ? prev.opponentInningScores : currentScores,
        outs: result.includes("アウト") ? prev.outs + 1 : prev.outs,
        logs: appendLog(actionNote, prev), // 🌟 即座にログへ反映
      };

      syncWithBackend(next, actionNote);
      return next;
    });
  };

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🚀 5. その他コントロール
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
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
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <ScoreContext.Provider value={{
      state, isLoading, isSyncing, initMatch, recordPitch, recordInPlay,
      changeInning, updateRunners, resetBatter, finishMatch
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
