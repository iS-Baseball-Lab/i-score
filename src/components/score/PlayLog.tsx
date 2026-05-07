// filepath: `src/components/score/PlayLog.tsx`
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
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PlayLogItem {
  id: string;
  inningText: string;
  description: string;
  resultType: 'pitch' | 'hit' | 'out' | 'score' | string;
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

  const fetchLogs = async () => {
    if (!state.matchId) return;
    setIsFetching(true);
    try {
      const res = await fetch(`/api/matches/${state.matchId}/logs`);
      if (res.ok) {
        const data = (await res.json()) as PlayLogResponse;
        if (data.success) {
          // 💡 現場視点: ログは「最新が上」の方が、1行表示(limit=1)の時に使いやすい
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

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 10000);
    return () => clearInterval(interval);
  }, [state.matchId, state.pitchCount, state.outs]);

  useEffect(() => {
    if (scrollRef.current && !limit) {
      scrollRef.current.scrollTop = 0; // 最新が上なのでトップへ
    }
  }, [logs, limit]);

  return (
    <div className={cn(
      "flex flex-col overflow-hidden transition-all duration-700",
      limit === 1
        ? "bg-transparent" 
        : "bg-card/60 border-2 border-border/40 rounded-[40px] h-[400px] shadow-2xl backdrop-blur-3xl"
    )}>
      {/* 1. ヘッダー (詳細モード) */}
      {!limit && (
        <div className="px-6 py-4 border-b border-border/20 flex items-center justify-between bg-black/5">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <Mic2 className="h-4 w-4 text-primary" />
              <span className="absolute -top-1 -right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-foreground/80">
              Direct Play Log
            </span>
          </div>
          <button onClick={fetchLogs} disabled={isFetching} className="p-2 rounded-full hover:bg-primary/10 transition-colors group">
            <RefreshCcw className={cn("h-4 w-4 text-muted-foreground group-hover:text-primary transition-all", isFetching && "animate-spin")} />
          </button>
        </div>
      )}

      {/* 2. ログリスト */}
      <div
        ref={scrollRef}
        className={cn(
          "flex-1 overflow-y-auto scrollbar-hide space-y-3",
          limit === 1 ? "p-0" : "p-6"
        )}
      >
        {logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full opacity-30 py-10">
            <History className="h-10 w-10 mb-3 stroke-[1px]" />
            <p className="text-[9px] font-black uppercase tracking-widest">Waiting for Actions...</p>
          </div>
        ) : (
          logs.map((log, index) => (
            <div
              key={log.id || index}
              className={cn(
                "group relative animate-in fade-in slide-in-from-right-4 duration-500",
                limit === 1 
                  ? "flex items-center gap-3 bg-black/20 backdrop-blur-md px-4 py-2.5 rounded-full border border-white/5" 
                  : "p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-primary/30 transition-all shadow-sm"
              )}
            >
              {/* アイコン & イニング */}
              <div className="flex items-center gap-2 shrink-0">
                <div className={cn(
                  "flex items-center justify-center w-6 h-6 rounded-full text-[8px] font-black italic",
                  log.resultType === 'score' ? "bg-primary text-primary-foreground shadow-[0_0_12px_rgba(var(--primary),0.4)]" :
                  log.resultType === 'out' ? "bg-rose-500/20 text-rose-500" :
                  "bg-muted/50 text-muted-foreground"
                )}>
                  {log.inningText.slice(0, 2)}
                </div>
                <Circle className={cn(
                  "h-1.5 w-1.5 fill-current",
                  log.resultType === 'score' ? "text-primary" :
                  log.resultType === 'out' ? "text-rose-500" :
                  log.resultType === 'hit' ? "text-blue-400" : "text-muted-foreground/20"
                )} />
              </div>

              {/* 詳細テキスト */}
              <p className={cn(
                "font-bold tracking-tight leading-none flex-1",
                limit === 1 ? "text-[10px] text-white/90 truncate" : "text-sm text-foreground/90"
              )}>
                {log.description}
                {log.resultType === 'hit' && <ArrowUpRight className="inline ml-1 h-3 w-3 text-blue-400" />}
                {log.resultType === 'score' && <Trophy className="inline ml-1 h-3 w-3 text-primary" />}
              </p>

              {/* LINE速報済みバッジ (詳細モードのみ) */}
              {!limit && (
                <div className="flex items-center gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
                  <Zap className="h-2.5 w-2.5 text-primary fill-current" />
                  <span className="text-[7px] font-black uppercase text-primary">Reported</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* 3. フッター (詳細モード) */}
      {!limit && (
        <div className="px-6 py-3 bg-black/10 border-t border-white/5 flex justify-between items-center">
          <span className="text-[8px] font-black text-muted-foreground/50 uppercase tracking-[0.4em]">
            {logs.length} Sequential Records
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
