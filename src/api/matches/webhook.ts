// filepath: src/api/matches/webhook.ts
/* 💡 iScoreCloud 規約: 
   1. Cloudflare Workers で実行。
   2. Messaging API Webhook を受け取り、groupId を安全に抽出。
   3. パス判定を正規化し、404エラーを完封する。 */

import { LineWebhookRequest } from "@/types/match";

export interface Env {
  LINE_CHANNEL_ACCESS_TOKEN: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    
    /* 💡 現場対応: パス末尾のスラッシュ有無や、
       Wranglerの設定によるルーティングのズレを吸収する判定 */
    const normalizedPath = url.pathname.replace(/\/$/, "");
    if (normalizedPath !== "/api/matches/webhook") {
      console.log(`[iScoreCloud] Ignored path: ${url.pathname}`);
      return new Response("Not Found", { status: 404 });
    }

    // LINE Webhook は POST 以外は受け付けない
    if (request.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    try {
      // 💡 規約: 型安全のため明示的にキャスト
      const body = (await request.json()) as LineWebhookRequest;

      // LINE Developersコンソールからの「検証」リクエストへの対応
      if (!body.events || body.events.length === 0) {
        console.log("[iScoreCloud] Verification request received.");
        return new Response("OK", { status: 200 });
      }

      for (const event of body.events) {
        // 🌟 グループIDの抽出ロジック
        if (event.source.type === 'group' && event.source.groupId) {
          const capturedGroupId = event.source.groupId;
          console.log(`[iScoreCloud] Captured Group ID: ${capturedGroupId}`);

          // 🧪 現場確認用: 「ID」メッセージへの自動返信
          if (
            event.type === 'message' && 
            event.message?.type === 'text' && 
            event.message.text === 'ID'
          ) {
            await fetch("https://api.line.me/v2/bot/message/reply", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${env.LINE_CHANNEL_ACCESS_TOKEN}`,
              },
              body: JSON.stringify({
                replyToken: event.replyToken,
                messages: [
                  {
                    type: "text",
                    text: `【iScoreCloud】\nこのグループのIDを特定しました:\n${capturedGroupId}`
                  }
                ],
              }),
            });
          }
        }
      }

      // LINEサーバーを安心させるため、処理成功時は常に 200 OK
      return new Response("OK", { status: 200 });

    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Webhook processing failed";
      console.error("[iScoreCloud Webhook Error]:", errorMsg);
      // 💡 規約: エラー時も 200 を返して LINE 側の再試行ループを止めるのも一案ですが、
      // デバッグのため一旦 500 を返します。
      return new Response(`Error: ${errorMsg}`, { status: 500 });
    }
  },
};
