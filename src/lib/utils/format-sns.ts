// filepath: src/lib/utils/format-sns.ts
/* 💡 iScoreCloud 規約: 
   1. サヨナラ勝ち(x)や未消化(-)の厳格な表示。
   2. Messaging API 直送用に生の文字列を返し、URL用は別途用意する。 */

/**
 * 💡 現場仕様スコアフォーマット
 */
export function formatScoreDisplay(score: number | null | undefined, isWalkOff: boolean = false): string {
  // スコアが確定していない、あるいは回が回ってきていない場合は「-」
  if (score === null || score === undefined) return "-";
  // サヨナラ勝ちは「x」を付与。野球界の不文律。
  return isWalkOff ? `${score}x` : `${score}`;
}

/**
 * 💡 LINE Messaging API 用テキスト生成
 * 現場の興奮をそのままグループへ届けます。
 */
export function formatMatchLineReport(
  homeTeamName: string,
  awayTeamName: string,
  scores: { home: number; away: number },
  inning: string, // 例: "5回裏", "9回裏(サヨナラ)"
  action: string, // 例: "佐藤選手のタイムリーで逆転！"
  status: 'live' | 'finished',
  isWalkOff: boolean = false
): string {
  const homeScoreStr = formatScoreDisplay(scores.home, isWalkOff);
  const awayScoreStr = formatScoreDisplay(scores.away);
  
  // 試合終了時は「終了」、進行中は「速報」と銘打つ
  const title = status === 'finished' ? "【iScoreCloud 試合終了】" : "【iScoreCloud 速報】";
  
  // 勝敗に応じたエモジの投げ分け
  const emoji = scores.home > scores.away ? "🏆" : (status === 'finished' ? "⏹️" : "⚾️");

  // メッセージの組み立て（LINE上での視認性を考慮した改行）
  const text = 
    `${title}\n` +
    `${emoji} ${homeTeamName} ${homeScoreStr} - ${awayScoreStr} ${awayTeamName}\n` +
    `------------------\n` +
    `状況: ${inning}\n` +
    `${action}\n\n` +
    `#iScoreCloud #Matches`;

  return text; // Messaging API に送るため、デコード済みの生文字列
}
