"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  ChevronLeft, Users, Loader2, ChevronRight, Wand2, 
  Shield, Swords, Save, FolderOpen, X 
} from "lucide-react"; 
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { SectionHeader } from "@/components/layout/SectionHeader";

const POSITIONS = [
    { id: "1", label: "1 投", color: "bg-red-500" }, { id: "2", label: "2 捕", color: "bg-blue-500" }, 
    { id: "3", label: "3 一", color: "bg-orange-500" }, { id: "4", label: "4 二", color: "bg-emerald-500" }, 
    { id: "5", label: "5 三", color: "bg-amber-500" }, { id: "6", label: "6 遊", color: "bg-purple-500" },
    { id: "7", label: "7 左", color: "bg-lime-500" }, { id: "8", label: "8 中", color: "bg-teal-500" }, 
    { id: "9", label: "9 右", color: "bg-cyan-500" }, { id: "DH", label: "DH 指", color: "bg-zinc-500" }
];

export default function LineupPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const matchId = searchParams.get("id");
    const teamId = searchParams.get("teamId");

    const [activeTab, setActiveTab] = useState<"myTeam" | "opponent">("myTeam");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [teamPlayers, setTeamPlayers] = useState<any[]>([]);
    const [templates, setTemplates] = useState<any[]>([]);

    // モーダル用
    const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
    const [templateName, setTemplateName] = useState("");

    const [myLineup, setMyLineup] = useState(
        Array.from({ length: 9 }, (_, i) => ({ order: i + 1, position: "", playerId: "", name: "", uniformNumber: "" }))
    );
    const [opponentLineup, setOpponentLineup] = useState(
        Array.from({ length: 9 }, (_, i) => ({ order: i + 1, position: "", name: "", uniformNumber: "" }))
    );

    // 排他制御ロジック
    const getDisabledPositions = (lineup: any[], currentIndex: number) => 
        lineup.filter((_, i) => i !== currentIndex).map(p => p.position).filter(Boolean);
    const getDisabledPlayers = (lineup: any[], currentIndex: number) => 
        lineup.filter((_, i) => i !== currentIndex).map(p => p.playerId).filter(Boolean);

    // テンプレート保存
    const saveTemplate = () => {
        if (!templateName) return toast.error("名前を入力してください");
        toast.success(`「${templateName}」を保存しました（モック）`);
        setIsTemplateModalOpen(false);
    };

    const handleFillDummyOpponent = () => {
        setOpponentLineup(prev => prev.map((p, i) => ({
            ...p,
            position: (i + 1).toString(),
            name: `相手打者 ${i + 1}`
        })));
    };

    return (
        <div className="w-full animate-in fade-in duration-500 min-h-screen pb-40">
            <div className="max-w-2xl mx-auto px-4 pt-8 space-y-8">
                
                {/* ヘッダー */}
                <div className="flex items-center justify-between">
                    <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
                        <ChevronLeft className="h-6 w-6" />
                    </Button>
                    <SectionHeader title="スタメン登録" subtitle="Lineup Setup" showPulse />
                    <div className="w-10" />
                </div>

                {/* タブ切り替え */}
                <div className="flex bg-muted/30 p-1.5 rounded-3xl border border-border/40 shadow-inner">
                    <button 
                        onClick={() => setActiveTab("myTeam")}
                        className={cn(
                            "flex-1 py-4 text-xs font-black rounded-2xl transition-all flex items-center justify-center gap-2",
                            activeTab === "myTeam" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground"
                        )}
                    >
                        <Shield className="w-4 h-4" /> 自チーム
                    </button>
                    <button 
                        onClick={() => setActiveTab("opponent")}
                        className={cn(
                            "flex-1 py-4 text-xs font-black rounded-2xl transition-all flex items-center justify-center gap-2",
                            activeTab === "opponent" ? "bg-rose-500 text-white shadow-sm" : "text-muted-foreground"
                        )}
                    >
                        <Swords className="w-4 h-4" /> 相手チーム
                    </button>
                </div>

                {/* 操作メニュー */}
                <div className="flex justify-between items-center px-1">
                    {activeTab === "myTeam" ? (
                        <div className="flex gap-2 w-full">
                            <select className="flex-1 h-12 bg-card/50 border-2 border-border/40 rounded-2xl px-4 text-xs font-black focus:outline-none">
                                <option>📂 テンプレート読込</option>
                            </select>
                            <Button variant="outline" onClick={() => setIsTemplateModalOpen(true)} className="h-12 rounded-2xl border-2 border-primary/20 text-primary font-black px-6">
                                <Save className="w-4 h-4 mr-2" /> 保存
                            </Button>
                        </div>
                    ) : (
                        <Button onClick={handleFillDummyOpponent} variant="outline" className="w-full h-12 rounded-2xl border-2 border-rose-200 text-rose-500 font-black">
                            <Wand2 className="w-4 h-4 mr-2" /> 相手スタメンを一括生成
                        </Button>
                    )}
                </div>

                {/* 打順リスト */}
                <div className="space-y-3">
                    {(activeTab === "myTeam" ? myLineup : opponentLineup).map((player, index) => {
                        const disabledPos = getDisabledPositions(activeTab === "myTeam" ? myLineup : opponentLineup, index);
                        return (
                            <div key={index} className="flex items-center gap-2 bg-card/50 border-2 border-border/40 p-2 rounded-2xl shadow-xs">
                                <div className="w-8 text-center font-black text-primary/40 italic">{index + 1}</div>
                                
                                <select 
                                    value={player.position}
                                    onChange={(e) => {
                                        const list = activeTab === "myTeam" ? [...myLineup] : [...opponentLineup];
                                        list[index].position = e.target.value;
                                        activeTab === "myTeam" ? setMyLineup(list) : setOpponentLineup(list);
                                    }}
                                    className={cn(
                                        "w-14 h-11 rounded-xl text-white font-black text-xs appearance-none text-center shadow-sm",
                                        POSITIONS.find(p => p.id === player.position)?.color || "bg-zinc-400"
                                    )}
                                >
                                    <option value="">守備</option>
                                    {POSITIONS.map(p => !disabledPos.includes(p.id) && (
                                        <option key={p.id} value={p.id}>{p.label}</option>
                                    ))}
                                </select>

                                {activeTab === "myTeam" ? (
                                    <select className="flex-1 h-11 bg-transparent border-none font-bold text-sm focus:outline-none">
                                        <option value="">選手を選択...</option>
                                        {/* teamPlayers.map(...) */}
                                    </select>
                                ) : (
                                    <Input 
                                        placeholder="相手選手名" 
                                        className="flex-1 h-11 border-none bg-transparent font-bold"
                                        value={player.name}
                                        onChange={(e) => {
                                            const list = [...opponentLineup];
                                            list[index].name = e.target.value;
                                            setOpponentLineup(list);
                                        }}
                                    />
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* プレイボールボタン */}
                <div className="fixed bottom-0 left-0 w-full p-6 bg-gradient-to-t from-background via-background to-transparent">
                    <div className="max-w-2xl mx-auto">
                        <Button 
                            onClick={() => router.push(`/matches/play?id=${matchId}`)}
                            className="w-full h-20 rounded-full text-xl font-black uppercase tracking-[0.3em] shadow-xl shadow-primary/30 active:scale-95 transition-all"
                        >
                            PLAYBALL
                            <ChevronRight className="ml-2 h-8 w-8" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* テンプレート保存モーダル */}
            {isTemplateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-card w-full max-w-sm rounded-[40px] border-2 border-border/40 p-8 shadow-2xl space-y-6">
                        <SectionHeader title="設定保存" subtitle="Save Template" />
                        <Input 
                            placeholder="例：2026年 基本オーダー" 
                            className="h-14 rounded-2xl bg-muted/50 border-none font-bold text-center"
                            value={templateName}
                            onChange={(e) => setTemplateName(e.target.value)}
                        />
                        <div className="flex gap-3">
                            <Button variant="ghost" onClick={() => setIsTemplateModalOpen(false)} className="flex-1 h-14 rounded-2xl font-black">
                                キャンセル
                            </Button>
                            <Button onClick={saveTemplate} className="flex-1 h-14 rounded-2xl font-black shadow-lg shadow-primary/20">
                                保存する
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
