// src/api/tournaments.ts
import { Hono } from 'hono'
import { getAuth } from "@/lib/auth"
import { drizzle } from 'drizzle-orm/d1'
import { tournaments, matches } from '@/db/schema'
import { desc, eq } from 'drizzle-orm'

const app = new Hono<{ Bindings: { DB: D1Database } }>()

// 大会一覧の取得
app.get('/', async (c) => {
    const auth = getAuth(c.env.DB, c.env as any)
    const session = await auth.api.getSession({ headers: c.req.raw.headers })
    if (!session) return c.json({ error: 'Unauthorized' }, 401)

    const db = drizzle(c.env.DB)
    try {
        const results = await db.select().from(tournaments).orderBy(desc(tournaments.createdAt));
        return c.json(results);
    } catch (e) {
        return c.json({ error: '大会の取得に失敗しました' }, 500);
    }
})

// 新規大会の作成
app.post('/', async (c) => {
    const auth = getAuth(c.env.DB, c.env as any)
    const session = await auth.api.getSession({ headers: c.req.raw.headers })
    if (!session) return c.json({ error: 'Unauthorized' }, 401)

    const body = await c.req.json()
    const db = drizzle(c.env.DB)
    const tournamentId = crypto.randomUUID()

    try {
        await db.insert(tournaments).values({
            id: tournamentId,
            name: body.name,
            season: body.season,
            startDate: body.startDate || null,
            endDate: body.endDate || null,
            createdBy: session.user.id,
        })
        return c.json({ success: true, id: tournamentId })
    } catch (e) {
        console.error(e);
        return c.json({ success: false, error: '大会の作成に失敗しました' }, 500)
    }
})

// 大会の削除
app.delete('/:id', async (c) => {
    const auth = getAuth(c.env.DB, c.env as any)
    const session = await auth.api.getSession({ headers: c.req.raw.headers })
    if (!session) return c.json({ error: 'Unauthorized' }, 401)

    const id = c.req.param('id')
    const db = drizzle(c.env.DB)
    
    try {
        // 紐づく試合の tournamentId を null にして保護する (必要に応じて)
        await db.update(matches).set({ tournamentId: null }).where(eq(matches.tournamentId, id));
        await db.delete(tournaments).where(eq(tournaments.id, id));
        return c.json({ success: true })
    } catch (e) {
        return c.json({ success: false, error: '削除に失敗しました' }, 500)
    }
})

export default app
