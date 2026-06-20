import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'

import { db } from './db'
import * as schema from './db/schema'

function getTrustedOrigins(): string[] {
  const configured = process.env.BETTER_AUTH_TRUSTED_ORIGINS
  if (configured) {
    return configured.split(',').map((origin) => origin.trim())
  }
  return ['http://localhost:3000']
}

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema,
  }),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL ?? 'http://localhost:3001',
  trustedOrigins: getTrustedOrigins(),
  emailAndPassword: {
    enabled: true,
  },
})

export type AuthSession = typeof auth.$Infer.Session
