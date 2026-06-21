import * as z from 'zod'

export const loginSchema = z.object({
  email: z.email('Enter a valid email address.'),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
})

export const signUpSchema = z.object({
  name: z.string().trim().min(1, 'Name is required.'),
  email: z.email('Enter a valid email address.'),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
})

export const createStoreSchema = z.object({
  name: z.string().trim().min(1, 'Store name is required.'),
  websiteUrl: z.union([
    z.literal(''),
    z.url('Enter a valid URL.'),
  ]),
  defaultCurrency: z
    .string()
    .trim()
    .min(1, 'Default currency is required.')
    .max(10, 'Currency code is too long.'),
})

export const storeSettingsSchema = z.object({
  name: z.string().trim().min(1, 'Store name is required.'),
  websiteUrl: z.union([
    z.literal(''),
    z.url('Enter a valid URL.'),
  ]),
  defaultCurrency: z
    .string()
    .trim()
    .min(1, 'Default currency is required.')
    .max(10, 'Currency code is too long.'),
})

export const apiKeySchema = z.object({
  label: z.string().trim().min(1, 'API key label is required.'),
  permissions: z
    .array(z.string())
    .min(1, 'Select at least one permission.'),
})

export type LoginFormValues = z.infer<typeof loginSchema>
export type SignUpFormValues = z.infer<typeof signUpSchema>
export type CreateStoreFormValues = z.infer<typeof createStoreSchema>
export type StoreSettingsFormValues = z.infer<typeof storeSettingsSchema>
export type ApiKeyFormValues = z.infer<typeof apiKeySchema>
