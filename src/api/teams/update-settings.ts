// filepath: src/api/teams/update-settings.ts
/* 💡 iScoreCloud 規約: 
   1. Cloudflare Workers + D1 + Drizzle で実装。
   2. 型キャストを明示し、レスポンスインターフェースを定義。 */

import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { teams } from '@/db/schema/teams';
import { eq } from 'drizzle-orm';
import type { WorkerEnv } from '@/types/api';

const teamsSettings = new Hono<{ Bindings: WorkerEnv }>();

export interface TeamSettingsUpdate {
  teamId: string;
  lineGroupId: string;
  isAutoReportEnabled: boolean;
}

teamsSettings.post('/update', async (c) => {
  const db = drizzle(c.env.DB);
  
  try {
    // 💡 規約: 明示的な型キャスト
    const body = (await c.req.json()) as TeamSettingsUpdate;
    const { teamId, lineGroupId, isAutoReportEnabled } = body;

    await db.update(teams)
      .set({ 
        lineGroupId, 
        isAutoReportEnabled: isAutoReportEnabled ? 1 : 0,
        updatedAt: new Date()
      })
      .where(eq(teams.id, teamId));

    return c.json({ success: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Update failed";
    return c.json({ success: false, error: msg }, 500);
  }
});

export default teamsSettings;
