// filepath: src/api/matches/webhook.ts
/* 💡 iScoreCloud 規約: 
   1. Cloudflare Workers で実行。
   2. Messaging API Webhook を確実に受理し、404を完封する。
   3. ログ出力を強化し、LINE側の「検証」リクエストを最優先で 200 OK 返答する。 */

import { LineWebhookRequest } from "@/types/match";

export interface Env {
  LINE_CHANNEL_ACCESS_TOKEN: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const method = request.method;

    // 💡 監督！ここで実際に Workers が受け取っているパスをログに出します
    console.log(`[iScoreCloud] Incoming Request: ${method} ${url.pathname}`);

    // 💡 Webhook検証(POST)と、ブラウザ等での確認(GET)の両方に対応させる
    if (method === "GET") {
      return new Response("iScoreCloud Webhook Endpoint is Active! ⚾️", { status: 200 });
    }

    // パス判定を「含む」レベルまで緩和して 404 を防ぐ
    if (!url.pathname.includes("/api/matches/webhook")) {
      return new Response(`Path Not Handled: ${url.pathname}`, { status: 404 });
    }

    try {
      const body = (await request.json()) as LineWebhookRequest;

      // 🌟 LINE「検証」ボタンへの最速返答
      if (!body.events || body.events.length === 0) {
        console.log("[iScoreCloud] Line verification check passed.");
        return new Response("OK", { status: 200 });
      }

      for (const event of body.events) {
        // グループID抽出ロジック（招待やメッセージから）
        if (event.source.type === 'group' && event.source.groupId) {
          const gid = event.source.groupId;
          console.log(`[iScoreCloud] SUCCESS! Captured Group ID: ${gid}`);

          // 「ID」と打たれた時の返信ロジック
          if (event.type === 'message' && event.message?.type === 'text' && event.message.text === 'ID') {
            await fetch("https://api.line.me/v2/bot/message/reply", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${env.LINE_CHANNEL_ACCESS_TOKEN}`,
              },
              body: JSON.stringify({
                replyToken: event.replyToken,
                messages: [{ type: "text", text: `【iScoreCloud】\nGroup ID: ${gid}` }],
              }),
            });
          }
        }
      }

      return new Response("OK", { status: 200 });
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Payload Error";
      console.error("[iScoreCloud] Webhook Processing Error:", errorMsg);
      // エラーでも 200 を返して LINE 側のリトライを止める（デバッグ時は 200 が安全）
      return new Response("OK", { status: 200 });
    }
  },
};
