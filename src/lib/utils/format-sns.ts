// filepath: src/lib/utils/format-sns.ts

/**
 * 💡 iScoreCloud 現場仕様: SNS投稿用テキスト生成
 * 試合経過やプレイログを、LINE等で見やすい形式にフォーマットします。
 */
export function formatLineLog(
  teamName: string,
  opponentName: string,
  score: { us: number; them: number },
  inning: string,
  action: string
): string {
  const emoji = score.us > score.them ? "🔥" : "⚾️";
  return encodeURIComponent(
    `【iScoreCloud 速報】\n` +
    `${emoji} ${teamName} vs ${opponentName}\n` +
    `スコア: ${score.us} - ${score.them}\n` +
    `状況: ${inning} ${action}\n\n` +
    `#iScoreCloud #野球速報 #現場至上主義`
  );
}
