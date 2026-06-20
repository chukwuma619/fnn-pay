import { neon } from '@neondatabase/serverless'
import { drizzle as drizzleNeonHttp } from 'drizzle-orm/neon-http'
import { drizzle as drizzlePostgresJs } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

import * as schema from './schema'

function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error('DATABASE_URL is required')
  }
  return url
}

function isNeonDatabase(url: string): boolean {
  try {
    return new URL(url).hostname.endsWith('.neon.tech')
  } catch {
    return false
  }
}

function createDb() {
  const databaseUrl = getDatabaseUrl()

  if (isNeonDatabase(databaseUrl)) {
    const sql = neon(databaseUrl)
    return drizzleNeonHttp({ client: sql, schema })
  }

  const client = postgres(databaseUrl)
  return drizzlePostgresJs({ client, schema })
}

export const db = createDb()
export * from './schema'
