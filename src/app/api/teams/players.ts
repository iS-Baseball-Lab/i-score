import { Hono } from 'hono'

const app = new Hono<{ Bindings: { DB: D1Database } }>()

app.get('/:teamId/players', async (c) => {
  const teamId = c.req.param('teamId');
  try {
    const { results } = await c.env.DB.prepare(
      `SELECT id, team_id, name, uniform_number as uniformNumber, created_at 
       FROM players WHERE team_id = ? ORDER BY CAST(uniform_number AS INTEGER) ASC`
    ).bind(teamId).all();
    return c.json(results);
  } catch (e) { return c.json({ error: '選手の取得に失敗しました' }, 500); }
});

app.post('/:teamId/players', async (c) => {
  const teamId = c.req.param('teamId');
  const body = await c.req.json();
  const playerId = crypto.randomUUID();
  try {
    await c.env.DB.prepare(`INSERT INTO players (id, team_id, name, uniform_number) VALUES (?, ?, ?, ?)`).bind(playerId, teamId, body.name, body.uniformNumber).run();
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

export default app;