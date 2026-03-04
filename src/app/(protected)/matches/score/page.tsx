// src/app/(protected)/matches/score/page.tsx
"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

import { Scoreboard } from "@/components/score/Scoreboard";
import { PlayArea } from "@/components/score/PlayArea";
import { ControlPanel } from "@/components/score/ControlPanel";
import { FieldModal } from "@/components/score/FieldModal";
import { PlayLog } from "@/components/score/PlayLog";
import { AdvanceModal } from "@/components/score/AdvanceModal";
import { SubstitutionModal } from "@/components/score/SubstitutionModal";

// 💡 チームIDを含める
interface Match {
    id: string; opponent: string; date: string;
    location: string | null; matchType: string; status: string; season: string;
    teamId: string;
    innings?: number;
}

// 💡 選手情報とスタメン情報の型を整備
interface Player {
    id: string; name: string; uniformNumber: string;
}

interface LineupPlayer {
    player_id: string; batting_order: number; playerName: string; uniformNumber: string; position: string;
}

interface GameStateSnapshot {
    selfScore: number; guestScore: number;
    inning: number; isTop: boolean;
    balls: number; strikes: number; outs: number;
    firstBase: boolean; secondBase: boolean; thirdBase: boolean;
    myBatterIndex: number;
    selfInningScores: number[];
    guestInningScores: number[];
    selfPitchCount: number;
    guestPitchCount: number;
    selfInningPitchCount: number;
    guestInningPitchCount: number;
    playLogs: string[];
}

function MatchScoreContent() {
    const searchParams = useSearchParams();
    const matchId = searchParams.get("id");
    const router = useRouter();

    const [match, setMatch] = useState<Match | null>(null);
    const [roster, setRoster] = useState<Player[]>([]); // 💡 チーム全体の選手リスト
    const [isLoading, setIsLoading] = useState(true);

    const [selfScore, setSelfScore] = useState(0);
    const [guestScore, setGuestScore] = useState(0);
    const [inning, setInning] = useState(1);
    const [isTop, setIsTop] = useState(true);

    const [guestInningScores, setGuestInningScores] = useState<number[]>([0, ...Array(8).fill(null)]);
    const [selfInningScores, setSelfInningScores] = useState<number[]>(Array(9).fill(null));

    const [selfPitchCount, setSelfPitchCount] = useState(0);
    const [guestPitchCount, setGuestPitchCount] = useState(0);
    const [selfInningPitchCount, setSelfInningPitchCount] = useState(0);
    const [guestInningPitchCount, setGuestInningPitchCount] = useState(0);

    const [balls, setBalls] = useState(0);
    const [strikes, setStrikes] = useState(0);
    const [outs, setOuts] = useState(0);

    const [firstBase, setFirstBase] = useState(false);
    const [secondBase, setSecondBase] = useState(false);
    const [thirdBase, setThirdBase] = useState(false);

    const [myLineup, setMyLineup] = useState<LineupPlayer[]>([]);
    const [myBatterIndex, setMyBatterIndex] = useState(0);

    const [pitchX, setPitchX] = useState<number | null>(null);
    const [pitchY, setPitchY] = useState<number | null>(null);

    const [history, setHistory] = useState<GameStateSnapshot[]>([]);
    const [playLogs, setPlayLogs] = useState<string[]>([]);

    const [showFieldModal, setShowFieldModal] = useState(false);
    const [pendingPlay, setPendingPlay] = useState<{ type: 'hit' | 'out', bases?: 1 | 2 | 3 | 4, outType?: 'groundout' | 'flyout' | 'double_play' } | null>(null);

    const [showAdvanceModal, setShowAdvanceModal] = useState(false);
    const [showSubModal, setShowSubModal] = useState(false); // 💡 追加

    // 💡 選手交代処理
    const handleSubstitute = async (outPlayerId: string, inPlayerId: string, logText: string) => {
        // スタメン配列を更新
        const newLineup = myLineup.map(p => {
            if (p.player_id === outPlayerId) {
                const newP = roster.find(r => r.id === inPlayerId);
                return newP ? { ...p, player_id: inPlayerId, playerName: newP.name, uniformNumber: newP.uniformNumber } : p;
            }
            return p;
        });
        setMyLineup(newLineup);

        // APIに更新後のスタメンを保存（途中で画面を閉じても交代が維持されるように）
        try {
            await fetch(`/api/matches/${matchId}/lineup`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newLineup.map(p => ({
                    playerId: p.player_id, battingOrder: p.batting_order, position: p.position
                })))
            });
        } catch (e) { console.error(e); }

        addPlayLog(logText); // ログに「選手交代」を追加
        setShowSubModal(false);
    };

    const handleAdvance = async (fromBase: 1 | 2 | 3, toBase: 2 | 3 | 4, isOut: boolean, logText: string) => {
        saveStateToHistory();
        addPlayLog(logText);

        if (fromBase === 1) setFirstBase(false);
        if (fromBase === 2) setSecondBase(false);
        if (fromBase === 3) setThirdBase(false);

        if (isOut) {
            processOuts(1);
        } else {
            if (toBase === 2) setSecondBase(true);
            if (toBase === 3) setThirdBase(true);
            if (toBase === 4) addScore(1);
        }
        setShowAdvanceModal(false);
    };

    const toggleFullScreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => console.log(err));
        } else {
            if (document.exitFullscreen) document.exitFullscreen();
        }
    };

    const currentBatter = myLineup.length > 0 ? myLineup[myBatterIndex] : null;
    const nextBatter = myLineup.length > 0 ? myLineup[(myBatterIndex + 1) % myLineup.length] : null;
    const currentPitcher = myLineup.find(p => p.position === '1' || p.position === '投手' || p.position.toUpperCase() === 'P') || myLineup[0];

    const addPlayLog = (actionText: string) => {
        const currentInningText = `${inning}回${isTop ? '表' : '裏'}`;
        const batterText = currentBatter ? `${currentBatter.batting_order}番 ${currentBatter.playerName}` : '打者未設定';
        setPlayLogs(prev => [...prev, `${currentInningText} ${batterText} - ${actionText}`]);
    };

    const saveStateToHistory = () => {
        setHistory(prev => [...prev, {
            selfScore, guestScore, inning, isTop,
            balls, strikes, outs,
            firstBase, secondBase, thirdBase, myBatterIndex,
            selfInningScores: [...selfInningScores],
            guestInningScores: [...guestInningScores],
            selfPitchCount, guestPitchCount,
            selfInningPitchCount, guestInningPitchCount,
            playLogs: [...playLogs]
        }]);
    };

    const handleUndo = async () => {
        if (history.length === 0) return;
        const prev = history[history.length - 1];
        setSelfScore(prev.selfScore); setGuestScore(prev.guestScore);
        setInning(prev.inning); setIsTop(prev.isTop);
        setBalls(prev.balls); setStrikes(prev.strikes); setOuts(prev.outs);
        setFirstBase(prev.firstBase); setSecondBase(prev.secondBase); setThirdBase(prev.thirdBase);
        setMyBatterIndex(prev.myBatterIndex);
        setSelfInningScores(prev.selfInningScores);
        setGuestInningScores(prev.guestInningScores);
        setSelfPitchCount(prev.selfPitchCount);
        setGuestPitchCount(prev.guestPitchCount);
        setSelfInningPitchCount(prev.selfInningPitchCount);
        setGuestInningPitchCount(prev.guestInningPitchCount);
        setPlayLogs(prev.playLogs);
        setPitchX(null); setPitchY(null);

        setHistory(h => h.slice(0, -1));

        if (matchId) {
            try { await fetch(`/api/matches/${matchId}/pitches/last`, { method: 'DELETE' }); }
            catch (e) { console.error(e); }
        }
    };

    const recordPitchAPI = async (pitchResult: string, atBatResult: string | null = null, hitX: number | null = null, hitY: number | null = null) => {
        if (!matchId) return;
        try {
            if (isTop) {
                setSelfPitchCount(prev => prev + 1);
                setSelfInningPitchCount(prev => prev + 1);
            } else {
                setGuestPitchCount(prev => prev + 1);
                setGuestInningPitchCount(prev => prev + 1);
            }
            await fetch(`/api/matches/${matchId}/pitches`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    inning, isTop, pitchNumber: balls + strikes + 1,
                    result: pitchResult, ballsBefore: balls, strikesBefore: strikes, atBatResult,
                    zoneX: pitchX, zoneY: pitchY, hitX, hitY,
                    batterName: currentBatter?.playerName || null,
                    pitcherName: currentPitcher?.playerName || null
                }),
            });
        } catch (e) { console.error(e); }
        setPitchX(null); setPitchY(null);
    };

    const advanceBatter = () => {
        if (!isTop && myLineup.length > 0) setMyBatterIndex(prev => (prev + 1) % myLineup.length);
    };

    const addScore = (runs: number) => {
        if (runs <= 0) return;
        if (isTop) {
            setGuestScore(s => s + runs);
            setGuestInningScores(prev => { const newScores = [...prev]; newScores[inning - 1] = (newScores[inning - 1] || 0) + runs; return newScores; });
        } else {
            setSelfScore(s => s + runs);
            setSelfInningScores(prev => { const newScores = [...prev]; newScores[inning - 1] = (newScores[inning - 1] || 0) + runs; return newScores; });
        }
    };

    const processOuts = (addedOuts: number) => {
        const newOuts = outs + addedOuts;
        if (newOuts >= 3) {
            setOuts(0); setBalls(0); setStrikes(0); setFirstBase(false); setSecondBase(false); setThirdBase(false);
            if (isTop) {
                setIsTop(false); setGuestInningPitchCount(0);
                setSelfInningScores(prev => { const newScores = [...prev]; newScores[inning - 1] = 0; return newScores; });
            } else {
                setIsTop(true); setSelfInningPitchCount(0);
                setInning(i => { const next = i + 1; setGuestInningScores(prev => { const newScores = [...prev]; newScores[next - 1] = 0; return newScores; }); return next; });
            }
        } else setOuts(newOuts);
    };

    const handleFinishMatch = async () => {
        if (!window.confirm("試合を終了してダッシュボードに戻りますか？")) return;
        try {
            const res = await fetch(`/api/matches/${matchId}/finish`, {
                method: 'PATCH', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    myScore: selfScore,
                    opponentScore: guestScore,
                    selfInningScores: selfInningScores,
                    guestInningScores: guestInningScores
                })
            });
            if (res.ok) router.push('/dashboard');
        } catch (e) { console.error(e); }
    };

    const handleManualOut = () => {
        saveStateToHistory();
        addPlayLog("アウト");
        processOuts(1);
        advanceBatter();
    };

    const handleStrike = async () => {
        saveStateToHistory();
        if (strikes === 2) {
            await recordPitchAPI('strike', 'strikeout');
            addPlayLog("三振");
            setBalls(0); setStrikes(0); processOuts(1); advanceBatter();
        }
        else {
            await recordPitchAPI('strike');
            addPlayLog("ストライク");
            setStrikes(s => s + 1);
        }
    };

    const handleWalk = async () => {
        saveStateToHistory();
        await recordPitchAPI('ball', 'walk');
        addPlayLog("四死球");
        let runs = 0; let newFirst = true; let newSecond = secondBase; let newThird = thirdBase;
        if (firstBase) { newSecond = true; if (secondBase) { newThird = true; if (thirdBase) runs++; } }
        setFirstBase(newFirst); setSecondBase(newSecond); setThirdBase(newThird);
        addScore(runs); setBalls(0); setStrikes(0); advanceBatter();
    };

    const handleBall = async () => {
        if (balls === 3) await handleWalk();
        else {
            saveStateToHistory();
            await recordPitchAPI('ball');
            addPlayLog("ボール");
            setBalls(b => b + 1);
        }
    };

    const initiateHit = (bases: 1 | 2 | 3 | 4) => {
        setPendingPlay({ type: 'hit', bases });
        setShowFieldModal(true);
    };

    const initiateInPlayOut = (outType: 'groundout' | 'flyout' | 'double_play') => {
        setPendingPlay({ type: 'out', outType });
        setShowFieldModal(true);
    };

    const getHitDirection = (x: number, y: number) => {
        if (y > 0.6) {
            if (x < 0.4) return "サード";
            if (x > 0.6) return "ファースト";
            return x < 0.5 ? "ショート" : "セカンド";
        } else {
            if (x < 0.35) return "レフト";
            if (x > 0.65) return "ライト";
            return "センター";
        }
    };

    const finalizePlayOnField = async (e: React.MouseEvent<HTMLDivElement>) => {
        if (!pendingPlay) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const fieldX = (e.clientX - rect.left) / rect.width;
        const fieldY = (e.clientY - rect.top) / rect.height;

        const direction = getHitDirection(fieldX, fieldY);
        saveStateToHistory();

        if (pendingPlay.type === 'hit') {
            const hitTypes = { 1: '前ヒット', 2: '方向の二塁打', 3: '方向の三塁打', 4: '方向の本塁打' };
            await recordPitchAPI('in_play', 'hit', fieldX, fieldY);

            addPlayLog(`${direction}${hitTypes[pendingPlay.bases!]}`);

            let runs = 0; let newFirst = false; let newSecond = false; let newThird = false;
            const bases = pendingPlay.bases!;
            if (bases === 1) { if (thirdBase) runs++; if (secondBase) newThird = true; if (firstBase) newSecond = true; newFirst = true; }
            else if (bases === 2) { if (thirdBase) runs++; if (secondBase) runs++; if (firstBase) newThird = true; newSecond = true; }
            else if (bases === 3) { if (thirdBase) runs++; if (secondBase) runs++; if (firstBase) runs++; newThird = true; }
            else if (bases === 4) { if (thirdBase) runs++; if (secondBase) runs++; if (firstBase) runs++; runs++; }

            setFirstBase(newFirst); setSecondBase(newSecond); setThirdBase(newThird);
            addScore(runs); setBalls(0); setStrikes(0); advanceBatter();
        } else {
            const outType = pendingPlay.outType!;
            const outNames = { 'groundout': 'ゴロ', 'flyout': 'フライ', 'double_play': 'への併殺打' };
            await recordPitchAPI('in_play', outType, fieldX, fieldY);

            addPlayLog(`${direction}${outNames[outType as keyof typeof outNames]}`);

            let addedOuts = 1;
            if (outType === 'double_play') {
                if (firstBase || secondBase || thirdBase) {
                    addedOuts = 2;
                    if (firstBase) setFirstBase(false); else if (secondBase) setSecondBase(false); else if (thirdBase) setThirdBase(false);
                }
            }
            setBalls(0); setStrikes(0); processOuts(addedOuts); advanceBatter();
        }

        setShowFieldModal(false);
        setPendingPlay(null);
    };

    const handleZoneClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        setPitchX(x); setPitchY(y);
    };

    useEffect(() => {
        if (!matchId) return;
        const fetchData = async () => {
            try {
                let matchData: Match | null = null;
                const matchRes = await fetch(`/api/matches/${matchId}`);
                if (matchRes.ok) {
                    matchData = await matchRes.json() as Match;
                    setMatch(matchData);
                }

                const lineupRes = await fetch(`/api/matches/${matchId}/lineup`);
                if (lineupRes.ok) setMyLineup(await lineupRes.json() as LineupPlayer[]);

                // 💡 チーム全体の選手リスト（ベンチメンバー候補）を取得
                if (matchData && matchData.teamId) {
                    const rosterRes = await fetch(`/api/teams/${matchData.teamId}/players`);
                    if (rosterRes.ok) setRoster(await rosterRes.json() as Player[]);
                }

            } catch (e) { console.error(e); }
            finally { setIsLoading(false); }
        };
        fetchData();
    }, [matchId]);

    if (isLoading) return <div className="flex h-screen items-center justify-center bg-background"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    if (!match) return <div className="p-8 text-center h-screen flex flex-col items-center justify-center"><p>試合が見つかりません</p><Button asChild variant="outline" className="mt-4"><Link href="/dashboard">戻る</Link></Button></div>;

    return (
        <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden relative">
            <Scoreboard
                match={match} inning={inning} isTop={isTop}
                guestInningScores={guestInningScores} selfInningScores={selfInningScores}
                guestScore={guestScore} selfScore={selfScore}
                currentPitcher={currentPitcher} selfPitchCount={selfPitchCount} selfInningPitchCount={selfInningPitchCount}
                currentBatter={currentBatter} nextBatter={nextBatter}
                onFinish={handleFinishMatch} onToggleFullScreen={toggleFullScreen}
            />

            <PlayArea
                balls={balls} strikes={strikes} outs={outs}
                firstBase={firstBase} secondBase={secondBase} thirdBase={thirdBase}
                pitchX={pitchX} pitchY={pitchY} onZoneClick={handleZoneClick}
            />

            <PlayLog logs={playLogs} />

            <ControlPanel
                handleBall={handleBall} handleStrike={handleStrike} handleManualOut={handleManualOut}
                handleUndo={handleUndo} canUndo={history.length > 0} initiateHit={initiateHit}
                handleWalk={handleWalk} initiateInPlayOut={initiateInPlayOut}
                initiateAdvance={() => setShowAdvanceModal(true)}
                initiateSubstitution={() => setShowSubModal(true)} // 💡 追加
            />

            <FieldModal
                show={showFieldModal}
                onClose={() => { setShowFieldModal(false); setPendingPlay(null); }}
                onFinalize={finalizePlayOnField}
            />

            <AdvanceModal
                show={showAdvanceModal}
                onClose={() => setShowAdvanceModal(false)}
                firstBase={firstBase}
                secondBase={secondBase}
                thirdBase={thirdBase}
                onAdvance={handleAdvance}
            />

            {/* 💡 選手交代モーダルを配置 */}
            <SubstitutionModal
                show={showSubModal}
                onClose={() => setShowSubModal(false)}
                roster={roster}
                currentLineup={myLineup}
                onSubstitute={handleSubstitute}
            />
        </div>
    );
}

export default function MatchScorePage() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center bg-background"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
            <MatchScoreContent />
        </Suspense>
    );
}