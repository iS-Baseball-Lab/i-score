// src/api/matches.ts
import { Hono } from 'hono'
import { getAuth } from "@/lib/auth"
import { drizzle } from 'drizzle-orm/d1'
import { matches, atBats, pitches, playLogs, matchLineups } from '@/db/schema'
import { desc, eq, and, isNull } from 'drizzle-orm'
import { canEditScore } from '@/lib/roles'

const app = new Hono<{ Bindings: { DB: D1Database, ASSETS: Fetcher } }>()

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ⚾️ [GET] チームの試合一覧を取得
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
app.get('/', async (c) => {
    const teamId = c.req.query('teamId')
    if (!teamId) return c.json({ error: 'Team ID is required' }, 400)
    const db = drizzle(c.env.DB)
    const result = await db.select().from(matches).where(eq(matches.teamId, teamId)).orderBy(desc(matches.createdAt))
    return c.json(result)
})

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ⚾️ [GET] 試合情報を取得
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
app.get("/:id", async (c) => {
    const matchId = c.req.param("id");
    const db = drizzle(c.env.DB);
    try {
        const matchData = await db.select().from(matches).where(eq(matches.id, matchId)).get();
        if (!matchData) return c.json({ success: false, error: "試合が見つかりません" }, 404);
        return c.json({ success: true, match: matchData });
    } catch (error) {
        return c.json({ success: false, error: "試合情報の取得に失敗しました" }, 500);
    }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ⚾️ [POST] 新規試合の作成
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
app.post('/', async (c) => {
    const auth = getAuth(c.env.DB, c.env)
    const session = await auth.api.getSession({ headers: c.req.raw.headers })
    const userRole = (session?.user as unknown as { role?: string })?.role
    if (!session || !canEditScore(userRole)) return c.json({ error: '権限がありません' }, 403)

    const body = await c.req.json()
    if (!body.teamId) return c.json({ error: 'Team ID is required' }, 400)

    const db = drizzle(c.env.DB)
    const matchId = crypto.randomUUID()
    try {
        // 💡 旧スキーマの season, opponentTeamId, location を排除し、新スキーマに適合
        await db.insert(matches).values({
            id: matchId,
            teamId: body.teamId,
            opponent: body.opponent,
            date: body.date,
            matchType: body.matchType,
            battingOrder: body.battingOrder, // 'first' or 'second'
            surfaceDetails: body.location || null, // UI側の location は surfaceDetails に格納
            innings: body.innings || 9,
            status: "scheduled",
        })
        return c.json({ success: true, matchId })
    } catch (e) { return c.json({ success: false, error: 'Failed to create match' }, 500) }
})

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ⚾️ [POST] 投球（Pitch）の記録
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
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
            // 💡 batterName を batterId に修正
            await db.insert(atBats).values({
                id: atBatId,
                matchId,
                inning: body.inning,
                isTop: body.isTop,
                batterId: body.batterId || null,
                pitcherId: body.pitcherId || null
            })
            currentAtBat = {
                id: atBatId, matchId, inning: body.inning, isTop: body.isTop,
                batterId: body.batterId || null, pitcherId: body.pitcherId || null, result: null, createdAt: new Date()
            }
        } else if (body.batterId && !currentAtBat.batterId) {
            await db.update(atBats).set({ batterId: body.batterId }).where(eq(atBats.id, currentAtBat.id));
        }

        const pitchId = crypto.randomUUID()
        // 💡 hitX, hitY を排除し、zoneX, zoneY のみに
        await db.insert(pitches).values({
            id: pitchId,
            atBatId: currentAtBat.id,
            pitchNumber: body.pitchNumber,
            result: body.result,
            ballsBefore: body.ballsBefore,
            strikesBefore: body.strikesBefore,
            zoneX: body.zoneX ?? null,
            zoneY: body.zoneY ?? null,
        })

        if (body.atBatResult) await db.update(atBats).set({ result: body.atBatResult }).where(eq(atBats.id, currentAtBat.id))
        return c.json({ success: true, pitchId, atBatId: currentAtBat.id })
    } catch (e) { return c.json({ success: false, error: 'Failed to record pitch' }, 500) }
})

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ⚾️ [PATCH] 試合終了
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
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
                status: 'finished',
                myScore: body.myScore || 0,
                opponentScore: body.opponentScore || 0,
                // 💡 フロントエンドからのキー名ブレに対応
                myInningScores: JSON.stringify(body.selfInningScores || body.myInningScores || []),
                opponentInningScores: JSON.stringify(body.guestInningScores || body.opponentInningScores || []),
            }).where(eq(matches.id, matchId))
        return c.json({ success: true })
    } catch (e) { return c.json({ success: false, error: '試合の終了処理に失敗しました' }, 500) }
})

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ⚾️ [DELETE] 試合削除
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
app.delete('/:id', async (c) => {
    const auth = getAuth(c.env.DB, c.env)
    const session = await auth.api.getSession({ headers: c.req.raw.headers })
    const userRole = (session?.user as unknown as { role?: string })?.role
    if (!session || !canEditScore(userRole)) return c.json({ error: '権限がありません' }, 403)

    const matchId = c.req.param('id')
    try {
        // 💡 関連テーブル（実況や走塁など）も一掃して整合性を保つ
        await c.env.DB.prepare(`DELETE FROM play_logs WHERE match_id = ?`).bind(matchId).run()
        await c.env.DB.prepare(`DELETE FROM base_advances WHERE match_id = ?`).bind(matchId).run()
        await c.env.DB.prepare(`DELETE FROM match_lineups WHERE match_id = ?`).bind(matchId).run()
        await c.env.DB.prepare(`DELETE FROM pitches WHERE at_bat_id IN (SELECT id FROM at_bats WHERE match_id = ?)`).bind(matchId).run()
        await c.env.DB.prepare(`DELETE FROM at_bats WHERE match_id = ?`).bind(matchId).run()
        await c.env.DB.prepare(`DELETE FROM matches WHERE id = ?`).bind(matchId).run()
        return c.json({ success: true })
    } catch (e) { return c.json({ success: false, error: '試合の削除に失敗しました' }, 500) }
})

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ⚾️ [DELETE] 直前の投球を取り消す
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
app.delete('/:id/pitches/last', async (c) => {
    const auth = getAuth(c.env.DB, c.env)
    const session = await auth.api.getSession({ headers: c.req.raw.headers })
    const userRole = (session?.user as unknown as { role?: string })?.role
    if (!session || !canEditScore(userRole)) return c.json({ error: '権限がありません' }, 403)

    const matchId = c.req.param('id')
    try {
        await c.env.DB.prepare(`
            DELETE FROM pitches WHERE id = (
                SELECT p.id FROM pitches p 
                JOIN at_bats a ON p.at_bat_id = a.id 
                WHERE a.match_id = ? ORDER BY p.created_at DESC LIMIT 1
            )
        `).bind(matchId).run()
        return c.json({ success: true })
    } catch (e) { return c.json({ success: false, error: '削除に失敗しました' }, 500) }
})

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ⚾️ [GET/PUT] スタメンの取得と保存
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
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
            // is_starting はSQLiteで true = 1 として保存
            await c.env.DB.prepare(`INSERT INTO match_lineups (id, match_id, player_id, batting_order, position, is_starting) VALUES (?, ?, ?, ?, ?, 1)`)
                .bind(lineupId, matchId, lineup.playerId, lineup.battingOrder, lineup.position).run();
        }
        return c.json({ success: true });
    } catch (e) { return c.json({ error: 'スタメンの保存に失敗しました' }, 500); }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ⚾️ [GET] ボックススコア（打席結果）
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
app.get('/:id/boxscore', async (c) => {
    const matchId = c.req.param('id');
    try {
        const { results } = await c.env.DB.prepare(`
            SELECT a.inning, a.is_top as isTop, p.name as batterName, a.result 
            FROM at_bats a
            LEFT JOIN players p ON a.batter_id = p.id
            WHERE a.match_id = ? AND a.batter_id IS NOT NULL 
            ORDER BY a.created_at ASC
        `).bind(matchId).all();
        return c.json(results);
    } catch (e) { return c.json({ error: '取得に失敗しました' }, 500); }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ⚾️ [POST] 実況ログ保存
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
app.post("/:id/logs", async (c) => {
    const matchId = c.req.param("id");
    try {
        const body = await c.req.json();
        const db = drizzle(c.env.DB);

        // 💡 旧スキーマの batterName, timestamp を排除し、型エラーを解消
        await db.insert(playLogs).values({
            id: body.id,
            matchId: matchId,
            inningText: body.inningText,
            resultType: body.resultType,
            description: body.description,
        });
        return c.json({ success: true, message: "🔥 熱い実況を記録しました！" });
    } catch (error) {
        return c.json({ success: false, error: "ログの保存に失敗しました" }, 500);
    }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ⚾️ [GET/DELETE] 実況ログ取得と削除
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
app.get("/:id/logs", async (c) => {
    const matchId = c.req.param("id");
    const db = drizzle(c.env.DB);
    try {
        const logs = await db.select().from(playLogs).where(eq(playLogs.matchId, matchId)).orderBy(desc(playLogs.createdAt));
        return c.json({ success: true, logs });
    } catch (error) { return c.json({ success: false, error: "ログの取得に失敗しました" }, 500); }
});

app.delete("/:id/logs/:logId", async (c) => {
    const matchId = c.req.param("id");
    const logId = c.req.param("logId");
    const db = drizzle(c.env.DB);
    try {
        await db.delete(playLogs).where(and(eq(playLogs.id, logId), eq(playLogs.matchId, matchId)));
        return c.json({ success: true, message: "プレイを取り消しました" });
    } catch (error) { return c.json({ success: false, error: "取り消しに失敗しました" }, 500); }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ⚾️ [PATCH] スコア更新
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
app.patch("/:id/score", async (c) => {
    const matchId = c.req.param("id");
    const db = drizzle(c.env.DB);
    try {
        const body = await c.req.json();
        await db.update(matches).set({
            myScore: body.myScore,
            opponentScore: body.opponentScore,
            status: "in_progress",
            // 💡 復活したイニングスコアを反映
            myInningScores: JSON.stringify(body.myInningScores || []),
            opponentInningScores: JSON.stringify(body.opponentInningScores || []),
        }).where(eq(matches.id, matchId));
        return c.json({ success: true, message: "スコアボードを更新しました！" });
    } catch (error) {
        return c.json({ success: false, error: "スコアの更新に失敗しました" }, 500);
    }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ⚾️ [PATCH] 試合情報（汎用）の更新
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
app.patch("/:id", async (c) => {
    const matchId = c.req.param("id");
    const db = drizzle(c.env.DB);

    try {
        const body = await c.req.json();
        // 💡 battingOrderの更新時、文字列 ('first' / 'second') ならそのまま保存するよう修正
        await db.update(matches)
            .set({
                battingOrder: body.battingOrder,
            })
            .where(eq(matches.id, matchId));

        return c.json({ success: true, message: "試合情報を更新しました！" });
    } catch (error) {
        return c.json({ success: false, error: "試合情報の更新に失敗しました" }, 500);
    }
});

export default app