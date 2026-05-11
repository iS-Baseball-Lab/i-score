// filepath: src/api/attendance/index.ts
/* 💡 iScoreCloud 規約: 
   1. 統一されたDBアクセス: drizzle(c.env.DB, { schema }) を使用。
   2. リレーショナルクエリ: schemaを渡すことで、with によるJOINを型安全に実現。 */

import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import * as attendanceSchema from '@/db/schema/attendance';
// 💡 userテーブルの定義が含まれるスキーマも必要に応じてインポート
import * as userSchema from '@/db/schema/auth';
import type { WorkerEnv } from '@/types/api';

const app = new Hono<{ Bindings: WorkerEnv }>();

/**
 * 📋 イベント別 出欠一覧取得ハンドラ
 */
app.get('/:eventId', async (c) => {
  const eventId = c.req.param('eventId');

  // 1. インスタンス生成（リレーショナルクエリを有効にするためschemaを結合して渡す）
  const db = drizzle(c.env.DB, {
    schema: { ...attendanceSchema, ...userSchema }
  });

  try {
    // 2. 現場至上主義：ユーザー情報をJOINして一覧を取得
    // update-score.ts の db.select() スタイルではなく、
    // JOINが容易な db.query (Relational Queries) スタイルを維持しつつ、
    // インスタンス化の作法だけを統一します。
    const results = await db.query.attendances.findMany({
      where: eq(attendanceSchema.attendances.eventId, eventId),
      with: {
        user: true, // schema 連携により型安全にJOIN
      },
    });

    // 3. 成功レスポンス
    return c.json({
      success: true,
      data: results
    });

  } catch (err: unknown) {
    console.error(`[Fetch Attendance Error]:`, err);
    const errorMsg = err instanceof Error ? err.message : "Internal Server Error";
    return c.json({ success: false, error: errorMsg }, 500);
  }
});

export default app;