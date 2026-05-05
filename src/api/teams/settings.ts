// filepath: src/api/teams/settings.ts
/* 💡 iScoreCloud 規約: 
   1. Cloudflare Workers + Drizzle で実装。
   2. Hono インスタンスとして定義し、src/worker.ts でマウントする。 */

import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { teams } from '@/db/schema/team';
import { eq } from 'drizzle-orm';
import type { WorkerEnv } from '@/types/api';

const settings = new Hono<{ Bindings: WorkerEnv }>();

/** 💡 API レスポンスの型定義 */
export interface TeamSettingsUpdateResponse {
    success: boolean;
    error?: string;
}

settings.post('/:teamId/line', async (c) => {
    const db = drizzle(c.env.DB);
    const teamId = c.req.param('teamId');

    try {
        // 💡 規約: インターフェースを定義し、明示的な型キャストを行う
        const body = (await c.req.json()) as { 
            lineGroupId: string; 
            isAutoReportEnabled: boolean; 
        };

        await db.update(teams)
            .set({ 
                lineGroupId: body.lineGroupId,
                isAutoReportEnabled: body.isAutoReportEnabled 
            })
            .where(eq(teams.id, teamId));

        const res: TeamSettingsUpdateResponse = { success: true };
        return c.json(res);

    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Update Failed";
        const res: TeamSettingsUpdateResponse = { success: false, error: msg };
        return c.json(res, 500);
    }
});

export default settings;
