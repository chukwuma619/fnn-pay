import { Link, useRouterState } from '@tanstack/react-router'
import {
  ChevronUp,
  CreditCard,
  FileText,
  LayoutDashboard,
  Settings,
  Store,
  Webhook,
} from 'lucide-react'

import { StoreSwitcher } from '#/components/dashboard/store-switcher'

import { Avatar, AvatarFallback } from '#/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '#/components/ui/sidebar'
import { authClient } from '#/lib/auth-client'

const navItems = [
  {
    title: 'Overview',
    to: '/dashboard' as const,
    icon: LayoutDashboard,
  },
  {
    title: 'Stores',
    to: '/dashboard/stores' as const,
    icon: Store,
  },
  {
    title: 'Invoices',
    to: '/dashboard/invoices' as const,
    icon: FileText,
  },
  {
    title: 'Payments',
    to: '/dashboard/payments' as const,
    icon: CreditCard,
  },
  {
    title: 'Webhooks',
    to: '/dashboard/webhooks' as const,
    icon: Webhook,
  },
  {
    title: 'Settings',
    to: '/dashboard/settings' as const,
    icon: Settings,
  },
]

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export function AppSidebar() {
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  const session = authClient.useSession()
  const user = session.data?.user

  function isNavActive(path: string): boolean {
    if (path === '/dashboard') {
      return pathname === '/dashboard' || pathname === '/dashboard/'
    }
    return pathname.startsWith(path)
  }

  async function handleSignOut() {
    await authClient.signOut()
    window.location.href = '/login'
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <StoreSwitcher />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Platform</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.to}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    isActive={isNavActive(item.to)}
                  >
                    <Link to={item.to}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="size-8 rounded-lg">
                    <AvatarFallback className="rounded-lg">
                      {user ? getInitials(user.name) : '…'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">
                      {user?.name ?? 'Loading…'}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {user?.email ?? ''}
                    </span>
                  </div>
                  <ChevronUp className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side="top"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuItem asChild>
                  <Link to="/dashboard/settings">Account settings</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
