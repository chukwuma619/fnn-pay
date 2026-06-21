import { createFileRoute, Link } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'
import { ArrowLeft, Copy, KeyRound, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'

import { Button } from '#/components/ui/button'
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '#/components/ui/field'
import { Input } from '#/components/ui/input'
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
import { getFieldErrors, isFieldInvalid } from '#/lib/forms/field-utils'
import { apiKeySchema, storeSettingsSchema } from '#/lib/forms/schemas'
import { useStores } from '#/lib/store-context'

export const Route = createFileRoute('/dashboard/stores/$storeId')({
  component: StoreSettingsPage,
})

function StoreSettingsForm({
  store,
  onSaved,
  onError,
}: {
  store: StoreRecord
  onSaved: (store: StoreRecord) => void
  onError: (message: string) => void
}) {
  const { refreshStores } = useStores()

  const form = useForm({
    defaultValues: {
      name: store.name,
      websiteUrl: store.websiteUrl ?? '',
      defaultCurrency: store.defaultCurrency,
    },
    validators: {
      onSubmit: storeSettingsSchema,
    },
    onSubmit: async ({ value }) => {
      const result = await updateStore(store.id, {
        name: value.name,
        websiteUrl: value.websiteUrl.trim() || null,
        defaultCurrency: value.defaultCurrency,
      })

      if (result.error) {
        onError(result.error.error)
        return
      }

      const updatedStore = result.data?.store
      if (updatedStore) {
        onSaved(updatedStore)
      }

      await refreshStores()
      onError('Store settings saved.')
    },
  })

  useEffect(() => {
    form.reset({
      name: store.name,
      websiteUrl: store.websiteUrl ?? '',
      defaultCurrency: store.defaultCurrency,
    })
  }, [form, store.defaultCurrency, store.id, store.name, store.websiteUrl])

  return (
    <form
      id="store-settings-form"
      className="mt-6 grid gap-4 md:grid-cols-2"
      onSubmit={(event) => {
        event.preventDefault()
        void form.handleSubmit()
      }}
    >
      <FieldGroup className="contents">
        <form.Field
          name="name"
          children={(field) => {
            const invalid = isFieldInvalid(field.state.meta)

            return (
              <Field
                className="md:col-span-2"
                data-invalid={invalid || undefined}
              >
                <FieldLabel htmlFor="store-settings-name">Store name</FieldLabel>
                <Input
                  id="store-settings-name"
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  aria-invalid={invalid}
                />
                {invalid ? (
                  <FieldError errors={getFieldErrors(field.state.meta.errors)} />
                ) : null}
              </Field>
            )
          }}
        />

        <form.Field
          name="websiteUrl"
          children={(field) => {
            const invalid = isFieldInvalid(field.state.meta)

            return (
              <Field
                className="md:col-span-2"
                data-invalid={invalid || undefined}
              >
                <FieldLabel htmlFor="store-settings-website">Website</FieldLabel>
                <Input
                  id="store-settings-website"
                  name={field.name}
                  type="url"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  placeholder="https://example.com"
                  aria-invalid={invalid}
                />
                {invalid ? (
                  <FieldError errors={getFieldErrors(field.state.meta.errors)} />
                ) : null}
              </Field>
            )
          }}
        />

        <form.Field
          name="defaultCurrency"
          children={(field) => {
            const invalid = isFieldInvalid(field.state.meta)

            return (
              <Field data-invalid={invalid || undefined}>
                <FieldLabel htmlFor="store-settings-currency">
                  Default currency
                </FieldLabel>
                <Input
                  id="store-settings-currency"
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  aria-invalid={invalid}
                />
                {invalid ? (
                  <FieldError errors={getFieldErrors(field.state.meta.errors)} />
                ) : null}
              </Field>
            )
          }}
        />
      </FieldGroup>

      <div className="md:col-span-2">
        <form.Subscribe selector={(state) => state.isSubmitting}>
          {(isSubmitting) => (
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving…' : 'Save settings'}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </form>
  )
}

function StoreApiKeyForm({
  storeId,
  availablePermissions,
  onCreated,
  onError,
}: {
  storeId: string
  availablePermissions: string[]
  onCreated: (apiKey: StoreApiKeyRecord, key: string) => void
  onError: (message: string) => void
}) {
  const form = useForm({
    defaultValues: {
      label: '',
      permissions: ['store:read', 'invoice:create', 'invoice:read'],
    },
    validators: {
      onSubmit: apiKeySchema,
    },
    onSubmit: async ({ value }) => {
      const result = await createStoreApiKey(storeId, {
        label: value.label,
        permissions: value.permissions,
      })

      if (result.error) {
        onError(result.error.error)
        return
      }

      const createdKey = result.data?.key
      const createdApiKey = result.data?.apiKey

      if (!createdKey || !createdApiKey) {
        onError('Unable to create API key')
        return
      }

      form.reset({
        label: '',
        permissions: ['store:read', 'invoice:create', 'invoice:read'],
      })
      onCreated(createdApiKey, createdKey)
    },
  })

  return (
    <form
      id="store-api-key-form"
      className="mt-6 space-y-4"
      onSubmit={(event) => {
        event.preventDefault()
        void form.handleSubmit()
      }}
    >
      <FieldGroup>
        <form.Field
          name="label"
          children={(field) => {
            const invalid = isFieldInvalid(field.state.meta)

            return (
              <Field data-invalid={invalid || undefined}>
                <FieldLabel htmlFor="api-key-label">Label</FieldLabel>
                <Input
                  id="api-key-label"
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  placeholder="POS integration"
                  aria-invalid={invalid}
                />
                {invalid ? (
                  <FieldError errors={getFieldErrors(field.state.meta.errors)} />
                ) : null}
              </Field>
            )
          }}
        />

        <form.Field
          name="permissions"
          mode="array"
          children={(field) => {
            const invalid = isFieldInvalid(field.state.meta)

            return (
              <Field data-invalid={invalid || undefined}>
                <FieldLabel>Permissions</FieldLabel>
                <div className="space-y-3">
                  {availablePermissions.map((permission) => (
                    <Field
                      key={permission}
                      orientation="horizontal"
                      className="rounded-lg border px-4 py-3"
                    >
                      <FieldContent>
                        <p className="text-sm font-medium">
                          {storeApiKeyPermissionLabels[permission] ?? permission}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {permission}
                        </p>
                      </FieldContent>
                      <Switch
                        checked={field.state.value.includes(permission)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            field.pushValue(permission)
                            return
                          }

                          const index = field.state.value.indexOf(permission)
                          if (index > -1) {
                            field.removeValue(index)
                          }
                        }}
                        aria-invalid={invalid}
                      />
                    </Field>
                  ))}
                </div>
                {invalid ? (
                  <FieldError errors={getFieldErrors(field.state.meta.errors)} />
                ) : null}
              </Field>
            )
          }}
        />
      </FieldGroup>

      <form.Subscribe selector={(state) => state.isSubmitting}>
        {(isSubmitting) => (
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating…' : 'Create API key'}
          </Button>
        )}
      </form.Subscribe>
    </form>
  )
}

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
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [createdApiKey, setCreatedApiKey] = useState<string | null>(null)

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

      setStore(storeResult.data?.store ?? null)

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
      setStatusMessage(result.error.error)
      return
    }

    await refreshStores()
    window.location.href = '/dashboard/stores'
  }

  async function handleDeleteApiKey(apiKeyId: string) {
    const confirmed = window.confirm('Revoke this API key?')
    if (!confirmed) {
      return
    }

    const result = await deleteStoreApiKey(storeId, apiKeyId)
    if (result.error) {
      setStatusMessage(result.error.error)
      return
    }

    setApiKeys((current) => current.filter((entry) => entry.id !== apiKeyId))
  }

  async function copyCreatedApiKey() {
    if (!createdApiKey) {
      return
    }

    await navigator.clipboard.writeText(createdApiKey)
    setStatusMessage('API key copied to clipboard.')
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

      {statusMessage ? (
        <section className="rounded-xl border bg-muted/40 p-4 text-sm">
          {statusMessage}
        </section>
      ) : null}

      <section className="rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
        <h2 className="text-lg font-semibold">General settings</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Basic store metadata used across invoices and checkout.
        </p>

        <StoreSettingsForm
          store={store}
          onSaved={setStore}
          onError={setStatusMessage}
        />
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

        <StoreApiKeyForm
          storeId={storeId}
          availablePermissions={availablePermissions}
          onCreated={(apiKey, key) => {
            setCreatedApiKey(key)
            setApiKeys((current) => [apiKey, ...current])
            setStatusMessage(null)
          }}
          onError={setStatusMessage}
        />

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
