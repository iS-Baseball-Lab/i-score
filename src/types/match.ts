// filepath: src/types/match.ts
/* 💡 iScoreCloud 規約: 
   1. Match型を Matches ディレクトリ構造とリブランディング名に同期。
   2. マルチチーム運用を見据えた Team 型および LINE Webhook 用の型を定義。 
   3. 野球特有の表現（サヨナラ x）をサポートする。 */

/** 試合種別：公式戦、練習試合、またはその他 */
export type MatchType = 'official' | 'practice' | 'other';

/** 攻守：先攻・後攻 */
export type BattingOrder = 'first' | 'second';

/** 試合ステータス：予定、試合中、終了 */
export type MatchStatus = 'scheduled' | 'live' | 'finished';

/** 💡 チーム・LINE連携用の定義 */
export interface Team {
  id: string;
  name: string;
  /** 連携先のLINEグループID（Messaging APIで使用） */
  lineGroupId?: string; 
  /** 自動速報の有効化フラグ */
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
  /** イニングごとのスコア：null は未消化イニング */
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

/** 💡 LINE Webhook イベント（groupId 取得用） */
export interface LineWebhookEvent {
  type: string;
  /** 誰から、またはどのグループからのイベントか */
  source: {
    type: 'user' | 'group' | 'room';
    userId?: string;
    groupId?: string; // 💡 監督、これがグループを一意に特定するIDです
    roomId?: string;
  };
  message?: {
    type: string;
    text: string;
  };
  replyToken: string;
  timestamp: number;
}

export interface LineWebhookRequest {
  destination: string;
  events: LineWebhookEvent[];
}
