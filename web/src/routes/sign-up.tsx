import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'
import { useEffect, useState } from 'react'

import { Button } from '#/components/ui/button'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '#/components/ui/field'
import { Input } from '#/components/ui/input'
import { authClient } from '#/lib/auth-client'
import { getFieldErrors, isFieldInvalid } from '#/lib/forms/field-utils'
import { signUpSchema } from '#/lib/forms/schemas'

export const Route = createFileRoute('/sign-up')({
  component: SignUpPage,
})

function SignUpPage() {
  const navigate = useNavigate()
  const session = authClient.useSession()
  const [submitError, setSubmitError] = useState<string | null>(null)

  const form = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
    validators: {
      onSubmit: signUpSchema,
    },
    onSubmit: async ({ value }) => {
      setSubmitError(null)

      const result = await authClient.signUp.email({
        name: value.name,
        email: value.email,
        password: value.password,
      })

      if (result.error) {
        setSubmitError(result.error.message ?? 'Unable to create account')
        return
      }

      window.location.href = '/dashboard'
    },
  })

  useEffect(() => {
    if (!session.isPending && session.data) {
      void navigate({ to: '/dashboard' })
    }
  }, [session.data, session.isPending, navigate])

  if (session.isPending || session.data) {
    return null
  }

  return (
    <main className="page-wrap px-4 pb-8 pt-14">
      <section className="island-shell mx-auto max-w-md rounded-[2rem] px-6 py-10 sm:px-10">
        <p className="island-kicker mb-3">Account</p>
        <h1 className="display-title mb-2 text-3xl font-bold tracking-tight text-[var(--sea-ink)]">
          Create account
        </h1>
        <p className="mb-8 text-sm text-[var(--sea-ink-soft)]">
          Set up access to your FNNPay dashboard.
        </p>

        <form
          id="sign-up-form"
          className="space-y-5"
          onSubmit={(event) => {
            event.preventDefault()
            void form.handleSubmit()
          }}
        >
          <FieldGroup>
            <form.Field
              name="name"
              children={(field) => {
                const invalid = isFieldInvalid(field.state.meta)

                return (
                  <Field data-invalid={invalid || undefined}>
                    <FieldLabel htmlFor="sign-up-name">Name</FieldLabel>
                    <Input
                      id="sign-up-name"
                      name={field.name}
                      type="text"
                      autoComplete="name"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) => field.handleChange(event.target.value)}
                      aria-invalid={invalid}
                    />
                    {invalid ? (
                      <FieldError
                        errors={getFieldErrors(field.state.meta.errors)}
                      />
                    ) : null}
                  </Field>
                )
              }}
            />

            <form.Field
              name="email"
              children={(field) => {
                const invalid = isFieldInvalid(field.state.meta)

                return (
                  <Field data-invalid={invalid || undefined}>
                    <FieldLabel htmlFor="sign-up-email">Email</FieldLabel>
                    <Input
                      id="sign-up-email"
                      name={field.name}
                      type="email"
                      autoComplete="email"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) => field.handleChange(event.target.value)}
                      aria-invalid={invalid}
                    />
                    {invalid ? (
                      <FieldError
                        errors={getFieldErrors(field.state.meta.errors)}
                      />
                    ) : null}
                  </Field>
                )
              }}
            />

            <form.Field
              name="password"
              children={(field) => {
                const invalid = isFieldInvalid(field.state.meta)

                return (
                  <Field data-invalid={invalid || undefined}>
                    <FieldLabel htmlFor="sign-up-password">Password</FieldLabel>
                    <Input
                      id="sign-up-password"
                      name={field.name}
                      type="password"
                      autoComplete="new-password"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(event) => field.handleChange(event.target.value)}
                      aria-invalid={invalid}
                    />
                    {invalid ? (
                      <FieldError
                        errors={getFieldErrors(field.state.meta.errors)}
                      />
                    ) : null}
                  </Field>
                )
              }}
            />
          </FieldGroup>

          {submitError ? (
            <p className="text-sm font-semibold text-red-600">{submitError}</p>
          ) : null}

          <form.Subscribe selector={(state) => state.isSubmitting}>
            {(isSubmitting) => (
              <Button
                type="submit"
                form="sign-up-form"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating account…' : 'Create account'}
              </Button>
            )}
          </form.Subscribe>
        </form>

        <p className="mt-6 text-sm text-[var(--sea-ink-soft)]">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-[var(--lagoon-deep)]">
            Sign in
          </Link>
        </p>
      </section>
    </main>
  )
}
