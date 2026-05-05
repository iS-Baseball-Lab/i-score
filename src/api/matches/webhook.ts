// filepath: src/api/matches/webhook.ts
/* 💡 iScoreCloud 規約: 
   1. Cloudflare Workers + Hono で実行。
   2. 現場でのコピー性を最大化するため、特定のメッセージ「ID」に対して groupId のみを返信する。 */

import { Hono } from 'hono';
import { LineWebhookRequest } from '@/types/match';
import type { WorkerEnv } from '@/types/api';

const webhook = new Hono<{ Bindings: WorkerEnv }>();

webhook.post('/', async (c) => {
  try {
    // 💡 規約: 型安全のため明示的にキャスト
    const body = (await c.req.json()) as LineWebhookRequest;

    // 検証リクエストへの即時応答
    if (!body.events || body.events.length === 0) {
      return c.text('OK', 200);
    }

    for (const event of body.events) {
      // 🌟 グループイベントから ID を抽出
      if (event.source.type === 'group' && event.source.groupId) {
        const gid = event.source.groupId;

        // 🧪 デバッグプロトコル: 「ID」というメッセージに反応
        if (
          event.type === 'message' && 
          event.message?.type === 'text' && 
          event.message.text === 'ID'
        ) {
          // 💡 現場視認性改善: 余計な文字を排除し、groupId のみを返信
          await fetch("https://api.line.me/v2/bot/message/reply", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${c.env.LINE_CHANNEL_ACCESS_TOKEN}`,
            },
            body: JSON.stringify({
              replyToken: event.replyToken,
              messages: [{ 
                type: "text", 
                text: gid // 🌟 ここを ID のみの返却に変更！
              }],
            }),
          });
        }
      }
    }

    return c.text('OK', 200);
  } catch (err: unknown) {
    // エラー時はログに残しつつ、LINE側には 200 を返してリトライを防ぐ
    console.error("[iScoreCloud Webhook Error]:", err);
    return c.text('OK', 200);
  }
});

export default webhook;
