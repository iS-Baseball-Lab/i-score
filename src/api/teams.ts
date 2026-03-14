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

    // 💡 year と tier も受け取るように追加
    const { name, role, organizationId, year, tier } = await c.req.json()
    const db = drizzle(c.env.DB)

    try {
        const teamId = crypto.randomUUID()
                                                
        // 1. チームの作成
        await db.insert(teams).values({
            id: teamId,
            organizationId,
            name,
            year: year || new Date().getFullYear(), // デフォルトは今年
            tier: tier || null,
            createdBy: session.user.id,
            createdAt: new Date(),
        })

        // 2. 作成者をチームメンバーとして登録
        await db.insert(teamMembers).values({
            id: crypto.randomUUID(),
            teamId,
            userId: session.user.id,
            role,
            joinedAt: new Date(),
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

        await db.update(teams).set({ name: body.name }).where(eq(teams.id, teamId))
        return c.json({ success: true })
    } catch (e) {
        console.error("チーム更新エラー:", e)
        return c.json({ success: false, error: 'Failed to update team' }, 500)
    }
})

app.delete('/:id', async (c) => {
    const auth = getAuth(c.env.DB, c.env)
    const session = await auth.api.getSession({ headers: c.req.raw.headers })
    if (!session) return c.json({ error: 'Unauthorized' }, 401)

    const userRole = (session.user as any).role;
    const teamId = c.req.param('id')
    const db = drizzle(c.env.DB)

    try {
        const member = await db.select().from(teamMembers)
            .where(and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, session.user.id))).get()

        if (userRole !== 'admin' && (!member || !canManageTeam(member.role))) {
            return c.json({ error: '権限がありません' }, 403)
        }

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
        await c.env.DB.prepare(`INSERT INTO players (id, team_id, name, uniform_number, created_at) VALUES (?, ?, ?, ?, ?)`).bind(playerId, teamId, body.name, body.uniformNumber, Date.now()).run();
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

app.get('/:id/stats', async (c) => {
    const teamId = c.req.param('id');
    try {
        const { results } = await c.env.DB.prepare(`
            SELECT batter_name as playerName, COUNT(result) as plateAppearances,
                SUM(CASE WHEN result IN ('single', 'double', 'triple', 'home_run', 'groundout', 'flyout', 'double_play', 'strikeout') THEN 1 ELSE 0 END) as atBats,
                SUM(CASE WHEN result IN ('single', 'double', 'triple', 'home_run') THEN 1 ELSE 0 END) as hits,
                SUM(CASE WHEN result = 'single' THEN 1 ELSE 0 END) as singles, SUM(CASE WHEN result = 'double' THEN 1 ELSE 0 END) as doubles,
                SUM(CASE WHEN result = 'triple' THEN 1 ELSE 0 END) as triples, SUM(CASE WHEN result = 'home_run' THEN 1 ELSE 0 END) as homeRuns,
                SUM(CASE WHEN result = 'walk' THEN 1 ELSE 0 END) as walks, SUM(CASE WHEN result = 'strikeout' THEN 1 ELSE 0 END) as strikeouts
            FROM at_bats JOIN matches ON at_bats.match_id = matches.id
            WHERE matches.team_id = ? AND matches.status = 'completed' AND batter_name IS NOT NULL
            GROUP BY batter_name ORDER BY hits DESC, plateAppearances DESC
        `).bind(teamId).all();
        return c.json(results);
    } catch (e) { return c.json({ error: '成績の取得に失敗しました' }, 500); }
});

app.get('/:id/pitcher-stats', async (c) => {
    const teamId = c.req.param('id');
    try {
        const { results } = await c.env.DB.prepare(`
            SELECT pitcher_name as playerName, COUNT(result) as battersFaced, SUM(CASE WHEN result = 'strikeout' THEN 1 ELSE 0 END) as strikeouts,
                SUM(CASE WHEN result = 'walk' THEN 1 ELSE 0 END) as walks, SUM(CASE WHEN result IN ('single', 'double', 'triple', 'home_run') THEN 1 ELSE 0 END) as hitsAllowed,
                SUM(CASE WHEN result IN ('groundout', 'flyout', 'strikeout') THEN 1 WHEN result = 'double_play' THEN 2 ELSE 0 END) as outs
            FROM at_bats JOIN matches ON at_bats.match_id = matches.id
            WHERE matches.team_id = ? AND matches.status = 'completed' AND pitcher_name IS NOT NULL
            GROUP BY pitcher_name ORDER BY outs DESC, strikeouts DESC
        `).bind(teamId).all();
        return c.json(results);
    } catch (e) { return c.json({ error: '成績の取得に失敗しました' }, 500); }
});

app.get('/:id/spray-chart', async (c) => {
    const teamId = c.req.param('id');
    try {
        const { results } = await c.env.DB.prepare(`
            SELECT p.hit_x as hitX, p.hit_y as hitY, p.result, ab.batter_name as batterName
            FROM pitches p JOIN at_bats ab ON p.at_bat_id = ab.id JOIN matches m ON ab.match_id = m.id
            WHERE m.team_id = ? AND m.status = 'completed' AND p.hit_x IS NOT NULL AND p.hit_y IS NOT NULL AND ab.batter_name IS NOT NULL
        `).bind(teamId).all();
        return c.json(results);
    } catch (e) { return c.json({ error: 'データの取得に失敗しました' }, 500); }
});

export default app