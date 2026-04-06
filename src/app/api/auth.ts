import { Hono } from 'hono'
import { getAuth } from "@/lib/auth" // 🌟 getAuth に戻す！
import { drizzle } from 'drizzle-orm/d1'
import { eq } from 'drizzle-orm'
import { teams, teamMembers, organizations } from '@/db/schema/team'

const app = new Hono<{ Bindings: { DB: D1Database, ASSETS: Fetcher } }>()

const getRoleLabel = (role: string) => {
  switch (role.toUpperCase()) {
    case 'MANAGER': return '監督 / 代表';
    case 'COACH': return 'コーチ';
    case 'SCORER': return 'スコアラー';
    case 'STAFF': return 'スタッフ';
    case 'PLAYER': return '選手';
    default: return 'メンバー';
  }
};

app.get('/me', async (c) => {
  const auth = getAuth(c.env.DB, c.env) // 🌟 ここでインスタンスを取得！
  const session = await auth.api.getSession({ headers: c.req.raw.headers })

  if (!session || !session.user) {
    return c.json({ success: false, error: 'Unauthorized' }, 401)
  }

  const user = session.user;
  const db = drizzle(c.env.DB);
  let memberships: any[] = [];

  try {
    const userTeams = await db
      .select({
        teamId: teams.id,
        teamName: teams.name,
        organizationName: organizations.name,
        role: teamMembers.role,
      })
      .from(teamMembers)
      .innerJoin(teams, eq(teamMembers.teamId, teams.id))
      .innerJoin(organizations, eq(teams.organizationId, organizations.id))
      .where(eq(teamMembers.userId, user.id));

    if (userTeams.length > 0) {
      memberships = userTeams.map((t, index) => ({
        teamId: t.teamId,
        teamName: t.teamName,
        organizationName: t.organizationName,
        role: t.role,
        roleLabel: getRoleLabel(t.role),
        isMainTeam: index === 0
      }));
    }
  } catch (error) {
    console.error("[i-Score Error]", error);
  }

  return c.json({
    success: true,
    data: {
      id: user.id,
      name: user.name,
      email: user.email,
      avatarUrl: user.image || `/api/images/avatars/${user.id}.png`,
      role: (user as any).role || 'USER',
      systemRole: (user as any).role || 'USER',
      memberships: memberships,
    }
  })
})

app.all('/*', (c) => {
  const auth = getAuth(c.env.DB, c.env) // 🌟 ここでも取得してハンドリング
  return auth.handler(c.req.raw)
})

export default app