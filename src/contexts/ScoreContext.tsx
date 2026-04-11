"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ⚾️ 型定義（スキーマ完全準拠）
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/** 塁進塁情報（打球結果に伴うランナーの移動） */
export interface BaseAdvance {
  runnerId: string;
  fromBase: 0 | 1 | 2 | 3;
  toBase: 1 | 2 | 3 | 4; // 4 = ホームイン
}

interface Player {
    id: string;
    name: string;
    uniformNumber: string;
}

// 💡 APIレスポンス用の型を定義
interface MatchResponse {
    success: boolean;
    match?: {
        id: string;
        status: string;
        myScore: number;
        opponentScore: number;
        myInningScores: string; // JSON文字列で返ってくる想定
        opponentInningScores: string;
        battingOrder: string;
    };
    error?: string;
}

interface ScoreState {
    matchId: string;
    inning: number;
    isTop: boolean; // true: 表 (自チーム攻撃), false: 裏 (相手チーム攻撃)
    balls: number;
    strikes: number;
    outs: number;
    // ランナー: 選手IDを保持 (nullなら不在)
    runners: {
        base1: string | null;
        base2: string | null;
        base3: string | null;
    };
    myScore: number;
    opponentScore: number;
    // イニングごとのスコア (JSON文字列のパース結果)
    myInningScores: number[];
    opponentInningScores: number[];

    // 現在の対戦
    batterId: string | null;
    pitcherId: string | null;
    pitchCount: number; // この打席での投球数
}

interface ScoreContextType {
    state: ScoreState;
    isLoading: boolean;
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
        batterId: null,
        pitcherId: null,
        pitchCount: 0,
    });
    const [isLoading, setIsLoading] = useState(true);

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🚀 試合情報の初期化
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const initMatch = useCallback(async (matchId: string) => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/matches/${matchId}`);
            if (res.ok) {
                // 💡 ここでキャストを行うことで 'unknown' エラーを回避します
                const data = (await res.json()) as MatchResponse;

                if (data.success && data.match) {
                    const m = data.match;
                    setState(prev => ({
                        ...prev,
                        matchId: m.id,
                        inning: m.status === "scheduled" ? 1 : prev.inning,
                        myScore: m.myScore || 0,
                        opponentScore: m.opponentScore || 0,
                        myInningScores: JSON.parse(m.myInningScores || "[]"),
                        opponentInningScores: JSON.parse(m.opponentInningScores || "[]"),
                        isTop: m.battingOrder === "first",
                    }));
                }
            }
        } catch (error) {
            toast.error("試合情報の読み込みに失敗しました");
        } finally {
            setIsLoading(false);
        }
    }, []);

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🚀 1球ごとの記録 (Ball, Strike, Foul)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const recordPitch = async (result: "ball" | "strike" | "foul" | "swinging_strike" | "in_play") => {
        const isStrike = result === "strike" || result === "swinging_strike" || (result === "foul" && state.strikes < 2);
        const isBall = result === "ball";

        let newStrikes = state.strikes;
        let newBalls = state.balls;
        let atBatResult: string | null = null;

        if (isStrike) newStrikes++;
        if (isBall) newBalls++;

        if (newStrikes >= 3) {
            atBatResult = "K";
            toast.info("三振！");
        } else if (newBalls >= 4) {
            atBatResult = "BB";
            toast.info("フォアボール！");
        }

        try {
            const res = await fetch(`/api/matches/${state.matchId}/pitches`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    inning: state.inning,
                    isTop: state.isTop,
                    batterId: state.batterId,
                    pitcherId: state.pitcherId,
                    pitchNumber: state.pitchCount + 1,
                    result: result,
                    ballsBefore: state.balls,
                    strikesBefore: state.strikes,
                    atBatResult: atBatResult,
                }),
            });

            if (!res.ok) throw new Error();

            setState(prev => ({
                ...prev,
                balls: atBatResult ? 0 : newBalls,
                strikes: atBatResult ? 0 : newStrikes,
                outs: atBatResult === "K" ? prev.outs + 1 : prev.outs,
                pitchCount: atBatResult ? 0 : prev.pitchCount + 1,
            }));

        } catch (e) {
            toast.error("投球の記録に失敗しました");
        }
    };

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🚀 打球・インプレイの結果記録
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const recordInPlay = async (result: string, rbi: number, advances: BaseAdvance[]) => {
        try {
            await fetch(`/api/matches/${state.matchId}/pitches`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    inning: state.inning,
                    isTop: state.isTop,
                    batterId: state.batterId,
                    pitcherId: state.pitcherId,
                    pitchNumber: state.pitchCount + 1,
                    result: "in_play",
                    ballsBefore: state.balls,
                    strikesBefore: state.strikes,
                    atBatResult: result,
                }),
            });

            const newScore = state.isTop ? state.myScore + rbi : state.opponentScore + rbi;
            const currentInningScores = state.isTop ? [...state.myInningScores] : [...state.opponentInningScores];

            const inningIdx = state.inning - 1;
            while (currentInningScores.length <= inningIdx) currentInningScores.push(0);
            currentInningScores[inningIdx] += rbi;

            const scorePayload = {
                myScore: state.isTop ? newScore : state.myScore,
                opponentScore: state.isTop ? state.opponentScore : newScore,
                myInningScores: state.isTop ? currentInningScores : state.myInningScores,
                opponentInningScores: state.isTop ? state.opponentInningScores : currentInningScores,
            };

            await fetch(`/api/matches/${state.matchId}/score`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(scorePayload),
            });

            await fetch(`/api/matches/${state.matchId}/logs`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: crypto.randomUUID(),
                    inningText: `${state.inning}回${state.isTop ? "表" : "裏"}`,
                    resultType: rbi > 0 ? "score" : "out",
                    description: `打席結果: ${result}${rbi > 0 ? ` (${rbi}点)` : ""}`,
                }),
            });

            setState(prev => ({
                ...prev,
                balls: 0,
                strikes: 0,
                pitchCount: 0,
                myScore: scorePayload.myScore,
                opponentScore: scorePayload.opponentScore,
                myInningScores: scorePayload.myInningScores,
                opponentInningScores: scorePayload.opponentInningScores,
                outs: result.includes("-") || result === "K" ? prev.outs + 1 : prev.outs,
            }));

        } catch (e) {
            toast.error("プレイの記録に失敗しました");
        }
    };

    const changeInning = () => {
        setState(prev => {
            const nextIsTop = !prev.isTop;
            const nextInning = prev.isTop ? prev.inning : prev.inning + 1;
            return {
                ...prev,
                isTop: nextIsTop,
                inning: nextInning,
                balls: 0,
                strikes: 0,
                outs: 0,
                runners: { base1: null, base2: null, base3: null },
            };
        });
        toast.success(`${state.inning}回${state.isTop ? "裏" : "表"}へ交代します`);
    };

    const updateRunners = (newRunners: { base1: string | null; base2: string | null; base3: string | null }) => {
        setState(prev => ({ ...prev, runners: newRunners }));
    };

    const resetBatter = (playerId: string | null) => {
        setState(prev => ({ ...prev, batterId: playerId, balls: 0, strikes: 0, pitchCount: 0 }));
    };

    const finishMatch = async () => {
        try {
            const res = await fetch(`/api/matches/${state.matchId}/finish`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    myScore: state.myScore,
                    opponentScore: state.opponentScore,
                    selfInningScores: state.myInningScores,
                    guestInningScores: state.opponentInningScores,
                }),
            });
            if (res.ok) {
                toast.success("試合終了！お疲れ様でした！");
            }
        } catch (e) {
            toast.error("終了処理に失敗しました");
        }
    };

    return (
        <ScoreContext.Provider value={{
            state, isLoading, initMatch, recordPitch, recordInPlay,
            changeInning, updateRunners, resetBatter, finishMatch
        }}>
            {children}
        </ScoreContext.Provider>
    );
}

export function useScore() {
    const context = useContext(ScoreContext);
    if (context === undefined) {
        throw new Error("useScore must be used within a ScoreProvider");
    }
    return context;
}