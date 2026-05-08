// filepath: `src/components/score/PlayLog.tsx`
/* 💡 プレイ内容をリアルタイムに表示。通知(Sonner)の代替として、最新のプレイを強力に強調。
   ScorePageの中央エリアに収まるよう、コンパクトかつ高コントラストな設計。 */

"use client";

import { useEffect, useState, useRef } from "react";
import { useScore } from "@/contexts/ScoreContext";
import {
  History,
  Mic2,
  RefreshCcw,
  Trophy,
  ArrowUpRight,
  Circle,
  Zap,
  CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";

// 既存のインターフェースを尊重
interface PlayLogItem {
  id: string;
  inningText: string;
  description: string;
  resultType: 'pitch' | 'hit' | 'out' | 'score' | string;
  timestamp?: number;
}

interface PlayLogResponse {
  success: boolean;
  logs: PlayLogItem[];
}

interface PlayLogProps {
  limit?: number;
}

export function PlayLog({ limit }: PlayLogProps) {
  const { state } = useScore();
  const [logs, setLogs] = useState<PlayLogItem[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  /**
   * 💡 現場視点: ログ取得
   * Context内のstate.logsとAPIの結果をマージし、常に最新のフィードバックを保証
   */
  const fetchLogs = async () => {
    if (!state.matchId) return;
    setIsFetching(true);
    try {
      const res = await fetch(`/api/matches/${state.matchId}/logs`);
      if (res.ok) {
        const data = (await res.json()) as PlayLogResponse;
        if (data.success) {
          // 最新が上になるようにソート
          const sortedLogs = data.logs.reverse();
          setLogs(limit ? sortedLogs.slice(0, limit) : sortedLogs);
        }
      }
    } catch (error) {
      console.error("Failed to fetch logs:", error);
    } finally {
      setIsFetching(false);
    }
  };

  // 試合状況が変わった時に即座に再取得（通知の代わり）
  useEffect(() => {
    fetchLogs();
  }, [state.matchId, state.pitchCount, state.outs, state.myScore, state.opponentScore]);

  // 定期更新（他端末での操作反映）
  useEffect(() => {
    const interval = setInterval(fetchLogs, 10000);
    return () => clearInterval(interval);
  }, [state.matchId]);

  return (
    <div className={cn(
      "flex flex-col overflow-hidden transition-all duration-500",
      limit 
        ? "bg-transparent h-full" 
        : "bg-card border-2 border-border rounded-[40px] h-[500px] shadow-2xl"
    )}>
      {/* 1. ヘッダー (詳細モードのみ) */}
      {!limit && (
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/30">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <Mic2 className="h-4 w-4 text-primary" />
              <span className="absolute -top-1 -right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-foreground/80">
              Live Play Log
            </span>
          </div>
          <button onClick={fetchLogs} disabled={isFetching} className="p-2 rounded-full hover:bg-primary/10 transition-colors">
            <RefreshCcw className={cn("h-4 w-4 text-muted-foreground", isFetching && "animate-spin")} />
          </button>
        </div>
      )}

      {/* 2. ログリスト */}
      <div
        ref={scrollRef}
        className={cn(
          "flex-1 overflow-y-auto scrollbar-hide space-y-2",
          limit ? "px-1 py-0" : "p-6"
        )}
      >
        {logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full opacity-30 py-4">
            <History className="h-8 w-8 mb-2 stroke-[1px]" />
            <p className="text-[8px] font-black uppercase tracking-widest">Waiting for Actions...</p>
          </div>
        ) : (
          logs.map((log, index) => {
            const isLatest = index === 0;
            const isScore = log.resultType === 'score' || log.description.includes("得点");
            const isOut = log.resultType === 'out' || log.description.includes("アウト") || log.description.includes("三振");
            const isHit = log.resultType === 'hit' || log.description.includes("安打");

            return (
              <div
                key={log.id || index}
                className={cn(
                  "relative flex items-center gap-3 transition-all duration-500",
                  // 💡 通知の代わり：最新の1件だけ背景色を強くし、アニメーション
                  isLatest && limit
                    ? "bg-primary text-primary-foreground px-4 py-2.5 rounded-[20px] shadow-lg animate-in fade-in slide-in-from-bottom-2 scale-[1.02]" 
                    : "bg-muted/50 text-foreground/80 px-4 py-2 rounded-[18px] border border-border/50",
                  !isLatest && "opacity-60 grayscale-[0.5]"
                )}
              >
                {/* イニング表示 */}
                <div className={cn(
                  "flex items-center justify-center min-w-[28px] h-5 rounded-full text-[9px] font-black italic border",
                  isLatest && limit ? "bg-white/20 border-white/30" : "bg-background border-border"
                )}>
                  {log.inningText || "1T"}
                </div>

                {/* 詳細テキスト */}
                <div className="flex-1 min-w-0 flex items-center gap-1.5">
                  <p className={cn(
                    "font-black tracking-tight truncate",
                    limit ? "text-[12px]" : "text-sm"
                  )}>
                    {log.description}
                  </p>
                  {isHit && <ArrowUpRight className="h-3 w-3 text-blue-500 shrink-0" />}
                  {isScore && <Trophy className="h-3 w-3 text-yellow-500 shrink-0" />}
                  {isOut && <Circle className="h-2 w-2 fill-rose-500 text-rose-500 shrink-0" />}
                </div>

                {/* 通信完了バッジ (最新ログのみ) */}
                {isLatest && !isFetching && (
                  <CheckCircle2 className={cn(
                    "h-3 w-3 shrink-0",
                    limit ? "text-primary-foreground/60" : "text-primary"
                  )} />
                )}
              </div>
            );
          })
        )}
      </div>

      {/* 3. フッター (詳細モードのみ) */}
      {!limit && (
        <div className="px-6 py-3 bg-muted/30 border-t border-border flex justify-between items-center">
          <span className="text-[8px] font-black text-muted-foreground/50 uppercase tracking-[0.4em]">
            {logs.length} Total Records
          </span>
          <div className="flex gap-1">
             {[...Array(3)].map((_, i) => (
               <div key={i} className="w-1 h-1 rounded-full bg-primary/30 animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
             ))}
          </div>
        </div>
      )}
    </div>
  );
}
