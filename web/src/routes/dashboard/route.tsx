import { createFileRoute, Outlet, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'

import { AppSidebar } from '#/components/dashboard/app-sidebar'
import { DashboardHeader } from '#/components/dashboard/dashboard-header'
import {
  SidebarInset,
  SidebarProvider,
} from '#/components/ui/sidebar'
import { authClient } from '#/lib/auth-client'

export const Route = createFileRoute('/dashboard')({
  component: DashboardLayout,
})

function DashboardLayout() {
  const navigate = useNavigate()
  const session = authClient.useSession()

  useEffect(() => {
    if (!session.isPending && !session.data) {
      void navigate({ to: '/login' })
    }
  }, [session.data, session.isPending, navigate])

  if (session.isPending || !session.data) {
    return null
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <DashboardHeader />
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
