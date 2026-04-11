// src/worker.ts
import { Hono } from 'hono'
import authRoute from './api/auth'
import orgsRoute from './api/orgs'
import teamsRoute from './api/teams'
import matchesRoute from './api/matches'
import adminRoute from './api/admin'
import imagesRouter from './api/images'
import seed from './api/seed'
import tournaments from './api/tournaments'
import type { WorkerEnv } from './types/api'

const app = new Hono<{ Bindings: { DB: D1Database, ASSETS: Fetcher } }>()

// 💡 整理整頓された美しいルーティング（各ファイルを特定パスにマウント）
app.route('/api/auth', authRoute)
app.route('/api/organizations', orgsRoute)
app.route('/api/teams', teamsRoute)
app.route('/api/matches', matchesRoute)
app.route('/api/admin', adminRoute)
app.route('/api/images', imagesRouter)
app.route('/api/seed', seed)
app.route('/api/tournaments', tournaments)

export default {
  async fetch(request: Request, env: WorkerEnv, ctx: ExecutionContext) {
    const url = new URL(request.url)
    if (url.pathname.startsWith('/api/')) return app.fetch(request, env, ctx)
    return env.ASSETS.fetch(request)
  }
}
