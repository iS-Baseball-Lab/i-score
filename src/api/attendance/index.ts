// filepath: src/api/attendance/index.ts
/* 💡 iScoreCloud 規約: 出欠データの参照系ユニット */

import { Hono } from 'hono';
import { db } from '@/lib/db'; // Drizzle設定
import { attendances, events } from '@/db/schema/attendance';
import { eq } from 'drizzle-orm';
import type { WorkerEnv } from '@/types/api';

const app = new Hono<{ Bindings: WorkerEnv }>();

// 指定したイベントの全メンバー出欠取得
app.get('/:eventId', async (c) => {
  const eventId = c.req.param('eventId');
  
  // 💡 現場至上主義：ユーザー情報とJOINして一覧を取得
  const results = await db.query.attendances.findMany({
    where: eq(attendances.eventId, eventId),
    with: {
      user: true, 
    }
  });

  return c.json({ success: true, data: results });
});

export default app;
