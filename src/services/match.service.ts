// src/services/match.service.ts
import { eq, desc } from "drizzle-orm";
import { matches, tournaments } from "@/db/schema/match";

// 💡 データベース操作（ビジネスロジック）だけを担当する「サービス層」
export const MatchService = {

  // 1. 試合一覧の取得
  async getMatchesByTeam(db: any, teamId: string) {
    const rows = await db.select({
      id: matches.id,
      opponent: matches.opponent,
      date: matches.date,
      myScore: matches.myScore,
      opponentScore: matches.opponentScore,
      status: matches.status,
      matchType: matches.matchType,
      battingOrder: matches.battingOrder,
      surfaceDetails: matches.surfaceDetails,
      tournamentName: tournaments.name,
      innings: matches.innings, // 🌟 追加：イニング数
      myInningScores: matches.myInningScores, // 🌟 追加：自チームのスコア
      opponentInningScores: matches.opponentInningScores // 🌟 追加：相手のスコア
    })
      .from(matches)
      .leftJoin(tournaments, eq(matches.tournamentId, tournaments.id))
      .where(eq(matches.teamId, teamId))
      .orderBy(desc(matches.date))
      .all();

    // 🌟 DBのJSON文字列を配列に変換してフロントエンドに返す
    return rows.map((r: any) => ({
      ...r,
      myInningScores: JSON.parse(r.myInningScores || "[]"),
      opponentInningScores: JSON.parse(r.opponentInningScores || "[]")
    }));
  },

  // 2. 特定の試合の取得
  async getMatchById(db: any, matchId: string) {
    return await db.select({
      id: matches.id,
      opponent: matches.opponent,
      date: matches.date,
      matchType: matches.matchType,
      battingOrder: matches.battingOrder,
      surfaceDetails: matches.surfaceDetails,
      innings: matches.innings,
      tournamentName: tournaments.name
    })
      .from(matches)
      .leftJoin(tournaments, eq(matches.tournamentId, tournaments.id))
      .where(eq(matches.id, matchId))
      .get();
  },

  // 3. イニングスコアの取得と整形
  async getMatchInnings(db: any, matchId: string) {
    const matchData = await db.select({
      myInningScores: matches.myInningScores,
      opponentInningScores: matches.opponentInningScores,
      battingOrder: matches.battingOrder
    }).from(matches).where(eq(matches.id, matchId)).get();

    if (!matchData) return [];

    const myScores = JSON.parse(matchData.myInningScores || "[]");
    const oppScores = JSON.parse(matchData.opponentInningScores || "[]");

    const results: any[] = [];
    const myTeamType = matchData.battingOrder === 'first' ? 'away' : 'home';
    const oppTeamType = matchData.battingOrder === 'first' ? 'home' : 'away';

    myScores.forEach((runs: number, i: number) => results.push({ teamType: myTeamType, inningNumber: i + 1, runs }));
    oppScores.forEach((runs: number, i: number) => results.push({ teamType: oppTeamType, inningNumber: i + 1, runs }));

    return results;
  },

  // 4. 大会（Tournament）の検索・作成（内部ヘルパー）
  async _resolveTournament(db: any, matchType: string, tournamentName?: string) {
    if (matchType !== 'official' || !tournamentName) return null;

    const existingTournament = await db.select().from(tournaments)
      .where(eq(tournaments.name, tournamentName)).get();

    if (existingTournament) return existingTournament.id;

    const newId = crypto.randomUUID();
    await db.insert(tournaments).values({
      id: newId,
      name: tournamentName,
      season: new Date().getFullYear().toString(),
    });
    return newId;
  },

  // 5. 新規試合の作成
  async createMatch(db: any, body: any) {
    const tournamentId = await this._resolveTournament(db, body.matchType, body.tournamentName);
    const matchId = crypto.randomUUID();

    await db.insert(matches).values({
      id: matchId,
      teamId: body.teamId,
      tournamentId,
      opponent: body.opponent,
      date: body.date,
      matchType: body.matchType,
      battingOrder: body.battingOrder,
      surfaceDetails: body.location,
      innings: body.innings,
      status: "scheduled",
    });
    return matchId;
  },

  // 6. 試合情報の更新
  async updateMatch(db: any, matchId: string, body: any) {
    const tournamentId = await this._resolveTournament(db, body.matchType, body.tournamentName);

    await db.update(matches).set({
      opponent: body.opponent,
      tournamentId,
      date: body.date,
      matchType: body.matchType,
      battingOrder: body.battingOrder,
      surfaceDetails: body.location,
      innings: body.innings,
    }).where(eq(matches.id, matchId));
  },

  // 7. スコア結果の保存
  async finishMatch(db: any, matchId: string, body: any) {
    await db.update(matches).set({
      myScore: body.myScore,
      opponentScore: body.opponentScore,
      myInningScores: JSON.stringify(body.myInningScores || []),
      opponentInningScores: JSON.stringify(body.opponentInningScores || []),
      status: 'finished'
    }).where(eq(matches.id, matchId));
  },

  // 8. 試合の削除
  async deleteMatch(db: any, matchId: string) {
    await db.delete(matches).where(eq(matches.id, matchId));
  }
};