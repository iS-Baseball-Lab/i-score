// filepath: `src/components/score/ControlPanel.tsx`
import { useScore } from "@/contexts/ScoreContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Plus, Minus, Send, RotateCcw, MessageSquarePlus } from "lucide-react";

export function ControlPanel() {
  const { state, recordInPlay, isSyncing, changeInning } = useScore();

  // LINE速報用のクイックタグ
  const quickTags = [
    { label: "単打", text: "クリーンヒット！" },
    { label: "二塁打", text: "鋭い当たりで二塁打！" },
    { label: "本塁打", text: "完璧な当たり！ホームラン！！" },
    { label: "犠飛", text: "犠牲フライで1点追加。" },
    { label: "エラー", text: "相手のエラーの間に進塁。" },
    { label: "四球", text: "粘ってフォアボールを選びました。" },
  ];

  return (
    <div className="h-full flex flex-col gap-3">
      
      {/* 🌟 クイック速報タグ（横スクロール） */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-2 px-2">
        {quickTags.map((tag) => (
          <Button
            key={tag.label}
            variant="outline"
            size="sm"
            className="rounded-full h-8 px-4 border-primary/20 bg-primary/5 text-[10px] font-black italic shrink-0 active:bg-primary active:text-white transition-colors"
            onClick={() => recordInPlay(tag.text, 0, [])} // 点数0で速報のみ飛ばす運用も可
          >
            {tag.label}
          </Button>
        ))}
        <Button variant="ghost" size="sm" className="rounded-full h-8 w-8 p-0 shrink-0">
          <MessageSquarePlus className="w-4 h-4 opacity-40" />
        </Button>
      </div>

      {/* 🌟 メイン・アクション・エリア */}
      <div className="flex-1 grid grid-cols-12 gap-3 items-stretch">
        
        {/* 左側：修正・コントロール（小） */}
        <div className="col-span-2 flex flex-col gap-2">
          <Button 
            variant="secondary" 
            className="flex-1 rounded-2xl bg-muted/50 border border-border/40"
            onClick={() => recordInPlay("スコア修正", -1, [])}
          >
            <Minus className="w-5 h-5 opacity-40" />
          </Button>
          <Button 
            variant="outline" 
            className="h-12 rounded-2xl border-dashed"
            onClick={() => { if(confirm("イニングを強制リセットしますか？")) {/* リセット処理 */} }}
          >
            <RotateCcw className="w-4 h-4 opacity-40" />
          </Button>
        </div>

        {/* 中央：メイン得点ボタン（特大） */}
        <div className="col-span-7 relative">
          <Button 
            disabled={isSyncing}
            onClick={() => recordInPlay(state.isTop ? "自チーム追加点！" : "相手チームが得点", 1, [])}
            className={cn(
              "w-full h-full rounded-[32px] text-white flex flex-col items-center justify-center gap-1 shadow-2xl transition-all active:scale-95",
              state.isTop 
                ? "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/20" 
                : "bg-rose-600 hover:bg-rose-500 shadow-rose-900/20"
            )}
          >
            <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-80">
              {state.isTop ? "My Team Score" : "Opponent Score"}
            </span>
            <div className="flex items-center gap-2">
              <Plus className={cn("w-10 h-10 transition-transform", isSyncing && "animate-spin-slow")} />
              <span className="text-4xl font-black italic tabular-nums">+1</span>
            </div>
            
            {/* 🌟 同期中のプログレスバー的な演出 */}
            {isSyncing && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce [animation-delay:0.4s]" />
              </div>
            )}
          </Button>
        </div>

        {/* 右側：イニング交代（縦長） */}
        <div className="col-span-3">
          <Button 
            variant="secondary"
            className="w-full h-full rounded-[32px] bg-blue-600 hover:bg-blue-500 text-white flex flex-col items-center justify-center gap-3 border-none shadow-xl active:scale-95"
            onClick={changeInning}
          >
            <div className="flex flex-col items-center leading-none">
              <span className="text-[18px] font-black italic">{state.inning}</span>
              <span className="text-[10px] font-bold">{state.isTop ? "TOP" : "BOT"}</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <Send className="w-4 h-4 rotate-90" />
            </div>
            <span className="text-[8px] font-black uppercase tracking-tighter">CHANGE</span>
          </Button>
        </div>

      </div>
    </div>
  );
}
