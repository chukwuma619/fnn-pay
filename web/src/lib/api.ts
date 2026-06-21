function getApiBaseUrl(): string {
  return import.meta.env.VITE_API_URL ?? 'http://localhost:3001'
}

type ApiError = {
  error: string
  availablePermissions?: string[]
}

export type StoreRecord = {
  id: string
  name: string
  websiteUrl: string | null
  brandColor: string | null
  logoUrl: string | null
  defaultCurrency: string
  createdAt: string
  updatedAt: string
}

export type StoreApiKeyRecord = {
  id: string
  label: string
  keyPrefix: string
  permissions: string[]
  createdAt: string
  lastUsedAt: string | null
}

async function apiFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<{ data?: T; error?: ApiError; status: number }> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  })

  const payload = await response.json().catch(() => null)

  if (!response.ok) {
    return {
      error: payload ?? { error: 'Request failed' },
      status: response.status,
    }
  }

  return { data: payload as T, status: response.status }
}

export async function listStores() {
  return apiFetch<{ stores: StoreRecord[] }>('/api/stores')
}

export async function createStore(input: {
  name: string
  websiteUrl?: string
  brandColor?: string
  logoUrl?: string
  defaultCurrency?: string
}) {
  return apiFetch<{ store: StoreRecord }>('/api/stores', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export async function getStore(storeId: string) {
  return apiFetch<{ store: StoreRecord }>(`/api/stores/${storeId}`)
}

export async function updateStore(
  storeId: string,
  input: Partial<{
    name: string
    websiteUrl: string | null
    brandColor: string | null
    logoUrl: string | null
    defaultCurrency: string
  }>,
) {
  return apiFetch<{ store: StoreRecord }>(`/api/stores/${storeId}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  })
}

export async function deleteStore(storeId: string) {
  return apiFetch<{ success: boolean }>(`/api/stores/${storeId}`, {
    method: 'DELETE',
  })
}

export async function listStoreApiKeys(storeId: string) {
  return apiFetch<{ apiKeys: StoreApiKeyRecord[] }>(
    `/api/stores/${storeId}/api-keys`,
  )
}

export async function createStoreApiKey(
  storeId: string,
  input: { label: string; permissions: string[] },
) {
  return apiFetch<{ apiKey: StoreApiKeyRecord; key: string }>(
    `/api/stores/${storeId}/api-keys`,
    {
      method: 'POST',
      body: JSON.stringify(input),
    },
  )
}

export async function deleteStoreApiKey(storeId: string, apiKeyId: string) {
  return apiFetch<{ success: boolean }>(
    `/api/stores/${storeId}/api-keys/${apiKeyId}`,
    {
      method: 'DELETE',
    },
  )
}

export async function listStoreApiKeyPermissions() {
  return apiFetch<{ permissions: string[] }>('/api/stores/permissions')
}

export const storeApiKeyPermissionLabels: Record<string, string> = {
  'store:read': 'View store settings',
  'store:write': 'Modify store settings',
  'invoice:create': 'Create invoices',
  'invoice:read': 'View invoices',
  'webhook:manage': 'Manage webhooks',
}
