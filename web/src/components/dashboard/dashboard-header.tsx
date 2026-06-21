import { useRouterState } from '@tanstack/react-router'

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '#/components/ui/breadcrumb'
import { Separator } from '#/components/ui/separator'
import { SidebarTrigger } from '#/components/ui/sidebar'
import { useStores } from '#/lib/store-context'

const pageTitles: Record<string, string> = {
  '/dashboard': 'Overview',
  '/dashboard/stores': 'Stores',
  '/dashboard/invoices': 'Invoices',
  '/dashboard/payments': 'Payments',
  '/dashboard/webhooks': 'Webhooks',
  '/dashboard/settings': 'Settings',
}

function getPageTitle(pathname: string): string {
  if (pathname.startsWith('/dashboard/stores/') && pathname !== '/dashboard/stores/') {
    return 'Store settings'
  }

  return pageTitles[pathname] ?? 'Dashboard'
}

export function DashboardHeader() {
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const { activeStore } = useStores()
  const pageTitle = getPageTitle(pathname)

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator
        orientation="vertical"
        className="mr-2 data-[orientation=vertical]:h-4"
      />
      <Breadcrumb>
        <BreadcrumbList>
          {activeStore ? (
            <>
              <BreadcrumbItem>
                <span className="text-muted-foreground">{activeStore.name}</span>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
            </>
          ) : null}
          <BreadcrumbItem>
            <BreadcrumbPage>{pageTitle}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </header>
  )
}
