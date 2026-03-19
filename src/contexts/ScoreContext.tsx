// src/contexts/ScoreContext.tsx
"use client";

import React, { createContext, useContext, useState, useRef, ReactNode } from "react";
import { toast } from "sonner";

// 💡 状態の型定義
type Count = { ball: number; strike: number; out: number };
type Inning = { num: number; isTop: boolean };
type Runners = { 1: boolean; 2: boolean; 3: boolean };
type Score = { top: number; bottom: number }; // 💡 追加: 両チームの得点

// 💡 プレイログの型
export type PlayEvent = {
    id: string;
    inningText: string;
    resultType: "hit" | "out" | "run" | "walk" | "other";
    batterName: string;
    description: string;
    timestamp: string;
};

interface ScoreContextType {
    count: Count;
    currentInning: Inning;
    runners: Runners;
    score: Score;
    logs: PlayEvent[];
    addBall: () => void;
    addStrike: () => void;
    addFoul: () => void;
    addOut: () => void;
    addPlayResult: (result: string) => void; // 💡 プレイ結果を処理する関数
}

interface ScoreContextType {
    // ...既存の型...
}

const ScoreContext = createContext<ScoreContextType | undefined>(undefined);

export function ScoreProvider({ children }: { children: ReactNode }) {
    const [count, setCount] = useState<Count>({ ball: 0, strike: 0, out: 0 });
    const [currentInning, setCurrentInning] = useState<Inning>({ num: 1, isTop: true });
    const [runners, setRunners] = useState<Runners>({ 1: false, 2: false, 3: false });
    const [score, setScore] = useState<Score>({ top: 0, bottom: 0 }); // 💡 得点ステート
    const [logs, setLogs] = useState<PlayEvent[]>([]);

    const lastActionTime = useRef<number>(0);
    const COOLDOWN_MS = 400;

    const canExecuteAction = () => {
        const now = Date.now();
        if (now - lastActionTime.current < COOLDOWN_MS) return false;
        lastActionTime.current = now;
        return true;
    };

    // 💡 ログを生成して追加する専用ヘルパー
    const addLog = (resultType: PlayEvent["resultType"], description: string) => {
        const now = new Date();
        const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        const inningText = `${currentInning.num}回${currentInning.isTop ? "表" : "裏"}`;
        // 💡 実際のアプリでは現在のバッターの名前を引っ張りますが、今回は仮で固定
        const batterName = "打者";

        setLogs((prev) => [
            {
                id: Math.random().toString(36).substring(7), // 簡易的なユニークID
                inningText,
                resultType,
                batterName,
                description,
                timestamp: timeStr,
            },
            ...prev, // 新しいログを一番上に追加！
        ]);
    };

    // ⚾️ 3アウトチェンジ
    const changeInning = () => {
        setCount({ ball: 0, strike: 0, out: 0 });
        setRunners({ 1: false, 2: false, 3: false });
        setCurrentInning((prev) => ({
            num: prev.isTop ? prev.num : prev.num + 1,
            isTop: !prev.isTop,
        }));
        toast.info("チェンジ！攻守交替です。");
    };

    // ⚾️ 得点を追加する内部関数
    const addRuns = (runsToAdd: number) => {
        if (runsToAdd <= 0) return;
        setScore((prev) => ({
            ...prev,
            [currentInning.isTop ? "top" : "bottom"]: prev[currentInning.isTop ? "top" : "bottom"] + runsToAdd,
        }));
        toast.success(`${runsToAdd}点入りました！`);
    };

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 💡 NEW! 打席結果の処理（進塁と得点）
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const addPlayResult = (result: string) => {
        if (!canExecuteAction()) return;

        // カウントはリセット（打席完了のため）
        setCount((prev) => ({ ...prev, ball: 0, strike: 0 }));

        setRunners((prevRunners) => {
            let newRunners = { ...prevRunners };
            let runsScored = 0;

            switch (result) {
                case "1B": // 単打 (全員1つ進塁する簡易ロジック)
                    addLog("hit", "鮮やかな単打で出塁！");
                    if (prevRunners[3]) runsScored += 1;
                    newRunners[3] = prevRunners[2];
                    newRunners[2] = prevRunners[1];
                    newRunners[1] = true; // バッターが1塁へ
                    toast.success("ヒット！");
                    break;

                case "2B": // 二塁打
                    if (prevRunners[3]) runsScored += 1;
                    if (prevRunners[2]) runsScored += 1;
                    newRunners[3] = prevRunners[1];
                    newRunners[2] = true; // バッターが2塁へ
                    newRunners[1] = false;
                    toast.success("ツーベースヒット！");
                    break;

                case "3B": // 三塁打
                    if (prevRunners[3]) runsScored += 1;
                    if (prevRunners[2]) runsScored += 1;
                    if (prevRunners[1]) runsScored += 1;
                    newRunners[3] = true; // バッターが3塁へ
                    newRunners[2] = false;
                    newRunners[1] = false;
                    toast.success("スリーベースヒット！！");
                    break;

                case "HR": // 本塁打 (全員生還)
                    addLog("run", "スタンドに叩き込む特大のホームラン！！🔥");
                    if (prevRunners[3]) runsScored += 1;
                    if (prevRunners[2]) runsScored += 1;
                    if (prevRunners[1]) runsScored += 1;
                    runsScored += 1; // バッターの分
                    newRunners = { 1: false, 2: false, 3: false }; // ランナー一掃
                    toast.success("ホームラン！！！🔥");
                    break;

                case "OUT": // 通常のアウト
                    addLog("out", "打ち取られてアウト。");
                case "FC":  // 野手選択 (とりあえずアウトを1つ追加する簡易版)
                    addOut();
                    break;

                case "DP": // 併殺 (2アウト追加)
                    addOut();
                    setTimeout(() => addOut(), 100); // 少し遅らせて2つ目のアウトを処理
                    break;

                default:
                    console.log("未定義の結果:", result);
                    break;
            }

            // 得点があれば追加
            if (runsScored > 0) addRuns(runsScored);

            return newRunners;
        });
    };

    // 既存のアクション
    const addBall = () => { /* 変更なしのため省略せずにそのまま保持しています */
        if (!canExecuteAction()) return;
        setCount((prev) => {
            if (prev.ball >= 3) {
                setRunners((r) => {
                    let runs = 0;
                    let newR = { ...r };
                    // 押し出しの判定
                    if (r[1] && r[2] && r[3]) { runs += 1; }
                    else if (r[1] && r[2]) { newR[3] = true; }
                    else if (r[1]) { newR[2] = true; }
                    newR[1] = true;
                    if (runs > 0) addRuns(runs);
                    return newR;
                });
                toast.success("フォアボール！");
                return { ...prev, ball: 0, strike: 0 };
            }
            return { ...prev, ball: prev.ball + 1 };
        });
    };

    const addStrike = () => {
        if (!canExecuteAction()) return;
        setCount((prev) => {
            if (prev.strike >= 2) {
                toast.error("バッターアウト！（三振）");
                addLog("out", "空振り三振！");
                if (prev.out >= 2) { changeInning(); return { ball: 0, strike: 0, out: 0 }; }
                return { ball: 0, strike: 0, out: prev.out + 1 };
            }
            return { ...prev, strike: prev.strike + 1 };
        });
    };

    const addFoul = () => {
        if (!canExecuteAction()) return;
        setCount((prev) => {
            if (prev.strike < 2) {
                addLog("walk", "四球を選んで出塁。");
                return { ...prev, strike: prev.strike + 1 };
            }
            return prev;
        });
    };

    const addOut = () => {
        setCount((prev) => {
            if (prev.out >= 2) { changeInning(); return { ball: 0, strike: 0, out: 0 }; }
            toast.error("アウト！");
            return { ...prev, out: prev.out + 1 };
        });
    };

    return (
        <ScoreContext.Provider value={{ count, currentInning, runners, score, addBall, addStrike, addFoul, addOut, addPlayResult }}>
            {children}
        </ScoreContext.Provider>
    );
}

export function useScore() {
    const context = useContext(ScoreContext);
    if (context === undefined) throw new Error("useScore must be used within a ScoreProvider");
    return context;
}