// filepath: src/lib/line/push.ts
/* 💡 iScoreCloud 規約: 
   1. Messaging API (Push) を使用して、指定の groupId へ即座にメッセージを送信する。
   2. 現場での送信失敗を追跡できるよう、詳細なログを残す。 */

/**
 * 🌟 LINE Push 送信関数
 * @param to 送信先 (groupId)
 * @param text 送信するテキスト
 * @param accessToken LINE_CHANNEL_ACCESS_TOKEN
 */
export async function sendLinePushMessage(
  to: string,
  text: string,
  accessToken: string
): Promise<{ success: boolean; error?: string }> {
  const url = "https://api.line.me/v2/bot/message/push";

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        to: to,
        messages: [
          {
            type: "text",
            text: text,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`[LINE Push Error]: ${response.status} - ${errorBody}`);
      return { success: false, error: `LINE API Error: ${response.status}` };
    }

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown Network Error";
    console.error(`[LINE Push Exception]: ${msg}`);
    return { success: false, error: msg };
  }
}
