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
import {
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '#/components/ui/sheet'
import { createStoreSchema } from '#/lib/forms/schemas'
import { getFieldErrors, isFieldInvalid } from '#/lib/forms/field-utils'

type CreateStoreSheetContentProps = {
  formId: string
  fieldIdPrefix: string
  title: string
  description: string
  submitLabel?: string
  submitPendingLabel?: string
  open?: boolean
  onSuccess?: () => void
  onSubmit: (values: {
    name: string
    websiteUrl?: string
    defaultCurrency?: string
  }) => Promise<{ error?: string }>
}

export function CreateStoreSheetContent({
  formId,
  fieldIdPrefix,
  title,
  description,
  submitLabel = 'Create store',
  submitPendingLabel = 'Creating…',
  open = true,
  onSuccess,
  onSubmit,
}: CreateStoreSheetContentProps) {
  const [submitError, setSubmitError] = useState<string | null>(null)

  const form = useForm({
    defaultValues: {
      name: '',
      websiteUrl: '',
      defaultCurrency: 'USD',
    },
    validators: {
      onSubmit: createStoreSchema,
    },
    onSubmit: async ({ value }) => {
      setSubmitError(null)

      const result = await onSubmit({
        name: value.name,
        websiteUrl: value.websiteUrl.trim() || undefined,
        defaultCurrency: value.defaultCurrency,
      })

      if (result.error) {
        setSubmitError(result.error)
        return
      }

      form.reset()
      onSuccess?.()
    },
  })

  useEffect(() => {
    if (open) {
      return
    }

    setSubmitError(null)
    form.reset()
  }, [form, open])

  return (
    <>
      <SheetHeader>
        <SheetTitle>{title}</SheetTitle>
        <SheetDescription>{description}</SheetDescription>
      </SheetHeader>

      <form
        id={formId}
        className="flex flex-1 flex-col gap-4 px-4"
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
                  <FieldLabel htmlFor={`${fieldIdPrefix}-name`}>
                    Store name
                  </FieldLabel>
                  <Input
                    id={`${fieldIdPrefix}-name`}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    placeholder="My Coffee Shop"
                    aria-invalid={invalid}
                    autoComplete="organization"
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
            name="websiteUrl"
            children={(field) => {
              const invalid = isFieldInvalid(field.state.meta)

              return (
                <Field data-invalid={invalid || undefined}>
                  <FieldLabel htmlFor={`${fieldIdPrefix}-website`}>
                    Website (optional)
                  </FieldLabel>
                  <Input
                    id={`${fieldIdPrefix}-website`}
                    name={field.name}
                    type="url"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    placeholder="https://example.com"
                    aria-invalid={invalid}
                    autoComplete="url"
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
            name="defaultCurrency"
            children={(field) => {
              const invalid = isFieldInvalid(field.state.meta)

              return (
                <Field data-invalid={invalid || undefined}>
                  <FieldLabel htmlFor={`${fieldIdPrefix}-currency`}>
                    Default currency
                  </FieldLabel>
                  <Input
                    id={`${fieldIdPrefix}-currency`}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    placeholder="USD"
                    aria-invalid={invalid}
                    autoComplete="off"
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
          <p className="text-sm font-medium text-destructive">{submitError}</p>
        ) : null}
      </form>

      <SheetFooter>
        <form.Subscribe selector={(state) => state.isSubmitting}>
          {(isSubmitting) => (
            <Button type="submit" form={formId} disabled={isSubmitting}>
              {isSubmitting ? submitPendingLabel : submitLabel}
            </Button>
          )}
        </form.Subscribe>
      </SheetFooter>
    </>
  )
}
