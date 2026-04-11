// src/components/matches/match-list.tsx
// src/components/matches/match-list.tsx
/* 💡 試合一覧リスト（スワイプ連動・x/ハイフン対応のフラットなイニングスコア実装） */
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Edit2, Calendar, MapPin, Trophy, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Match } from "@/types/match";

interface MatchListProps {
  matches: Match[];
  isLoading: boolean;
  onDelete?: (id: string) => void;
}

// 🔥 現場仕様：スコアのフォーマット関数（x・ハイフン対応）
interface FormatScoreProps {
  score: number | null | undefined;
  isBottom: boolean;
  isInningFinal: boolean;
  isHomeWinning: boolean;
}

const formatScoreDisplay = ({ score, isBottom, isInningFinal, isHomeWinning }: FormatScoreProps) => {
  // 後攻の最終回で、後攻が勝っていてスコアが未入力の場合、「x」を表示（サヨナラ・裏なし）
  if (isBottom && isInningFinal && isHomeWinning && (score === null || score === undefined)) {
    return "x";
  }
  // 未入力（未プレイ）のイニングは「-」を表示
  if (score === null || score === undefined) {
    return "-";
  }
  return score;
};

export function MatchList({ matches, isLoading, onDelete }: MatchListProps) {
  const router = useRouter();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [swipeId, setSwipeId] = useState<string | null>(null);
  const [startX, setStartX] = useState(0);
  const [offsetX, setOffsetX] = useState(0);

  const [teamFullName, setTeamFullName] = useState("");

  useEffect(() => {
    const fetchTeamName = async () => {
      const teamId = localStorage.getItem("iScore_selectedTeamId");
      if (!teamId) return;
      const teamRes = await fetch("/api/auth/me");
      if (teamRes.ok) {
        const res = (await teamRes.json()) as { data: { memberships: { teamId: string; organizationName?: string; teamName: string }[] } };
        const currentMembership = res.data.memberships.find(m => m.teamId === teamId);
        if (currentMembership) {
          setTeamFullName(`${currentMembership.organizationName} ${currentMembership.teamName}`);
        }
      }
    };
    fetchTeamName();
  }, []);

  if (isLoading) return <div className="space-y-3">{[1, 2, 3].map((i) => (<div key={i} className="h-28 w-full rounded-2xl bg-muted/50 animate-pulse" />))}</div>;

  // 🌟 スマートなスワイプ挙動（コンテキストが変わったら自動で閉じる）
  const handleTouchStart = (e: React.TouchEvent, id: string) => {
    // 別の試合を触り始めたら、開いているスコアを閉じる
    if (expandedId !== null && expandedId !== id) {
      setExpandedId(null);
    }
    setStartX(e.touches[0].clientX);
    setSwipeId(id);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const currentX = e.touches[0].clientX;
    const diff = currentX - startX;

    // スワイプ（横移動）が10px以上発生したら、自分自身が開いていても閉じる
    if (Math.abs(diff) > 10 && expandedId !== null) {
      setExpandedId(null);
    }

    if (Math.abs(diff) < 100) setOffsetX(diff);
  };

  const handleTouchEnd = () => {
    if (offsetX > 50) setOffsetX(80);
    else if (offsetX < -50) setOffsetX(-80);
    else { setOffsetX(0); setSwipeId(null); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("本当にこの試合を削除しますか？")) return;
    try {
      const res = await fetch(`/api/matches/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success("試合を削除しました");
        if (onDelete) onDelete(id);
        else window.location.reload();
      } else {
        toast.error("削除に失敗しました");
      }
    } catch (error) {
      toast.error("エラーが発生しました");
    }
  };

  if (matches.length === 0) {
    return (
      <div className="text-center py-10 px-4 rounded-3xl border-2 border-dashed border-border/50 bg-card/50">
        <p className="text-sm font-bold text-muted-foreground">試合データがありません</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 overflow-x-hidden px-1 pb-1">
      {matches.map((match) => {
        const isWin = match.myScore > match.opponentScore;
        const isLoss = match.myScore < match.opponentScore;
        const isDraw = match.myScore === match.opponentScore;
        const isExpanded = expandedId === match.id;
        const isSwiping = swipeId === match.id;

        const firstScore = match.battingOrder === 'first' ? match.myScore : match.opponentScore;
        const secondScore = match.battingOrder === 'first' ? match.opponentScore : match.myScore;
        const inningCount = match.innings || 7;

        const myScores = match.myInningScores || [];
        const oppScores = match.opponentInningScores || [];

        // 先攻・後攻のスコア配列を決定
        const topScores = match.battingOrder === 'first' ? myScores : oppScores;
        const bottomScores = match.battingOrder === 'second' ? myScores : oppScores;
        const isHomeWinning = secondScore > firstScore;

        return (
          <div key={match.id} className="relative">
            {/* --- スワイプ時の背面ボタン --- */}
            <div className={cn(
              "absolute inset-0 flex items-center justify-between px-1 transition-opacity duration-200",
              Math.abs(offsetX) > 0 ? "opacity-100" : "opacity-0 pointer-events-none"
            )}>
              <button
                onClick={() => router.push(`/matches/edit?id=${match.id}`)}
                className="flex flex-col items-center justify-center w-16 h-[calc(100%-8px)] bg-blue-400 dark:bg-blue-500 hover:bg-blue-500 text-white rounded-xl shadow-sm transition-all active:scale-95"
              >
                <Edit2 className="h-5 w-5 mb-1 opacity-90" />
                <span className="text-[10px] font-black tracking-widest opacity-90">編集</span>
              </button>
              <button
                onClick={() => handleDelete(match.id)}
                className="flex flex-col items-center justify-center w-16 h-[calc(100%-8px)] bg-rose-400 dark:bg-rose-500 hover:bg-rose-500 text-white rounded-xl shadow-sm transition-all active:scale-95"
              >
                <Trash2 className="h-5 w-5 mb-1 opacity-90" />
                <span className="text-[10px] font-black tracking-widest opacity-90">削除</span>
              </button>
            </div>

            {/* --- カード本体 --- */}
            <div
              // 🌟 !isExpanded の制限を外し、いつでもスワイプイベントを検知可能に
              onTouchStart={(e) => handleTouchStart(e, match.id)}
              onTouchMove={(e) => handleTouchMove(e)}
              onTouchEnd={() => handleTouchEnd()}
              // isSwiping のみに依存させ、開いていてもスワイプアニメーションを一時的に許可（直後に閉じる）
              style={{ transform: isSwiping ? `translateX(${offsetX}px)` : 'translateX(0)' }}
              className={cn(
                "relative z-10 rounded-2xl border transition-all duration-300 ease-out",
                isExpanded
                  ? "bg-primary/10 backdrop-blur-sm border-primary shadow-md shadow-primary/5"
                  : "bg-card border-border/50 shadow-sm hover:border-border"
              )}
            >
              <div
                className="p-4 sm:p-5 cursor-pointer"
                onClick={() => {
                  if (Math.abs(offsetX) < 10) setExpandedId(isExpanded ? null : match.id);
                  setOffsetX(0); setSwipeId(null);
                }}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={cn(
                        "w-16 text-center text-[10px] sm:text-xs font-black px-1.5 py-0.5 rounded shadow-sm",
                        match.matchType === 'official' ? "bg-amber-500/10 text-amber-600 border border-amber-500/20" : "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                      )}>
                        {match.matchType === 'official' ? '公式戦' : '練習試合'}
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" /> {match.date}
                      </span>
                    </div>

                    <h3 className="text-lg sm:text-xl font-black truncate text-foreground mb-1">vs {match.opponent}</h3>

                    {match.matchType === 'official' && (
                      <p className="text-xs font-bold text-amber-600 flex items-center gap-1 mt-0.5 truncate">
                        <Trophy className="h-3.5 w-3.5 shrink-0" /> {match.tournamentName || "大会名未登録"}
                      </p>
                    )}

                    <p className="text-xs font-bold text-muted-foreground flex items-center gap-1 mt-1 truncate">
                      <MapPin className="h-3.5 w-3.5 shrink-0" /> {match.surfaceDetails || "球場未設定"}
                    </p>
                  </div>

                  <div className="flex flex-col items-center gap-1.5 shrink-0">
                    <div className="w-14 text-center">
                      {isWin && <span className="block w-full bg-blue-600 text-white text-[11px] font-black py-0.5 rounded shadow-sm">WIN</span>}
                      {isLoss && <span className="block w-full bg-red-600 text-white text-[11px] font-black py-0.5 rounded shadow-sm">LOSE</span>}
                      {isDraw && <span className="block w-full bg-zinc-500 text-white text-[11px] font-black py-0.5 rounded shadow-sm">DRAW</span>}
                    </div>

                    <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/5 dark:bg-primary/10 rounded-xl border border-primary/20">
                      <div className="text-center w-7">
                        <p className="text-[9px] font-black text-primary/70 uppercase leading-none">先</p>
                        <span className="text-xl font-black tabular-nums leading-none text-foreground">{firstScore}</span>
                      </div>
                      <span className="text-sm font-black text-primary/30">-</span>
                      <div className="text-center w-7">
                        <p className="text-[9px] font-black text-primary/70 uppercase leading-none">後</p>
                        <span className="text-xl font-black tabular-nums leading-none text-foreground">{secondScore}</span>
                      </div>
                    </div>
                    {isExpanded ? <ChevronUp className="h-4 w-4 text-primary mt-1" /> : <ChevronDown className="h-4 w-4 text-muted-foreground/50 mt-1" />}
                  </div>
                </div>

                {/* 🌟 展開時：イニングスコア（フラットデザイン ＆ x/- フォーマット対応） */}
                {isExpanded && (
                  <div className="mt-4 pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="w-full overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                      <div className="overflow-x-auto">
                        <table className="w-full text-center whitespace-nowrap">
                          {/* ヘッダー行：イニング数は text-sm/md:text-base で見やすく */}
                          <thead className="bg-muted/30 dark:bg-muted/10 border-b border-border/50">
                            <tr>
                              <th className="py-2 px-3 text-left font-normal text-muted-foreground text-xs w-20 md:w-32">
                                TEAM
                              </th>
                              {Array.from({ length: inningCount }).map((_, i) => (
                                <th key={i} className="py-2 px-1 sm:px-2 text-sm md:text-base font-semibold text-foreground">
                                  {i + 1}
                                </th>
                              ))}
                              <th className="py-2 px-3 text-sm md:text-base font-bold text-primary">R</th>
                            </tr>
                          </thead>

                          <tbody className="divide-y divide-border/50 text-xs sm:text-sm font-medium tabular-nums">
                            {/* 先攻（Top） */}
                            <tr>
                              <td className="py-2 px-3 text-left">
                                {/* スマホでは省略、PCではフル表示 */}
                                <div className="w-16 truncate md:w-auto md:whitespace-normal">
                                  {match.battingOrder === 'first' ? (teamFullName || "自チーム") : (match.opponent || "相手")}
                                </div>
                              </td>
                              {Array.from({ length: inningCount }).map((_, i) => (
                                <td key={`top-${i}`} className="py-2 text-muted-foreground">
                                  {formatScoreDisplay({
                                    score: topScores[i],
                                    isBottom: false,
                                    isInningFinal: i === inningCount - 1,
                                    isHomeWinning
                                  })}
                                </td>
                              ))}
                              <td className="py-2 px-3 font-bold text-primary">{firstScore}</td>
                            </tr>

                            {/* 後攻（Bottom） */}
                            <tr>
                              <td className="py-2 px-3 text-left">
                                <div className="w-16 truncate md:w-auto md:whitespace-normal">
                                  {match.battingOrder === 'second' ? (teamFullName || "自チーム") : (match.opponent || "相手")}
                                </div>
                              </td>
                              {Array.from({ length: inningCount }).map((_, i) => (
                                <td key={`bottom-${i}`} className="py-2 text-foreground font-semibold">
                                  {formatScoreDisplay({
                                    score: bottomScores[i],
                                    isBottom: true,
                                    isInningFinal: i === inningCount - 1,
                                    isHomeWinning
                                  })}
                                </td>
                              ))}
                              <td className="py-2 px-3 font-bold text-primary">{secondScore}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}