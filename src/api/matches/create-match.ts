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

    // 💡 徹底的に null 変換するヘルパー
    const n = (val: any) => (val === "" || val === undefined || val === null ? null : val);

    // 💡 INSERT実行
    await db.insert(matches).values({
      id: matchId,
      // 🌟 teamId が DB の teams テーブルに実在することを確認してください
      teamId: body.teamId || "team-001",
      opponent: body.opponent,

      // 🌟 ID系は絶対に "" ではなく null を渡す
      tournamentId: n(body.tournamentId),
      venueId: n(body.venueId),

      date: body.date || new Date().toISOString().split('T')[0],
      matchType: body.matchType || 'practice',
      battingOrder: body.battingOrder || 'first',

      innings: body.innings || 7,
      currentInning: 1,
      isBottom: false, // SQLiteでは自動で 0 になります

      isTiebreaker: false,
      isColdGame: false,

      status: 'scheduled',
      myScore: 0,
      opponentScore: 0,
      myInningScores: '[]',
      opponentInningScores: '[]',

      surfaceDetails: n(body.surfaceDetails),
      weather: null,

      // 🌟 重要: created_at はここから削除します
      // スキーマの default(sql`...`) に完全に任せるのが SQLite (D1) の安全策です
    });

    return c.json({ success: true, matchId });
  } catch (err: any) {
    console.error("Match Create Error Detail:", err.message);
    // 💡 もし "FOREIGN KEY constraint failed" と出たら、teamId の存在を確認！
    return c.json({ success: false, error: err.message }, 500);
  }
});

export default app;