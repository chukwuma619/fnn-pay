import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'

import { Button } from '#/components/ui/button'
import { authClient } from '#/lib/auth-client'

export const Route = createFileRoute('/dashboard')({
  component: DashboardPage,
})

function DashboardPage() {
  const navigate = useNavigate()
  const session = authClient.useSession()
  const user = session.data?.user

  useEffect(() => {
    if (!session.isPending && !session.data) {
      void navigate({ to: '/login' })
    }
  }, [session.data, session.isPending, navigate])

  if (session.isPending || !user) {
    return null
  }

  async function handleSignOut() {
    await authClient.signOut()
    window.location.href = '/login'
  }

  return (
    <main className="page-wrap px-4 pb-8 pt-14">
      <section className="island-shell rounded-[2rem] px-6 py-10 sm:px-10">
        <p className="island-kicker mb-3">Dashboard</p>
        <h1 className="display-title mb-2 text-3xl font-bold tracking-tight text-[var(--sea-ink)]">
          Welcome, {user.name}
        </h1>
        <p className="mb-8 text-sm text-[var(--sea-ink-soft)]">{user.email}</p>

        <Button type="button" variant="outline" onClick={handleSignOut}>
          Sign out
        </Button>
      </section>
    </main>
  )
}
