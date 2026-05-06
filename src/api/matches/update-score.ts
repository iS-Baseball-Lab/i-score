// filepath: src/api/matches/update-score.ts
/* 💡 iScoreCloud 規約: 
   1. 試合の進行状況（イニング・表裏）をアトミックに更新。
   2. myScore / opponentScore カラムへの正確なマッピング。
   3. waitUntil を使用した低遅延な LINE 速報射出。 */

import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { matches } from '@/db/schema/match';
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
    // 🌟 1. D1の試合データを最新の状況に更新
    await db.update(matches)
      .set({ 
        myScore: homeScore,        // 自チーム得点
        opponentScore: awayScore,  // 相手チーム得点
        currentInning: inning,     // 🌟 追加：現在の回
        isBottom: isBottom,        // 🌟 追加：裏フラグ
        status: 'live' 
      })
      .where(eq(matches.id, matchId));

    // 🌟 2. チーム設定を取得して LINE 送信可否を判定
    const matchData = await db.select().from(matches).where(eq(matches.id, matchId)).get();
    if (!matchData) return c.json({ success: false, error: "Match Not Found" }, 404);

    const teamData = await db.select().from(teams).where(eq(teams.id, matchData.teamId)).get();

    // 🌟 3. LINE速報の射出（waitUntil でレスポンスを待たせない）
    if (teamData?.lineGroupId && teamData.isAutoReportEnabled) {
      const message = formatMatchLineReport(
        teamData.name,
        matchData.opponent,
        { home: homeScore, away: awayScore },
        { number: inning, isBottom },
        action,
        'live'
      );

      c.executionCtx.waitUntil(
        sendLinePushMessage(
          teamData.lineGroupId, 
          message, 
          c.env.LINE_CHANNEL_ACCESS_TOKEN
        )
      );
    }

    return c.json({ success: true, data: { matchId, updatedInning: `${inning}${isBottom ? '裏' : '表'}` } });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal Server Error";
    return c.json({ success: false, error: msg }, 500);
  }
});

export default matchesApi;
