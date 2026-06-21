import { relations } from 'drizzle-orm'
import {
  index,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core'

import { user } from './auth'

export const store = pgTable(
  'store',
  {
    id: uuid('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    websiteUrl: text('website_url'),
    brandColor: text('brand_color'),
    logoUrl: text('logo_url'),
    defaultCurrency: text('default_currency').default('USD').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index('store_userId_idx').on(table.userId)],
)

export const storeApiKey = pgTable(
  'store_api_key',
  {
    id: uuid('id').primaryKey(),
    storeId: uuid('store_id')
      .notNull()
      .references(() => store.id, { onDelete: 'cascade' }),
    label: text('label').notNull(),
    keyPrefix: text('key_prefix').notNull(),
    keyHash: text('key_hash').notNull(),
    permissions: text('permissions').array().notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    lastUsedAt: timestamp('last_used_at'),
  },
  (table) => [index('store_api_key_storeId_idx').on(table.storeId)],
)

export const storeRelations = relations(store, ({ one, many }) => ({
  user: one(user, {
    fields: [store.userId],
    references: [user.id],
  }),
  apiKeys: many(storeApiKey),
}))

export const storeApiKeyRelations = relations(storeApiKey, ({ one }) => ({
  store: one(store, {
    fields: [storeApiKey.storeId],
    references: [store.id],
  }),
}))
