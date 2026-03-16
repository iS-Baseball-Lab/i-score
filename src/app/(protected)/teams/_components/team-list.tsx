// src/app/(protected)/teams/_components/team-list.tsx
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ChevronRight, ChevronLeft, Settings, Info, CalendarDays, Layers, Users, Tag, Swords } from "lucide-react";
import { RiTeamFill } from "react-icons/ri"; 
import { cn } from "@/lib/utils";
import { Organization, Team } from "../types";

interface TeamListProps {
    teams: Team[];
    selectedOrg: Organization;
    isLoading: boolean;
    onBack: () => void;
    onTeamClick: (teamId: string) => void;
    onOpenDetail: (e: React.MouseEvent, team: Team) => void;
}

const getTeamTypeLabel = (type?: string) => {
    switch(type) {
        case 'regular': return '通常';
        case 'selection': return '選抜・合同';
        case 'practice': return '練習・紅白戦';
        case 'ob': return 'OB・その他';
        default: return '通常';
    }
};

const getTeamRoleDisplayName = (role?: string) => {
    switch(role) {
        case 'manager': return '監督 / 代表';
        case 'coach': return 'コーチ';
        case 'scorer': return 'スコアラー';
        case 'staff': return 'スタッフ';
        default: return 'メンバー';
    }
};

export function TeamList({ teams, selectedOrg, isLoading, onBack, onTeamClick, onOpenDetail }: TeamListProps) {
    // 💡 この組織が対戦相手かどうかを判定
    const isOpponent = selectedOrg.myRole === 'OPPONENT_MANAGER';

    return (
        <div className="animate-in slide-in-from-right-4 fade-in duration-300 pb-10">
            <div className="mb-6 flex flex-col items-start gap-4">
                <Button variant="ghost" onClick={onBack} className="rounded-full pl-2 pr-4 hover:bg-muted text-muted-foreground font-extrabold">
                    <ChevronLeft className="h-5 w-5 mr-1" /> チーム一覧へ戻る
                </Button>
                <div className="flex items-center justify-between w-full pl-2">
                    <div>
                        <div className="text-xs font-black text-primary tracking-wider uppercase mb-1">{selectedOrg.name}</div>
                        <h2 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2.5">
                            {/* 💡 対戦相手ならアイコンとタイトルを切り替え！ */}
                            {isOpponent ? <Swords className="h-6 w-6 text-primary" /> : <RiTeamFill className="h-6 w-6 text-primary" />}
                            {isOpponent ? "対戦相手の編成" : "所属チーム編成"} <span className="text-muted-foreground/50 text-base sm:text-lg">({teams.length})</span>
                        </h2>
                    </div>
                </div>
            </div>

            {/* 💡 究極改修: 対戦相手の場合、上部に通算成績パネルを表示！ */}
            {isOpponent && (
                <div className="mb-8 p-6 bg-card rounded-[28px] border border-border/50 shadow-sm">
                    <h3 className="text-sm font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2 mb-4">
                        <Swords className="h-4 w-4 text-primary/70" /> {selectedOrg.name} との通算成績
                    </h3>
                    <div className="grid grid-cols-3 gap-3 sm:gap-4">
                        {/* ※ APIと繋ぐまではダミーの 0勝 0敗 0分 を表示 */}
                        <div className="bg-blue-500/5 border border-blue-500/10 rounded-[20px] p-4 flex flex-col items-center justify-center text-center shadow-sm">
                            <span className="text-[10px] font-black text-blue-500/70 uppercase tracking-widest mb-1">Wins</span>
                            <span className="text-2xl sm:text-3xl font-black text-blue-500">0 <span className="text-sm">勝</span></span>
                        </div>
                        <div className="bg-red-500/5 border border-red-500/10 rounded-[20px] p-4 flex flex-col items-center justify-center text-center shadow-sm">
                            <span className="text-[10px] font-black text-red-500/70 uppercase tracking-widest mb-1">Losses</span>
                            <span className="text-2xl sm:text-3xl font-black text-red-500">0 <span className="text-sm">敗</span></span>
                        </div>
                        <div className="bg-zinc-500/5 border border-zinc-500/10 rounded-[20px] p-4 flex flex-col items-center justify-center text-center shadow-sm">
                            <span className="text-[10px] font-black text-zinc-500/70 uppercase tracking-widest mb-1">Draws</span>
                            <span className="text-2xl sm:text-3xl font-black text-zinc-500">0 <span className="text-sm">分</span></span>
                        </div>
                    </div>
                </div>
            )}

            {isLoading ? (
                <div className="py-20 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary/50" /></div>
            ) : teams.length === 0 ? (
                <div className="text-center py-24 bg-primary/5 rounded-[32px] border border-dashed border-primary/20 shadow-sm">
                    <div className="h-24 w-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-primary/20 shadow-inner">
                        {isOpponent ? <Swords className="h-12 w-12 text-primary/60" /> : <RiTeamFill className="h-12 w-12 text-primary/60" />}
                    </div>
                    <h3 className="text-xl font-black text-primary/90 mb-2 tracking-tight">編成が登録されていません</h3>
                    {isOpponent && <p className="text-sm font-bold text-primary/70 mt-2">右下の＋ボタンから、対戦相手の編成（例：1軍）を追加してください。</p>}
                </div>
            ) : (
                <div className="grid gap-4 sm:gap-6 sm:grid-cols-2">
                    {teams.map((team) => (
                        <Card key={team.id} onClick={() => onTeamClick(team.id)} className="group relative overflow-hidden rounded-[28px] border-border/50 bg-card shadow-sm transition-all duration-300 hover:shadow-lg hover:border-primary/40 active:border-primary/40 active:scale-[0.96] cursor-pointer flex flex-col">
                            
                            <div className="absolute top-0 right-0 pointer-events-none">
                                <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-bl-full -mr-16 -mt-16 transition-transform duration-500 group-hover:scale-110 group-active:scale-110" />
                                <div className="absolute top-0 right-0 w-36 h-36 bg-primary/5 rounded-bl-full -mr-10 -mt-10 transition-transform duration-500 delay-75 group-hover:scale-110 group-active:scale-110 group-hover:bg-primary/10 group-active:bg-primary/10" />
                                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-bl-full -mr-4 -mt-4 transition-transform duration-500 delay-150 group-hover:scale-[1.2] group-active:scale-[1.2] group-hover:bg-primary/20 group-active:bg-primary/20" />
                            </div>

                            <CardContent className="p-6 sm:p-8 relative z-10 flex flex-col h-full pointer-events-none">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3.5 bg-muted/50 rounded-[18px] text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary group-active:bg-primary/10 group-active:text-primary transition-colors duration-300 shadow-sm border border-border/50 group-hover:border-primary/20 group-active:border-primary/20">
                                        {isOpponent ? <Swords className="h-7 w-7" /> : <RiTeamFill className="h-7 w-7" />}
                                    </div>
                                    <div className="flex items-center gap-2 pointer-events-auto">
                                        {!isOpponent && team.myRole && (
                                            <div className="inline-flex items-center rounded-full px-3 py-1.5 text-[10px] sm:text-xs font-black bg-primary/10 text-primary uppercase tracking-widest transition-colors duration-300 border border-primary/20 shadow-sm pointer-events-none">
                                                {getTeamRoleDisplayName(team.myRole)}
                                            </div>
                                        )}
                                        <Button variant="ghost" size="icon" onClick={(e) => onOpenDetail(e, team)} className={cn("h-8 w-8 rounded-full transition-colors z-20", selectedOrg.myRole === 'OWNER' ? "text-primary/70 hover:bg-primary/10 hover:text-primary" : "text-muted-foreground hover:bg-muted")}>
                                            {selectedOrg.myRole === 'OWNER' || selectedOrg.myRole === 'OPPONENT_MANAGER' ? <Settings className="h-4 w-4" /> : <Info className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                </div>

                                <div className="mt-auto">
                                    <div className="flex flex-wrap items-center gap-2 mb-3">
                                        {team.year && (
                                            <div className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] sm:text-xs font-black bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-sm">
                                                <CalendarDays className="h-3.5 w-3.5" /> {team.year}年度
                                            </div>
                                        )}
                                        {team.tier && (
                                            <div className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] sm:text-xs font-black bg-blue-500/10 text-blue-500 border border-blue-500/20 shadow-sm">
                                                <Layers className="h-3.5 w-3.5" /> {team.tier}
                                            </div>
                                        )}
                                        {team.generation && (
                                            <div className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] sm:text-xs font-black bg-purple-500/10 text-purple-500 border border-purple-500/20 shadow-sm">
                                                <Users className="h-3.5 w-3.5" /> {team.generation}
                                            </div>
                                        )}
                                        {team.teamType && team.teamType !== 'regular' && (
                                            <div className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] sm:text-xs font-black bg-orange-500/10 text-orange-500 border border-orange-500/20 shadow-sm">
                                                <Tag className="h-3.5 w-3.5" /> {getTeamTypeLabel(team.teamType)}
                                            </div>
                                        )}
                                    </div>

                                    <h3 className="text-2xl sm:text-3xl font-black tracking-tight mb-2 truncate group-hover:text-primary group-active:text-primary transition-colors duration-300 drop-shadow-sm">
                                        {team.name}
                                    </h3>
                                    
                                    <div className="flex items-center text-sm font-extrabold text-muted-foreground mt-4 group-hover:text-primary/80 group-active:text-primary/80 transition-colors duration-300">
                                        {isOpponent ? '対戦記録・ダッシュボードへ' : 'ダッシュボードを開く'} <ChevronRight className="h-5 w-5 ml-1 transition-transform duration-300 group-hover:translate-x-1 group-active:translate-x-1" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
