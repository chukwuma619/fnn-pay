import { sql } from 'drizzle-orm'
import { Hono } from 'hono'

import { db } from './db'

const app = new Hono()

app.get('/', (c) => {
  return c.json({
    name: 'fnnpay-server',
    status: 'ok',
  })
})

app.get('/health', async (c) => {
  try {
    await db.execute(sql`select 1`)
    return c.json({ status: 'ok', db: 'ok' })
  } catch {
    return c.json({ status: 'degraded', db: 'error' }, 503)
  }
})

const port = Number(process.env.PORT ?? 3001)

export default {
  port,
  hostname: '0.0.0.0',
  fetch: app.fetch,
}
