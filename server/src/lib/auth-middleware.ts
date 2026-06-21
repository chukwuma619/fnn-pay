import type { Context, Next } from 'hono'

import type { auth } from '../auth'

type AuthVariables = {
  user: typeof auth.$Infer.Session.user | null
  session: typeof auth.$Infer.Session.session | null
}

export async function requireAuth(
  c: Context<{ Variables: AuthVariables }>,
  next: Next,
) {
  const user = c.get('user')
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  await next()
}
