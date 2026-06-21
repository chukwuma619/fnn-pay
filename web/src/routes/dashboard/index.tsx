import { createFileRoute } from '@tanstack/react-router'

import { authClient } from '#/lib/auth-client'

export const Route = createFileRoute('/dashboard/')({
  component: DashboardOverviewPage,
})

function DashboardOverviewPage() {
  const session = authClient.useSession()
  const user = session.data?.user

  if (!user) {
    return null
  }

  return (
    <div className="flex flex-1 flex-col gap-4 py-4">
      <section className="rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
        <p className="mb-1 text-sm font-medium text-muted-foreground">
          Welcome back
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">{user.name}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{user.email}</p>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          ['Open invoices', '0'],
          ['Paid today', '0 CKB'],
          ['Pending', '0'],
          ['Webhook events', '0'],
        ].map(([label, value]) => (
          <section
            key={label}
            className="rounded-xl border bg-card p-5 text-card-foreground shadow-sm"
          >
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
          </section>
        ))}
      </div>

      <section className="rounded-xl border bg-card p-6 text-card-foreground shadow-sm">
        <h2 className="text-lg font-semibold">Getting started</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Connect your Fiber node, create your first invoice, and configure
          webhooks to receive payment notifications.
        </p>
      </section>
    </div>
  )
}
