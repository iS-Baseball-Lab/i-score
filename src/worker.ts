// filepath: src/worker.ts
import { Hono } from 'hono'
import authRoute from './api/auth'
import orgsRoute from './api/orgs'
import teamsRoute from './api/teams'
import matchesRoute from './api/matches'
import webhookRoute from './api/matches/webhook' // 💡 追加
import adminRoute from './api/admin'
import imagesRouter from './api/images'
import seed from './api/seed'
import tournaments from './api/tournaments'
import type { WorkerEnv } from './types/api'

const app = new Hono<{ Bindings: WorkerEnv }>() // 💡 WorkerEnv を使用

// 💡 整理整頓された美しいルーティング
app.route('/api/auth', authRoute)
app.route('/api/organizations', orgsRoute)
app.route('/api/teams', teamsRoute)
app.route('/api/matches', matchesRoute)
app.route('/api/matches/webhook', webhookRoute) // 🌟 ここにマウント！
app.route('/api/admin', adminRoute)
app.route('/api/images', imagesRouter)
app.route('/api/seed', seed)
app.route('/api/tournaments', tournaments)

export default {
  async fetch(request: Request, env: WorkerEnv, ctx: ExecutionContext) {
    const url = new URL(request.url)
    // 💡 Hono (app.fetch) に env と ctx を渡して実行
    if (url.pathname.startsWith('/api/')) return app.fetch(request, env, ctx)
    return env.ASSETS.fetch(request)
  }
}
