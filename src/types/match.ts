// filepath: src/types/match.ts
/* 💡 iScoreCloud 規約: Match型を Matches ディレクトリ構造とリブランディング名に同期 */

/** 試合種別：公式戦、練習試合、またはその他 */
export type MatchType = 'official' | 'practice' | 'other';

/** 攻守：先攻・後攻 */
export type BattingOrder = 'first' | 'second';

/** 試合ステータス：予定、試合中、終了 */
export type MatchStatus = 'scheduled' | 'live' | 'finished';

export interface Match {
  id: string;
  opponent: string;
  date: string;
  myScore: number;
  opponentScore: number;
  status: MatchStatus; // 💡 string からリテラル型に変更
  matchType: MatchType;
  battingOrder: BattingOrder;
  surfaceDetails?: string;
  tournamentName?: string;
  innings?: number;
  /** イニングごとのスコア：サヨナラ等の特殊表示は formatScoreDisplay 関数で処理 */
  myInningScores?: (number | null)[];
  opponentInningScores?: (number | null)[];
  /** サヨナラ勝ちフラグ：LINE速報での「x」表示に使用 */
  isWalkOff?: boolean;
}

/** 💡 LINE Messaging API 用レスポンス型 */
export interface LinePostResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}
