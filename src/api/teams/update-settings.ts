// filepath: src/api/teams/update-settings.ts
/* 💡 iScoreCloud 規約: 
   1. D1 のマイグレーション漏れをフロントエンドに赤文字で即座に伝える。
   2. 詳細なエラーメッセージを JSON で返却し、現場での「原因不明」を撲滅。 */

import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { teams } from '@/db/schema/team';
import { eq } from 'drizzle-orm';
import type { WorkerEnv } from '@/types/api';

const teamsUpdateSettings = new Hono<{ Bindings: WorkerEnv }>();

teamsUpdateSettings.post('/update-line', async (c) => {
  const db = drizzle(c.env.DB);
  
  try {
    const body = await c.req.json();
    
    // 💡 実行！もしカラムがないとここで例外が投げられます
    await db.update(teams)
      .set({ 
        lineGroupId: body.lineGroupId?.trim() || null, 
        isAutoReportEnabled: body.isAutoReportEnabled ?? false 
      })
      .where(eq(teams.id, body.teamId));

    return c.json({ success: true, data: { updatedId: body.teamId } });

  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Unknown DB Error";
    
    // 🌟 監督！マイグレーション忘れを特定するヒントを添えます
    let hint = errorMsg;
    if (errorMsg.includes("no such column")) {
      hint = `【DB整備不良】line_group_id カラムが見つかりません。npx wrangler d1 migrations apply を実行してください。 (詳細: ${errorMsg})`;
    }

    return c.json({ success: false, error: hint }, 500);
  }
});

export default teamsUpdateSettings;
