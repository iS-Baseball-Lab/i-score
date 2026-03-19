// src/contexts/ScoreContext.tsx
"use client";

import React, { createContext, useContext, useState, useRef, ReactNode } from "react";
import { toast } from "sonner"; // 💡 誤連打時にトースト通知を出すと親切です

// 💡 状態の型定義
type Count = { ball: number; strike: number; out: number };
type Inning = { num: number; isTop: boolean };
type Runners = { 1: boolean; 2: boolean; 3: boolean };

interface ScoreContextType {
    count: Count;
    currentInning: Inning;
    runners: Runners;
    addBall: () => void;
    addStrike: () => void;
    addFoul: () => void;
    addOut: () => void;
}

const ScoreContext = createContext<ScoreContextType | undefined>(undefined);

export function ScoreProvider({ children }: { children: ReactNode }) {
    const [count, setCount] = useState<Count>({ ball: 0, strike: 0, out: 0 });
    const [currentInning, setCurrentInning] = useState<Inning>({ num: 1, isTop: true });
    const [runners, setRunners] = useState<Runners>({ 1: false, 2: false, 3: false });

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🛡️ 鉄壁の連打防止（スロットル）機能
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const lastActionTime = useRef<number>(0);
    const COOLDOWN_MS = 400; // 0.4秒間のクールダウン（絶妙な長さ）

    // アクションを実行して良いか判定する関数
    const canExecuteAction = () => {
        const now = Date.now();
        if (now - lastActionTime.current < COOLDOWN_MS) {
            // 💡 0.4秒以内の連打は無視！（開発中のみconsole.logを出してもOK）
            console.log("連打ブロック発動！");
            return false;
        }
        lastActionTime.current = now;
        return true;
    };

    // ⚾️ 3アウトチェンジの処理
    const changeInning = () => {
        setCount({ ball: 0, strike: 0, out: 0 });
        setRunners({ 1: false, 2: false, 3: false });
        setCurrentInning((prev) => ({
            num: prev.isTop ? prev.num : prev.num + 1,
            isTop: !prev.isTop,
        }));
        toast.info("スリーアウト！チェンジです。");
    };

    // 🟢 ボール追加
    const addBall = () => {
        if (!canExecuteAction()) return; // 🛡️ ガード！

        setCount((prev) => {
            if (prev.ball >= 3) {
                // フォアボール（四球）の処理（一旦、カウントリセットして1塁へ）
                setRunners((r) => ({ ...r, 1: true }));
                toast.success("フォアボール！");
                return { ...prev, ball: 0, strike: 0 };
            }
            return { ...prev, ball: prev.ball + 1 };
        });
    };

    // 🟡 ストライク追加
    const addStrike = () => {
        if (!canExecuteAction()) return; // 🛡️ ガード！

        setCount((prev) => {
            if (prev.strike >= 2) {
                // 見逃し/空振り三振
                toast.error("バッターアウト！（三振）");
                if (prev.out >= 2) {
                    changeInning();
                    return { ball: 0, strike: 0, out: 0 };
                }
                return { ball: 0, strike: 0, out: prev.out + 1 };
            }
            return { ...prev, strike: prev.strike + 1 };
        });
    };

    // 🟡 ファウル追加（2ストライクからは増えない）
    const addFoul = () => {
        if (!canExecuteAction()) return; // 🛡️ ガード！

        setCount((prev) => {
            if (prev.strike < 2) {
                return { ...prev, strike: prev.strike + 1 };
            }
            return prev;
        });
    };

    // 🔴 アウト追加 (盗塁死や牽制アウトなど、打席が完了しないアウト用)
    const addOut = () => {
        if (!canExecuteAction()) return; // 🛡️ ガード！

        setCount((prev) => {
            if (prev.out >= 2) {
                changeInning();
                return { ball: 0, strike: 0, out: 0 };
            }
            toast.error("アウト！");
            return { ...prev, out: prev.out + 1 }; // B/Sカウントはそのまま
        });
    };

    return (
        <ScoreContext.Provider value={{ count, currentInning, runners, addBall, addStrike, addFoul, addOut }}>
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