// filepath: `src/components/score/Scoreboard.tsx`
import { useScore } from "@/contexts/ScoreContext";
import { cn } from "@/lib/utils";

export function Scoreboard({ variant }: { variant?: string }) {
  const { state } = useScore();

  // 💡 イニング情報の生成
  const innings = Array.from({ length: 9 }, (_, i) => i + 1);

  // 💡 LEDドットテクスチャ
  const LedTexture = () => (
    <div className="absolute inset-0 opacity-20 pointer-events-none"
      style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '2px 2px' }} />
  );

  return (
    <div className="h-full w-full bg-zinc-950 flex flex-col border-b border-white/10">

      {/* 1. 最上段：大会名コンテキスト (高さ節約のため超スリムに) */}
      <div className="h-6 flex items-center justify-center bg-white/5 border-b border-white/5">
        <span className="text-[8px] font-black text-zinc-500 uppercase tracking-[0.5em]">
          2026 Spring Regional Championship • Group A
        </span>
      </div>

      {/* 2. 中段：メインスコア & BSO (ここが情報の中心) */}
      <div className="flex-1 flex items-center justify-between px-6">

        {/* 対戦カード & スコア */}
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-center">
            <span className="text-[9px] font-black text-zinc-500 uppercase tracking-tighter">GUEST</span>
            <span className="text-[10px] font-bold text-zinc-400 mb-1 truncate max-w-[60px]">MARINES</span>
            <p className="text-4xl font-black italic tracking-tighter leading-none tabular-nums text-white">
              {state.opponentScore}
            </p>
          </div>

          <div className="text-xl font-black text-zinc-800 italic mt-6">VS</div>

          <div className="flex flex-col items-center">
            <span className="text-[9px] font-black text-primary uppercase tracking-tighter">HOME</span>
            <span className="text-[10px] font-bold text-primary/80 mb-1 truncate max-w-[60px]">EAGLES</span>
            <p className="text-4xl font-black italic tracking-tighter leading-none tabular-nums text-primary">
              {state.myScore}
            </p>
          </div>
        </div>

        {/* BSOランプ（よりコンパクトに右側に配置） */}
        <div className="flex flex-col gap-1.5 bg-black/40 p-2.5 rounded-xl border border-white/5">
          {['B', 'S', 'O'].map((label) => {
            const count = label === 'B' ? state.balls : label === 'S' ? state.strikes : state.outs;
            const color = label === 'B' ? "bg-amber-500" : label === 'S' ? "bg-blue-500" : "bg-rose-500";
            const shadow = label === 'B' ? "shadow-[0_0_10px_rgba(245,158,11,0.5)]" : label === 'S' ? "shadow-[0_0_10px_rgba(59,130,246,0.5)]" : "shadow-[0_0_10px_rgba(244,63,94,0.5)]";
            return (
              <div key={label} className="flex items-center gap-2">
                <span className={cn("text-[9px] font-black w-2.5 italic",
                  label === 'B' ? "text-amber-500" : label === 'S' ? "text-blue-500" : "text-rose-500"
                )}>{label}</span>
                <div className="flex gap-1">
                  {[...Array(label === 'B' ? 3 : 2)].map((_, i) => (
                    <div key={i} className={cn(
                      "w-3 h-3 rounded-full border border-white/5 relative overflow-hidden transition-all duration-300",
                      i < count ? `${color} ${shadow}` : "bg-zinc-900 opacity-20"
                    )}>
                      <LedTexture />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. 下段：イニングスコア表 (高さを極限まで圧縮) */}
      <div className="h-14 bg-zinc-900/50 flex items-center px-4 overflow-hidden border-t border-white/5">
        <table className="w-full text-center border-collapse">
          <thead>
            <tr className="text-[7px] font-black text-zinc-600 uppercase tracking-tighter">
              <th className="text-left w-12 opacity-0">TEAM</th>
              {innings.map(i => <th key={i} className={cn("w-6 sm:w-8", state.inning === i && "text-primary")}>{i}</th>)}
              <th className="w-8 border-l border-white/10 bg-white/5">R</th>
            </tr>
          </thead>
          <tbody className="text-[11px] font-black italic tabular-nums leading-none">
            <tr className="h-4">
              <td className="text-left text-[8px] not-italic text-zinc-500 uppercase tracking-tighter">GUEST</td>
              {innings.map(i => <td key={i} className="text-zinc-600">{state.opponentInningScores[i - 1] ?? "-"}</td>)}
              <td className="border-l border-white/10 bg-white/5 text-zinc-400">{state.opponentScore}</td>
            </tr>
            <tr className="h-4">
              <td className="text-left text-[8px] not-italic text-primary uppercase tracking-tighter">HOME</td>
              {innings.map(i => <td key={i} className={cn(state.inning === i ? "text-primary" : "text-zinc-500")}>{state.myInningScores[i - 1] ?? "-"}</td>)}
              <td className="border-l border-white/10 bg-white/5 text-primary">{state.myScore}</td>
            </tr>
          </tbody>
        </table>
      </div>

    </div>
  );
}