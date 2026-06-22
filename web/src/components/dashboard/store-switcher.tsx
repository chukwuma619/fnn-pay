import { Link } from '@tanstack/react-router'
import { Check, ChevronsUpDown, Plus, Store } from 'lucide-react'
import { useState } from 'react'

import { CreateStoreSheetContent } from '#/components/dashboard/create-store-form'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu'
import { Sheet, SheetContent } from '#/components/ui/sheet'
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
          <CreateStoreSheetContent
            open={isCreateOpen}
            formId="store-switcher-create-store"
            fieldIdPrefix="store-switcher"
            title="Create store"
            description="Add a new merchant store"
            onSubmit={createNewStore}
            onSuccess={() => setIsCreateOpen(false)}
          />
        </SheetContent>
      </Sheet>
    </>
  )
}
