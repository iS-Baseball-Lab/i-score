// src/app/(protected)/teams/roster/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Select } from "@/components/ui/select";
import { Users, Plus, Edit2, Trash2, X, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Player {
    id: string;
    name: string;
    uniformNumber: string;
    position: string;
    batsThrows: string;
}

export default function RosterPage() {
    const router = useRouter();
    const [players, setPlayers] = useState<Player[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // 💡 モーダル（登録フォーム）用のState
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    
    // 💡 新規登録用のフォームデータ
    const [formData, setFormData] = useState({
        name: "",
        uniformNumber: "",
        position: "投手",
        batsThrows: "右投右打"
    });

    useEffect(() => {
        setIsLoading(true);
        setTimeout(() => {
            setPlayers([
                { id: "1", name: "大谷 翔平", uniformNumber: "17", position: "投手", batsThrows: "右投左打" },
                { id: "2", name: "山本 由伸", uniformNumber: "18", position: "投手", batsThrows: "右投右打" },
                { id: "3", name: "ダルビッシュ 有", uniformNumber: "11", position: "投手", batsThrows: "右投右打" },
                { id: "4", name: "村上 宗隆", uniformNumber: "55", position: "内野手", batsThrows: "右投左打" },
            ]);
            setIsLoading(false);
        }, 800);
    }, []);

    // 💡 保存ボタンを押した時の処理
    const handleSavePlayer = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.uniformNumber) return;

        setIsSaving(true);
        
        // ※ ここは後で Cloudflare Workers の本物APIに差し替えます！
        setTimeout(() => {
            const newPlayer: Player = {
                id: Date.now().toString(),
                name: formData.name,
                uniformNumber: formData.uniformNumber,
                position: formData.position,
                batsThrows: formData.batsThrows,
            };
            setPlayers([...players, newPlayer]);
            setIsSaving(false);
            setIsModalOpen(false);
            setFormData({ name: "", uniformNumber: "", position: "投手", batsThrows: "右投右打" });
            toast.success("選手を名簿に登録しました！"); // 💡 美しいトースト通知
        }, 600);
    };

    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground pb-24 relative">
            <PageHeader 
                href="/dashboard" 
                icon={Users} 
                title="選手名簿 (ロースター)" 
                subtitle="チーム所属選手の管理" 
            />

            <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-6xl mx-auto w-full space-y-6 animate-in fade-in duration-500">
                {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-40 rounded-2xl w-full" />)}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                        {players.map((player) => (
                            <Card key={player.id} className="relative overflow-hidden group border-border/60 bg-gradient-to-br from-background via-background to-muted/30 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1.5 cursor-pointer rounded-2xl">
                                <div className="absolute -bottom-8 -right-4 text-[130px] font-black italic text-foreground/5 group-hover:text-primary/10 transition-colors select-none z-0 tracking-tighter leading-none">{player.uniformNumber}</div>
                                <div className="absolute top-0 left-0 w-1.5 h-full bg-primary/20 group-hover:bg-primary transition-colors z-10" />
                                <CardContent className="p-6 relative z-10 flex flex-col h-full pl-8">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary font-black text-xl border border-primary/20 shadow-inner group-hover:scale-110 transition-transform">{player.uniformNumber}</div>
                                        <span className="px-3 py-1 text-[10px] font-extrabold rounded-full bg-muted text-muted-foreground tracking-widest border border-border/50 shadow-sm">{player.position}</span>
                                    </div>
                                    <h3 className="text-2xl font-black tracking-tight mb-1 truncate group-hover:text-primary transition-colors">{player.name}</h3>
                                    <p className="text-sm font-bold text-muted-foreground/80 mb-4">{player.batsThrows}</p>
                                    <div className="mt-auto pt-4 border-t border-border/30 flex justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                        <Button variant="outline" size="icon" className="h-8 w-8 rounded-full border-border/50 text-muted-foreground hover:text-primary hover:border-primary/50 hover:bg-primary/10"><Edit2 className="h-4 w-4" /></Button>
                                        <Button variant="outline" size="icon" className="h-8 w-8 rounded-full border-border/50 text-muted-foreground hover:text-red-500 hover:border-red-500/50 hover:bg-red-500/10"><Trash2 className="h-4 w-4" /></Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </main>

            {/* 💡 究極の使いやすさ：画面右下に浮遊する追加ボタン（FAB） */}
            <Button 
                onClick={() => setIsModalOpen(true)}
                className="fixed bottom-24 right-6 sm:bottom-12 sm:right-12 h-14 w-14 sm:h-16 sm:w-16 rounded-full shadow-2xl shadow-primary/40 bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300 hover:scale-110 active:scale-95 z-40 flex items-center justify-center"
            >
                <Plus className="h-6 w-6 sm:h-8 sm:w-8" />
                <span className="sr-only">選手を追加</span>
            </Button>

            {/* 💡 美しいスライドアップ・モーダル（登録フォーム） */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-0 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div 
                        className="absolute inset-0" 
                        onClick={() => !isSaving && setIsModalOpen(false)} // 背景タップで閉じる
                    />
                    <div className="relative w-full max-w-lg bg-background border border-border shadow-2xl rounded-3xl sm:rounded-2xl overflow-hidden animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-4 duration-300">
                        <div className="flex items-center justify-between p-6 border-b border-border/50 bg-muted/20">
                            <h2 className="text-xl font-extrabold flex items-center gap-2 tracking-tight">
                                <Users className="h-5 w-5 text-primary" /> 新規選手の登録
                            </h2>
                            <Button variant="ghost" size="icon" onClick={() => setIsModalOpen(false)} disabled={isSaving} className="h-8 w-8 rounded-full hover:bg-muted">
                                <X className="h-5 w-5" />
                            </Button>
                        </div>
                        
                        <form onSubmit={handleSavePlayer} className="p-6 space-y-5">
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2 col-span-2">
                                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">選手名</label>
                                    <input type="text" required placeholder="例: 山田 太郎" className="flex h-12 w-full rounded-xl border border-input bg-background px-4 text-sm font-bold shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} disabled={isSaving} />
                                </div>
                                <div className="space-y-2 col-span-1">
                                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">背番号</label>
                                    <input type="number" required placeholder="1" className="flex h-12 w-full rounded-xl border border-input bg-background px-4 text-sm font-bold shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary text-center" value={formData.uniformNumber} onChange={(e) => setFormData({...formData, uniformNumber: e.target.value})} disabled={isSaving} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">ポジション</label>
                                    <Select className="flex h-12 w-full rounded-xl border border-input bg-background px-4 text-sm font-bold shadow-sm focus-visible:ring-primary" value={formData.position} onChange={(e) => setFormData({...formData, position: e.target.value})} disabled={isSaving}>
                                        <option value="投手">投手</option>
                                        <option value="捕手">捕手</option>
                                        <option value="内野手">内野手</option>
                                        <option value="外野手">外野手</option>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">投打</label>
                                    <Select className="flex h-12 w-full rounded-xl border border-input bg-background px-4 text-sm font-bold shadow-sm focus-visible:ring-primary" value={formData.batsThrows} onChange={(e) => setFormData({...formData, batsThrows: e.target.value})} disabled={isSaving}>
                                        <option value="右投右打">右投右打</option>
                                        <option value="右投左打">右投左打</option>
                                        <option value="左投左打">左投左打</option>
                                        <option value="左投右打">左投右打</option>
                                    </Select>
                                </div>
                            </div>

                            <div className="pt-4 mt-2 border-t border-border/50 flex gap-3">
                                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} disabled={isSaving} className="flex-1 h-12 rounded-xl font-bold">
                                    キャンセル
                                </Button>
                                <Button type="submit" disabled={isSaving} className="flex-1 h-12 rounded-xl font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-md">
                                    {isSaving ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : <><Save className="h-4 w-4 mr-2" /> 登録する</>}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
