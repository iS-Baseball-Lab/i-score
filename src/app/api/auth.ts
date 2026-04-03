// src/app/api/auth.ts
import { Hono } from 'hono'
import { getAuth } from "@/lib/auth"
import { drizzle } from 'drizzle-orm/d1'
import { eq, and } from 'drizzle-orm'
// 💡 organizations テーブルを追加
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
  const auth = getAuth(c.env.DB, c.env)
  const session = await auth.api.getSession({ headers: c.req.raw.headers })

  if (!session) {
    return c.json({ success: false, error: 'Unauthorized' }, 401)
  }

  const userWithRole = session.user as any;
  const db = drizzle(c.env.DB);

  let memberships: any[] = [];

  try {
    // ⚾️ Drizzle ORMで親子JOINを実行！
    const userTeams = await db
      .select({
        teamId: teams.id,
        teamName: teams.name,
        organizationName: organizations.name, // 🔥 親チーム名を取得
        role: teamMembers.role,
      })
      .from(teamMembers)
      .innerJoin(teams, eq(teamMembers.teamId, teams.id))
      .innerJoin(organizations, eq(teams.organizationId, organizations.id)) // 🔥 organizationsをJOIN
      .where(eq(teamMembers.userId, userWithRole.id));

    if (userTeams.length > 0) {
      // DBにデータがあった場合
      memberships = userTeams.map((t, index) => ({
        teamId: t.teamId,
        teamName: t.teamName,
        organizationName: t.organizationName, // 🔥 フロントへ渡す
        role: t.role,
        roleLabel: getRoleLabel(t.role),
        isMainTeam: index === 0
      }));
    } else {
      // 💡 DBが空の場合のダミーデータもC案仕様にアップデート！
      console.log("[i-Score Debug] No teams found in DB. Using mock data.");
      memberships = [{
        teamId: "mock-team-1",
        teamName: "2024年度 1軍",
        organizationName: "iS Baseball Club", // 💡 親の名前
        role: "MANAGER",
        roleLabel: "監督",
        isMainTeam: true
      }];
    }
  } catch (error) {
    console.error("[i-Score Error] Failed to fetch user teams:", error);
    memberships = [{
      teamId: "error-mock",
      teamName: "連携エラー",
      organizationName: "DB接続確認中",
      role: "STAFF",
      roleLabel: "確認",
      isMainTeam: true
    }];
  }

  return c.json({
    success: true,
    data: {
      id: userWithRole.id,
      name: userWithRole.name,
      email: userWithRole.email,
      avatarUrl: userWithRole.image || `/api/images/avatars/${userWithRole.id}.png`,
      role: userWithRole.role,
      systemRole: userWithRole.role,
      memberships: memberships,
    }
  })
})

app.all('/*', async (c) => {
  const auth = getAuth(c.env.DB, c.env)
  return auth.handler(c.req.raw)
})

export default app