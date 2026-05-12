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

    // 💡 スキーマの型定義に100%一致させます
    await db.insert(matches).values({
      id: matchId,
      teamId: body.teamId,
      opponent: body.opponent || "対戦相手未定",
      // tournament プロパティを削除し、スキーマにある tournamentId (null可) を使用
      tournamentId: body.tournamentId || null,

      date: body.date || new Date().toISOString().split('T')[0],
      matchType: body.matchType || 'practice', // 'official' または 'practice'
      battingOrder: body.battingOrder || 'first',

      innings: body.innings || 7,
      currentInning: 1,
      isBottom: false,

      status: 'scheduled',
      myScore: 0,
      opponentScore: 0,
      myInningScores: '[]',
      opponentInningScores: '[]',

      venueId: body.venueId || null,
      isTiebreaker: false,
      isColdGame: false,
    });

    return c.json({ success: true, matchId });
  } catch (err: unknown) {
    console.error("Match Create Error:", err);
    return c.json({ success: false, error: "試合の作成に失敗しました" }, 500);
  }
});

export default app;