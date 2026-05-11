// filepath: src/lib/utils/score-logic.ts
/* 💡 iScoreCloud 規約: 
   1. サヨナラ勝ち（Walk-off）の条件を厳格に判定する。
   2. 規定イニング（innings）に基づき、延長戦も考慮したロジックを構築。 */

import { MatchRow } from "@/types/api";

export function checkWalkOff(match: Pick<MatchRow, 'myScore' | 'opponentScore' | 'currentInning' | 'isBottom' | 'innings' | 'battingOrder'>): boolean {
  // 後攻（home）が自チームかどうかを判定
  const isHome = match.battingOrder === 'second';
  
  // 判定条件：
  // 1. 現在が最終回以降（currentInning >= innings）
  // 2. イニングが「裏」（isBottom === true）
  // 3. 後攻のチームがリードしている
  if (match.currentInning >= match.innings && match.isBottom) {
    if (isHome && match.myScore > match.opponentScore) return true;
    if (!isHome && match.opponentScore > match.myScore) return true;
  }
  
  return false;
}
