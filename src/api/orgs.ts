// src/api/orgs.ts
import { Hono } from 'hono'
import { getAuth } from "@/lib/auth"
import { drizzle } from 'drizzle-orm/d1'
import { organizations, organizationMembers, teams } from '@/db/schema'
import { desc, eq, and } from 'drizzle-orm'

const app = new Hono<{ Bindings: { DB: D1Database, ASSETS: Fetcher } }>()

app.get('/', async (c) => {
    const auth = getAuth(c.env.DB, c.env)
    const session = await auth.api.getSession({ headers: c.req.raw.headers })
    if (!session) return c.json({ error: 'Unauthorized' }, 401)

    const db = drizzle(c.env.DB)
    const myOrgs = await db.select({
        id: organizations.id,
        name: organizations.name,
        myRole: organizationMembers.role,
    })
        .from(organizationMembers)
        .innerJoin(organizations, eq(organizationMembers.organizationId, organizations.id))
        .where(eq(organizationMembers.userId, session.user.id))
        .orderBy(desc(organizations.createdAt))

    return c.json(myOrgs)
})

app.post('/', async (c) => {
    const auth = getAuth(c.env.DB, c.env)
    const session = await auth.api.getSession({ headers: c.req.raw.headers })
    if (!session) return c.json({ error: 'Unauthorized' }, 401)

    const body = await c.req.json()
    const db = drizzle(c.env.DB)
    const orgId = crypto.randomUUID()

    try {
        await db.insert(organizations).values({
            id: orgId,
            name: body.name,
            createdAt: new Date(),
        })

        await db.insert(organizationMembers).values({
            id: crypto.randomUUID(),
            organizationId: orgId,
            userId: session.user.id,
            role: 'OWNER',
            createdAt: new Date(),
        })

        return c.json({ success: true, orgId })
    } catch (e) {
        console.error("組織作成エラー:", e)
        return c.json({ success: false, error: 'Failed to create organization' }, 500)
    }
})

app.get('/:orgId/teams', async (c) => {
    const orgId = c.req.param('orgId')
    const db = drizzle(c.env.DB)

    const orgTeams = await db.select()
        .from(teams)
        .where(eq(teams.organizationId, orgId))
        .orderBy(desc(teams.createdAt))

    return c.json(orgTeams)
})

// 💡 新規追加：クラブ（組織）の完全削除 API
app.delete('/:orgId', async (c) => {
    const auth = getAuth(c.env.DB, c.env)
    const session = await auth.api.getSession({ headers: c.req.raw.headers })
    if (!session) return c.json({ error: 'Unauthorized' }, 401)

    const orgId = c.req.param('orgId')
    const db = drizzle(c.env.DB)

    try {
        // 権限チェック：OWNER（代表）またはシステム管理者のみ削除可能
        const member = await db.select().from(organizationMembers)
            .where(and(eq(organizationMembers.organizationId, orgId), eq(organizationMembers.userId, session.user.id))).get()

        if ((session.user as any).role !== 'admin' && (!member || member.role !== 'OWNER')) {
            return c.json({ error: '権限がありません' }, 403)
        }

        // この組織に属するチーム一覧を取得
        const orgTeams = await db.select({ id: teams.id }).from(teams).where(eq(teams.organizationId, orgId))

        // 各チームに紐づく深いデータ（試合・打席・投球・名簿など）を順にカスケード削除
        for (const t of orgTeams) {
            const teamId = t.id;
            await c.env.DB.prepare(`DELETE FROM match_lineups WHERE match_id IN (SELECT id FROM matches WHERE team_id = ?)`).bind(teamId).run()
            await c.env.DB.prepare(`DELETE FROM pitches WHERE at_bat_id IN (SELECT id FROM at_bats WHERE match_id IN (SELECT id FROM matches WHERE team_id = ?))`).bind(teamId).run()
            await c.env.DB.prepare(`DELETE FROM at_bats WHERE match_id IN (SELECT id FROM matches WHERE team_id = ?)`).bind(teamId).run()
            await c.env.DB.prepare(`DELETE FROM matches WHERE team_id = ?`).bind(teamId).run()
            await c.env.DB.prepare(`DELETE FROM players WHERE team_id = ?`).bind(teamId).run()
            await c.env.DB.prepare(`DELETE FROM lineup_templates WHERE team_id = ?`).bind(teamId).run()
            await c.env.DB.prepare(`DELETE FROM team_members WHERE team_id = ?`).bind(teamId).run()
        }

        // チーム自体を削除
        await c.env.DB.prepare(`DELETE FROM teams WHERE organization_id = ?`).bind(orgId).run()
        // 組織メンバーの紐付けを削除
        await c.env.DB.prepare(`DELETE FROM organization_members WHERE organization_id = ?`).bind(orgId).run()
        // 組織本体を削除
        await c.env.DB.prepare(`DELETE FROM organizations WHERE id = ?`).bind(orgId).run()

        return c.json({ success: true })
    } catch (e) {
        console.error("クラブ削除エラー:", e)
        return c.json({ success: false, error: 'Failed to delete organization' }, 500)
    }
})

export default app