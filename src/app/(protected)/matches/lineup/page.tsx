"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ChevronLeft, Users, Loader2, ArrowRight, Wand2, Shield, Swords } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const POSITIONS = [
    { id: "1", label: "投" }, { id: "2", label: "捕" }, { id: "3", label: "一" },
    { id: "4", label: "二" }, { id: "5", label: "三" }, { id: "6", label: "遊" },
    { id: "7", label: "左" }, { id: "8", label: "中" }, { id: "9", label: "右" },
    { id: "DH", label: "DH" }, { id: "PH", label: "代打" }, { id: "PR", label: "代走" }
];

interface Player {
    id: string;
    name: string;
    uniformNumber: string;
}

function LineupContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const matchId = searchParams.get("id");
    const teamId = searchParams.get("teamId");

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState<"myTeam" | "opponent">("myTeam");

    const [teamPlayers, setTeamPlayers] = useState<Player[]>([]);

    const [myLineup, setMyLineup] = useState(
        Array.from({ length: 9 }, (_, i) => ({ order: i + 1, position: "", playerId: "", name: "", uniformNumber: "" }))
    );

    const [opponentLineup, setOpponentLineup] = useState(
        Array.from({ length: 9 }, (_, i) => ({ order: i + 1, position: "", name: "", uniformNumber: "" }))
    );

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🚀 APIから選手一覧を取得（修正完了！）
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    useEffect(() => {
        if (!teamId) return;
        const fetchPlayers = async () => {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
                const res = await fetch(`${apiUrl}/api/teams/${teamId}/players`, {
                    credentials: "include"
                });

                if (res.ok) {
                    // 💡 修正: APIは配列を直接返すので、Player[] として受け取る！
                    const data = (await res.json()) as Player[];
                    setTeamPlayers(data || []);
                }
            } catch (e) {
                console.error("選手取得エラー", e);
            }
        };
        fetchPlayers();
    }, [teamId]);

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🚀 排他制御ヘルパー（他の打順で選ばれているものを抽出）
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const getDisabledPositions = (lineup: any[], currentIndex: number) => {
        return lineup.filter((_, i) => i !== currentIndex).map(p => p.position).filter(Boolean);
    };

    const getDisabledPlayers = (lineup: any[], currentIndex: number) => {
        return lineup.filter((_, i) => i !== currentIndex).map(p => p.playerId).filter(Boolean);
    };

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🚀 各種ハンドラー
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const handleMyTeamPlayerSelect = (index: number, playerId: string) => {
        const player = teamPlayers.find(p => p.id === playerId);
        const newLineup = [...myLineup];
        newLineup[index].playerId = playerId;
        if (player) {
            newLineup[index].name = player.name;
            newLineup[index].uniformNumber = String(player.uniformNumber);
        } else {
            newLineup[index].name = "";
            newLineup[index].uniformNumber = "";
        }
        setMyLineup(newLineup);
    };

    const handleFieldChange = (target: "myTeam" | "opponent", index: number, field: string, value: string) => {
        if (target === "myTeam") {
            const newLineup = [...myLineup];
            newLineup[index] = { ...newLineup[index], [field]: value };
            setMyLineup(newLineup);
        } else {
            const newLineup = [...opponentLineup];
            newLineup[index] = { ...newLineup[index], [field]: value };
            setOpponentLineup(newLineup);
        }
    };

    const handleFillDummyOpponent = () => {
        let availablePositions = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
        const dummyLineup = opponentLineup.map((p, i) => {
            let pos = p.position;
            if (!pos && availablePositions.length > 0) {
                pos = availablePositions.shift() || "";
            }
            return {
                order: i + 1,
                position: pos,
                name: p.name || `相手打者${i + 1}`,
                uniformNumber: p.uniformNumber,
            };
        });
        setOpponentLineup(dummyLineup);
        toast.success("相手のスタメンをダミーで一括設定しました！");
    };

    const handleSaveLineup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!matchId) return;
        setIsSubmitting(true);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
            const res = await fetch(`${apiUrl}/api/matches/${matchId}`, {
                method: "PATCH",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    battingOrder: { myTeam: myLineup, opponent: opponentLineup },
                }),
            });

            if (res.ok) {
                toast.success("スタメンを登録しました！試合開始です！");
                router.push(`/matches/score?id=${matchId}`);
            } else {
                const errorData = (await res.json().catch(() => ({}))) as { error?: string };
                toast.error(errorData.error || "スタメンの保存に失敗しました");
            }
        } catch (error) {
            toast.error("通信エラーが発生しました");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!matchId) return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

    return (
        <div className="flex flex-col min-h-screen text-foreground pb-32 relative overflow-x-hidden">
            <main className="flex-1 px-4 sm:px-6 max-w-4xl mx-auto w-full mt-6 sm:mt-10 relative z-10 animate-in fade-in duration-500">

                <div className="mb-6 flex flex-col items-start gap-4">
                    <Button variant="ghost" onClick={() => router.back()} className="rounded-full pl-2 pr-4 hover:bg-muted text-muted-foreground font-extrabold -ml-2 transition-transform active:scale-95">
                        <ChevronLeft className="h-5 w-5 mr-1" /> 試合設定に戻る
                    </Button>
                    <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-3">
                        <div className="p-2.5 bg-primary/10 rounded-2xl text-primary shadow-sm border border-primary/20">
                            <Users className="h-6 w-6 sm:h-7 sm:w-7" />
                        </div>
                        スタメン・守備位置の登録
                    </h1>
                </div>

                <div className="flex bg-muted/30 p-1.5 rounded-[20px] border border-border/50 shadow-inner mb-6">
                    <button onClick={() => setActiveTab("myTeam")} className={cn("flex flex-1 items-center justify-center gap-2 py-3.5 text-sm sm:text-base font-black rounded-[16px] transition-all duration-200", activeTab === "myTeam" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground active:scale-95")}>
                        <Shield className="w-4 h-4" /> 自チーム
                    </button>
                    <button onClick={() => setActiveTab("opponent")} className={cn("flex flex-1 items-center justify-center gap-2 py-3.5 text-sm sm:text-base font-black rounded-[16px] transition-all duration-200", activeTab === "opponent" ? "bg-red-500 text-white shadow-sm" : "text-muted-foreground hover:text-foreground active:scale-95")}>
                        <Swords className="w-4 h-4" /> 相手チーム
                    </button>
                </div>

                <Card className="rounded-[32px] border-border/50 bg-card/80 backdrop-blur-xl shadow-sm relative overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-border/50">
                        <CardTitle className="text-lg flex items-center gap-2">
                            {activeTab === "myTeam" ? "自チームのオーダー" : "相手チームのオーダー"}
                        </CardTitle>
                        {activeTab === "opponent" && (
                            <Button type="button" variant="outline" size="sm" onClick={handleFillDummyOpponent} className="text-xs sm:text-sm font-bold border-red-500/30 text-red-500 hover:bg-red-500/10 rounded-full px-4">
                                <Wand2 className="w-4 h-4 mr-1.5" /> ダミーで一括入力
                            </Button>
                        )}
                    </CardHeader>

                    <CardContent className="p-4 sm:p-6">
                        <form onSubmit={handleSaveLineup} className="space-y-8">

                            <div className="space-y-3">
                                {/* 💡 自チーム */}
                                {activeTab === "myTeam" && myLineup.map((player, index) => {
                                    const disabledPositions = getDisabledPositions(myLineup, index);
                                    const disabledPlayers = getDisabledPlayers(myLineup, index);

                                    return (
                                        <div key={index} className="flex items-center gap-2 sm:gap-4 p-3 rounded-[16px] bg-muted/30 border border-border/50">
                                            <div className="w-8 h-8 rounded-full bg-background border border-border/50 flex items-center justify-center font-black text-muted-foreground shrink-0 shadow-sm">{player.order}</div>

                                            <select value={player.position} onChange={(e) => handleFieldChange("myTeam", index, "position", e.target.value)} className="w-20 sm:w-24 h-12 rounded-[12px] bg-background border border-border/50 font-bold text-center appearance-none shadow-inner cursor-pointer focus:ring-2 focus:ring-primary/50">
                                                <option value="">守備</option>
                                                {POSITIONS.map(p => {
                                                    // 💡 非表示ロジック（重複するポジションはそもそもリストに出さない！）
                                                    const isSelectedByOther = disabledPositions.includes(p.id) && !["DH", "PH", "PR"].includes(p.id);
                                                    if (isSelectedByOther) return null;
                                                    return <option key={p.id} value={p.id}>{p.label}</option>;
                                                })}
                                            </select>

                                            <select value={player.playerId} onChange={(e) => handleMyTeamPlayerSelect(index, e.target.value)} className="flex-1 h-12 rounded-[12px] bg-background border border-border/50 font-bold px-3 shadow-inner cursor-pointer focus:ring-2 focus:ring-primary/50 text-sm sm:text-base">
                                                <option value="">選手を選択...</option>
                                                {teamPlayers.map(p => {
                                                    // 💡 非表示ロジック（重複する選手はそもそもリストに出さない！）
                                                    const isSelectedByOther = disabledPlayers.includes(p.id);
                                                    if (isSelectedByOther) return null;
                                                    return <option key={p.id} value={p.id}>#{p.uniformNumber} {p.name}</option>;
                                                })}
                                            </select>
                                        </div>
                                    );
                                })}

                                {/* 💡 相手チーム */}
                                {activeTab === "opponent" && opponentLineup.map((player, index) => {
                                    const disabledPositions = getDisabledPositions(opponentLineup, index);

                                    return (
                                        <div key={index} className="flex items-center gap-2 sm:gap-4 p-3 rounded-[16px] bg-muted/30 border border-border/50">
                                            <div className="w-8 h-8 rounded-full bg-background border border-border/50 flex items-center justify-center font-black text-muted-foreground shrink-0 shadow-sm">{player.order}</div>

                                            <select value={player.position} onChange={(e) => handleFieldChange("opponent", index, "position", e.target.value)} className="w-20 sm:w-24 h-12 rounded-[12px] bg-background border border-border/50 font-bold text-center appearance-none shadow-inner cursor-pointer focus:ring-2 focus:ring-red-500/50">
                                                <option value="">守備</option>
                                                {POSITIONS.map(p => {
                                                    // 💡 非表示ロジック
                                                    const isSelectedByOther = disabledPositions.includes(p.id) && !["DH", "PH", "PR"].includes(p.id);
                                                    if (isSelectedByOther) return null;
                                                    return <option key={p.id} value={p.id}>{p.label}</option>;
                                                })}
                                            </select>

                                            <Input placeholder="背番" value={player.uniformNumber} onChange={(e) => handleFieldChange("opponent", index, "uniformNumber", e.target.value)} className="w-16 sm:w-20 h-12 rounded-[12px] font-mono text-center font-bold bg-background shadow-inner" />
                                            <Input placeholder="選手名" value={player.name} onChange={(e) => handleFieldChange("opponent", index, "name", e.target.value)} className="flex-1 h-12 rounded-[12px] font-bold bg-background shadow-inner" />
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="pt-4">
                                <Button type="submit" disabled={isSubmitting} className="w-full h-16 rounded-[24px] text-lg sm:text-xl font-black bg-primary text-primary-foreground hover:bg-primary/90 shadow-xl shadow-primary/20 transition-all active:scale-[0.98]">
                                    {isSubmitting ? <Loader2 className="h-6 w-6 animate-spin mx-auto" /> : <>⚾️ 試合開始！ <ArrowRight className="ml-2 h-6 w-6" /></>}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}

export default function LineupPage() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
            <LineupContent />
        </Suspense>
    );
}