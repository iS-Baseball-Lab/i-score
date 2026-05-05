// filepath: src/api/matches/webhook.ts
/* 💡 iScoreCloud 規約: 
   1. Hono インスタンスとして定義し、src/worker.ts でマウントする。
   2. Messaging API Webhook を受け取り、groupId を安全に抽出。 */

import { Hono } from 'hono';
import { LineWebhookRequest } from '@/types/match';
import type { WorkerEnv } from '@/types/api';

const webhook = new Hono<{ Bindings: WorkerEnv }>();

webhook.post('/', async (c) => {
  try {
    // 💡 規約: 型安全のため明示的にキャスト
    const body = (await c.req.json()) as LineWebhookRequest;

    // LINE「検証」リクエストへの対応
    if (!body.events || body.events.length === 0) {
      return c.text('OK', 200);
    }

    for (const event of body.events) {
      if (event.source.type === 'group' && event.source.groupId) {
        const gid = event.source.groupId;
        console.log(`[iScoreCloud] Captured Group ID: ${gid}`);

        // デバッグ用：ID返信プロトコル
        if (event.type === 'message' && event.message?.text === 'ID') {
          await fetch("https://api.line.me/v2/bot/message/reply", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${c.env.LINE_CHANNEL_ACCESS_TOKEN}`,
            },
            body: JSON.stringify({
              replyToken: event.replyToken,
              messages: [{ type: "text", text: `【iScoreCloud】\nCaptured ID: ${gid}` }],
            }),
          });
        }
      }
    }

    return c.text('OK', 200);
  } catch (err: unknown) {
    console.error("[iScoreCloud Webhook Error]:", err);
    return c.text('OK', 200); // LINE 側のリトライを防ぐため 200 を返す
  }
});

export default webhook;
