// src/api/auth.ts
import { Hono } from 'hono'
import { getAuth } from "@/lib/auth"

const app = new Hono<{ Bindings: { DB: D1Database, ASSETS: Fetcher } }>()

app.all('/*', async (c) => {
    const auth = getAuth(c.env.DB, c.env)
    return auth.handler(c.req.raw)
})

export default app