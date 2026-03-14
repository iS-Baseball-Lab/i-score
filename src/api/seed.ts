// src/api/seed.ts
import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { getAuth } from '../lib/auth';
import {
    organizations, organizationMembers, teams, teamMembers, players, matches
} from '../db/schema';

type Env = {
    DB: D1Database;
};

const app = new Hono<{ Bindings: Env }>();

app.post('/', async (c) => {
    const auth = getAuth(c.env.DB, c.env);
    const session = await auth.api.getSession({ headers: c.req.raw.headers });
    if (!session) return c.json({ error: 'Unauthorized' }, 401);

    const db = drizzle(c.env.DB);
    const userId = session.user.id;

    try {
        // ----------------------------------------------------
        // 1. クラブの作成
        // ----------------------------------------------------
        const myOrg1_id = crypto.randomUUID(); // 川崎中央シニア
        const myOrg2_id = crypto.randomUUID(); // 多摩川フレンズ (過去)
        const oppOrg1_id = crypto.randomUUID(); // 横浜青葉シニア
        const oppOrg2_id = crypto.randomUUID(); // 世田谷西シニア

        await db.insert(organizations).values([
            { id: myOrg1_id, name: '川崎中央シニア', category: 'junior', createdAt: new Date() },
            { id: myOrg2_id, name: '多摩川フレンズ', category: 'gakudo', createdAt: new Date() },
            { id: oppOrg1_id, name: '横浜青葉シニア', category: 'junior', createdAt: new Date() },
            { id: oppOrg2_id, name: '世田谷西シニア', category: 'junior', createdAt: new Date() },
        ]);

        await db.insert(organizationMembers).values([
            { id: crypto.randomUUID(), organizationId: myOrg1_id, userId, role: 'OWNER', createdAt: new Date() },
            { id: crypto.randomUUID(), organizationId: myOrg2_id, userId, role: 'OWNER', createdAt: new Date() },
            { id: crypto.randomUUID(), organizationId: oppOrg1_id, userId, role: 'OPPONENT_MANAGER', createdAt: new Date() },
            { id: crypto.randomUUID(), organizationId: oppOrg2_id, userId, role: 'OPPONENT_MANAGER', createdAt: new Date() },
        ]);

        // ----------------------------------------------------
        // 2. チームの作成
        // ----------------------------------------------------
        const myTeam1_id = crypto.randomUUID(); // 川崎中央 1年生
        const myTeam2_id = crypto.randomUUID(); // 多摩川 Aチーム
        const oppTeam1_id = crypto.randomUUID(); // 横浜青葉 1年生

        await db.insert(teams).values([
            { id: myTeam1_id, organizationId: myOrg1_id, name: '1年生チーム', year: 2026, tier: '1年生', createdBy: userId, createdAt: new Date() },
            { id: myTeam2_id, organizationId: myOrg2_id, name: 'Aチーム', year: 2025, tier: 'A', createdBy: userId, createdAt: new Date() },
            { id: oppTeam1_id, organizationId: oppOrg1_id, name: '1年生チーム', year: 2026, tier: '1年生', createdBy: userId, createdAt: new Date() },
        ]);

        // 自分のチームにスコアラーとして所属
        await db.insert(teamMembers).values([
            { id: crypto.randomUUID(), teamId: myTeam1_id, userId, role: 'SCORER', joinedAt: new Date() },
            { id: crypto.randomUUID(), teamId: myTeam2_id, userId, role: 'SCORER', joinedAt: new Date() },
        ]);

        // ----------------------------------------------------
        // 3. 選手データ（川崎中央シニア 1年生チーム）の作成
        // ----------------------------------------------------
        const dummyPlayers = [
            { id: crypto.randomUUID(), teamId: myTeam1_id, name: '山田 太郎', uniformNumber: '1', createdAt: new Date() },
            { id: crypto.randomUUID(), teamId: myTeam1_id, name: '佐藤 次郎', uniformNumber: '2', createdAt: new Date() },
            { id: crypto.randomUUID(), teamId: myTeam1_id, name: '鈴木 三郎', uniformNumber: '3', createdAt: new Date() },
            { id: crypto.randomUUID(), teamId: myTeam1_id, name: '高橋 健太', uniformNumber: '4', createdAt: new Date() },
            { id: crypto.randomUUID(), teamId: myTeam1_id, name: '田中 翔太', uniformNumber: '5', createdAt: new Date() },
            { id: crypto.randomUUID(), teamId: myTeam1_id, name: '伊藤 翼', uniformNumber: '6', createdAt: new Date() },
            { id: crypto.randomUUID(), teamId: myTeam1_id, name: '渡辺 陸', uniformNumber: '7', createdAt: new Date() },
            { id: crypto.randomUUID(), teamId: myTeam1_id, name: '山本 海', uniformNumber: '8', createdAt: new Date() },
            { id: crypto.randomUUID(), teamId: myTeam1_id, name: '中村 空', uniformNumber: '9', createdAt: new Date() },
        ];
        await db.insert(players).values(dummyPlayers);

        // ----------------------------------------------------
        // 4. 試合データの作成
        // ----------------------------------------------------
        await db.insert(matches).values([
            {
                id: crypto.randomUUID(),
                teamId: myTeam1_id,
                opponentTeamId: oppTeam1_id,
                opponent: '横浜青葉シニア',
                season: '2026',
                date: '2026-03-10',
                location: '多摩川河川敷グラウンド',
                matchType: 'practice', // 練習試合
                battingOrder: 'normal',
                innings: 7,
                status: 'completed', // 試合終了
                myScore: 5,
                opponentScore: 3,
                myInningScores: JSON.stringify([1, 0, 2, 0, 0, 0, 2]),
                opponentInningScores: JSON.stringify([0, 1, 0, 0, 2, 0, 0]),
            }
        ]);

        return c.json({ success: true, message: 'テストデータの生成に成功しました！' });

    } catch (error) {
        console.error('シードデータの生成に失敗:', error);
        return c.json({ success: false, error: 'Internal Server Error' }, 500);
    }
});

export default app;