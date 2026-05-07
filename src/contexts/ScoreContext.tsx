// filepath: src/contexts/ScoreContext.tsx
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
}

interface ScoreContextType {
    state: ScoreState;
    isLoading: boolean;
    isSyncing: boolean; // 🌟 通信中フラグ
    initMatch: (matchId: string) => Promise<void>;
    recordPitch: (result: "ball" | "strike" | "foul" | "swinging_strike" | "in_play") => Promise<void>;
    recordInPlay: (result: string, rbi: number, advances: BaseAdvance[]) => Promise<void>;
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
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false); // 🌟

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🚀 1. バックエンド同期 ＆ LINE速報（共通処理）
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const syncWithBackend = useCallback(async (updatedState: ScoreState, actionNote: string) => {
        setIsSyncing(true);
        try {
            const res = await fetch("/api/matches/update-score", {
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
            const result = await res.json();
            
            if (result.success && result.data.isWalkOff) {
                toast.success("劇的サヨナラ！試合終了です！", { icon: "⚾️" });
            }
        } catch (e) {
            console.error("Sync Error:", e);
            toast.error("通信エラーが発生しましたが、記録は保持されています。");
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
    // 🚀 3. 投球記録 (Ball, Strike)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const recordPitch = async (result: "ball" | "strike" | "foul" | "swinging_strike" | "in_play") => {
        if (result === "in_play") return;

        const isStrike = result === "strike" || result === "swinging_strike" || (result === "foul" && state.strikes < 2);
        const isBall = result === "ball";

        setState(prev => {
            const newStrikes = isStrike ? prev.strikes + 1 : prev.strikes;
            const newBalls = isBall ? prev.balls + 1 : prev.balls;
            
            let atBatResult = "";
            let newOuts = prev.outs;
            
            if (newStrikes >= 3) {
                atBatResult = "K";
                newOuts++;
                toast.info("三振！");
            } else if (newBalls >= 4) {
                atBatResult = "BB";
                toast.info("フォアボール！");
            }

            const next = {
                ...prev,
                balls: atBatResult ? 0 : newBalls,
                strikes: atBatResult ? 0 : newStrikes,
                outs: newOuts,
                pitchCount: atBatResult ? 0 : prev.pitchCount + 1,
            };

            // 三振や四球のときだけ LINE 速報を飛ばす
            if (atBatResult) {
                syncWithBackend(next, atBatResult === "K" ? "空振り三振！" : "フォアボールで出塁。");
            }
            
            return next;
        });
    };

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🚀 4. 打球・インプレイ記録 (楽観的更新 ＆ LINE連動)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const recordInPlay = async (result: string, rbi: number, advances: BaseAdvance[]) => {
        // 現在の得点配列をコピーして更新
        const currentScores = state.isTop ? [...state.myInningScores] : [...state.opponentInningScores];
        const idx = state.inning - 1;
        while (currentScores.length <= idx) currentScores.push(0);
        currentScores[idx] += rbi;

        const next = {
            ...state,
            balls: 0, strikes: 0, pitchCount: 0,
            myScore: state.isTop ? state.myScore + rbi : state.myScore,
            opponentScore: state.isTop ? state.opponentScore : state.opponentScore + rbi,
            myInningScores: state.isTop ? currentScores : state.myInningScores,
            opponentInningScores: state.isTop ? state.opponentInningScores : currentScores,
            outs: (result.includes("-") || result === "K") ? state.outs + 1 : state.outs,
        };

        // UIを即座に更新（楽観的）
        setState(next);

        // LINE速報 ＆ DB永続化
        const actionNote = `${result}${rbi > 0 ? ` (${rbi}点)` : ""}`;
        syncWithBackend(next, actionNote);
        toast.info(actionNote);
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
            };
            syncWithBackend(next, `${next.inning}回${next.isTop ? "表" : "裏"}開始`);
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
            const res = await fetch(`/api/matches/${state.matchId}/finish`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    myScore: state.myScore,
                    opponentScore: state.opponentScore,
                }),
            });
            if (res.ok) toast.success("試合終了！お疲れ様でした！");
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
