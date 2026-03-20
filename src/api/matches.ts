// src/api/matches.ts
import { Hono } from 'hono'
import { getAuth } from "@/lib/auth"
import { drizzle } from 'drizzle-orm/d1'
import { matches, atBats, pitches, playLogs } from '@/db/schema'
import { desc, eq, and, isNull } from 'drizzle-orm'
import { canEditScore } from '@/lib/roles'

const app = new Hono<{ Bindings: { DB: D1Database, ASSETS: Fetcher } }>()

app.get('/', async (c) => {
    const teamId = c.req.query('teamId')
    if (!teamId) return c.json({ error: 'Team ID is required' }, 400)
    const db = drizzle(c.env.DB)
    const result = await db.select().from(matches).where(eq(matches.teamId, teamId)).orderBy(desc(matches.createdAt))
    return c.json(result)
})

app.get('/:id', async (c) => {
    const id = c.req.param('id')
    const db = drizzle(c.env.DB)
    const result = await db.select().from(matches).where(eq(matches.id, id)).get()
    if (!result) return c.json({ error: 'Match not found' }, 404)
    return c.json(result)
})

app.post('/', async (c) => {
    const auth = getAuth(c.env.DB, c.env)
    const session = await auth.api.getSession({ headers: c.req.raw.headers })
    const userRole = (session?.user as unknown as { role?: string })?.role
    if (!session || !canEditScore(userRole)) return c.json({ error: '権限がありません' }, 403)

    const body = await c.req.json()
    if (!body.teamId || !body.season) return c.json({ error: 'Team ID and Season are required' }, 400)

    const db = drizzle(c.env.DB)
    const matchId = crypto.randomUUID()
    try {
        await db.insert(matches).values({
            id: matchId, teamId: body.teamId, season: body.season, opponentTeamId: body.opponentTeamId || null,
            opponent: body.opponent, date: body.date, location: body.location || null, matchType: body.matchType,
            battingOrder: body.battingOrder, innings: body.innings || 9, status: "scheduled",
        })
        return c.json({ success: true, matchId })
    } catch (e) { return c.json({ success: false, error: 'Failed to create match' }, 500) }
})

app.post('/:id/pitches', async (c) => {
    const auth = getAuth(c.env.DB, c.env)
    const session = await auth.api.getSession({ headers: c.req.raw.headers })
    const userRole = (session?.user as unknown as { role?: string })?.role
    if (!session || !canEditScore(userRole)) return c.json({ error: '権限がありません' }, 403)

    const matchId = c.req.param('id')
    const body = await c.req.json()
    const db = drizzle(c.env.DB)

    try {
        let currentAtBat = await db.select().from(atBats)
            .where(and(eq(atBats.matchId, matchId), eq(atBats.inning, body.inning), eq(atBats.isTop, body.isTop), isNull(atBats.result))).get()

        if (!currentAtBat) {
            const atBatId = crypto.randomUUID()
            await db.insert(atBats).values({
                id: atBatId, matchId, inning: body.inning, isTop: body.isTop,
                batterName: body.batterName || null, pitcherName: body.pitcherName || null
            })
            currentAtBat = {
                id: atBatId, matchId, inning: body.inning, isTop: body.isTop,
                batterName: body.batterName || null, pitcherName: body.pitcherName || null, result: null, createdAt: new Date()
            }
        } else if (body.batterName && !currentAtBat.batterName) {
            await db.update(atBats).set({ batterName: body.batterName }).where(eq(atBats.id, currentAtBat.id));
        }

        const pitchId = crypto.randomUUID()
        await db.insert(pitches).values({
            id: pitchId, atBatId: currentAtBat.id, pitchNumber: body.pitchNumber, result: body.result,
            ballsBefore: body.ballsBefore, strikesBefore: body.strikesBefore,
            zoneX: body.zoneX ?? null, zoneY: body.zoneY ?? null, hitX: body.hitX ?? null, hitY: body.hitY ?? null,
        })

        if (body.atBatResult) await db.update(atBats).set({ result: body.atBatResult }).where(eq(atBats.id, currentAtBat.id))
        return c.json({ success: true, pitchId, atBatId: currentAtBat.id })
    } catch (e) { return c.json({ success: false, error: 'Failed to record pitch' }, 500) }
})

app.patch('/:id/finish', async (c) => {
    const auth = getAuth(c.env.DB, c.env)
    const session = await auth.api.getSession({ headers: c.req.raw.headers })
    const userRole = (session?.user as unknown as { role?: string })?.role
    if (!session || !canEditScore(userRole)) return c.json({ error: '権限がありません' }, 403)

    const matchId = c.req.param('id')
    const body = await c.req.json()
    const db = drizzle(c.env.DB)
    try {
        await db.update(matches)
            .set({
                status: 'completed', myScore: body.myScore || 0, opponentScore: body.opponentScore || 0,
                myInningScores: JSON.stringify(body.selfInningScores || []), opponentInningScores: JSON.stringify(body.guestInningScores || []),
            }).where(eq(matches.id, matchId))
        return c.json({ success: true })
    } catch (e) { return c.json({ success: false, error: '試合の終了処理に失敗しました' }, 500) }
})

app.delete('/:id', async (c) => {
    const auth = getAuth(c.env.DB, c.env)
    const session = await auth.api.getSession({ headers: c.req.raw.headers })
    const userRole = (session?.user as unknown as { role?: string })?.role
    if (!session || !canEditScore(userRole)) return c.json({ error: '権限がありません' }, 403)

    const matchId = c.req.param('id')
    try {
        await c.env.DB.prepare(`DELETE FROM match_lineups WHERE match_id = ?`).bind(matchId).run()
        await c.env.DB.prepare(`DELETE FROM pitches WHERE at_bat_id IN (SELECT id FROM at_bats WHERE match_id = ?)`).bind(matchId).run()
        await c.env.DB.prepare(`DELETE FROM at_bats WHERE match_id = ?`).bind(matchId).run()
        await c.env.DB.prepare(`DELETE FROM matches WHERE id = ?`).bind(matchId).run()
        return c.json({ success: true })
    } catch (e) { return c.json({ success: false, error: '試合の削除に失敗しました' }, 500) }
})

app.delete('/:id/pitches/last', async (c) => {
    const auth = getAuth(c.env.DB, c.env)
    const session = await auth.api.getSession({ headers: c.req.raw.headers })
    const userRole = (session?.user as unknown as { role?: string })?.role
    if (!session || !canEditScore(userRole)) return c.json({ error: '権限がありません' }, 403)

    const matchId = c.req.param('id')
    try {
        await c.env.DB.prepare(`DELETE FROM pitches WHERE id = (SELECT id FROM pitches WHERE matchId = ? ORDER BY createdAt DESC LIMIT 1)`).bind(matchId).run()
        return c.json({ success: true })
    } catch (e) { return c.json({ success: false, error: '削除に失敗しました' }, 500) }
})

app.get('/:id/lineup', async (c) => {
    const matchId = c.req.param('id');
    try {
        const { results } = await c.env.DB.prepare(`
                SELECT ml.*, p.name as playerName, p.uniform_number as uniformNumber
                FROM match_lineups ml JOIN players p ON ml.player_id = p.id
                WHERE ml.match_id = ? ORDER BY ml.batting_order ASC
            `).bind(matchId).all();
        return c.json(results);
    } catch (e) { return c.json({ error: 'スタメンの取得に失敗しました' }, 500); }
});

app.put('/:id/lineup', async (c) => {
    const auth = getAuth(c.env.DB, c.env)
    const session = await auth.api.getSession({ headers: c.req.raw.headers })
    const userRole = (session?.user as unknown as { role?: string })?.role
    if (!session || !canEditScore(userRole)) return c.json({ error: '権限がありません' }, 403)

    const matchId = c.req.param('id');
    const lineups = await c.req.json();
    try {
        await c.env.DB.prepare(`DELETE FROM match_lineups WHERE match_id = ?`).bind(matchId).run();
        for (const lineup of lineups) {
            const lineupId = crypto.randomUUID();
            await c.env.DB.prepare(`INSERT INTO match_lineups (id, match_id, player_id, batting_order, position) VALUES (?, ?, ?, ?, ?)`).bind(lineupId, matchId, lineup.playerId, lineup.battingOrder, lineup.position).run();
        }
        return c.json({ success: true });
    } catch (e) { return c.json({ error: 'スタメンの保存に失敗しました' }, 500); }
});

app.get('/:id/boxscore', async (c) => {
    const matchId = c.req.param('id');
    try {
        const { results } = await c.env.DB.prepare(`SELECT inning, is_top as isTop, batter_name as batterName, result FROM at_bats WHERE match_id = ? AND batter_name IS NOT NULL ORDER BY created_at ASC`).bind(matchId).all();
        return c.json(results);
    } catch (e) { return c.json({ error: '取得に失敗しました' }, 500); }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ⚾️ 試合に紐づく実況ログを保存するAPI
// エンドポイント例: POST /api/matches/:id/logs
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
app.post("/:id/logs", async (c) => {
    const matchId = c.req.param("id");

    try {
        const body = await c.req.json();
        const db = drizzle(c.env.DB);

        // 💡 D1データベースの play_logs テーブルにINSERT！
        await db.insert(playLogs).values({
            id: body.id,
            matchId: matchId,
            inningText: body.inningText,
            resultType: body.resultType,
            batterName: body.batterName || "打者",
            description: body.description,
            timestamp: body.timestamp,
        }).run();;

        return c.json({ success: true, message: "🔥 熱い実況をD1に記録しました！" });
    } catch (error) {
        console.error("DB保存エラー:", error);
        return c.json({ success: false, error: "ログの保存に失敗しました" }, 500);
    }
});

export default app