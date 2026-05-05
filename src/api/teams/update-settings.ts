// filepath: src/api/teams/update-settings.ts
/* 💡 iScoreCloud 規約: 
   1. 他の API と同様に、リソース ID (teamId) は POST ボディで受け取る。
   2. エンドポイントのパスを固定して 404 を回避する。 */

import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { teams } from '@/db/schema/team';
import { eq } from 'drizzle-orm';
import type { WorkerEnv } from '@/types/api';

const teamsUpdateSettings = new Hono<{ Bindings: WorkerEnv }>();

// 🌟 パスを固定（/:teamId/line ではなく /update-line にする）
teamsUpdateSettings.post('/update-line', async (c) => {
  const db = drizzle(c.env.DB);
  
  try {
    const body = await c.req.json();
    const { teamId, lineGroupId, isAutoReportEnabled } = body;

    if (!teamId) {
      return c.json({ success: false, error: "teamId is required" }, 400);
    }

    await db.update(teams)
      .set({ 
        lineGroupId: lineGroupId?.trim() || null, 
        isAutoReportEnabled: isAutoReportEnabled ?? false 
      })
      .where(eq(teams.id, teamId)); // 💡 ボディの ID を使用

    return c.json({ success: true, data: { updatedId: teamId } });

  } catch (err: unknown) {
    return c.json({ success: false, error: "Database Error" }, 500);
  }
});

export default teamsUpdateSettings;
