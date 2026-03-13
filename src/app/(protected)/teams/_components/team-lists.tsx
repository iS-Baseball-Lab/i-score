// src/app/(protected)/teams/_components/team-lists.tsx
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Shield, ChevronRight, ChevronLeft, Settings, Info, Swords, Search } from "lucide-react";
import { RiTeamFill } from "react-icons/ri";
import { cn } from "@/lib/utils";
import { Organization, Team } from "../types";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 1. クラブ一覧コンポーネント
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
interface OrgListProps {
    orgs: Organization[];
    isLoading: boolean;
    onSelectOrg: (org: Organization) => void;
    onOpenDetail: (e: React.MouseEvent, type: 'org', data: Organization) => void;
}

export function OrgList({ orgs, isLoading, onSelectOrg, onOpenDetail }: OrgListProps) {
    // 💡 対戦クラブのモックデータ（後でAPIから取得するように変更します）
    const mockOpponents = [
        { id: 'opp-1', name: '横浜青葉シニア', matchCount: 3, lastMatch: '2025-11-12' },
        { id: 'opp-2', name: '世田谷西シニア', matchCount: 1, lastMatch: '2025-10-05' },
        { id: 'opp-3', name: '新宿シニア', matchCount: 2, lastMatch: '2025-09-20' },
        { id: 'opp-4', name: '浦和シニア', matchCount: 5, lastMatch: '2025-08-30' },
    ];

    if (isLoading) return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

    return (
        <div className="animate-in slide-in-from-left-4 fade-in duration-300 pb-10">
            {/* ─── 所属クラブ セクション ─── */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2.5">
                    <RiTeamFill className="h-6 w-6 text-primary" />
                    所属クラブ <span className="text-muted-foreground/50 text-base sm:text-lg">({orgs.length})</span>
                </h2>
            </div>

            {orgs.length === 0 ? (
                <div className="text-center py-24 bg-primary/5 rounded-[32px] border border-dashed border-primary/20 mt-6 shadow-sm">
                    <div className="h-24 w-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-primary/20 shadow-inner">
                        <RiTeamFill className="h-12 w-12 text-primary/60" />
                    </div>
                    <h3 className="text-xl font-black text-primary/90 mb-2 tracking-tight">クラブが登録されていません</h3>
                    <p className="text-primary/70 font-extrabold text-sm mb-8">右下の＋ボタンから、最初のクラブを作成しましょう。</p>
                </div>
            ) : (
                <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 mt-4">
                    {orgs.map((org) => (
                        <Card key={org.id} onClick={() => onSelectOrg(org)} className="group relative overflow-hidden rounded-[28px] border-border/50 bg-card shadow-sm transition-all duration-300 hover:shadow-lg hover:border-primary/40 active:border-primary/40 active:scale-[0.96] cursor-pointer">
                            <div className="absolute top-0 right-0 pointer-events-none">
                                <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-bl-full -mr-16 -mt-16 transition-transform duration-500 group-hover:scale-110 group-active:scale-110" />
                                <div className="absolute top-0 right-0 w-36 h-36 bg-primary/5 rounded-bl-full -mr-10 -mt-10 transition-transform duration-500 delay-75 group-hover:scale-110 group-active:scale-110 group-hover:bg-primary/10 group-active:bg-primary/10" />
                                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-bl-full -mr-4 -mt-4 transition-transform duration-500 delay-150 group-hover:scale-[1.2] group-active:scale-[1.2] group-hover:bg-primary/20 group-active:bg-primary/20" />
                            </div>

                            <CardContent className="p-6 sm:p-8 relative z-10 flex flex-col h-full pointer-events-none">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="p-3.5 bg-muted/50 rounded-[18px] text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary group-active:bg-primary/10 group-active:text-primary transition-colors duration-300 shadow-sm border border-border/50 group-hover:border-primary/20 group-active:border-primary/20">
                                        <RiTeamFill className="h-7 w-7" />
                                    </div>
                                    <div className="flex items-center gap-2 pointer-events-auto">
                                        <div className="inline-flex items-center rounded-full px-3 py-1.5 text-[10px] sm:text-xs font-black bg-muted/50 text-muted-foreground uppercase tracking-widest group-hover:bg-primary/10 group-hover:text-primary group-active:bg-primary/10 group-active:text-primary transition-colors duration-300 border border-border/50 group-hover:border-primary/20 group-active:border-primary/20 shadow-sm pointer-events-none">
                                            {org.myRole}
                                        </div>
                                        <Button variant="ghost" size="icon" onClick={(e) => onOpenDetail(e, 'org', org)} className={cn("h-8 w-8 rounded-full transition-colors z-20", org.myRole === 'OWNER' ? "text-primary/70 hover:bg-primary/10 hover:text-primary" : "text-muted-foreground hover:bg-muted")}>
                                            {org.myRole === 'OWNER' ? <Settings className="h-4 w-4" /> : <Info className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                </div>
                                <h3 className="text-2xl sm:text-3xl font-black tracking-tight mb-2 truncate group-hover:text-primary group-active:text-primary transition-colors duration-300 drop-shadow-sm mt-auto">
                                    {org.name}
                                </h3>
                                <div className="flex items-center text-sm font-extrabold text-muted-foreground mt-4 group-hover:text-primary/80 group-active:text-primary/80 transition-colors duration-300">
                                    チーム一覧を開く <ChevronRight className="h-5 w-5 ml-1 transition-transform duration-300 group-hover:translate-x-1 group-active:translate-x-1" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                💡 新規追加：対戦クラブ（コンパクトリスト） セクション
            ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
            <div className="mt-16 animate-in slide-in-from-bottom-8 fade-in duration-500 delay-150 fill-mode-both">

                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
                    <div>
                        <h2 className="text-lg sm:text-xl font-black tracking-tight flex items-center gap-2.5 text-foreground/80">
                            <Swords className="h-5 w-5 text-primary/70" />
                            対戦履歴・その他のクラブ
                        </h2>
                        <p className="text-xs font-bold text-muted-foreground mt-1">過去に対戦したクラブや、登録されているクラブの一覧です。</p>
                    </div>

                    {/* 検索ボックス（モック） */}
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="クラブを検索..."
                            className="h-10 w-full rounded-full border border-border/50 bg-background pl-9 pr-4 text-sm font-bold shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-all"
                        />
                    </div>
                </div>

                <div className="bg-card border border-border/50 rounded-[28px] overflow-hidden shadow-sm">
                    {mockOpponents.map((opp, index) => (
                        <div
                            key={opp.id}
                            onClick={() => console.log('TODO: 対戦クラブ詳細を開く', opp.id)}
                            className={cn(
                                "group flex items-center justify-between p-4 sm:px-6 hover:bg-muted/50 transition-colors cursor-pointer",
                                index !== mockOpponents.length - 1 && "border-b border-border/50"
                            )}
                        >
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black text-sm sm:text-base border border-primary/20 shrink-0 group-hover:scale-105 transition-transform">
                                    {opp.name.charAt(0)}
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-black text-base sm:text-lg text-foreground group-hover:text-primary transition-colors">{opp.name}</span>
                                    <span className="text-xs font-bold text-muted-foreground hidden sm:block">最終対戦: {opp.lastMatch}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="hidden sm:flex flex-col items-end">
                                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">対戦回数</span>
                                    <span className="font-black text-foreground">{opp.matchCount} <span className="text-xs text-muted-foreground font-bold">回</span></span>
                                </div>
                                <div className="h-8 w-8 rounded-full bg-background border border-border/50 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all shadow-sm">
                                    <ChevronRight className="h-4 w-4" />
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* 「もっと見る」ボタン */}
                    <button className="w-full py-4 text-sm font-black text-primary/70 hover:text-primary hover:bg-primary/5 transition-colors border-t border-border/50">
                        すべてのクラブを表示
                    </button>
                </div>
            </div>
        </div>
    );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 2. チーム一覧コンポーネント (変更なし)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
interface TeamListProps {
    teams: Team[];
    selectedOrg: Organization;
    isLoading: boolean;
    onBack: () => void;
    onTeamClick: (teamId: string) => void;
    onOpenDetail: (e: React.MouseEvent, type: 'team', data: Team) => void;
}

export function TeamList({ teams, selectedOrg, isLoading, onBack, onTeamClick, onOpenDetail }: TeamListProps) {
    // ...（中略：以前の TeamList コンポーネントの中身そのまま）...
    return (
        <div className="animate-in slide-in-from-right-4 fade-in duration-300">
            <div className="mb-6 flex flex-col items-start gap-4">
                <Button variant="ghost" onClick={onBack} className="rounded-full pl-2 pr-4 hover:bg-muted text-muted-foreground font-extrabold">
                    <ChevronLeft className="h-5 w-5 mr-1" /> クラブ一覧へ戻る
                </Button>
                <div className="flex items-center justify-between w-full pl-2">
                    <div>
                        <div className="text-xs font-black text-primary tracking-wider uppercase mb-1">{selectedOrg.name}</div>
                        <h2 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2.5">
                            <Shield className="h-6 w-6 text-primary" />
                            所属チーム <span className="text-muted-foreground/50 text-base sm:text-lg">({teams.length})</span>
                        </h2>
                    </div>
                </div>
            </div>

            {isLoading ? (
                <div className="py-20 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary/50" /></div>
            ) : teams.length === 0 ? (
                <div className="text-center py-24 bg-primary/5 rounded-[32px] border border-dashed border-primary/20 mt-6 shadow-sm">
                    <div className="h-24 w-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-primary/20 shadow-inner">
                        <Shield className="h-12 w-12 text-primary/60" />
                    </div>
                    <h3 className="text-xl font-black text-primary/90 mb-2 tracking-tight">チームが登録されていません</h3>
                    <p className="text-primary/70 font-extrabold text-sm mb-8">右下の＋ボタンから、最初のチームを追加しましょう。</p>
                </div>
            ) : (
                <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 mt-4">
                    {teams.map((team) => (
                        <Card key={team.id} onClick={() => onTeamClick(team.id)} className="group relative overflow-hidden rounded-[28px] border-border/50 bg-card shadow-sm transition-all duration-300 hover:shadow-lg hover:border-primary/40 active:border-primary/40 active:scale-[0.96] cursor-pointer">
                            <div className="absolute top-0 right-0 pointer-events-none">
                                <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-bl-full -mr-16 -mt-16 transition-transform duration-500 group-hover:scale-110 group-active:scale-110" />
                                <div className="absolute top-0 right-0 w-36 h-36 bg-primary/5 rounded-bl-full -mr-10 -mt-10 transition-transform duration-500 delay-75 group-hover:scale-110 group-active:scale-110 group-hover:bg-primary/10 group-active:bg-primary/10" />
                                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-bl-full -mr-4 -mt-4 transition-transform duration-500 delay-150 group-hover:scale-[1.2] group-active:scale-[1.2] group-hover:bg-primary/20 group-active:bg-primary/20" />
                            </div>

                            <CardContent className="p-6 sm:p-8 relative z-10 flex flex-col h-full pointer-events-none">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="p-3.5 bg-muted/50 rounded-[18px] text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary group-active:bg-primary/10 group-active:text-primary transition-colors duration-300 shadow-sm border border-border/50 group-hover:border-primary/20 group-active:border-primary/20">
                                        <Shield className="h-7 w-7" />
                                    </div>
                                    <div className="flex items-center gap-2 pointer-events-auto">
                                        <div className="inline-flex items-center rounded-full px-3 py-1.5 text-[10px] sm:text-xs font-black bg-muted/50 text-muted-foreground uppercase tracking-widest group-hover:bg-primary/10 group-hover:text-primary group-active:bg-primary/10 group-active:text-primary transition-colors duration-300 border border-border/50 group-hover:border-primary/20 group-active:border-primary/20 shadow-sm">TEAM</div>
                                        <Button variant="ghost" size="icon" onClick={(e) => onOpenDetail(e, 'team', team)} className={cn("h-8 w-8 rounded-full transition-colors z-20", selectedOrg.myRole === 'OWNER' ? "text-primary/70 hover:bg-primary/10 hover:text-primary" : "text-muted-foreground hover:bg-muted")}>
                                            {selectedOrg.myRole === 'OWNER' ? <Settings className="h-4 w-4" /> : <Info className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                </div>
                                <h3 className="text-2xl sm:text-3xl font-black tracking-tight mb-2 truncate group-hover:text-primary group-active:text-primary transition-colors duration-300 drop-shadow-sm mt-auto">
                                    {team.name}
                                </h3>
                                <div className="flex items-center text-sm font-extrabold text-muted-foreground mt-4 group-hover:text-primary/80 group-active:text-primary/80 transition-colors duration-300">
                                    ダッシュボードを開く <ChevronRight className="h-5 w-5 ml-1 transition-transform duration-300 group-hover:translate-x-1 group-active:translate-x-1" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}