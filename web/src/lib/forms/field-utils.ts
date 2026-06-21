type FieldMeta = {
  isTouched: boolean
  isValid: boolean
  errors: ReadonlyArray<unknown>
}

export function isFieldInvalid(meta: FieldMeta): boolean {
  return meta.isTouched && !meta.isValid
}

export function getFieldErrors(
  errors: ReadonlyArray<unknown>,
): Array<{ message?: string } | undefined> {
  return errors.map((error) =>
    typeof error === 'string' ? { message: error } : (error as { message?: string }),
  )
}
