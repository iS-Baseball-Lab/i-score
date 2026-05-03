// filepath: src/lib/utils/format-sns.ts

/**
 * 💡 iScoreCloud 現場仕様スコアフォーマット
 * サヨナラ勝ちの「x」や、試合前の「-」を適切に処理します。
 */
export function formatScoreDisplay(score: number | null | undefined, isWalkOff: boolean = false): string {
  if (score === null || score === undefined) return "-";
  return isWalkOff ? `${score}x` : `${score}`;
}

/**
 * 💡 LINE/SNS投稿用テキスト生成
 * 現場の熱量を伝えるため、iScoreCloudの名称とMatchesの状況をフォーマット。
 */
export function formatMatchLineLog(
  homeTeamName: string,
  awayTeamName: string,
  scores: { home: number; away: number },
  inning: string,
  action: string,
  isWalkOff: boolean = false
): string {
  const homeScoreStr = formatScoreDisplay(scores.home, isWalkOff);
  const awayScoreStr = formatScoreDisplay(scores.away);
  
  const emoji = scores.home > scores.away ? "🔥" : "⚾️";
  
  const text = 
    `【iScoreCloud 速報】\n` +
    `${emoji} ${homeTeamName} ${homeScoreStr} - ${awayScoreStr} ${awayTeamName}\n` +
    `状況: ${inning} ${action}\n\n` +
    `#iScoreCloud #Matches #野球速報`;

  return encodeURIComponent(text);
}
