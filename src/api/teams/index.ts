import { Hono } from 'hono'
import { getAuth } from "@/lib/auth"
import { drizzle } from 'drizzle-orm/d1'
import { teams, teamMembers, organizations } from '@/db/schema'
import { desc, eq, and } from 'drizzle-orm'
import { canManageTeam } from '@/lib/roles'
import type { AuthUser } from '@/types/api'

// 🔥 子ルーターのインポート
import playersApp from './players'
import statsApp from './stats'
import lineupsApp from './lineups'

const app = new Hono<{ Bindings: { DB: D1Database, ASSETS: Fetcher } }>()

// 🔥 子ルーターをマウント（URLは元のまま完全に動作します）
app.route('/', playersApp)
app.route('/', statsApp)
app.route('/', lineupsApp)

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// チーム基本CRUD
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
app.get('/', async (c) => {
  const auth = getAuth(c.env.DB, c.env)
  const session = await auth.api.getSession({ headers: c.req.raw.headers })
  if (!session) return c.json({ error: 'Unauthorized' }, 401)

  const db = drizzle(c.env.DB)
  const myTeams = await db.select({
    id: teams.id,
    name: teams.name,
    orgName: organizations.name,
    description: organizations.description,
    category: organizations.category,
    homeGround: teams.homeGround,
    managerName: teams.managerName,
    year: teams.year,
    tier: teams.tier,
    teamType: teams.teamType,
    myRole: teamMembers.role,
    isFounder: eq(teams.createdBy, session.user.id)
  })
    .from(teamMembers)
    .innerJoin(teams, eq(teamMembers.teamId, teams.id))
    .leftJoin(organizations, eq(teams.organizationId, organizations.id))
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
      id: teamId, organizationId, name, year: year || new Date().getFullYear(),
      tier: tier || null, teamType: teamType || 'regular', createdBy: session.user.id,
    })
    await db.insert(teamMembers).values({ id: crypto.randomUUID(), teamId, userId: session.user.id, role })
    return c.json({ success: true, teamId })
  } catch (e) { return c.json({ success: false, error: 'Failed to create team' }, 500) }
})

app.patch('/:id', async (c) => {
  const auth = getAuth(c.env.DB, c.env)
  const session = await auth.api.getSession({ headers: c.req.raw.headers })
  if (!session) return c.json({ error: 'Unauthorized' }, 401)

  const userRole = (session.user as AuthUser).role;
  const teamId = c.req.param('id')
  const body = await c.req.json()
  const db = drizzle(c.env.DB)

  try {
    const member = await db.select().from(teamMembers).where(and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, session.user.id))).get()
    if (userRole !== 'SYSTEM_ADMIN' && (!member || !canManageTeam(member.role))) return c.json({ error: '権限がありません' }, 403)

    await db.update(teams).set({ name: body.name, year: body.year, tier: body.tier, teamType: body.teamType }).where(eq(teams.id, teamId))
    return c.json({ success: true })
  } catch (e) { return c.json({ success: false, error: 'Failed to update team' }, 500) }
})

app.delete('/:id', async (c) => {
  const auth = getAuth(c.env.DB, c.env)
  const session = await auth.api.getSession({ headers: c.req.raw.headers })
  if (!session) return c.json({ error: 'Unauthorized' }, 401)
  const teamId = c.req.param('id')

  try {
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
  } catch (e) { return c.json({ success: false, error: 'Failed to delete team' }, 500) }
})

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 招待・申請関連
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
app.get('/search/:id', async (c) => {
  const auth = getAuth(c.env.DB, c.env)
  const session = await auth.api.getSession({ headers: c.req.raw.headers })
  if (!session) return c.json({ error: 'Unauthorized' }, 401)
  const teamId = c.req.param('id')
  const db = drizzle(c.env.DB)

  try {
    const teamData = await db.select({ id: teams.id, name: teams.name, year: teams.year, tier: teams.tier, orgName: organizations.name })
      .from(teams).leftJoin(organizations, eq(teams.organizationId, organizations.id)).where(eq(teams.id, teamId)).get();
    if (!teamData) return c.json({ success: false, error: '指定されたIDのチームが見つかりません' }, 404);
    return c.json({ success: true, team: teamData });
  } catch (e) { return c.json({ success: false, error: '検索に失敗しました' }, 500); }
})

app.post('/:id/join', async (c) => {
  const auth = getAuth(c.env.DB, c.env)
  const session = await auth.api.getSession({ headers: c.req.raw.headers })
  if (!session) return c.json({ error: 'Unauthorized' }, 401)
  const teamId = c.req.param('id')
  const db = drizzle(c.env.DB)

  try {
    const existing = await db.select().from(teamMembers).where(and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, session.user.id))).get();
    if (existing) {
      if (existing.status === 'pending') return c.json({ success: false, error: 'すでに参加申請を送信済みです。監督の承認をお待ちください。' }, 400);
      return c.json({ success: false, error: 'すでにこのチームに参加しています。' }, 400);
    }
    await db.insert(teamMembers).values({ id: crypto.randomUUID(), teamId, userId: session.user.id, role: 'MEMBER', status: 'pending' });
    return c.json({ success: true, message: '参加申請を送信しました！' });
  } catch (e) { return c.json({ success: false, error: '申請処理に失敗しました' }, 500); }
})

app.get('/:id/requests', async (c) => {
  const auth = getAuth(c.env.DB, c.env)
  const session = await auth.api.getSession({ headers: c.req.raw.headers })
  if (!session) return c.json({ error: 'Unauthorized' }, 401)
  const teamId = c.req.param('id')
  const db = drizzle(c.env.DB)

  try {
    const requests = await db.select().from(teamMembers).where(and(eq(teamMembers.teamId, teamId), eq(teamMembers.status, 'pending')));
    return c.json({ success: true, requests });
  } catch (e) { return c.json({ success: false, error: '申請一覧の取得に失敗しました' }, 500); }
})

app.patch('/:id/requests/:memberId', async (c) => {
  const auth = getAuth(c.env.DB, c.env)
  const session = await auth.api.getSession({ headers: c.req.raw.headers })
  if (!session) return c.json({ error: 'Unauthorized' }, 401)
  const teamId = c.req.param('id')
  const memberId = c.req.param('memberId')
  const body = await c.req.json()
  const db = drizzle(c.env.DB)

  try {
    if (body.action === 'approve') {
      await db.update(teamMembers).set({ status: 'active' }).where(and(eq(teamMembers.id, memberId), eq(teamMembers.teamId, teamId)));
      return c.json({ success: true, message: '参加を承認しました' });
    } else if (body.action === 'reject') {
      await db.delete(teamMembers).where(and(eq(teamMembers.id, memberId), eq(teamMembers.teamId, teamId)));
      return c.json({ success: true, message: '参加申請を拒否しました' });
    }
    return c.json({ success: false, error: '無効なアクションです' }, 400);
  } catch (e) { return c.json({ success: false, error: '処理に失敗しました' }, 500); }
})

export default app
