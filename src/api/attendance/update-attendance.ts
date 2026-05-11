// filepath: src/api/attendance/update-attendance.ts
/* 💡 iScoreCloud 規約: 出欠データの更新系ユニット (POST) */

import { Hono } from 'hono';
import { db } from '@/lib/db';
import { attendances } from '@/db/schema/attendance';
import type { WorkerEnv } from '@/types/api';

const app = new Hono<{ Bindings: WorkerEnv }>();

// 💡 現場での入力ミスを防ぐための厳格なリクエスト型
interface AttendancePostRequest {
  eventId: string;
  userId: string;
  status: 'present' | 'absent' | 'pending' | 'late' | 'early';
  hasCar: boolean;
  comment: string;
}

app.post('/update', async (c) => {
  const body = await c.req.json() as AttendancePostRequest;

  if (!body.eventId || !body.userId) {
    return c.json({ success: false, message: "Missing ID" }, 400);
  }

  // 💡 D1 (SQLite) 特有の Upsert 処理
  const result = await db.insert(attendances)
    .values({
      eventId: body.eventId,
      userId: body.userId,
      status: body.status,
      hasCar: body.hasCar,
      comment: body.comment,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [attendances.eventId, attendances.userId],
      set: {
        status: body.status,
        hasCar: body.hasCar,
        comment: body.comment,
        updatedAt: new Date(),
      }
    })
    .returning();

  return c.json({ success: true, data: result[0] });
});

export default app;
