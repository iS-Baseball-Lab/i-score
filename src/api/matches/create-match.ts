// filepath: src/api/matches/create-match.ts
import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { matches } from '@/db/schema/match';
import type { WorkerEnv } from '@/types/api';

const app = new Hono<{ Bindings: WorkerEnv }>();

app.post('/create', async (c) => {
  const db = drizzle(c.env.DB);

  try {
    const body = await c.req.json();
    const matchId = crypto.randomUUID();

    // 💡 空文字や undefined を確実に null へ変換する
    const n = (val: any) => (val === "" || val === undefined ? null : val);

    await db.insert(matches).values({
      id: matchId,
      teamId: body.teamId,
      opponent: body.opponent,

      // 🌟 ID系は null でないと外部キー制約に引っかかる可能性あり
      tournamentId: n(body.tournamentId),
      venueId: n(body.venueId),

      date: body.date || new Date().toISOString().split('T')[0],
      matchType: body.matchType || 'practice',
      battingOrder: body.battingOrder || 'first',

      innings: body.innings || 7,
      currentInning: 1,
      isBottom: false,

      isTiebreaker: false,
      isColdGame: false,

      status: 'scheduled',
      myScore: 0,
      opponentScore: 0,
      myInningScores: '[]',
      opponentInningScores: '[]',

      surfaceDetails: n(body.surfaceDetails),
      weather: null,

      // 🌟 重要: created_at はここには書かない！
      // 書かなければ、スキーマ側の .default(sql`(strftime('%s', 'now'))`) が自動適用されます。
    });

    return c.json({ success: true, matchId });
  } catch (err: any) {
    // 💡 エラー詳細をフロントに返す
    console.error("Match Create Error:", err);
    return c.json({ success: false, error: err.message }, 500);
  }
});

export default app;