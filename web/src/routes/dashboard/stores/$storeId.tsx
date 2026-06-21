import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft, Copy, KeyRound, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'

import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { Skeleton } from '#/components/ui/skeleton'
import { Switch } from '#/components/ui/switch'
import {
  createStoreApiKey,
  deleteStore,
  deleteStoreApiKey,
  getStore,
  listStoreApiKeyPermissions,
  listStoreApiKeys,
  storeApiKeyPermissionLabels,
  updateStore,
} from '#/lib/api'
import type { StoreApiKeyRecord, StoreRecord } from '#/lib/api'
import { useStores } from '#/lib/store-context'

export const Route = createFileRoute('/dashboard/stores/$storeId')({
  component: StoreSettingsPage,
})

function StoreSettingsPage() {
  const { storeId } = Route.useParams()
  const { refreshStores, setActiveStoreId } = useStores()
  const [store, setStore] = useState<StoreRecord | null>(null)
  const [apiKeys, setApiKeys] = useState<StoreApiKeyRecord[]>([])
  const [availablePermissions, setAvailablePermissions] = useState<string[]>(
    [],
  )
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const [name, setName] = useState('')
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [defaultCurrency, setDefaultCurrency] = useState('USD')

  const [apiKeyLabel, setApiKeyLabel] = useState('')
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([
    'store:read',
    'invoice:create',
    'invoice:read',
  ])
  const [createdApiKey, setCreatedApiKey] = useState<string | null>(null)
  const [isCreatingApiKey, setIsCreatingApiKey] = useState(false)

  useEffect(() => {
    async function loadStoreData() {
      setIsLoading(true)
      setError(null)

      const [storeResult, apiKeysResult, permissionsResult] = await Promise.all(
        [
          getStore(storeId),
          listStoreApiKeys(storeId),
          listStoreApiKeyPermissions(),
        ],
      )

      if (storeResult.error) {
        setError(storeResult.error.error)
        setIsLoading(false)
        return
      }

      const nextStore = storeResult.data?.store ?? null
      setStore(nextStore)
      if (nextStore) {
        setName(nextStore.name)
        setWebsiteUrl(nextStore.websiteUrl ?? '')
        setDefaultCurrency(nextStore.defaultCurrency)
      }

      if (apiKeysResult.error) {
        setError(apiKeysResult.error.error)
      } else {
        setApiKeys(apiKeysResult.data?.apiKeys ?? [])
      }

      if (permissionsResult.data?.permissions) {
        setAvailablePermissions(permissionsResult.data.permissions)
      }

      setIsLoading(false)
    }

    void loadStoreData()
  }, [storeId])

  async function handleSaveGeneral(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaveMessage(null)
    setIsSaving(true)

    const result = await updateStore(storeId, {
      name,
      websiteUrl: websiteUrl.trim() || null,
      defaultCurrency,
    })

    setIsSaving(false)

    if (result.error) {
      setSaveMessage(result.error.error)
      return
    }

    const updatedStore = result.data?.store ?? null
    setStore(updatedStore)
    await refreshStores()
    setSaveMessage('Store settings saved.')
  }

  async function handleDeleteStore() {
    const confirmed = window.confirm(
      `Delete "${store?.name ?? 'this store'}"? This cannot be undone.`,
    )
    if (!confirmed) {
      return
    }

    setIsDeleting(true)
    const result = await deleteStore(storeId)
    setIsDeleting(false)

    if (result.error) {
      setSaveMessage(result.error.error)
      return
    }

    await refreshStores()
    window.location.href = '/dashboard/stores'
  }

  function togglePermission(permission: string, enabled: boolean) {
    setSelectedPermissions((current) => {
      if (enabled) {
        return current.includes(permission)
          ? current
          : [...current, permission]
      }

      return current.filter((entry) => entry !== permission)
    })
  }

  async function handleCreateApiKey(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setCreatedApiKey(null)
    setIsCreatingApiKey(true)

    const result = await createStoreApiKey(storeId, {
      label: apiKeyLabel,
      permissions: selectedPermissions,
    })

    setIsCreatingApiKey(false)

    if (result.error) {
      setSaveMessage(result.error.error)
      return
    }

    setCreatedApiKey(result.data?.key ?? null)
    setApiKeyLabel('')
    setApiKeys((current) => [
      ...(result.data?.apiKey ? [result.data.apiKey] : []),
      ...current,
    ])
  }

  async function handleDeleteApiKey(apiKeyId: string) {
    const confirmed = window.confirm('Revoke this API key?')
    if (!confirmed) {
      return
    }

    const result = await deleteStoreApiKey(storeId, apiKeyId)
    if (result.error) {
      setSaveMessage(result.error.error)
      return
    }

    setApiKeys((current) => current.filter((entry) => entry.id !== apiKeyId))
  }

  async function copyCreatedApiKey() {
    if (!createdApiKey) {
      return
    }

    await navigator.clipboard.writeText(createdApiKey)
    setSaveMessage('API key copied to clipboard.')
  }

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-4 py-4">
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    )
  }

  if (error || !store) {
    return (
      <div className="flex flex-1 flex-col gap-4 py-4">
        <section className="rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
          <h1 className="text-2xl font-semibold tracking-tight">
            Store not found
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {error ?? 'This store does not exist or you do not have access.'}
          </p>
          <Button className="mt-4" variant="outline" asChild>
            <Link to="/dashboard/stores">
              <ArrowLeft />
              Back to stores
            </Link>
          </Button>
        </section>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-4 py-4">
      <section className="rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Button variant="ghost" size="sm" className="-ml-2 mb-2" asChild>
              <Link to="/dashboard/stores">
                <ArrowLeft />
                All stores
              </Link>
            </Button>
            <h1 className="text-2xl font-semibold tracking-tight">
              {store.name}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Store ID: {store.id}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => setActiveStoreId(store.id)}
            >
              Set as active store
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteStore}
              disabled={isDeleting}
            >
              <Trash2 />
              {isDeleting ? 'Deleting…' : 'Delete store'}
            </Button>
          </div>
        </div>
      </section>

      {saveMessage ? (
        <section className="rounded-xl border bg-muted/40 p-4 text-sm">
          {saveMessage}
        </section>
      ) : null}

      <section className="rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
        <h2 className="text-lg font-semibold">General settings</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Basic store metadata used across invoices and checkout.
        </p>

        <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={handleSaveGeneral}>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="store-settings-name">Store name</Label>
            <Input
              id="store-settings-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="store-settings-website">Website</Label>
            <Input
              id="store-settings-website"
              type="url"
              value={websiteUrl}
              onChange={(event) => setWebsiteUrl(event.target.value)}
              placeholder="https://example.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="store-settings-currency">Default currency</Label>
            <Input
              id="store-settings-currency"
              value={defaultCurrency}
              onChange={(event) => setDefaultCurrency(event.target.value)}
              required
            />
          </div>

          <div className="md:col-span-2">
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Saving…' : 'Save settings'}
            </Button>
          </div>
        </form>
      </section>

      <section className="rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
        <div className="flex items-center gap-2">
          <KeyRound className="size-5" />
          <h2 className="text-lg font-semibold">API keys</h2>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Create scoped keys for integrations, similar to BTCPay Server Greenfield
          API keys.
        </p>

        {createdApiKey ? (
          <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
            <p className="text-sm font-medium">
              Copy your new API key now. You will not be able to see it again.
            </p>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <Input readOnly value={createdApiKey} />
              <Button type="button" variant="outline" onClick={copyCreatedApiKey}>
                <Copy />
                Copy
              </Button>
            </div>
          </div>
        ) : null}

        <form className="mt-6 space-y-4" onSubmit={handleCreateApiKey}>
          <div className="space-y-2">
            <Label htmlFor="api-key-label">Label</Label>
            <Input
              id="api-key-label"
              value={apiKeyLabel}
              onChange={(event) => setApiKeyLabel(event.target.value)}
              placeholder="POS integration"
              required
            />
          </div>

          <div className="space-y-3">
            <Label>Permissions</Label>
            {availablePermissions.map((permission) => (
              <div
                key={permission}
                className="flex items-center justify-between rounded-lg border px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium">
                    {storeApiKeyPermissionLabels[permission] ?? permission}
                  </p>
                  <p className="text-xs text-muted-foreground">{permission}</p>
                </div>
                <Switch
                  checked={selectedPermissions.includes(permission)}
                  onCheckedChange={(checked) =>
                    togglePermission(permission, checked)
                  }
                />
              </div>
            ))}
          </div>

          <Button type="submit" disabled={isCreatingApiKey}>
            {isCreatingApiKey ? 'Creating…' : 'Create API key'}
          </Button>
        </form>

        <div className="mt-8 space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Existing keys
          </h3>
          {apiKeys.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No API keys yet for this store.
            </p>
          ) : (
            apiKeys.map((entry) => (
              <div
                key={entry.id}
                className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium">{entry.label}</p>
                  <p className="text-sm text-muted-foreground">
                    {entry.keyPrefix}… · {entry.permissions.join(', ')}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteApiKey(entry.id)}
                >
                  Revoke
                </Button>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  )
}
