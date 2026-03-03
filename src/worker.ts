// src/worker.ts
import { Hono } from 'hono'
import { getAuth } from "@/lib/auth"
import { drizzle } from 'drizzle-orm/d1'
import { user, teams, teamMembers, matches, atBats, pitches } from '@/db/schema'
import { desc, eq, and, isNull } from 'drizzle-orm'
import { canEditScore, canManageTeam } from '@/lib/roles'

const app = new Hono<{ Bindings: { DB: D1Database, ASSETS: Fetcher } }>()

// Auth 関連のルーティング
app.all('/api/auth/*', async (c) => {
    const auth = getAuth(c.env.DB, c.env)
    return auth.handler(c.req.raw)
})

// ==========================================
// 💡 チーム管理 API
// ==========================================

// 💡 自分の所属チーム一覧を取得
app.get('/api/teams', async (c) => {
    const auth = getAuth(c.env.DB, c.env)
    const session = await auth.api.getSession({ headers: c.req.raw.headers })
    if (!session) return c.json({ error: 'Unauthorized' }, 401)

    const db = drizzle(c.env.DB)
    // teamMembers テーブルを経由して、自分が所属しているチーム情報とロールを取得
    const myTeams = await db.select({
        id: teams.id,
        name: teams.name,
        myRole: teamMembers.role,
        isFounder: eq(teams.createdBy, session.user.id) // 自分が発起人かどうかのフラグ
    })
        .from(teamMembers)
        .innerJoin(teams, eq(teamMembers.teamId, teams.id))
        .where(eq(teamMembers.userId, session.user.id))
        .orderBy(desc(teams.createdAt))

    return c.json(myTeams)
})

// 💡 チームの新規作成（作成時に自分のロールを指定）
app.post('/api/teams', async (c) => {
    const auth = getAuth(c.env.DB, c.env)
    const session = await auth.api.getSession({ headers: c.req.raw.headers })
    if (!session) return c.json({ error: 'Unauthorized' }, 401)

    const body = await c.req.json()
    const db = drizzle(c.env.DB)
    const teamId = crypto.randomUUID()

    try {
        // トランザクションに近い形で、チーム作成とメンバー登録を連続で行う
        await db.insert(teams).values({
            id: teamId,
            name: body.name,
            createdBy: session.user.id,
            createdAt: new Date(),
        })

        await db.insert(teamMembers).values({
            id: crypto.randomUUID(),
            teamId: teamId,
            userId: session.user.id,
            role: body.role || 'scorer', // 画面から選ばれたロール（デフォルトはスコアラー）
            joinedAt: new Date(),
        })

        return c.json({ success: true, teamId })
    } catch (e) {
        console.error("チーム作成エラー:", e)
        return c.json({ success: false, error: 'Failed to create team' }, 500)
    }
})

// 💡 チーム名の更新API
app.patch('/api/teams/:id', async (c) => {
    const auth = getAuth(c.env.DB, c.env)
    const session = await auth.api.getSession({ headers: c.req.raw.headers })
    if (!session) return c.json({ error: 'Unauthorized' }, 401)

    // 💡 ユーザーのシステム全体でのロールを取得
    const userRole = (session.user as any).role;

    const teamId = c.req.param('id')
    const body = await c.req.json()
    const db = drizzle(c.env.DB)

    try {
        const member = await db.select().from(teamMembers)
            .where(and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, session.user.id))).get()

        // 💡 修正：システム管理者(admin) または チーム管理者なら許可
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

// 💡 チームの削除API
app.delete('/api/teams/:id', async (c) => {
    const auth = getAuth(c.env.DB, c.env)
    const session = await auth.api.getSession({ headers: c.req.raw.headers })
    if (!session) return c.json({ error: 'Unauthorized' }, 401)

    // 💡 ユーザーのシステム全体でのロールを取得
    const userRole = (session.user as any).role;

    const teamId = c.req.param('id')
    const db = drizzle(c.env.DB)

    try {
        const member = await db.select().from(teamMembers)
            .where(and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, session.user.id))).get()

        // 💡 修正：システム管理者(admin) または チーム管理者なら許可
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

// 💡 チームの所属選手一覧を取得するAPI（背番号順に並べて返します）
app.get('/api/teams/:teamId/players', async (c) => {
    const teamId = c.req.param('teamId');
    try {
        // 💡 修正: フロントエンドが認識できるように `uniform_number as uniformNumber` と名前を変換して返します
        const { results } = await c.env.DB.prepare(
            `SELECT id, team_id, name, uniform_number as uniformNumber, created_at 
             FROM players 
             WHERE team_id = ? 
             ORDER BY CAST(uniform_number AS INTEGER) ASC`
        ).bind(teamId).all();

        return c.json(results);
    } catch (e) {
        console.error("選手取得エラー:", e);
        return c.json({ error: '選手の取得に失敗しました' }, 500);
    }
});

// 💡 チームに新しい選手を登録するAPI
app.post('/api/teams/:teamId/players', async (c) => {
    const teamId = c.req.param('teamId');
    const body = await c.req.json();
    const playerId = crypto.randomUUID();

    try {
        // データベースに背番号と名前を保存
        await c.env.DB.prepare(
            `INSERT INTO players (id, team_id, name, uniform_number, created_at) VALUES (?, ?, ?, ?, ?)`
        ).bind(playerId, teamId, body.name, body.uniformNumber, Date.now()).run();

        return c.json({ success: true, id: playerId });
    } catch (e) {
        console.error("選手登録エラー:", e);
        return c.json({ error: '選手の登録に失敗しました' }, 500);
    }
});

// 💡 チームに所属する選手情報を更新するAPI
app.patch('/api/teams/:teamId/players/:playerId', async (c) => {
    const teamId = c.req.param('teamId');
    const playerId = c.req.param('playerId');
    const body = await c.req.json();

    try {
        await c.env.DB.prepare(
            `UPDATE players SET name = ?, uniform_number = ? WHERE id = ? AND team_id = ?`
        ).bind(body.name, body.uniformNumber, playerId, teamId).run();

        return c.json({ success: true });
    } catch (e) {
        console.error("選手更新エラー:", e);
        return c.json({ error: '選手の更新に失敗しました' }, 500);
    }
});

// 💡 チームの選手を削除するAPI
app.delete('/api/teams/:teamId/players/:playerId', async (c) => {
    const teamId = c.req.param('teamId');
    const playerId = c.req.param('playerId');

    try {
        await c.env.DB.prepare(
            `DELETE FROM players WHERE id = ? AND team_id = ?`
        ).bind(playerId, teamId).run();

        return c.json({ success: true });
    } catch (e) {
        console.error("選手削除エラー:", e);
        return c.json({ error: '選手の削除に失敗しました' }, 500);
    }
});

// ==========================================
// 💡 試合関連 API
// ==========================================

// 💡 試合一覧取得（※特定のチームに絞り込む）
app.get('/api/matches', async (c) => {
    const teamId = c.req.query('teamId')
    if (!teamId) return c.json({ error: 'Team ID is required' }, 400)

    const db = drizzle(c.env.DB)
    const result = await db.select().from(matches)
        .where(eq(matches.teamId, teamId))
        .orderBy(desc(matches.createdAt))
    return c.json(result)
})

// 💡 試合詳細取得
app.get('/api/matches/:id', async (c) => {
    const id = c.req.param('id')
    const db = drizzle(c.env.DB)
    const result = await db.select().from(matches).where(eq(matches.id, id)).get()
    if (!result) return c.json({ error: 'Match not found' }, 404)
    return c.json(result)
})

// 💡 試合の新規作成（※teamId と season を必須に！）
app.post('/api/matches', async (c) => {
    const auth = getAuth(c.env.DB, c.env)
    const session = await auth.api.getSession({ headers: c.req.raw.headers })
    const userRole = (session?.user as unknown as { role?: string })?.role

    // 💡 ひとまずシステム全体の権限でチェック（後ほどチーム内の権限チェックに進化させます）
    if (!session || !canEditScore(userRole)) return c.json({ error: '権限がありません' }, 403)

    const body = await c.req.json()
    if (!body.teamId || !body.season) return c.json({ error: 'Team ID and Season are required' }, 400)

    const db = drizzle(c.env.DB)
    const matchId = crypto.randomUUID()

    try {
        await db.insert(matches).values({
            id: matchId,
            teamId: body.teamId,             // 💡 追加
            season: body.season,             // 💡 追加
            opponentTeamId: body.opponentTeamId || null, // 💡 追加（任意）
            opponent: body.opponent,
            date: body.date,
            location: body.location || null,
            matchType: body.matchType,
            battingOrder: body.battingOrder,
            status: "scheduled",
        })
        return c.json({ success: true, matchId })
    } catch (e) {
        return c.json({ success: false, error: 'Failed to create match' }, 500)
    }
})

// 💡 1球ごとの記録（ピッチング）保存
app.post('/api/matches/:id/pitches', async (c) => {
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
            // 💡 修正：フロントエンドから送られてきた batterName を保存する
            await db.insert(atBats).values({
                id: atBatId, matchId, inning: body.inning, isTop: body.isTop,
                batterName: body.batterName || null,
                pitcherName: body.pitcherName || null
            })
            currentAtBat = {
                id: atBatId, matchId, inning: body.inning, isTop: body.isTop,
                batterName: body.batterName || null,
                pitcherName: body.pitcherName || null,
                result: null,
                createdAt: new Date()
            }
        } else if (body.batterName && !currentAtBat.batterName) {
            // 💡 もし既に打席が作られていて名前が空だった場合、名前を更新
            await db.update(atBats).set({ batterName: body.batterName }).where(eq(atBats.id, currentAtBat.id));
        }

        const pitchId = crypto.randomUUID()
        await db.insert(pitches).values({
            id: pitchId,
            atBatId: currentAtBat.id,
            pitchNumber: body.pitchNumber,
            result: body.result,
            ballsBefore: body.ballsBefore,
            strikesBefore: body.strikesBefore,
            zoneX: body.zoneX ?? null,
            zoneY: body.zoneY ?? null,
            hitX: body.hitX ?? null,
            hitY: body.hitY ?? null,
        })

        if (body.atBatResult) {
            await db.update(atBats).set({ result: body.atBatResult }).where(eq(atBats.id, currentAtBat.id))
        }

        return c.json({ success: true, pitchId, atBatId: currentAtBat.id })
    } catch (e) {
        console.error(e)
        return c.json({ success: false, error: 'Failed to record pitch' }, 500)
    }
})

// 💡 試合終了（ステータス更新）API
app.patch('/api/matches/:id/finish', async (c) => {
    const auth = getAuth(c.env.DB, c.env)
    const session = await auth.api.getSession({ headers: c.req.raw.headers })
    const userRole = (session?.user as unknown as { role?: string })?.role

    if (!session || !canEditScore(userRole)) return c.json({ error: '権限がありません' }, 403)

    const matchId = c.req.param('id')
    const body = await c.req.json() // 💡 フロントからスコア情報を受け取る
    const db = drizzle(c.env.DB)

    try {
        await db.update(matches)
            .set({
                status: 'completed',
                // 💡 点数とイニングごとの配列(JSON)をDBに保存！
                myScore: body.myScore || 0,
                opponentScore: body.opponentScore || 0,
                myInningScores: JSON.stringify(body.selfInningScores || []),
                opponentInningScores: JSON.stringify(body.guestInningScores || []),
            })
            .where(eq(matches.id, matchId))

        return c.json({ success: true })
    } catch (e) {
        console.error("試合終了エラー:", e)
        return c.json({ success: false, error: '試合の終了処理に失敗しました' }, 500)
    }
})

// 💡 Undo（1球戻る）のための、最後の投球削除API
app.delete('/api/matches/:id/pitches/last', async (c) => {
    const auth = getAuth(c.env.DB, c.env)
    const session = await auth.api.getSession({ headers: c.req.raw.headers })
    const userRole = (session?.user as unknown as { role?: string })?.role

    if (!session || !canEditScore(userRole)) return c.json({ error: '権限がありません' }, 403)

    const matchId = c.req.param('id')

    try {
        // 💡 D1の生SQL機能を使って、この試合の最新の1球だけを狙い撃ちで削除！
        await c.env.DB.prepare(`
            DELETE FROM pitches 
            WHERE id = (
                SELECT id FROM pitches 
                WHERE matchId = ? 
                ORDER BY createdAt DESC 
                LIMIT 1
            )
        `).bind(matchId).run()

        return c.json({ success: true })
    } catch (e) {
        console.error("Undoエラー:", e)
        return c.json({ success: false, error: '削除に失敗しました' }, 500)
    }
})

// 💡 スターティングメンバー（打順）を保存するAPI
app.get('/api/matches/:id/lineup', async (c) => {
    const matchId = c.req.param('id');
    try {
        // JOINを使って、playersテーブルから名前(playerName)と背番号(uniformNumber)を引っ張ってきます
        const { results } = await c.env.DB.prepare(`
                SELECT ml.*, p.name as playerName, p.uniform_number as uniformNumber
                FROM match_lineups ml
                JOIN players p ON ml.player_id = p.id
                WHERE ml.match_id = ? 
                ORDER BY ml.batting_order ASC
            `).bind(matchId).all();

        return c.json(results);
    } catch (e) {
        console.error("スタメン取得エラー:", e);
        return c.json({ error: 'スタメンの取得に失敗しました' }, 500);
    }
});

// 💡 スターティングメンバー（打順）を一括保存するAPI
app.put('/api/matches/:id/lineup', async (c) => {
    const auth = getAuth(c.env.DB, c.env)
    const session = await auth.api.getSession({ headers: c.req.raw.headers })
    const userRole = (session?.user as unknown as { role?: string })?.role

    if (!session || !canEditScore(userRole)) return c.json({ error: '権限がありません' }, 403)

    const matchId = c.req.param('id');
    const lineups = await c.req.json(); // [{ playerId, battingOrder, position }, ...] の配列

    try {
        // まず既存のスタメンデータをクリア（上書きのため）
        await c.env.DB.prepare(`DELETE FROM match_lineups WHERE match_id = ?`).bind(matchId).run();

        // 新しいスタメンを1件ずつ保存
        for (const lineup of lineups) {
            const lineupId = crypto.randomUUID();
            await c.env.DB.prepare(
                `INSERT INTO match_lineups (id, match_id, player_id, batting_order, position) VALUES (?, ?, ?, ?, ?)`
            ).bind(lineupId, matchId, lineup.playerId, lineup.battingOrder, lineup.position).run();
        }

        return c.json({ success: true });
    } catch (e) {
        console.error("スタメン保存エラー:", e);
        return c.json({ error: 'スタメンの保存に失敗しました' }, 500);
    }
});

// ==========================================
// 💡 ユーザー管理 API (Admin専用)
// ==========================================

// 1. ユーザー一覧の取得
app.get('/api/users', async (c) => {
    const auth = getAuth(c.env.DB, c.env)
    const session = await auth.api.getSession({ headers: c.req.raw.headers })
    if ((session?.user as any)?.role !== 'admin') return c.json({ error: '権限がありません' }, 403)

    try {
        const { results } = await c.env.DB.prepare(
            `SELECT id, name, email, role, created_at as createdAt FROM user ORDER BY created_at DESC`
        ).all()
        return c.json(results)
    } catch (e) {
        console.error(e)
        return c.json({ error: '取得に失敗しました' }, 500)
    }
})

// 2. ユーザーの権限（ロール）を更新するAPI
app.patch('/api/users/:id/role', async (c) => {
    const auth = getAuth(c.env.DB, c.env)
    const session = await auth.api.getSession({ headers: c.req.raw.headers })
    if ((session?.user as any)?.role !== 'admin') return c.json({ error: '権限がありません' }, 403)

    const userId = c.req.param('id')
    const { role } = await c.req.json()

    try {
        await c.env.DB.prepare(`UPDATE user SET role = ? WHERE id = ?`).bind(role, userId).run()
        return c.json({ success: true })
    } catch (e) {
        console.error(e)
        return c.json({ error: '更新に失敗しました' }, 500)
    }
})

// 3. ユーザーを削除するAPI
app.delete('/api/users/:id', async (c) => {
    const auth = getAuth(c.env.DB, c.env)
    const session = await auth.api.getSession({ headers: c.req.raw.headers })
    if ((session?.user as any)?.role !== 'admin') return c.json({ error: '権限がありません' }, 403)

    const userId = c.req.param('id')

    try {
        // ユーザー本体と、関連付けられたチームメンバー情報を削除
        await c.env.DB.prepare(`DELETE FROM team_members WHERE user_id = ?`).bind(userId).run()
        await c.env.DB.prepare(`DELETE FROM user WHERE id = ?`).bind(userId).run()
        return c.json({ success: true })
    } catch (e) {
        console.error(e)
        return c.json({ error: '削除に失敗しました' }, 500)
    }
})

// 4. 全チーム一覧の取得 (Admin専用)
app.get('/api/admin/teams', async (c) => {
    const auth = getAuth(c.env.DB, c.env)
    const session = await auth.api.getSession({ headers: c.req.raw.headers })
    if ((session?.user as any)?.role !== 'admin') return c.json({ error: '権限がありません' }, 403)

    try {
        // サブクエリを使って、各チームの「所属メンバー数」も一緒に計算して取得します
        const { results } = await c.env.DB.prepare(`
            SELECT 
                t.id, 
                t.name, 
                t.created_at as createdAt, 
                (SELECT COUNT(*) FROM team_members WHERE team_id = t.id) as memberCount
            FROM teams t
            ORDER BY t.created_at DESC
        `).all()
        return c.json(results)
    } catch (e) {
        console.error(e)
        return c.json({ error: 'チーム一覧の取得に失敗しました' }, 500)
    }
})

// 5. 特定チームの所属メンバー一覧を取得 (Admin専用)
app.get('/api/admin/teams/:id/members', async (c) => {
    const auth = getAuth(c.env.DB, c.env)
    const session = await auth.api.getSession({ headers: c.req.raw.headers })
    if ((session?.user as any)?.role !== 'admin') return c.json({ error: '権限がありません' }, 403)

    const teamId = c.req.param('id')
    try {
        const { results } = await c.env.DB.prepare(`
            SELECT u.id, u.name, u.email, tm.role 
            FROM team_members tm
            JOIN user u ON tm.user_id = u.id
            WHERE tm.team_id = ?
        `).bind(teamId).all()
        return c.json(results)
    } catch (e) {
        console.error(e)
        return c.json({ error: 'メンバー取得に失敗しました' }, 500)
    }
})

// 6. チームにユーザーを紐付け（追加） (Admin専用)
app.post('/api/admin/teams/:id/members', async (c) => {
    const auth = getAuth(c.env.DB, c.env)
    const session = await auth.api.getSession({ headers: c.req.raw.headers })
    if ((session?.user as any)?.role !== 'admin') return c.json({ error: '権限がありません' }, 403)

    const teamId = c.req.param('id')
    const { userId, role } = await c.req.json()

    // 💡 生SQLをやめ、他のAPIと同じく安全な Drizzle を使用します
    const db = drizzle(c.env.DB)

    try {
        // 既に所属しているかチェック
        const existing = await db.select().from(teamMembers)
            .where(and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, userId))).get()

        if (existing) {
            // 既にいる場合は権限だけアップデート
            await db.update(teamMembers)
                .set({ role })
                .where(and(eq(teamMembers.teamId, teamId), eq(teamMembers.userId, userId)))
        } else {
            // 新規紐付け（as any をつけることで、createdAt等のスキーマ厳格チェックを安全にパスします）
            await db.insert(teamMembers).values({
                id: crypto.randomUUID(),
                teamId: teamId,
                userId: userId,
                role: role,
                createdAt: new Date(), // 必須カラム対策
                joinedAt: new Date()
            } as any)
        }
        return c.json({ success: true })
    } catch (e) {
        console.error("メンバー追加APIエラー:", e)
        return c.json({ error: 'メンバーの追加に失敗しました' }, 500)
    }
})

// 7. チームからユーザーの紐付けを解除（削除） (Admin専用)
app.delete('/api/admin/teams/:id/members/:userId', async (c) => {
    const auth = getAuth(c.env.DB, c.env)
    const session = await auth.api.getSession({ headers: c.req.raw.headers })
    if ((session?.user as any)?.role !== 'admin') return c.json({ error: '権限がありません' }, 403)

    const teamId = c.req.param('id')
    const userId = c.req.param('userId')

    try {
        await c.env.DB.prepare(`DELETE FROM team_members WHERE team_id = ? AND user_id = ?`).bind(teamId, userId).run()
        return c.json({ success: true })
    } catch (e) {
        console.error(e)
        return c.json({ error: 'メンバーの解除に失敗しました' }, 500)
    }
})

// 💡 チームの個人成績（スタッツ）を集計するAPI
app.get('/api/teams/:id/stats', async (c) => {
    const teamId = c.req.param('id');
    try {
        // 生のSQLを使って、安打数や四死球を自動集計します
        const { results } = await c.env.DB.prepare(`
            SELECT 
                batter_name as playerName,
                COUNT(result) as plateAppearances,
                SUM(CASE WHEN result IN ('single', 'double', 'triple', 'home_run', 'groundout', 'flyout', 'double_play', 'strikeout') THEN 1 ELSE 0 END) as atBats,
                SUM(CASE WHEN result IN ('single', 'double', 'triple', 'home_run') THEN 1 ELSE 0 END) as hits,
                SUM(CASE WHEN result = 'single' THEN 1 ELSE 0 END) as singles,
                SUM(CASE WHEN result = 'double' THEN 1 ELSE 0 END) as doubles,
                SUM(CASE WHEN result = 'triple' THEN 1 ELSE 0 END) as triples,
                SUM(CASE WHEN result = 'home_run' THEN 1 ELSE 0 END) as homeRuns,
                SUM(CASE WHEN result = 'walk' THEN 1 ELSE 0 END) as walks,
                SUM(CASE WHEN result = 'strikeout' THEN 1 ELSE 0 END) as strikeouts
            FROM at_bats
            JOIN matches ON at_bats.match_id = matches.id
            WHERE matches.team_id = ? AND matches.status = 'completed' AND batter_name IS NOT NULL
            GROUP BY batter_name
            ORDER BY hits DESC, plateAppearances DESC
        `).bind(teamId).all();

        return c.json(results);
    } catch (e) {
        console.error("スタッツ集計エラー:", e);
        return c.json({ error: '成績の取得に失敗しました' }, 500);
    }
});

// 💡 ボックススコア（打席結果の一覧）を取得するAPI
app.get('/api/matches/:id/boxscore', async (c) => {
    const matchId = c.req.param('id');
    try {
        // その試合の全打席を時間の古い順に取得
        const { results } = await c.env.DB.prepare(`
            SELECT inning, is_top as isTop, batter_name as batterName, result
            FROM at_bats
            WHERE match_id = ? AND batter_name IS NOT NULL
            ORDER BY created_at ASC
        `).bind(matchId).all();

        return c.json(results);
    } catch (e) {
        console.error("ボックススコア取得エラー:", e);
        return c.json({ error: '取得に失敗しました' }, 500);
    }
});

// 💡 チームの投手成績（スタッツ）を集計するAPI
app.get('/api/teams/:id/pitcher-stats', async (c) => {
    const teamId = c.req.param('id');
    try {
        const { results } = await c.env.DB.prepare(`
            SELECT 
                pitcher_name as playerName,
                COUNT(result) as battersFaced,
                SUM(CASE WHEN result = 'strikeout' THEN 1 ELSE 0 END) as strikeouts,
                SUM(CASE WHEN result = 'walk' THEN 1 ELSE 0 END) as walks,
                SUM(CASE WHEN result IN ('single', 'double', 'triple', 'home_run') THEN 1 ELSE 0 END) as hitsAllowed,
                SUM(CASE WHEN result IN ('groundout', 'flyout', 'strikeout') THEN 1 WHEN result = 'double_play' THEN 2 ELSE 0 END) as outs
            FROM at_bats
            JOIN matches ON at_bats.match_id = matches.id
            WHERE matches.team_id = ? AND matches.status = 'completed' AND pitcher_name IS NOT NULL
            GROUP BY pitcher_name
            ORDER BY outs DESC, strikeouts DESC
        `).bind(teamId).all();

        return c.json(results);
    } catch (e) {
        console.error("投手スタッツ集計エラー:", e);
        return c.json({ error: '成績の取得に失敗しました' }, 500);
    }
});

// 💡 スプレーチャート（打球方向）用のデータを取得するAPI
app.get('/api/teams/:id/spray-chart', async (c) => {
    const teamId = c.req.param('id');
    try {
        const { results } = await c.env.DB.prepare(`
            SELECT p.hit_x as hitX, p.hit_y as hitY, p.result, ab.batter_name as batterName
            FROM pitches p
            JOIN at_bats ab ON p.at_bat_id = ab.id
            JOIN matches m ON ab.match_id = m.id
            WHERE m.team_id = ? AND m.status = 'completed' AND p.hit_x IS NOT NULL AND p.hit_y IS NOT NULL AND ab.batter_name IS NOT NULL
        `).bind(teamId).all();

        return c.json(results);
    } catch (e) {
        console.error("スプレーチャート取得エラー:", e);
        return c.json({ error: 'データの取得に失敗しました' }, 500);
    }
});

export default {
    async fetch(request: Request, env: any, ctx: ExecutionContext) {
        const url = new URL(request.url)
        if (url.pathname.startsWith('/api/')) return app.fetch(request, env, ctx)
        return env.ASSETS.fetch(request)
    }

}






