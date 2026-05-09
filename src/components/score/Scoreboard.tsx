// filepath: `src/components/score/Scoreboard.tsx`
/* 💡 伝統的イニングスコア形式。物理配置（上段＝オモテ、下段＝ウラ）を厳守。
   試合開始前限定の右スライドで「先攻・後攻ラベル」を確実に入れ替える。 */

"use client";

import { useState, useRef } from "react";
import { useScore } from "@/contexts/ScoreContext";
import { cn } from "@/lib/utils";

export function Scoreboard() {
  const { state, updateMatchSettings } = useScore();
  const [offsetX, setOffsetX] = useState(0);
  const startX = useRef(0);
  
  const displayInningsCount = Math.max(state.maxInnings || 9, state.inning);
  const innings = Array.from({ length: displayInningsCount }, (_, i) => i + 1);

  /**
   * 💡 現場至上主義：試合開始前かどうかの判定[span_1](start_span)[span_1](end_span)
   * 1回表・無死・無走者・両チーム無得点の時のみ「先攻・後攻」の入れ替えを許可。
   */
  const isPreGame = state.inning === 1 && state.isTop && 
                    state.myScore === 0 && state.opponentScore === 0 &&
                    state.outs === 0 && state.balls === 0 && state.strikes === 0;

  /**
   * 🚀 攻守ラベルの動的決定
   * ユーザー様の定義：自チームが先攻(isGuestFirst)なら、上段＝HOME(自)、下段＝GUEST(敵)
   */
  const topLabel = state.isGuestFirst ? "HOME" : "GUEST";
  const bottomLabel = state.isGuestFirst ? "GUEST" : "HOME";

  // 🚀 スマート・スワイプ制御：右方向のみ。縦スクロール時は無効化[span_2](start_span)[span_2](end_span)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isPreGame) return;
    startX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPreGame) return;
    const move = e.touches[0].clientX - startX.current;
    if (move > 0) setOffsetX(Math.min(move, 80)); 
  };

  const handleTouchEnd = () => {
    if (offsetX >= 60) {
      // 🌟 実際に先攻・後攻の設定を入れ替える
      updateMatchSettings?.({ isGuestFirst: !state.isGuestFirst });
    }
    setOffsetX(0);
  };

  const numberStyle = "font-black tabular-nums tracking-tighter";

  return (
    <div className="w-full bg-background border-b border-border transition-colors select-none">
      <div className="w-full px-1 py-1">
        
        {/* 掲示板コンテナ */}
        <div className="relative overflow-hidden border border-border rounded-md shadow-sm bg-card">
          
          {/* 🌟 改善：スライド背景をプライマリカラーに変更し、文字を「攻守切替」に[span_3](start_span)[span_3](end_span) */}
          <div 
            className="absolute inset-0 flex items-center px-6 bg-primary z-0 pointer-events-none transition-opacity"
            style={{ opacity: offsetX > 15 ? 1 : 0 }}
          >
            <span className="text-[12px] font-black text-primary-foreground tracking-[0.2em]">攻守切替</span>
          </div>

          {/* 前面テーブル本体 */}
          <div 
            className="relative z-10 bg-card transition-transform duration-200 ease-out"
            style={{ transform: `translateX(${offsetX}px)` }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <table className="w-full border-collapse text-card-foreground min-w-[340px]">
              <thead>
                <tr className="bg-muted/50 border-b border-border text-muted-foreground/60">
                  <th className="w-12 py-1 pl-2 text-left">
                    <span className="text-[8px] font-black uppercase tracking-widest">TEAM</span>
                  </th>
                  {innings.map(i => (
                    <th key={i} className={cn(
                      "py-1 text-base px-1",
                      numberStyle,
                      state.inning === i ? "bg-primary text-primary-foreground" : ""
                    )}>{i}</th>
                  ))}
                  <th className={cn("w-8 bg-muted border-l border-border/50 text-center text-base", numberStyle)}>R</th>
                  <th className={cn("w-8 bg-muted/30 text-center text-base", numberStyle)}>H</th>
                  <th className={cn("w-8 bg-muted/30 text-center text-base", numberStyle)}>E</th>
                </tr>
              </thead>
              <tbody>
                {/* 🔴 上段：オモテ(isTop)の攻撃時にハイライト。常に先攻を表示。[span_4](start_span)[span_4](end_span) */}
                <tr className={cn("border-b border-border/50 transition-colors", state.isTop ? "bg-primary/10" : "bg-transparent")}>
                  <td className="pl-2 py-1">
                    <span className={cn("text-[10px] font-black uppercase", state.isTop ? "text-primary" : "text-foreground/70")}>
                      {topLabel}
                    </span>
                  </td>
                  {innings.map(i => (
                    <td key={i} className={cn(
                      "text-center text-lg px-0.5",
                      numberStyle,
                      state.inning === i && state.isTop ? "text-primary font-black underline decoration-2 underline-offset-2" : "text-foreground/80",
                      (state.opponentInningScores[i - 1] === undefined && i > state.inning) && "opacity-10"
                    )}>
                      {state.opponentInningScores[i - 1] ?? (i <= state.inning && (state.isTop || i < state.inning) ? "0" : "-")}
                    </td>
                  ))}
                  {/* Rエリア：攻撃中なら青く強調。表なら上段。[span_5](start_span)[span_5](end_span) */}
                  <td className={cn(
                    "text-center text-xl border-l border-border transition-colors", 
                    numberStyle,
                    state.isTop ? "bg-primary/15 text-primary" : "bg-muted/30"
                  )}>
                    {state.opponentScore}
                  </td>
                  <td className={cn("text-center text-lg text-muted-foreground/80", numberStyle)}>{state.opponentHits || 0}</td>
                  <td className={cn("text-center text-lg text-muted-foreground/80", numberStyle)}>{state.opponentErrors || 0}</td>
                </tr>

                {/* 🔵 下段：ウラ(!isTop)の攻撃時にハイライト。常に後攻を表示。[span_6](start_span)[span_6](end_span) */}
                <tr className={cn("transition-colors", !state.isTop ? "bg-primary/10" : "bg-transparent")}>
                  <td className="pl-2 py-1">
                    <span className={cn("text-[10px] font-black uppercase", !state.isTop ? "text-primary" : "text-foreground/70")}>
                      {bottomLabel}
                    </span>
                  </td>
                  {innings.map(i => (
                    <td key={i} className={cn(
                      "text-center text-lg px-0.5",
                      numberStyle,
                      state.inning === i && !state.isTop ? "text-primary font-black underline decoration-2 underline-offset-2" : "text-foreground/80",
                      (state.myInningScores[i - 1] === undefined && i >= state.inning && !(state.isTop && i === state.inning)) && "opacity-10"
                    )}>
                      {state.myInningScores[i - 1] ?? (i <= state.inning && (!state.isTop || i < state.inning) ? "0" : "-")}
                    </td>
                  ))}
                  {/* Rエリア：攻撃中なら青く強調。裏なら下段。[span_7](start_span)[span_7](end_span) */}
                  <td className={cn(
                    "text-center text-xl border-l border-border transition-colors", 
                    numberStyle,
                    !state.isTop ? "bg-primary/15 text-primary" : "bg-muted/30"
                  )}>
                    {state.myScore}
                  </td>
                  <td className={cn("text-center text-lg text-muted-foreground/80", numberStyle)}>{state.myHits || 0}</td>
                  <td className={cn("text-center text-lg text-muted-foreground/80", numberStyle)}>{state.myErrors || 0}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 下段：BSO & カウント表示 */}
        <div className="flex items-center justify-between px-2 mt-2 h-8">
          <div className="flex gap-5">
            {[
              { label: 'B', color: 'bg-emerald-500 shadow-[0_0_10px_#10b981]', count: state.balls, max: 3, textColor: 'text-emerald-600' },
              { label: 'S', color: 'bg-amber-400 shadow-[0_0_10px_#fbbf24]', count: state.strikes, max: 2, textColor: 'text-amber-600' },
              { label: 'O', color: 'bg-rose-500 shadow-[0_0_10px_#f43f5e]', count: state.outs, max: 2, textColor: 'text-rose-600' }
            ].map(type => (
              <div key={type.label} className="flex items-center gap-2">
                <span className={cn("text-lg font-black", type.textColor)}>{type.label}</span>
                <div className="flex gap-1.5">
                  {Array.from({ length: type.max }).map((_, i) => (
                    <div key={i} className={cn(
                      "w-4 h-4 rounded-full border border-border/40 transition-all duration-300",
                      i < type.count ? type.color : "bg-muted shadow-inner"
                    )} />
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center text-primary pr-1">
            <span className={cn("text-2xl", numberStyle)}>{state.inning}</span>
            <span className="text-[14px] font-black ml-1.5 mr-1 leading-none">回</span>
            <span className="text-[14px] font-black leading-none">{state.isTop ? "オモテ" : "ウラ"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
