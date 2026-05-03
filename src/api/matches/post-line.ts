// filepath: src/api/matches/post-line.ts
/* 💡 iScoreCloud 規約: Cloudflare Workers で実行。
   Messaging API を直接叩き、LINEアプリを介さないバックグラウンド直送を実現。 */

import { Match, LinePostResponse } from "@/types/match";
import { generateMatchReport } from "@/lib/utils/format-match";

export interface Env {
  LINE_CHANNEL_ACCESS_TOKEN: string; // 💡 Cloudflare Secrets に設定済みであること
  DB: D1Database;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    try {
      // 💡 規約: インターフェースを定義し、明示的な型キャストを行う
      const body = (await request.json()) as { match: Match; targetId: string };
      const { match, targetId } = body;

      const reportText = generateMatchReport(match);

      // 🌟 LINE Messaging API への Push 送信リクエスト
      const response = await fetch("https://api.line.me/v2/bot/message/push", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${env.LINE_CHANNEL_ACCESS_TOKEN}`,
        },
        body: JSON.stringify({
          to: targetId,
          messages: [
            {
              type: "text",
              text: reportText,
            },
          ],
        }),
      });

      const result = (await response.json()) as any;
      
      const lineRes: LinePostResponse = {
        success: response.ok,
        messageId: result.sentMessages?.[0]?.id,
        error: response.ok ? undefined : (result.message || "Unknown error"),
      };

      return new Response(JSON.stringify(lineRes), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Internal Server Error";
      return new Response(JSON.stringify({ success: false, error: errorMsg }), { status: 500 });
    }
  },
};
