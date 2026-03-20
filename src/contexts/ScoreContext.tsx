// src/contexts/ScoreContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";
import { toast } from "sonner";

type Count = { ball: number; strike: number; out: number };
type Inning = { num: number; isTop: boolean };
type Runners = { 1: boolean; 2: boolean; 3: boolean };
type Score = { top: number; bottom: number; topInnings: number[]; bottomInnings: number[] };

export type PlayEvent = {
    id: string;
    inningText: string;
    resultType: "hit" | "out" | "run" | "walk" | "other";
    batterName: string;
    description: string;
    timestamp: string;
};

// 💡 選手の型定義
export type Player = { name: string; uniformNumber: string; statsToday?: string };

interface ScoreContextType {
    count: Count;
    currentInning: Inning;
    runners: Runners;
    score: Score;
    logs: PlayEvent[];
    currentBatter: Player;  // 今のバッター
    nextBatter: Player; // 次のバッター
    addBall: () => void;
    addStrike: (isSwinging?: boolean) => void; // 💡 空振り判定
    addFoul: () => void;
    addOut: () => void;
    addPlayResult: (result: string, positionId?: number | null) => void; // 💡 打球方向
    undoLastPlay: () => void;
}

// 💡 Providerが「どの試合か(matchId)」を受け取れるようにする型
interface ScoreProviderProps {
    children: ReactNode;
    matchId: string;
}

const ScoreContext = createContext<ScoreContextType | undefined>(undefined);

// 💡 守備位置IDから名前を取得するマスタ
const POS_NAMES: Record<number, string> = {
    1: "ピッチャー", 2: "キャッチャー", 3: "ファースト", 4: "セカンド",
    5: "サード", 6: "ショート", 7: "レフト", 8: "センター", 9: "ライト"
};

export function ScoreProvider({ children, matchId }: ScoreProviderProps) {
    const [count, setCount] = useState<Count>({ ball: 0, strike: 0, out: 0 });
    const [currentInning, setCurrentInning] = useState<Inning>({ num: 1, isTop: true });
    const [runners, setRunners] = useState<Runners>({ 1: false, 2: false, 3: false });
    const [score, setScore] = useState<Score>({ top: 0, bottom: 0, topInnings: [0], bottomInnings: [] });
    const [logs, setLogs] = useState<PlayEvent[]>([]);
    // 💡 オーダー（打順）と、現在何番バッターか（0〜8）を管理
    const [lineup, setLineup] = useState<Player[]>(Array(9).fill({ name: "読込中...", uniformNumber: "-" }));
    const [currentBatterIndex, setCurrentBatterIndex] = useState(0);

    const lastActionTime = useRef<number>(0);
    const canExecuteAction = () => {
        const now = Date.now();
        if (now - lastActionTime.current < 400) return false;
        lastActionTime.current = now;
        return true;
    };

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🚀 画面を開いた時に過去のログを自動取得！
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    useEffect(() => {
        const fetchMatchData = async () => {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";

                // 1. ログの取得
                const res = await fetch(`${apiUrl}/api/matches/${matchId}/logs`);
                if (res.ok) {
                    const data = await res.json() as ScoreContextType;
                    // DBから取得したログを画面にセット！
                    setLogs(data.logs);
                }

                // 2. 試合情報の取得
                const matchRes = await fetch(`${apiUrl}/api/matches/${matchId}`);
                if (matchRes.ok) {
                    const matchData = await matchRes.json() as {
                        match: {
                            battingOrder: string | null;
                            myScore: number;
                            opponentScore: number;
                            myInningScores: string | null;
                            opponentInningScores: string | null;
                        };
                    };
                    const match = matchData.match;

                    // DBの battingOrder（JSON文字列）をパースして配列にセット
                    if (match.battingOrder) {
                        try {
                            const parsedLineup = JSON.parse(match.battingOrder);
                            if (parsedLineup.length > 0) setLineup(parsedLineup);
                        } catch (e) {
                            console.error("打順のパースエラー", e);
                        }
                    }

                    // スコアボードの復元
                    setScore({
                        top: match.myScore, bottom: match.opponentScore,
                        topInnings: match.myInningScores ? JSON.parse(match.myInningScores) : [0],
                        bottomInnings: match.opponentInningScores ? JSON.parse(match.opponentInningScores) : []
                    });
                }
            } catch (error) {
                console.error("データ取得エラー:", error);
            }
        };
        fetchMatchData();
    }, [matchId, apiUrl]);

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 💡 バッターを1人進めるヘルパー関数
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const advanceBatter = () => {
        setCurrentBatterIndex((prev) => (prev + 1) % 9);
    };

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // ⚾️ 実況ログを生成し、画面に表示 ＆ DBに保存する！
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const addLog = async (resultType: PlayEvent["resultType"], description: string) => {
        const batterName = lineup[currentBatterIndex]?.name || "打者";
        const now = new Date();
        const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        const inningText = `${currentInning.num}回${currentInning.isTop ? "表" : "裏"}`;

        // 1. 保存するログのデータを作成
        const newLog: PlayEvent = {
            id: crypto.randomUUID(),
            inningText,
            resultType,
            batterName: "打者",
            description,
            timestamp: timeStr,
        };

        // 2. ⚡️ フロントエンドの画面を「即座に」更新する（サクサク感の要！）
        setLogs((prev) => [newLog, ...prev]);

        // 3. ☁️ バックエンド (Cloudflare Workers API) へ裏側でこっそり送信！
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";

            const response = await fetch(`${apiUrl}/api/matches/${matchId}/logs`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(newLog),
            });

            if (!response.ok) {
                console.error("ログの保存に失敗しました");
                // 失敗した時だけ小さくエラーを出すと親切です
                toast.error("通信エラー: 一部ログの保存に失敗しました");
            }
        } catch (error) {
            console.error("API通信エラー:", error);
        }
    };

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // ⚾️ 魂のプレイボール宣言！！！
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const playBall = async () => {
        // すでにログがある（試合が始まっている）場合は何もしない
        if (logs.length > 0) {
            toast.error("すでに試合は始まっています！");
            return;
        }
        // resultType "other" を使って、特別な実況ログを流す！
        await addLog("other", "⚾️ プレイボール！！！試合開始！");
        toast.success("プレイボール！");
    };
    
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // ⚾️ イニングチェンジ
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const changeInning = () => {
        setCount({ ball: 0, strike: 0, out: 0 });
        setRunners({ 1: false, 2: false, 3: false });
        addLog("other", "スリーアウト！攻守交替です。");
        setCurrentInning((prev) => ({ num: prev.isTop ? prev.num : prev.num + 1, isTop: !prev.isTop }));
        toast.info("チェンジ！");
        setCurrentInning((prev) => {
            const nextIsTop = !prev.isTop;
            const nextNum = prev.isTop ? prev.num : prev.num + 1;

            // 次のイニングの配列枠を「0」で作っておく
            setScore(s => {
                const ns = { ...s };
                if (nextIsTop) { ns.topInnings[nextNum - 1] = 0; }
                else { ns.bottomInnings[nextNum - 1] = 0; }
                return ns;
            });
            return { num: nextNum, isTop: nextIsTop };
        });
    };

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // ⚾️ 得点追加
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const addRuns = (runsToAdd: number) => {
        if (runsToAdd <= 0) return;
        setScore((prev) => {
            const isTop = currentInning.isTop;
            const newScore = { ...prev };

            // 合計得点と、現在のイニングの配列を更新！
            if (isTop) {
                newScore.top += runsToAdd;
                newScore.topInnings[currentInning.num - 1] = (newScore.topInnings[currentInning.num - 1] || 0) + runsToAdd;
            } else {
                newScore.bottom += runsToAdd;
                newScore.bottomInnings[currentInning.num - 1] = (newScore.bottomInnings[currentInning.num - 1] || 0) + runsToAdd;
            }

            syncScoreToDB(newScore); // ☁️ APIに送信
            return newScore;
        });
        addLog("run", `${runsToAdd}点が入りました！`);
        toast.success(`${runsToAdd}点入りました！`);
    };

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // ⚾️ 打席結果（入力された「方向」と「結果」を組み合わせる）
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const addPlayResult = (result: string, positionId?: number | null) => {
        if (!canExecuteAction()) return;
        setCount((prev) => ({ ...prev, ball: 0, strike: 0 }));

        // 💡 入力された守備位置の取得（なければ「野手」）
        const posName = positionId ? POS_NAMES[positionId] : "野手";

        setRunners((prevRunners) => {
            let newRunners = { ...prevRunners };
            let runsScored = 0;

            switch (result) {
                case "1B":
                    addLog("hit", `${posName}へのヒット！ランナー出塁！`);
                    if (prevRunners[3]) runsScored += 1;
                    newRunners[3] = prevRunners[2]; newRunners[2] = prevRunners[1]; newRunners[1] = true;
                    toast.success("ヒット！");
                    break;
                case "2B":
                    addLog("hit", `${posName}へのツーベースヒット！`);
                    if (prevRunners[3]) runsScored += 1; if (prevRunners[2]) runsScored += 1;
                    newRunners[3] = prevRunners[1]; newRunners[2] = true; newRunners[1] = false;
                    toast.success("ツーベースヒット！");
                    break;
                case "3B":
                    addLog("hit", `${posName}へのスリーベースヒット！`);
                    if (prevRunners[3]) runsScored += 1; if (prevRunners[2]) runsScored += 1; if (prevRunners[1]) runsScored += 1;
                    newRunners[3] = true; newRunners[2] = false; newRunners[1] = false;
                    toast.success("スリーベース！");
                    break;
                case "HR":
                    addLog("run", `${posName}方向へのホームラン！！🔥`);
                    if (prevRunners[3]) runsScored += 1; if (prevRunners[2]) runsScored += 1; if (prevRunners[1]) runsScored += 1; runsScored += 1;
                    newRunners = { 1: false, 2: false, 3: false };
                    toast.success("ホームラン！");
                    break;
                case "OUT":
                    addLog("out", `${posName}への打球、アウト。`);
                    addOut();
                    break;
                case "DP":
                    addLog("out", `${posName}への打球でダブルプレー。`);
                    addOut(); setTimeout(() => addOut(), 100);
                    break;
                case "SAC":
                    addLog("out", `${posName}への犠打（犠飛）。`);
                    addOut();
                    break;
                case "FC":
                    addLog("other", `${posName}への打球、野手選択でセーフ。`);
                    addOut(); // 簡易処理
                    break;
                case "ERR":
                    addLog("other", `${posName}のエラーで出塁！`);
                    break;
            }

            if (runsScored > 0) addRuns(runsScored);
            return newRunners;
        });

        advanceBatter(); // 💡 打席完了なので次のバッターへ！
    };

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // ⚾️ カウント系（事実とカウント状況を組み合わせる）
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const addBall = () => {
        if (!canExecuteAction()) return;
        setCount((prev) => {
            if (prev.ball >= 3) {
                // 事実: フルカウントかそうでないか
                const prefix = prev.strike === 2 ? "フルカウントから" : "";
                addLog("walk", `${prefix}フォアボールで出塁。`);
                advanceBatter(); // 💡 フォアボールなので次のバッターへ！
                setRunners((r) => {
                    let runs = 0; let newR = { ...r };
                    if (r[1] && r[2] && r[3]) { runs += 1; } else if (r[1] && r[2]) { newR[3] = true; } else if (r[1]) { newR[2] = true; }
                    newR[1] = true;
                    if (runs > 0) addRuns(runs);
                    return newR;
                });
                return { ...prev, ball: 0, strike: 0 };
            }
            addLog("other", "ボール。");
            return { ...prev, ball: prev.ball + 1 };
        });
    };

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🚀 スコアが変わるたびにDBを更新！(スコアボード連動)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const syncScoreToDB = async (newScore: Score) => {
        try {
            // ※ 今回は先攻(top)を自チーム(myScore)と仮定して送ります。
            // 実際は matchesテーブルの isTop などの情報から判定してください。
            await fetch(`${apiUrl}/api/matches/${matchId}/score`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    myScore: newScore.top,
                    opponentScore: newScore.bottom,
                    myInningScores: newScore.topInnings,
                    opponentInningScores: newScore.bottomInnings,
                }),
            });
        } catch (error) {
            console.error("スコア同期エラー", error);
        }
    };

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🚀 直前のプレイを取り消す（UNDO）
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const undoLastPlay = async () => {
        if (logs.length === 0) return;

        // 一番上の最新ログを取得
        const targetLog = logs[0];

        // 画面からログを消す (楽観的UI)
        setLogs((prev) => prev.slice(1));
        toast.info("直前のプレイを取り消しました");

        // カウントを簡易リセット (※本格的な復元は履歴管理が必要ですが、まずはリセットで対応)
        setCount({ ball: 0, strike: 0, out: count.out });

        try {
            // ☁️ APIに削除リクエストを送信
            await fetch(`${apiUrl}/api/matches/${matchId}/logs/${targetLog.id}`, {
                method: "DELETE",
            });
        } catch (error) {
            console.error("UNDOエラー", error);
        }
    };

    const addStrike = (isSwinging: boolean = false) => {
        if (!canExecuteAction()) return;
        setCount((prev) => {
            if (prev.strike >= 2) {
                // 事実: 空振り三振か、見逃し三振か
                const typeStr = isSwinging ? "空振り三振！" : "見逃し三振！";
                addLog("out", typeStr);
                advanceBatter(); // 💡 三振完了なので次のバッターへ！
                toast.error("アウト！（三振）");
                if (prev.out >= 2) { changeInning(); return { ball: 0, strike: 0, out: 0 }; }
                return { ball: 0, strike: 0, out: prev.out + 1 };
            }
            addLog("other", isSwinging ? "空振り！" : "ストライク。");
            return { ...prev, strike: prev.strike + 1 };
        });
    };

    const addFoul = () => {
        if (!canExecuteAction()) return;
        addLog("other", "ファウル。");
        setCount((prev) => {
            if (prev.strike < 2) return { ...prev, strike: prev.strike + 1 };
            return prev;
        });
    };

    const addOut = () => {
        setCount((prev) => {
            if (prev.out >= 2) {
                changeInning();
                advanceBatter(); // 💡 アウトなので次のバッターへ！
                return { ball: 0, strike: 0, out: 0 };
            }
            return { ...prev, out: prev.out + 1 };
        });
    };

    return (
        <ScoreContext.Provider value={{
            count, currentInning, runners, score,
            logs, addBall, addStrike, addFoul, addOut,
            addPlayResult, undoLastPlay, playBall,
            currentBatter: lineup[currentBatterIndex],
            nextBatter: lineup[(currentBatterIndex + 1) % 9]
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
