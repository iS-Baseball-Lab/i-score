// src/types/match.ts
/* 💡 試合データの共通型定義 */

export type MatchType = 'official' | 'practice';
export type BattingOrder = 'first' | 'second';

export interface Match {
  id: string;
  opponent: string;
  date: string;
  myScore: number;
  opponentScore: number;
  status: string;
  matchType: MatchType; // string ではなくリテラル型に固定
  battingOrder: BattingOrder;
  surfaceDetails?: string;
  tournamentName?: string;
  innings?: number;
  myInningScores?: number[];
  opponentInningScores?: number[];
}