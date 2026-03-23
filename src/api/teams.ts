// src/api/teams.ts
import { Hono } from 'hono'
import { getAuth } from "@/lib/auth"
import { drizzle } from 'drizzle-orm/d1'
import { teams, teamMembers, lineupTemplates } from '@/db/schema'
import { desc, eq, and } from 'drizzle-orm'
import { canManageTeam } from '@/lib/roles'

const app = new Hono<{ Bindings: { DB: D1Database, ASSETS: Fetcher } }>()

app.get('/', async (c) => {
    const auth = getAuth(c.env.DB, c.env)
    const session = await auth.api.getSession({ headers: c.req.raw.headers })
    if (!session) return c.json({ error: 'Unauthorized' }, 401)

    const db = drizzle(c.env.DB)
    const myTeams = await db.select({
        id: teams.id,
        name: teams.name,
        year: teams.year,
        tier: teams.tier,
        teamType: teams.teamType,
        myRole: teamMembers.role,
        isFounder: eq(teams.createdBy, session.user.id)
    })
        .from(teamMembers)
        .innerJoin(teams, eq(teamMembers.teamId, teams.id))
        .where(eq(teamMembers.userId, session.user.id))
        .orderBy(desc(teams.createdAt))

    return c.json(myTeams)
})

app.post('/', async (c) => {
    const auth = getAuth(c.env.DB, c.env)
    const session = await auth.api.getSession({ headers: c.req.raw.headers })
    if (!session) return c.json({ error: 'Unauthorized' }, 401)

    const { name, role, organizationId, year, tier, teamType } = await c.req.json()
    const db = drizzle(c.env.DB)

    try {
        const teamId = crypto.randomUUID()

        await db.insert(teams).values({
            id: teamId,
            organizationId,
            name,
            year: year || new Date().getFullYear(),
            tier: tier || null,
            teamType: teamType || 'regular',
            createdBy: session.user.id,
        })

        await db.insert(teamMembers).values({
            id: crypto.randomUUID(),
            teamId,
            userId: session.user.id,
            role,
        })

        return c.json({ success: true, teamId })
    } catch (e) {
        console.error("チーム作成エラー:", e)
        return c.json({ success: false, error: 'Failed to create team' }, 500)
    }
})

app.patch('/:id', async (c) => {
    const auth = getAuth(c.env.DB, c.env)
    const session = await auth.api.getSession({ headers: c.req.raw.headers })
    if (!session) return c.json({ error: 'Unauthorized' }, 401)

    const userRole = (session.user as any).role;
    const teamId = c.req.param('id')
    const body = await c.req.json()
    const db = drizzle(c.env.DB)

    try {
        const member = await db.select().from(teamMembers)
            .where(and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, session.user.id))).get()

        if (userRole !== 'admin' && (!member || !canManageTeam(member.role))) {
            return c.json({ error: '権限がありません' }, 403)
        }

        await db.update(teams).set({
            name: body.name,
            year: body.year,
            tier: body.tier,
            teamType: body.teamType
        }).where(eq(teams.id, teamId))

        return c.json({ success: true })
    } catch (e) {
        console.error("チーム更新エラー:", e)
        return c.json({ success: false, error: 'Failed to update team' }, 500)
    }
})

app.delete('/:id', async (c) => {
    // 省略せずにそのまま
    const auth = getAuth(c.env.DB, c.env)
    const session = await auth.api.getSession({ headers: c.req.raw.headers })
    if (!session) return c.json({ error: 'Unauthorized' }, 401)

    const userRole = (session.user as any).role;
    const teamId = c.req.param('id')

    try {
        // 💡 関連テーブル（実況や走塁など）も一緒に削除するように拡張
        await c.env.DB.prepare(`DELETE FROM play_logs WHERE match_id IN (SELECT id FROM matches WHERE team_id = ?)`).bind(teamId).run()
        await c.env.DB.prepare(`DELETE FROM base_advances WHERE match_id IN (SELECT id FROM matches WHERE team_id = ?)`).bind(teamId).run()
        await c.env.DB.prepare(`DELETE FROM match_lineups WHERE match_id IN (SELECT id FROM matches WHERE team_id = ?)`).bind(teamId).run()
        await c.env.DB.prepare(`DELETE FROM pitches WHERE at_bat_id IN (SELECT id FROM at_bats WHERE match_id IN (SELECT id FROM matches WHERE team_id = ?))`).bind(teamId).run()
        await c.env.DB.prepare(`DELETE FROM at_bats WHERE match_id IN (SELECT id FROM matches WHERE team_id = ?)`).bind(teamId).run()
        await c.env.DB.prepare(`DELETE FROM matches WHERE team_id = ?`).bind(teamId).run()
        await c.env.DB.prepare(`DELETE FROM players WHERE team_id = ?`).bind(teamId).run()
        await c.env.DB.prepare(`DELETE FROM team_members WHERE team_id = ?`).bind(teamId).run()
        await c.env.DB.prepare(`DELETE FROM teams WHERE id = ?`).bind(teamId).run()

        return c.json({ success: true })
    } catch (e) {
        console.error("チーム削除エラー:", e)
        return c.json({ success: false, error: 'Failed to delete team' }, 500)
    }
})

app.get('/:teamId/players', async (c) => {
    const teamId = c.req.param('teamId');
    try {
        const { results } = await c.env.DB.prepare(
            `SELECT id, team_id, name, uniform_number as uniformNumber, created_at 
             FROM players 
             WHERE team_id = ? 
             ORDER BY CAST(uniform_number AS INTEGER) ASC`
        ).bind(teamId).all();
        return c.json(results);
    } catch (e) { return c.json({ error: '選手の取得に失敗しました' }, 500); }
});

app.post('/:teamId/players', async (c) => {
    const teamId = c.req.param('teamId');
    const body = await c.req.json();
    const playerId = crypto.randomUUID();
    try {
        await c.env.DB.prepare(`INSERT INTO players (id, team_id, name, uniform_number) VALUES (?, ?, ?, ?)`).bind(playerId, teamId, body.name, body.uniformNumber).run();
        return c.json({ success: true, id: playerId });
    } catch (e) { return c.json({ error: '選手の登録に失敗しました' }, 500); }
});

app.patch('/:teamId/players/:playerId', async (c) => {
    const teamId = c.req.param('teamId');
    const playerId = c.req.param('playerId');
    const body = await c.req.json();
    try {
        await c.env.DB.prepare(`UPDATE players SET name = ?, uniform_number = ? WHERE id = ? AND team_id = ?`).bind(body.name, body.uniformNumber, playerId, teamId).run();
        return c.json({ success: true });
    } catch (e) { return c.json({ error: '選手の更新に失敗しました' }, 500); }
});

app.delete('/:teamId/players/:playerId', async (c) => {
    const teamId = c.req.param('teamId');
    const playerId = c.req.param('playerId');
    try {
        await c.env.DB.prepare(`DELETE FROM players WHERE id = ? AND team_id = ?`).bind(playerId, teamId).run();
        return c.json({ success: true });
    } catch (e) { return c.json({ error: '選手の削除に失敗しました' }, 500); }
});

app.get('/:teamId/lineup-templates', async (c) => {
    const db = drizzle(c.env.DB)
    const teamId = c.req.param('teamId')
    try {
        const templates = await db.select().from(lineupTemplates).where(eq(lineupTemplates.teamId, teamId)).orderBy(desc(lineupTemplates.createdAt))
        return c.json(templates)
    } catch (e) { return c.json({ error: 'Failed to fetch templates' }, 500) }
})

app.post('/:teamId/lineup-templates', async (c) => {
    const db = drizzle(c.env.DB)
    const teamId = c.req.param('teamId')
    const body = await c.req.json()
    const id = crypto.randomUUID()
    try {
        await db.insert(lineupTemplates).values({ id, teamId, name: body.name, lineupData: JSON.stringify(body.lineupData) })
        return c.json({ success: true, id })
    } catch (e) { return c.json({ error: 'Failed to save template' }, 500) }
})

app.delete('/:teamId/lineup-templates/:id', async (c) => {
    const db = drizzle(c.env.DB)
    const id = c.req.param('id')
    try {
        await db.delete(lineupTemplates).where(eq(lineupTemplates.id, id))
        return c.json({ success: true })
    } catch (e) { return c.json({ error: 'Failed to delete template' }, 500) }
})

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ⚾️ [GET] 個人成績（打撃）の集計
// 💡 batter_id ベースに書き換え、players テーブルをJOINして名前を取得！
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
app.get('/:id/stats', async (c) => {
    const teamId = c.req.param('id');
    try {
        const { results } = await c.env.DB.prepare(`
            SELECT p.name as playerName, COUNT(ab.result) as plateAppearances,
                SUM(CASE WHEN ab.result IN ('single', 'double', 'triple', 'home_run', 'groundout', 'flyout', 'double_play', 'strikeout') THEN 1 ELSE 0 END) as atBats,
                SUM(CASE WHEN ab.result IN ('single', 'double', 'triple', 'home_run') THEN 1 ELSE 0 END) as hits,
                SUM(CASE WHEN ab.result = 'single' THEN 1 ELSE 0 END) as singles, 
                SUM(CASE WHEN ab.result = 'double' THEN 1 ELSE 0 END) as doubles,
                SUM(CASE WHEN ab.result = 'triple' THEN 1 ELSE 0 END) as triples, 
                SUM(CASE WHEN ab.result = 'home_run' THEN 1 ELSE 0 END) as homeRuns,
                SUM(CASE WHEN ab.result = 'walk' THEN 1 ELSE 0 END) as walks, 
                SUM(CASE WHEN ab.result = 'strikeout' THEN 1 ELSE 0 END) as strikeouts
            FROM at_bats ab 
            JOIN matches m ON ab.match_id = m.id
            LEFT JOIN players p ON ab.batter_id = p.id
            WHERE m.team_id = ? AND m.status = 'finished' AND ab.batter_id IS NOT NULL
            GROUP BY ab.batter_id 
            ORDER BY hits DESC, plateAppearances DESC
        `).bind(teamId).all();
        return c.json(results);
    } catch (e) { return c.json({ error: '成績の取得に失敗しました' }, 500); }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ⚾️ [GET] 個人成績（投手）の集計
// 💡 pitcher_id ベースに書き換え！
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
app.get('/:id/pitcher-stats', async (c) => {
    const teamId = c.req.param('id');
    try {
        const { results } = await c.env.DB.prepare(`
            SELECT p.name as playerName, COUNT(ab.result) as battersFaced, 
                SUM(CASE WHEN ab.result = 'strikeout' THEN 1 ELSE 0 END) as strikeouts,
                SUM(CASE WHEN ab.result = 'walk' THEN 1 ELSE 0 END) as walks, 
                SUM(CASE WHEN ab.result IN ('single', 'double', 'triple', 'home_run') THEN 1 ELSE 0 END) as hitsAllowed,
                SUM(CASE WHEN ab.result IN ('groundout', 'flyout', 'strikeout') THEN 1 WHEN ab.result = 'double_play' THEN 2 ELSE 0 END) as outs
            FROM at_bats ab 
            JOIN matches m ON ab.match_id = m.id
            LEFT JOIN players p ON ab.pitcher_id = p.id
            WHERE m.team_id = ? AND m.status = 'finished' AND ab.pitcher_id IS NOT NULL
            GROUP BY ab.pitcher_id 
            ORDER BY outs DESC, strikeouts DESC
        `).bind(teamId).all();
        return c.json(results);
    } catch (e) { return c.json({ error: '成績の取得に失敗しました' }, 500); }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ⚾️ [GET] スプレーチャート（打球方向）
// 💡 hit_x/y を排除し、zone_x/y をベースにするか、結果のみを返す形に変更
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
app.get('/:id/spray-chart', async (c) => {
    const teamId = c.req.param('id');
    try {
        // ※ zone_x, zone_y はストライクゾーンの座標であり、打球の飛んだ場所ではないため
        // 今回のスキーマでは UI 側での打球方向描画は Result (例: 8-4(センター前), 7(レフトフライ) など) 
        // の文字列を解析して描画するアプローチに変更するのが現場的（手入力のミスが減る）です。
        const { results } = await c.env.DB.prepare(`
            SELECT p.zone_x as zoneX, p.zone_y as zoneY, p.result, pl.name as batterName
            FROM pitches p 
            JOIN at_bats ab ON p.at_bat_id = ab.id 
            JOIN matches m ON ab.match_id = m.id
            LEFT JOIN players pl ON ab.batter_id = pl.id
            WHERE m.team_id = ? AND m.status = 'finished' AND p.zone_x IS NOT NULL AND p.zone_y IS NOT NULL AND ab.batter_id IS NOT NULL
        `).bind(teamId).all();
        return c.json(results);
    } catch (e) { return c.json({ error: 'データの取得に失敗しました' }, 500); }
});

export default app