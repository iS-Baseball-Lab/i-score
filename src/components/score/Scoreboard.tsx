// filepath: `src/components/score/Scoreboard.tsx`
"use client";

import { useState, useRef } from "react";
import { useScore } from "@/contexts/ScoreContext";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

export function Scoreboard() {
  const { state, updateMatchSettings } = useScore();
  const [offsetX, setOffsetX] = useState(0);
  const startX = useRef(0);
  
  const displayInningsCount = Math.max(state.maxInnings || 9, state.inning);
  const innings = Array.from({ length: displayInningsCount }, (_, i) => i + 1);

  // 💡 試合開始前かどうかの判定（1回表・0対0・無死・カウントなし）
  const isPreGame = state.inning === 1 && state.isTop && 
                    state.myScore === 0 && state.opponentScore === 0 &&
                    state.outs === 0 && state.balls === 0 && state.strikes === 0;

  // 🚀 スライド操作
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isPreGame) return; // 試合開始後は無効
    startX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPreGame) return;
    const move = e.touches[0].clientX - startX.current;
    // 右方向(move > 0)へのスライドのみ許容（最大80px）
    if (move > 0) {
      setOffsetX(Math.min(move, 80));
    }
  };

  const handleTouchEnd = () => {
    if (!isPreGame) return;
    // 60px以上右にスライドしたら切り替え実行
    if (offsetX >= 60) {
      const nextSettings = { isGuestFirst: !state.isGuestFirst };
      updateMatchSettings?.(nextSettings);
    }
    setOffsetX(0);
  };

  const numberStyle = "font-black tabular-nums tracking-tighter";

  return (
    <div className="w-full bg-background border-b border-border transition-colors select-none">
      <div className="w-full px-1 py-1">
        
        {/* 🚀 スライドコンテナ（右スライドのみ） */}
        <div 
          className={cn(
            "relative overflow-hidden border border-border rounded-md shadow-sm transition-transform duration-200 ease-out bg-card",
            isPreGame && "cursor-grab active:cursor-grabbing"
          )}
          style={{ transform: `translateX(${offsetX}px)` }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* スライド時に見える背景メッセージ */}
          <div className="absolute inset-y-0 left-0 w-full flex items-center px-4 bg-primary/10 -z-10">
            <ArrowRight className="w-4 h-4 text-primary animate-pulse mr-2" />
            <span className="text-[10px] font-black uppercase text-primary tracking-widest">Switch Side</span>
          </div>

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
              {/* GUEST */}
              <tr className={cn("border-b border-border/50", state.isTop ? "bg-primary/5" : "")}>
                <td className="pl-2 py-1">
                  <span className={cn("text-[10px] font-black uppercase", state.isTop ? "text-primary" : "text-foreground/70")}>GUEST</span>
                </td>
                {innings.map(i => (
                  <td key={i} className={cn(
                    "text-center text-lg px-0.5",
                    numberStyle,
                    state.inning === i && state.isTop ? "text-primary underline decoration-2 underline-offset-2" : "text-foreground/80",
                    (state.opponentInningScores[i - 1] === undefined && i > state.inning) && "opacity-10"
                  )}>
                    {state.opponentInningScores[i - 1] ?? (i <= state.inning ? "0" : "-")}
                  </td>
                ))}
                <td className={cn("text-center text-xl bg-muted/30 border-l border-border", numberStyle)}>{state.opponentScore}</td>
                <td className={cn("text-center text-lg text-muted-foreground/80", numberStyle)}>{state.opponentHits || 0}</td>
                <td className={cn("text-center text-lg text-muted-foreground/80", numberStyle)}>{state.opponentErrors || 0}</td>
              </tr>

              {/* HOME */}
              <tr className={cn(!state.isTop ? "bg-primary/5" : "")}>
                <td className="pl-2 py-1">
                  <span className={cn("text-[10px] font-black uppercase", !state.isTop ? "text-primary" : "text-foreground/70")}>HOME</span>
                </td>
                {innings.map(i => (
                  <td key={i} className={cn(
                    "text-center text-lg px-0.5",
                    numberStyle,
                    state.inning === i && !state.isTop ? "text-primary underline decoration-2 underline-offset-2" : "text-foreground/80",
                    (state.myInningScores[i - 1] === undefined && i >= state.inning && !(state.isTop && i === state.inning)) && "opacity-10"
                  )}>
                    {state.myInningScores[i - 1] ?? (i <= state.inning && !(state.isTop === true && i === state.inning) ? "0" : "-")}
                  </td>
                ))}
                <td className={cn("text-center text-xl bg-primary/10 text-primary border-l border-border", numberStyle)}>{state.myScore}</td>
                <td className={cn("text-center text-lg text-muted-foreground/80", numberStyle)}>{state.myHits || 0}</td>
                <td className={cn("text-center text-lg text-muted-foreground/80", numberStyle)}>{state.myErrors || 0}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 🚀 下段：BSO & イニング表示 */}
        <div className="flex items-center justify-between px-2 mt-2 h-8">
          <div className="flex gap-5">
            {[
              { label: 'B', color: 'bg-emerald-500 shadow-[0_0_10px_#10b981]', count: state.balls, max: 3, textColor: 'text-emerald-600' },
              { label: 'S', color: 'bg-amber-400 shadow-[0_0_10px_#fbbf24]', count: state.strikes, max: 2, textColor: 'text-amber-600' },
              { label: 'O', color: 'bg-rose-500 shadow-[0_0_10px_#f43f5e]', count: state.outs, max: 2, textColor: 'text-rose-600' }
            ].map(type => (
              <div key={type.label} className="flex items-center gap-2">
                {/* 🌟 italicを廃止しfont-blackで統一 */}
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

          {/* 🌟 フォントサイズを13pxに大きくし、数値とのバランスを調整 */}
          <div className="flex items-center text-primary pr-1">
            <span className={cn("text-xl", numberStyle)}>{state.inning}</span>
            <span className="text-[13px] font-black mx-1.5 leading-none">回</span>
            <span className="text-[13px] font-black leading-none">{state.isTop ? "オモテ" : "ウラ"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
