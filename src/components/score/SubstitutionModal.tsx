// src/components/score/SubstitutionModal.tsx
"use client";

import { useState, useEffect } from "react";
/**
 * 💡 選手交代モーダル (究極UI版)
 * 1. 意匠: 透明感のあるリスト表示。
 * 2. 構造: 現在の出場選手と、ベンチに控えている選手を明確に分離。
 * 3. 整理: ポジション変更と代打・代走のフローをスムーズに。
 * 4. 規則: 影なし。角丸40px。border-border/40。
 */
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, UserCog, Repeat, UserPlus, Loader2 } from "lucide-react";
import { useScore } from "@/contexts/ScoreContext";
import { cn } from "@/lib/utils";

interface Player {
  id: string;
  name: string;
  number: string;
  position: string;
}

export function SubstitutionModal({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const { state, resetBatter } = useScore();
  const [players, setPlayers] = useState<Player[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open) {
      // 💡 実際には D1 から自チームの選手一覧を取得
      setIsLoading(true);
      setTimeout(() => {
        setPlayers([
          { id: "p1", name: "佐藤 翼", number: "1", position: "P" },
          { id: "p2", name: "田中 健太", number: "2", position: "C" },
          { id: "p3", name: "高橋 翔", number: "10", position: "IF" },
          { id: "p4", name: "渡辺 航", number: "24", position: "OF" },
        ]);
        setIsLoading(false);
      }, 500);
    }
  }, [open]);

  const handleSubstitution = (player: Player) => {
    resetBatter(player.id);
    onOpenChange(false);
  };

  const filteredPlayers = players.filter(p => p.name.includes(search) || p.number.includes(search));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-background/60 backdrop-blur-3xl border-border/40 rounded-[40px] shadow-none p-8 flex flex-col h-[80vh]">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="border-primary/30 text-primary bg-primary/5 rounded-full px-3 py-0.5 text-[9px] font-black tracking-widest uppercase">Personnel Manager</Badge>
          </div>
          <DialogTitle className="text-3xl font-black italic tracking-tighter uppercase italic leading-none">選手<span className="text-primary">交代</span></DialogTitle>
        </DialogHeader>

        {/* 検索バー */}
        <div className="relative mt-4 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            placeholder="選手名・背番号で検索..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-14 pl-12 rounded-2xl bg-muted/20 border-border/40 focus:ring-primary/20 transition-all shadow-none font-bold"
          />
        </div>

        {/* 選手リスト */}
        <div className="flex-1 overflow-y-auto mt-6 space-y-3 scrollbar-hide pr-1">
          {isLoading ? (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary opacity-20" />
            </div>
          ) : filteredPlayers.length > 0 ? (
            filteredPlayers.map((player) => (
              <button
                key={player.id}
                onClick={() => handleSubstitution(player)}
                className="w-full p-5 rounded-[28px] bg-card/20 border border-border/20 hover:bg-card/40 hover:border-primary/30 transition-all flex items-center justify-between group text-left"
              >
                <div className="flex items-center gap-5">
                  <div className="h-14 w-14 rounded-full bg-muted/50 border border-border/40 flex items-center justify-center text-xl font-black italic group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all duration-500">
                    {player.number}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[8px] font-black px-1.5 rounded-md border-muted-foreground/20 text-muted-foreground">{player.position}</Badge>
                    </div>
                    <p className="text-xl font-black tracking-tight text-foreground">{player.name}</p>
                  </div>
                </div>
                <div className="h-12 w-12 rounded-full bg-muted/20 flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-all">
                  <UserPlus className="h-5 w-5" />
                </div>
              </button>
            ))
          ) : (
            <div className="py-20 text-center opacity-20">
              <UserCog className="h-12 w-12 mx-auto mb-2" />
              <p className="text-xs font-bold uppercase tracking-widest">No Players Found</p>
            </div>
          )}
        </div>

        <div className="mt-6 pt-6 border-t border-border/20 flex items-center justify-between text-muted-foreground opacity-40">
          <div className="flex items-center gap-2">
            <Repeat className="h-4 w-4" />
            <span className="text-[10px] font-black uppercase tracking-widest leading-none">Quick Swap Ready</span>
          </div>
          <p className="text-[9px] font-bold">iScore Personnel System</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}