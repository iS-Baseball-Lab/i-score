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

    // 💡 空文字を null に変換するヘルパー
    const nullIfEmpty = (val: any) => (val === "" || val === undefined ? null : val);

    await db.insert(matches).values({
      id: matchId,
      teamId: body.teamId, // ここは必須
      opponent: body.opponent, // ここも必須

      // 🌟 空文字ではなく明示的に null を渡す
      tournamentId: nullIfEmpty(body.tournamentId),
      venueId: nullIfEmpty(body.venueId),

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

      surfaceDetails: nullIfEmpty(body.surfaceDetails),
      weather: null,
      // createdAt はデフォルト値(strftime)に任せるため、ここで送らなくてもOK
    });

    return c.json({ success: true, matchId });
  } catch (err: any) {
    // 💡 エラーログをより詳細に出す
    console.error("Match Create Error Detail:", err.message);
    return c.json({ success: false, error: err.message }, 500);
  }
});

export default app;