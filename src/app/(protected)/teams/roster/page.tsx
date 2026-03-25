// src/app/(protected)/teams/roster/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, Users, Loader2, UserCheck, UserX, Shield, UserPlus, MailQuestion, Copy } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// 💡 型定義
interface RequestUser {
    id: string; // teamMembersのID
    userId: string; // auth_userのID
    role: string;
    status: string;
    // ※今後API側でユーザー名(users.name)をJOINしたらここに追加します
    userName?: string;
}

interface Player {
    id: string;
    name: string;
    uniformNumber: string;
}

export default function RosterPage() {
    const router = useRouter();
    const [teamId, setTeamId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // タブ切り替え ('players': 選手名簿, 'requests': アプリ参加申請)
    const [activeTab, setActiveTab] = useState<"players" | "requests">("players");

    const [players, setPlayers] = useState<Player[]>([]);
    const [requests, setRequests] = useState<RequestUser[]>([]);
    const [isProcessingId, setIsProcessingId] = useState<string | null>(null);

    useEffect(() => {
        // ダッシュボード等で選択したチームIDを取得
        const savedTeamId = localStorage.getItem("iScore_selectedTeamId");
        if (!savedTeamId) {
            toast.error("チームが選択されていません");
            router.push("/dashboard");
            return;
        }
        setTeamId(savedTeamId);
        fetchData(savedTeamId);
    }, []);

    const fetchData = async (id: string) => {
        setIsLoading(true);
        try {
            // 1. 選手名簿の取得
            const playersRes = await fetch(`/api/teams/${id}/players`);
            if (playersRes.ok) setPlayers(await playersRes.json());

            // 2. 参加申請（承認待ち）の取得
            const requestsRes = await fetch(`/api/teams/${id}/requests`);
            if (requestsRes.ok) {
                const data = await requestsRes.json() as { success: boolean; requests: RequestUser[] };
                if (data.success) setRequests(data.requests);
            }
        } catch (e) {
            console.error("データ取得エラー", e);
        } finally {
            setIsLoading(false);
        }
    };

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🚀 招待コード（チームID）をコピーする
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const handleCopyInviteCode = () => {
        if (!teamId) return;
        navigator.clipboard.writeText(teamId)
            .then(() => toast.success("📋 招待コードをコピーしました！LINE等で保護者に共有してください。"))
            .catch(() => toast.error("コピーに失敗しました"));
    };

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // 🚀 参加申請の承認・拒否処理
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const handleRequestAction = async (memberId: string, action: 'approve' | 'reject') => {
        if (!teamId) return;

        // 拒否の場合は確認ダイアログを出す
        if (action === 'reject' && !window.confirm("本当にこの参加申請を拒否（削除）しますか？")) return;

        setIsProcessingId(memberId);
        try {
            const res = await fetch(`/api/teams/${teamId}/requests/${memberId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action }),
            });
            const data = await res.json() as { success: boolean; error?: string };

            if (res.ok && data.success) {
                toast.success(action === 'approve' ? "参加を承認しました！" : "申請を拒否しました。");
                // リストから該当ユーザーを削除してUIを即座に更新
                setRequests(prev => prev.filter(req => req.id !== memberId));
            } else {
                toast.error(data.error || "処理に失敗しました");
            }
        } catch (e) {
            toast.error("通信エラーが発生しました");
        } finally {
            setIsProcessingId(null);
        }
    };

    if (isLoading) return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

    return (
        <div className="flex flex-col min-h-screen text-foreground pb-32 relative overflow-x-hidden p-4 sm:p-6 max-w-4xl mx-auto w-full mt-4 animate-in fade-in duration-500">

            <div className="mb-6 flex flex-col items-start gap-4">
                <Button variant="ghost" onClick={() => router.back()} className="rounded-full pl-2 pr-4 hover:bg-muted text-muted-foreground font-extrabold -ml-2 transition-transform active:scale-95">
                    <ChevronLeft className="h-5 w-5 mr-1" /> 戻る
                </Button>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-4">
                    <h1 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-3">
                        <div className="p-2.5 bg-primary/10 rounded-2xl text-primary shadow-sm border border-primary/20">
                            <Users className="h-6 w-6 sm:h-7 sm:w-7" />
                        </div>
                        名簿・メンバー管理
                    </h1>
                    {/* 💡 コピーボタンを追加！ */}
                    <Button
                        onClick={handleCopyInviteCode}
                        variant="outline"
                        className="h-10 sm:h-12 rounded-full font-black text-primary border-primary/30 bg-primary/5 hover:bg-primary/10 shadow-sm shrink-0"
                    >
                        <Copy className="h-4 w-4 mr-2" /> 招待コードを共有する
                    </Button>
                </div>
            </div>
            {/* 💡 タブ切り替えUI */}
            <div className="flex bg-muted/30 p-1.5 rounded-[20px] border border-border/50 shadow-inner mb-6">
                <button
                    onClick={() => setActiveTab("players")}
                    className={cn("flex flex-1 items-center justify-center gap-2 py-3.5 text-sm sm:text-base font-black rounded-[16px] transition-all duration-200", activeTab === "players" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground active:scale-95")}
                >
                    <Shield className="w-4 h-4" /> 選手名簿 <span className="text-xs bg-background/20 px-2 py-0.5 rounded-full ml-1">{players.length}</span>
                </button>
                <button
                    onClick={() => setActiveTab("requests")}
                    className={cn("flex flex-1 items-center justify-center gap-2 py-3.5 text-sm sm:text-base font-black rounded-[16px] transition-all duration-200 relative", activeTab === "requests" ? "bg-orange-500 text-white shadow-sm" : "text-muted-foreground hover:text-foreground active:scale-95")}
                >
                    <UserPlus className="w-4 h-4" /> 参加申請
                    {requests.length > 0 && (
                        <span className="absolute top-2 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white animate-pulse">
                            {requests.length}
                        </span>
                    )}
                </button>
            </div>

            {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            {/* 💡 参加申請（承認待ち）タブの内容 */}
            {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            {activeTab === "requests" && (
                <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                    {requests.length === 0 ? (
                        <div className="text-center py-20 bg-muted/30 rounded-[32px] border border-dashed border-border/50">
                            <MailQuestion className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                            <h3 className="text-lg font-black text-muted-foreground">現在、新しい参加申請はありません</h3>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {requests.map((req) => (
                                <Card key={req.id} className="rounded-[24px] border-border/50 bg-card/80 backdrop-blur-xl shadow-sm overflow-hidden">
                                    <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                                        <div className="flex items-center gap-4 w-full sm:w-auto">
                                            <div className="h-12 w-12 rounded-full bg-orange-500/10 text-orange-500 flex items-center justify-center border border-orange-500/20 shrink-0">
                                                <UserPlus className="h-6 w-6" />
                                            </div>
                                            <div>
                                                {/* ※APIで名前を引いてくるまでは、仮のテキストやIDの先頭を表示 */}
                                                <h3 className="text-lg font-black">{req.userName || `ユーザー (ID: ${req.userId.substring(0, 6)}...)`}</h3>
                                                <p className="text-sm font-bold text-muted-foreground">参加を希望しています</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                                            <Button
                                                variant="outline"
                                                onClick={() => handleRequestAction(req.id, 'reject')}
                                                disabled={isProcessingId === req.id}
                                                className="flex-1 sm:flex-none h-12 rounded-[16px] font-black border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white"
                                            >
                                                {isProcessingId === req.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <><UserX className="h-4 w-4 mr-2" /> 拒否</>}
                                            </Button>
                                            <Button
                                                onClick={() => handleRequestAction(req.id, 'approve')}
                                                disabled={isProcessingId === req.id}
                                                className="flex-1 sm:flex-none h-12 rounded-[16px] font-black bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20"
                                            >
                                                {isProcessingId === req.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <><UserCheck className="h-4 w-4 mr-2" /> 承認する</>}
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            {/* 💡 選手名簿（プレイヤー）タブの内容 */}
            {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            {activeTab === "players" && (
                <div className="space-y-4 animate-in slide-in-from-left-4 duration-300">
                    {/* ここには元々の選手名簿リストや「+ 選手を追加」ボタンが入ります */}
                    <div className="flex justify-between items-center mb-4">
                        <p className="text-sm font-bold text-muted-foreground">グラウンドでプレイする選手の名簿です。</p>
                        <Button variant="outline" className="rounded-full font-bold h-9">
                            + 選手追加
                        </Button>
                    </div>

                    {players.length === 0 ? (
                        <div className="text-center py-20 bg-muted/30 rounded-[32px] border border-dashed border-border/50">
                            <h3 className="text-lg font-black text-muted-foreground">選手が登録されていません</h3>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {players.map((player) => (
                                <div key={player.id} className="flex items-center gap-4 p-4 bg-card rounded-[20px] border border-border/50 shadow-sm">
                                    <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black text-lg border border-primary/20">
                                        {player.uniformNumber}
                                    </div>
                                    <div className="font-black text-lg">{player.name}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

        </div>
    );
}