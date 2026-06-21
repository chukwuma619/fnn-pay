import { createFileRoute, Link } from '@tanstack/react-router'
import { ExternalLink, Plus, Settings, Store } from 'lucide-react'
import { useState } from 'react'

import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '#/components/ui/sheet'
import { Skeleton } from '#/components/ui/skeleton'
import { useStores } from '#/lib/store-context'

export const Route = createFileRoute('/dashboard/stores/')({
  component: StoresPage,
})

function StoresPage() {
  const { stores, isLoading, error, createNewStore, setActiveStoreId } =
    useStores()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [name, setName] = useState('')
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleCreateStore(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError(null)
    setIsSubmitting(true)

    const result = await createNewStore({
      name,
      websiteUrl: websiteUrl.trim() || undefined,
    })

    setIsSubmitting(false)

    if (result.error) {
      setFormError(result.error)
      return
    }

    setName('')
    setWebsiteUrl('')
    setIsCreateOpen(false)
  }

  return (
    <div className="flex flex-1 flex-col gap-4 py-4">
      <section className="rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Stores</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Manage merchant stores for invoices, payments, and webhooks. Each
              store has its own settings and API keys, like BTCPay Server.
            </p>
          </div>
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus />
            Create store
          </Button>
        </div>
      </section>

      {error ? (
        <section className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {error}
        </section>
      ) : null}

      <section className="rounded-xl border bg-card text-card-foreground shadow-sm">
        {isLoading ? (
          <div className="space-y-3 p-6">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : stores.length === 0 ? (
          <div className="flex flex-col items-center gap-4 px-6 py-16 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-muted">
              <Store className="size-5 text-muted-foreground" />
            </span>
            <div>
              <h2 className="text-lg font-semibold">No stores yet</h2>
              <p className="mt-1 max-w-md text-sm text-muted-foreground">
                Create your first store to start accepting CKB payments through
                Fiber.
              </p>
            </div>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus />
              Create your first store
            </Button>
          </div>
        ) : (
          <ul className="divide-y">
            {stores.map((entry) => (
              <li
                key={entry.id}
                className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Store className="size-4 text-muted-foreground" />
                    <h2 className="truncate text-lg font-semibold">
                      {entry.name}
                    </h2>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {entry.defaultCurrency}
                  </p>
                  {entry.websiteUrl ? (
                    <a
                      href={entry.websiteUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-flex items-center gap-1 text-sm text-primary hover:underline"
                    >
                      {entry.websiteUrl}
                      <ExternalLink className="size-3.5" />
                    </a>
                  ) : null}
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setActiveStoreId(entry.id)}
                  >
                    Set active
                  </Button>
                  <Button variant="outline" asChild>
                    <Link
                      to="/dashboard/stores/$storeId"
                      params={{ storeId: entry.id }}
                    >
                      <Settings />
                      Settings
                    </Link>
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Sheet open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Create store</SheetTitle>
            <SheetDescription>
              Stores isolate invoices, webhooks, and API keys for each merchant
              brand you operate.
            </SheetDescription>
          </SheetHeader>

          <form className="mt-6 space-y-4" onSubmit={handleCreateStore}>
            <div className="space-y-2">
              <Label htmlFor="stores-page-name">Store name</Label>
              <Input
                id="stores-page-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="My Coffee Shop"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stores-page-website">Website (optional)</Label>
              <Input
                id="stores-page-website"
                type="url"
                value={websiteUrl}
                onChange={(event) => setWebsiteUrl(event.target.value)}
                placeholder="https://example.com"
              />
            </div>

            {formError ? (
              <p className="text-sm font-medium text-destructive">
                {formError}
              </p>
            ) : null}

            <SheetFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating…' : 'Create store'}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  )
}
