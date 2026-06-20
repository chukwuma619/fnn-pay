import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { authClient } from '#/lib/auth-client'

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

function LoginPage() {
  const navigate = useNavigate()
  const session = authClient.useSession()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!session.isPending && session.data) {
      void navigate({ to: '/dashboard' })
    }
  }, [session.data, session.isPending, navigate])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    const result = await authClient.signIn.email({
      email,
      password,
    })

    setIsSubmitting(false)

    if (result.error) {
      setError(result.error.message ?? 'Unable to sign in')
      return
    }

    window.location.href = '/dashboard'
  }

  if (session.isPending || session.data) {
    return null
  }

  return (
    <main className="page-wrap px-4 pb-8 pt-14">
      <section className="island-shell mx-auto max-w-md rounded-[2rem] px-6 py-10 sm:px-10">
        <p className="island-kicker mb-3">Account</p>
        <h1 className="display-title mb-2 text-3xl font-bold tracking-tight text-[var(--sea-ink)]">
          Sign in
        </h1>
        <p className="mb-8 text-sm text-[var(--sea-ink-soft)]">
          Access your FNNPay dashboard.
        </p>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <Label htmlFor="email" className="mb-2 block text-sm font-semibold">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>

          <div>
            <Label
              htmlFor="password"
              className="mb-2 block text-sm font-semibold"
            >
              Password
            </Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>

          {error ? (
            <p className="text-sm font-semibold text-red-600">{error}</p>
          ) : null}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>

        <p className="mt-6 text-sm text-[var(--sea-ink-soft)]">
          No account yet?{' '}
          <Link to="/sign-up" className="font-semibold text-[var(--lagoon-deep)]">
            Create one
          </Link>
        </p>
      </section>
    </main>
  )
}
