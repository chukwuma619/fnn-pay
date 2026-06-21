import { Link } from '@tanstack/react-router'
import { Check, ChevronsUpDown, Plus, Store } from 'lucide-react'
import { useState } from 'react'

import { Button } from '#/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu'
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
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '#/components/ui/sidebar'
import { useStores } from '#/lib/store-context'

export function StoreSwitcher() {
  const {
    stores,
    activeStore,
    isLoading,
    setActiveStoreId,
    createNewStore,
  } = useStores()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [name, setName] = useState('')
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleCreateStore(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    const result = await createNewStore({
      name,
      websiteUrl: websiteUrl.trim() || undefined,
    })

    setIsSubmitting(false)

    if (result.error) {
      setError(result.error)
      return
    }

    setName('')
    setWebsiteUrl('')
    setIsCreateOpen(false)
  }

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <span className="flex size-8 items-center justify-center rounded-lg bg-[linear-gradient(135deg,#56c6be,#7ed3bf)] text-white">
                  <Store className="size-4" />
                </span>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    {isLoading
                      ? 'Loading stores…'
                      : (activeStore?.name ?? 'No store selected')}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    {activeStore?.defaultCurrency ?? 'Create your first store'}
                  </span>
                </div>
                <ChevronsUpDown className="ml-auto size-4" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
              align="start"
              side="bottom"
              sideOffset={4}
            >
              <DropdownMenuLabel>Stores</DropdownMenuLabel>
              {stores.length === 0 ? (
                <DropdownMenuItem disabled>No stores yet</DropdownMenuItem>
              ) : (
                stores.map((entry) => (
                  <DropdownMenuItem
                    key={entry.id}
                    onClick={() => setActiveStoreId(entry.id)}
                  >
                    <Store className="size-4" />
                    <span className="flex-1 truncate">{entry.name}</span>
                    {entry.id === activeStore?.id ? (
                      <Check className="size-4" />
                    ) : null}
                  </DropdownMenuItem>
                ))
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setIsCreateOpen(true)}>
                <Plus className="size-4" />
                Create store
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/dashboard/stores">Manage stores</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      <Sheet open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Create store</SheetTitle>
            <SheetDescription>
              Add a new merchant store, similar to BTCPay Server store
              management.
            </SheetDescription>
          </SheetHeader>

          <form className="mt-6 space-y-4" onSubmit={handleCreateStore}>
            <div className="space-y-2">
              <Label htmlFor="store-name">Store name</Label>
              <Input
                id="store-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="My Coffee Shop"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="store-website">Website (optional)</Label>
              <Input
                id="store-website"
                type="url"
                value={websiteUrl}
                onChange={(event) => setWebsiteUrl(event.target.value)}
                placeholder="https://example.com"
              />
            </div>

            {error ? (
              <p className="text-sm font-medium text-destructive">{error}</p>
            ) : null}

            <SheetFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating…' : 'Create store'}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </>
  )
}
