import { Hono } from 'hono'

const app = new Hono()

app.get('/', (c) => {
  return c.json({
    name: 'fnnpay-server',
    status: 'ok',
  })
})

app.get('/health', (c) => {
  return c.json({ status: 'ok' })
})

const port = Number(process.env.PORT ?? 3001)

export default {
  port,
  hostname: '0.0.0.0',
  fetch: app.fetch,
}
