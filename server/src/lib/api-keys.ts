import { createHash, randomBytes } from 'node:crypto'

const API_KEY_PREFIX = 'fnn_'

export function generateApiKey(): { key: string; keyPrefix: string; keyHash: string } {
  const secret = randomBytes(32).toString('hex')
  const key = `${API_KEY_PREFIX}${secret}`
  const keyPrefix = key.slice(0, 12)
  const keyHash = hashApiKey(key)

  return { key, keyPrefix, keyHash }
}

export function hashApiKey(key: string): string {
  return createHash('sha256').update(key).digest('hex')
}

export const storeApiKeyPermissions = [
  'store:read',
  'store:write',
  'invoice:create',
  'invoice:read',
  'webhook:manage',
] as const

export type StoreApiKeyPermission = (typeof storeApiKeyPermissions)[number]

export function isStoreApiKeyPermission(
  value: string,
): value is StoreApiKeyPermission {
  return storeApiKeyPermissions.includes(value as StoreApiKeyPermission)
}
