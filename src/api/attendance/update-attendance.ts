// filepath: src/api/attendance/update-attendance.ts
/* 💡 iScoreCloud 規約: 
   1. 統一されたDBアクセス: drizzle(c.env.DB) を使用し、プロジェクト全体の記法を統一。
   2. 現場至上主義: 選手・スタッフ・車出し情報を1つのトランザクションで確実に更新。 */

import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { attendances } from '@/db/schema/attendance';
import type { WorkerEnv } from '@/types/api';

const app = new Hono<{ Bindings: WorkerEnv }>();

/**
 * 📋 出欠情報 登録・更新ハンドラ
 */
app.post('/update', async (c) => {
  // 1. インスタンス生成を update-score.ts のスタイルに統一
  const db = drizzle(c.env.DB);

  try {
    // 2. リクエストボディの取得
    const body = await c.req.json();
    const {
      eventId,
      userId,
      status,
      roleInEvent,
      hasCar,
      comment
    } = body;

    // 3. バリデーション
    if (!eventId || !userId) {
      return c.json({ success: false, error: "イベントIDまたはユーザーIDが不足しています。" }, 400);
    }

    // 4. D1 データベースへの Upsert (挿入または更新)
    // update-score.ts と同様のメソッドチェーンスタイル
    const result = await db.insert(attendances)
      .values({
        eventId,
        userId,
        status,
        roleInEvent: roleInEvent || 'player',
        hasCar: !!hasCar,
        comment: comment || '',
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [attendances.eventId, attendances.userId],
        set: {
          status,
          roleInEvent: roleInEvent || 'player',
          hasCar: !!hasCar,
          comment: comment || '',
          updatedAt: new Date(),
        }
      })
      .returning();

    // 5. 成功レスポンス
    return c.json({
      success: true,
      data: result[0]
    });

  } catch (err: unknown) {
    console.error(`[Update Attendance Error]:`, err);
    const errorMsg = err instanceof Error ? err.message : "Internal Server Error";
    return c.json({ success: false, error: errorMsg }, 500);
  }
});

export default app;