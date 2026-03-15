// src/api/orgs.ts
import { Hono } from 'hono'
import { getAuth } from "@/lib/auth"
import { drizzle } from 'drizzle-orm/d1'
import { organizations, organizationMembers, teams } from '@/db/schema'
import { desc, eq, and } from 'drizzle-orm'

const app = new Hono<{ Bindings: { DB: D1Database, ASSETS: Fetcher } }>()

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 💡 1. クラブ一覧取得 (GET /)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
app.get('/', async (c) => {
    const auth = getAuth(c.env.DB, c.env)
    const session = await auth.api.getSession({ headers: c.req.raw.headers })
    if (!session) return c.json({ error: 'Unauthorized' }, 401)

    const db = drizzle(c.env.DB)

    const results = await db.select({
        id: organizations.id,
        name: organizations.name,
        category: organizations.category,
        myRole: organizationMembers.role,
    })
        .from(organizations)
        .innerJoin(organizationMembers, eq(organizations.id, organizationMembers.organizationId))
        .where(eq(organizationMembers.userId, session.user.id))
        .orderBy(desc(organizations.createdAt))

    return c.json(results)
})

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 💡 2. 新規クラブ作成 (POST /)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
app.post('/', async (c) => {
    const auth = getAuth(c.env.DB, c.env)
    const session = await auth.api.getSession({ headers: c.req.raw.headers })
    if (!session) return c.json({ error: 'Unauthorized' }, 401)

    // フロントから "isExternal" という一時的なフラグを受け取る
    const { name, isExternal, category } = await c.req.json()
    const db = drizzle(c.env.DB)

    try {
        // 💡 自分が既に同じ名前のクラブに所属（または管理）していないかチェック
        const existingOrgs = await db.select({ id: organizations.id })
            .from(organizations)
            .innerJoin(organizationMembers, eq(organizations.id, organizationMembers.organizationId))
            .where(
                and(
                    eq(organizations.name, name),
                    eq(organizationMembers.userId, session.user.id)
                )
            ).limit(1)

        // もし同じ名前が見つかったらエラーを返す！
        if (existingOrgs.length > 0) {
            return c.json({ success: false, error: `「${name}」は既に登録されています。` }, 400)
        }

        const newOrgId = crypto.randomUUID()

        // 1. クラブの作成（中立な組織として作成）
        await db.insert(organizations).values({
            id: newOrgId,
            name,
            category: category || 'other',
            createdAt: new Date(),
        })

        // 2. 💡 究極設計：メンバー登録時の「Role（役割）」で関係性を決める！
        // 外部クラブとして作成された場合は 'OPPONENT_MANAGER'、自クラブなら 'OWNER'
        const role = isExternal ? 'OPPONENT_MANAGER' : 'OWNER'

        await db.insert(organizationMembers).values({
            id: crypto.randomUUID(),
            organizationId: newOrgId,
            userId: session.user.id,
            role: role,
            createdAt: new Date(),
        })

        return c.json({ success: true, organizationId: newOrgId })
    } catch (e) {
        console.error("クラブ作成エラー:", e)
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

app.delete('/:orgId', async (c) => {
    const auth = getAuth(c.env.DB, c.env)
    const session = await auth.api.getSession({ headers: c.req.raw.headers })
    if (!session) return c.json({ error: 'Unauthorized' }, 401)

    const orgId = c.req.param('orgId')
    const db = drizzle(c.env.DB)

    try {
        const member = await db.select().from(organizationMembers)
            .where(and(eq(organizationMembers.organizationId, orgId), eq(organizationMembers.userId, session.user.id))).get()

        if ((session.user as any).role !== 'admin' && (!member || member.role !== 'OWNER')) {
            return c.json({ error: '権限がありません' }, 403)
        }

        const orgTeams = await db.select({ id: teams.id }).from(teams).where(eq(teams.organizationId, orgId))

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

        await c.env.DB.prepare(`DELETE FROM teams WHERE organization_id = ?`).bind(orgId).run()
        await c.env.DB.prepare(`DELETE FROM organization_members WHERE organization_id = ?`).bind(orgId).run()
        await c.env.DB.prepare(`DELETE FROM organizations WHERE id = ?`).bind(orgId).run()

        return c.json({ success: true })
    } catch (e) {
        console.error("クラブ削除エラー:", e)
        return c.json({ success: false, error: 'Failed to delete organization' }, 500)
    }
})

// 💡 クラブ（組織）の更新 API
app.patch('/:orgId', async (c) => {
    const auth = getAuth(c.env.DB, c.env)
    const session = await auth.api.getSession({ headers: c.req.raw.headers })
    if (!session) return c.json({ error: 'Unauthorized' }, 401)

    const orgId = c.req.param('orgId')
    const body = await c.req.json()
    const db = drizzle(c.env.DB)

    try {
        // 権限チェック：OWNERのみ編集可能
        const member = await db.select().from(organizationMembers)
            .where(and(eq(organizationMembers.organizationId, orgId), eq(organizationMembers.userId, session.user.id))).get()

        if ((session.user as any).role !== 'admin' && (!member || member.role !== 'OWNER')) {
            return c.json({ error: '権限がありません' }, 403)
        }

        if (body.category) {
            await c.env.DB.prepare(`UPDATE organizations SET name = ?, category = ? WHERE id = ?`)
                .bind(body.name, body.category, orgId).run()
        } else {
            await c.env.DB.prepare(`UPDATE organizations SET name = ? WHERE id = ?`)
                .bind(body.name, orgId).run()
        }

        return c.json({ success: true })
    } catch (e) {
        console.error("クラブ更新エラー:", e)
        return c.json({ success: false, error: 'Failed to update organization' }, 500)
    }
})

export default app