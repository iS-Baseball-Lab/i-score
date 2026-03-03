// src/components/score/PlayLog.tsx
import { useEffect, useRef } from "react";
import { MessageSquareText } from "lucide-react";
import { cn } from "@/lib/utils";

interface PlayLogProps {
    logs: string[];
}

export function PlayLog({ logs }: PlayLogProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    // 💡 ログが追加されたら、自動的に一番下までスクロールする
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [logs]);

    return (
        <div
            ref={scrollRef}
            className="bg-muted/10 border-y border-border px-4 py-2 h-[88px] overflow-y-auto flex flex-col gap-1.5 text-sm shadow-inner scroll-smooth"
        >
            {logs.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground/50 font-bold text-xs gap-1.5">
                    <MessageSquareText className="h-4 w-4" /> プレイログがここに表示されます
                </div>
            ) : (
                logs.map((log, i) => {
                    // ログの内容に応じて色を変える
                    const isHit = log.includes('ヒット') || log.includes('二塁打') || log.includes('三塁打') || log.includes('本塁打');
                    const isOut = log.includes('アウト') || log.includes('三振') || log.includes('併殺打') || log.includes('フライ');
                    const isWalk = log.includes('四死球');

                    return (
                        <div key={i} className="animate-in slide-in-from-bottom-2 fade-in flex items-start gap-2 leading-snug">
                            <span className="text-[9px] font-mono text-muted-foreground/40 pt-0.5 shrink-0">
                                {(i + 1).toString().padStart(3, '0')}
                            </span>
                            <span className={cn(
                                "font-medium text-xs sm:text-sm",
                                isHit ? "text-blue-600 dark:text-blue-400 font-bold" :
                                    isOut ? "text-red-500 font-bold" :
                                        isWalk ? "text-green-600 dark:text-green-500 font-bold" :
                                            "text-muted-foreground"
                            )}>
                                {log}
                            </span>
                        </div>
                    );
                })
            )}
        </div>
    );
}