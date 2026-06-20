import { sql } from 'drizzle-orm'
import { cors } from 'hono/cors'
import { Hono } from 'hono'

import { auth } from './auth'
import { db } from './db'

function getTrustedOrigins(): string[] {
  const configured = process.env.BETTER_AUTH_TRUSTED_ORIGINS
  if (configured) {
    return configured.split(',').map((origin) => origin.trim())
  }
  return ['http://localhost:3000']
}

const trustedOrigins = getTrustedOrigins()

type AuthVariables = {
  user: typeof auth.$Infer.Session.user | null
  session: typeof auth.$Infer.Session.session | null
}

const app = new Hono<{ Variables: AuthVariables }>()

app.use(
  '*',
  cors({
    origin: (origin) => {
      if (!origin || trustedOrigins.includes(origin)) {
        return origin ?? trustedOrigins[0]!
      }
      return trustedOrigins[0]!
    },
    allowHeaders: ['Content-Type', 'Authorization'],
    allowMethods: ['POST', 'GET', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  }),
)

app.use('*', async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers })
  c.set('user', session?.user ?? null)
  c.set('session', session?.session ?? null)
  await next()
})

app.on(['POST', 'GET'], '/api/auth/*', (c) => {
  return auth.handler(c.req.raw)
})

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

app.get('/api/me', (c) => {
  const user = c.get('user')
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401)
  }
  return c.json({ user })
})

const port = Number(process.env.PORT ?? 3001)

export default {
  port,
  hostname: '0.0.0.0',
  fetch: app.fetch,
}
