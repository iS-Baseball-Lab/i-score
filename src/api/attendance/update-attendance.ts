// filepath: src/api/attendance/update-attendance.ts
/* 💡 iScoreCloud 規約: スタッフ対応・出欠更新ユニット */

import { Hono } from 'hono';
import { db } from '@/lib/db';
import { attendances } from '@/db/schema/attendance';
import type { WorkerEnv } from '@/types/api';

const app = new Hono<{ Bindings: WorkerEnv }>();

interface AttendanceUpdateRequest {
  eventId: string;
  userId: string;
  status: 'present' | 'absent' | 'pending' | 'late';
  roleInEvent: string; // "player", "coach", "staff", "umpire" など
  hasCar: boolean;
  comment: string;
}

app.post('/update', async (c) => {
  const body = await c.req.json() as AttendanceUpdateRequest;

  const result = await db.insert(attendances)
    .values({
      ...body,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [attendances.eventId, attendances.userId],
      set: {
        status: body.status,
        roleInEvent: body.roleInEvent,
        hasCar: body.hasCar,
        comment: body.comment,
        updatedAt: new Date(),
      }
    })
    .returning();

  return c.json({ success: true, data: result[0] });
});

export default app;
