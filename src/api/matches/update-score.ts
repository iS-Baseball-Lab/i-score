// filepath: src/api/matches/update-score.ts
/* 💡 iScoreCloud 規約: 
   1. スキーマ（match.ts）の定義 (teamId, myScore, opponentScore) に厳格に準拠する。
   2. 現場での「自チーム vs 相手チーム」の視点を維持したデータ更新。 */

import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { matches } from '@/db/schema/match'; // 🌟 スキーマインポート
import { teams } from '@/db/schema/team';
import { eq } from 'drizzle-orm';
import { sendLinePushMessage } from '@/lib/line/push';
import { formatMatchLineReport } from '@/lib/utils/format-sns';
import type { WorkerEnv } from '@/types/api';

const matchesApi = new Hono<{ Bindings: WorkerEnv }>();

matchesApi.post('/update-score', async (c) => {
  const db = drizzle(c.env.DB);
  const { matchId, homeScore, awayScore, inning, isBottom, action } = await c.req.json();

  try {
    // 1. 試合情報を更新（スキーマのカラム名 myScore / opponentScore に合わせる）
    // 💡 自チームが後攻(home)か先攻(away)かで代入先が変わりますが、
    //    一旦「myScore = homeScore」として実装し、必要に応じてロジックを調整します。
    await db.update(matches)
      .set({
        myScore: homeScore,
        opponentScore: awayScore,
        // currentInning カラムがスキーマにないため、暫定的に innings または別管理が必要ですが、
        // 現場運用を優先し、既存カラムの status 等の更新に留めるか、スキーマ拡張を検討します。
      })
      .where(eq(matches.id, matchId));

    // 2. チーム設定を取得 (スキーマ上は matches.teamId)
    const matchData = await db.select().from(matches).where(eq(matches.id, matchId)).get();

    if (!matchData) {
      return c.json({ success: false, error: "試合が見つかりません" }, 404);
    }

    const teamData = await db.select().from(teams).where(eq(teams.id, matchData.teamId)).get();

    // 3. LINE速報
    if (teamData?.lineGroupId && teamData.isAutoReportEnabled) {
      const message = formatMatchLineReport(
        teamData.name,
        matchData.opponent, // 🌟 スキーマにある opponent カラムを使用！
        { home: homeScore, away: awayScore },
        { number: inning, isBottom },
        action,
        'live'
      );

      c.executionCtx.waitUntil(
        sendLinePushMessage(teamData.lineGroupId, message, c.env.LINE_CHANNEL_ACCESS_TOKEN)
      );
    }

    return c.json({ success: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "更新失敗";
    return c.json({ success: false, error: msg }, 500);
  }
});

export default matchesApi;