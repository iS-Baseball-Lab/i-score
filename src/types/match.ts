// filepath: src/types/match.ts
/* 💡 iScoreCloud 規約: 
   1. Match型を Matches 構造に同期。
   2. チームごとのLINEグループ紐付け（groupId）に対応。 */

/** 試合種別、攻守、ステータスの定義は維持 */
export type MatchType = 'official' | 'practice' | 'other';
export type BattingOrder = 'first' | 'second';
export type MatchStatus = 'scheduled' | 'live' | 'finished';

/** 💡 チーム・LINE連携用の拡張定義 */
export interface Team {
  id: string;
  name: string;
  /** 連携先のLINEグループID（Messaging APIで使用） */
  lineGroupId?: string; 
  isAutoReportEnabled: boolean;
}

export interface Match {
  id: string;
  opponent: string;
  date: string;
  myScore: number;
  opponentScore: number;
  status: MatchStatus;
  matchType: MatchType;
  battingOrder: BattingOrder;
  surfaceDetails?: string;
  tournamentName?: string;
  innings?: number;
  myInningScores?: (number | null)[];
  opponentInningScores?: (number | null)[];
  isWalkOff?: boolean;
}

/** 💡 LINE Messaging API 用レスポンス型 */
export interface LinePostResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}
