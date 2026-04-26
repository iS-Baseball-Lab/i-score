// filepath: `src/app/(protected)/dashboard/page.tsx`
// ... (既存のインポートは維持)

export default function DashboardPage() {
  // ... (既存のロジックは維持)

  return (
    <div className="w-full animate-in fade-in duration-500 bg-transparent min-h-screen pb-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-8">

        {/* --- 1. タイトルセクション (中央配置 & サイズアップ) --- */}
        <section className="text-center space-y-2">
          <h2 className="text-sm sm:text-base font-black text-primary uppercase tracking-[0.3em] flex items-center justify-center gap-2">
            <Activity className="h-5 w-5" /> Dashboard
          </h2>
          <h1 className="text-xs sm:text-sm font-black text-muted-foreground uppercase tracking-[0.2em] opacity-80">
            Game Management & Live Recording
          </h1>
        </section>

        {/* --- 現在地ステータス (中央配置は維持) --- */}
        <div className="flex justify-center px-1">
          <div className="flex items-center gap-2 py-2.5 px-8 rounded-3xl bg-primary/10 border border-primary/20 text-primary shadow-sm transition-all cursor-default">
            <MapPin className="h-4 w-4 animate-pulse" />
            <span className="text-sm sm:text-base font-black tracking-tight">
              現在地：{locationName || "取得中..."}
            </span>
          </div>
        </div>

        {/* --- 2. スコア入力選択 (ScoreTypeSelector) --- */}
        <section>
          <ScoreTypeSelector />
        </section>

        {/* --- 環境ウィジェット (維持) --- */}
        <section className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md border border-border/40 shadow-sm rounded-3xl p-4 sm:p-6">
          {/* ... (既存のウィジェット内容は維持) ... */}
        </section>

        {/* --- 3. 試合リスト (維持) --- */}
        <section className="pt-4">
          <div className="flex items-center justify-center mb-6">
            <h2 className="text-xl font-black text-foreground flex items-center gap-3">
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              試合一覧
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            </h2>
          </div>
          <MatchList matches={paginatedMatches} isLoading={isLoading} />
          {/* ... (ページネーションは維持) ... */}
        </section>
      </div>
    </div>
  );
}
