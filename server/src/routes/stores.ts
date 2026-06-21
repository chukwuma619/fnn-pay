import { and, eq } from 'drizzle-orm'
import { Hono } from 'hono'

import type { auth } from '../auth'
import { db } from '../db'
import { store, storeApiKey } from '../db/schema/stores'
import {
  generateApiKey,
  isStoreApiKeyPermission,
  storeApiKeyPermissions,
} from '../lib/api-keys'
import { requireAuth } from '../lib/auth-middleware'

type AuthVariables = {
  user: typeof auth.$Infer.Session.user | null
  session: typeof auth.$Infer.Session.session | null
}

function serializeStore(record: typeof store.$inferSelect) {
  return {
    id: record.id,
    name: record.name,
    websiteUrl: record.websiteUrl,
    brandColor: record.brandColor,
    logoUrl: record.logoUrl,
    defaultCurrency: record.defaultCurrency,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  }
}

function serializeApiKey(record: typeof storeApiKey.$inferSelect) {
  return {
    id: record.id,
    label: record.label,
    keyPrefix: record.keyPrefix,
    permissions: record.permissions,
    createdAt: record.createdAt.toISOString(),
    lastUsedAt: record.lastUsedAt?.toISOString() ?? null,
  }
}

async function getOwnedStore(userId: string, storeId: string) {
  const [record] = await db
    .select()
    .from(store)
    .where(and(eq(store.id, storeId), eq(store.userId, userId)))
    .limit(1)

  return record ?? null
}

function parsePermissions(value: unknown): string[] | null {
  if (!Array.isArray(value) || value.length === 0) {
    return null
  }

  const permissions = value.filter(
    (permission): permission is string => typeof permission === 'string',
  )

  if (permissions.length !== value.length) {
    return null
  }

  if (!permissions.every(isStoreApiKeyPermission)) {
    return null
  }

  return permissions
}

export const storesRoutes = new Hono<{ Variables: AuthVariables }>()

storesRoutes.use('*', requireAuth)

storesRoutes.get('/permissions', (c) => {
  return c.json({ permissions: storeApiKeyPermissions })
})

storesRoutes.get('/', async (c) => {
  const user = c.get('user')!
  const stores = await db
    .select()
    .from(store)
    .where(eq(store.userId, user.id))
    .orderBy(store.createdAt)

  return c.json({ stores: stores.map(serializeStore) })
})

storesRoutes.post('/', async (c) => {
  const user = c.get('user')!
  const body = await c.req.json().catch(() => null)

  if (!body || typeof body.name !== 'string' || !body.name.trim()) {
    return c.json({ error: 'Store name is required' }, 400)
  }

  const name = body.name.trim()
  const id = crypto.randomUUID()

  const [created] = await db
    .insert(store)
    .values({
      id,
      userId: user.id,
      name,
      websiteUrl:
        typeof body.websiteUrl === 'string' && body.websiteUrl.trim()
          ? body.websiteUrl.trim()
          : null,
      brandColor:
        typeof body.brandColor === 'string' && body.brandColor.trim()
          ? body.brandColor.trim()
          : null,
      logoUrl:
        typeof body.logoUrl === 'string' && body.logoUrl.trim()
          ? body.logoUrl.trim()
          : null,
      defaultCurrency:
        typeof body.defaultCurrency === 'string' && body.defaultCurrency.trim()
          ? body.defaultCurrency.trim().toUpperCase()
          : 'USD',
    })
    .returning()

  return c.json({ store: serializeStore(created!) }, 201)
})

storesRoutes.get('/:storeId', async (c) => {
  const user = c.get('user')!
  const record = await getOwnedStore(user.id, c.req.param('storeId'))

  if (!record) {
    return c.json({ error: 'Store not found' }, 404)
  }

  return c.json({ store: serializeStore(record) })
})

storesRoutes.patch('/:storeId', async (c) => {
  const user = c.get('user')!
  const storeId = c.req.param('storeId')
  const record = await getOwnedStore(user.id, storeId)

  if (!record) {
    return c.json({ error: 'Store not found' }, 404)
  }

  const body = await c.req.json().catch(() => null)
  if (!body || typeof body !== 'object') {
    return c.json({ error: 'Invalid request body' }, 400)
  }

  const updates: Partial<typeof store.$inferInsert> = {}

  if ('name' in body) {
    if (typeof body.name !== 'string' || !body.name.trim()) {
      return c.json({ error: 'Store name cannot be empty' }, 400)
    }
    updates.name = body.name.trim()
  }

  if ('websiteUrl' in body) {
    if (body.websiteUrl === null || body.websiteUrl === '') {
      updates.websiteUrl = null
    } else if (typeof body.websiteUrl === 'string') {
      updates.websiteUrl = body.websiteUrl.trim() || null
    } else {
      return c.json({ error: 'Invalid website URL' }, 400)
    }
  }

  if ('brandColor' in body) {
    if (body.brandColor === null || body.brandColor === '') {
      updates.brandColor = null
    } else if (typeof body.brandColor === 'string') {
      updates.brandColor = body.brandColor.trim() || null
    } else {
      return c.json({ error: 'Invalid brand color' }, 400)
    }
  }

  if ('logoUrl' in body) {
    if (body.logoUrl === null || body.logoUrl === '') {
      updates.logoUrl = null
    } else if (typeof body.logoUrl === 'string') {
      updates.logoUrl = body.logoUrl.trim() || null
    } else {
      return c.json({ error: 'Invalid logo URL' }, 400)
    }
  }

  if ('defaultCurrency' in body) {
    if (typeof body.defaultCurrency !== 'string' || !body.defaultCurrency.trim()) {
      return c.json({ error: 'Invalid default currency' }, 400)
    }
    updates.defaultCurrency = body.defaultCurrency.trim().toUpperCase()
  }

  if (Object.keys(updates).length === 0) {
    return c.json({ store: serializeStore(record) })
  }

  const [updated] = await db
    .update(store)
    .set(updates)
    .where(eq(store.id, storeId))
    .returning()

  return c.json({ store: serializeStore(updated!) })
})

storesRoutes.delete('/:storeId', async (c) => {
  const user = c.get('user')!
  const storeId = c.req.param('storeId')
  const record = await getOwnedStore(user.id, storeId)

  if (!record) {
    return c.json({ error: 'Store not found' }, 404)
  }

  await db.delete(store).where(eq(store.id, storeId))

  return c.json({ success: true })
})

storesRoutes.get('/:storeId/api-keys', async (c) => {
  const user = c.get('user')!
  const storeId = c.req.param('storeId')
  const record = await getOwnedStore(user.id, storeId)

  if (!record) {
    return c.json({ error: 'Store not found' }, 404)
  }

  const apiKeys = await db
    .select()
    .from(storeApiKey)
    .where(eq(storeApiKey.storeId, storeId))
    .orderBy(storeApiKey.createdAt)

  return c.json({ apiKeys: apiKeys.map(serializeApiKey) })
})

storesRoutes.post('/:storeId/api-keys', async (c) => {
  const user = c.get('user')!
  const storeId = c.req.param('storeId')
  const record = await getOwnedStore(user.id, storeId)

  if (!record) {
    return c.json({ error: 'Store not found' }, 404)
  }

  const body = await c.req.json().catch(() => null)
  if (!body || typeof body.label !== 'string' || !body.label.trim()) {
    return c.json({ error: 'API key label is required' }, 400)
  }

  const permissions = parsePermissions(body.permissions)
  if (!permissions) {
    return c.json(
      {
        error: 'Invalid permissions',
        availablePermissions: storeApiKeyPermissions,
      },
      400,
    )
  }

  const { key, keyPrefix, keyHash } = generateApiKey()
  const id = crypto.randomUUID()

  const [created] = await db
    .insert(storeApiKey)
    .values({
      id,
      storeId,
      label: body.label.trim(),
      keyPrefix,
      keyHash,
      permissions,
    })
    .returning()

  return c.json(
    {
      apiKey: serializeApiKey(created!),
      key,
    },
    201,
  )
})

storesRoutes.delete('/:storeId/api-keys/:apiKeyId', async (c) => {
  const user = c.get('user')!
  const storeId = c.req.param('storeId')
  const apiKeyId = c.req.param('apiKeyId')
  const record = await getOwnedStore(user.id, storeId)

  if (!record) {
    return c.json({ error: 'Store not found' }, 404)
  }

  const [deleted] = await db
    .delete(storeApiKey)
    .where(and(eq(storeApiKey.id, apiKeyId), eq(storeApiKey.storeId, storeId)))
    .returning()

  if (!deleted) {
    return c.json({ error: 'API key not found' }, 404)
  }

  return c.json({ success: true })
})
