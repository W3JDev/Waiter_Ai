// Enterprise Database Schema for WaiterAI Platform
// Built with Drizzle ORM for Vercel Postgres

import { pgTable, text, uuid, varchar, decimal, jsonb, timestamp, boolean, integer } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// User and Authentication Tables
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }),
  image: text('image'),
  emailVerified: timestamp('email_verified'),
  role: varchar('role', { length: 50 }).notNull().default('customer'), // admin, staff, customer
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const accounts = pgTable('accounts', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: varchar('type', { length: 255 }).notNull(),
  provider: varchar('provider', { length: 255 }).notNull(),
  providerAccountId: varchar('provider_account_id', { length: 255 }).notNull(),
  refresh_token: text('refresh_token'),
  access_token: text('access_token'),
  expires_at: integer('expires_at'),
  token_type: varchar('token_type', { length: 255 }),
  scope: varchar('scope', { length: 255 }),
  id_token: text('id_token'),
  session_state: varchar('session_state', { length: 255 }),
})

export const sessions = pgTable('sessions', {
  id: uuid('id').defaultRandom().primaryKey(),
  sessionToken: varchar('session_token', { length: 255 }).notNull().unique(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires').notNull(),
})

export const verificationTokens = pgTable('verification_tokens', {
  identifier: varchar('identifier', { length: 255 }).notNull(),
  token: varchar('token', { length: 255 }).notNull().unique(),
  expires: timestamp('expires').notNull(),
})

// Restaurant Management Tables
export const restaurants = pgTable('restaurants', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  ownerId: varchar('owner_id', { length: 255 }).notNull(),
  address: text('address').notNull(),
  phone: varchar('phone', { length: 50 }).notNull(),
  whatsapp_link: text('whatsapp_link'),
  booking_link: text('booking_link'),
  map_link: text('map_link'),
  description: text('description'),
  logo_url: text('logo_url'),
  banner_url: text('banner_url'),
  subscription: varchar('subscription', { length: 50 }).default('free'), // free, starter, professional, enterprise
  subscriptionExpiresAt: timestamp('subscription_expires_at'),
  settings: jsonb('settings').$type<RestaurantSettings>(),
  operating_hours: jsonb('operating_hours').$type<OperatingHours[]>(),
  analytics: jsonb('analytics').$type<RestaurantAnalytics>(),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const menuCategories = pgTable('menu_categories', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  restaurantId: uuid('restaurant_id').notNull().references(() => restaurants.id, { onDelete: 'cascade' }),
  image_url: text('image_url'),
  sortOrder: integer('sort_order').default(0),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const menuItems = pgTable('menu_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description').notNull(),
  aiGeneratedDescription: text('ai_generated_description'),
  nameTranslations: jsonb('name_translations').$type<Record<string, string>>(),
  descriptionTranslations: jsonb('description_translations').$type<Record<string, string>>(),
  categoryId: uuid('category_id').notNull().references(() => menuCategories.id, { onDelete: 'cascade' }),
  restaurantId: uuid('restaurant_id').notNull().references(() => restaurants.id, { onDelete: 'cascade' }),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  image_url: text('image_url'),
  dietary_info: jsonb('dietary_info').$type<string[]>().default([]),
  allergens: jsonb('allergens').$type<string[]>().default([]),
  spice_level: varchar('spice_level', { length: 20 }), // mild, medium, hot, extra-hot
  available: boolean('available').default(true),
  featured: boolean('featured').default(false),
  sortOrder: integer('sort_order').default(0),
  analytics: jsonb('analytics').$type<ItemAnalytics>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// AI Integration Tables
export const aiConfigs = pgTable('ai_configs', {
  id: uuid('id').defaultRandom().primaryKey(),
  restaurantId: uuid('restaurant_id').notNull().references(() => restaurants.id, { onDelete: 'cascade' }),
  provider: varchar('provider', { length: 50 }).notNull(), // openai, google, groq, deepseek
  model: varchar('model', { length: 100 }).notNull(),
  temperature: decimal('temperature', { precision: 3, scale: 2 }).default('0.7'),
  maxTokens: integer('max_tokens').default(300),
  promptTemplate: text('prompt_template').notNull(),
  apiKey: text('api_key'), // encrypted
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const aiGenerationLogs = pgTable('ai_generation_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  restaurantId: uuid('restaurant_id').notNull().references(() => restaurants.id, { onDelete: 'cascade' }),
  menuItemId: uuid('menu_item_id').references(() => menuItems.id, { onDelete: 'cascade' }),
  prompt: text('prompt').notNull(),
  response: text('response').notNull(),
  provider: varchar('provider', { length: 50 }).notNull(),
  model: varchar('model', { length: 100 }).notNull(),
  tokensUsed: integer('tokens_used'),
  cost: decimal('cost', { precision: 10, scale: 6 }),
  language: varchar('language', { length: 10 }).default('en'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Payment and Subscription Tables
export const subscriptions = pgTable('subscriptions', {
  id: uuid('id').defaultRandom().primaryKey(),
  restaurantId: uuid('restaurant_id').notNull().references(() => restaurants.id, { onDelete: 'cascade' }),
  stripeCustomerId: varchar('stripe_customer_id', { length: 255 }),
  stripeSubscriptionId: varchar('stripe_subscription_id', { length: 255 }),
  plan: varchar('plan', { length: 50 }).notNull(), // starter, professional, enterprise
  status: varchar('status', { length: 50 }).notNull(), // active, canceled, past_due
  currentPeriodStart: timestamp('current_period_start'),
  currentPeriodEnd: timestamp('current_period_end'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const payments = pgTable('payments', {
  id: uuid('id').defaultRandom().primaryKey(),
  restaurantId: uuid('restaurant_id').notNull().references(() => restaurants.id, { onDelete: 'cascade' }),
  stripePaymentIntentId: varchar('stripe_payment_intent_id', { length: 255 }),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 }).default('USD'),
  status: varchar('status', { length: 50 }).notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Analytics and Tracking Tables
export const analyticsEvents = pgTable('analytics_events', {
  id: uuid('id').defaultRandom().primaryKey(),
  restaurantId: uuid('restaurant_id').notNull().references(() => restaurants.id, { onDelete: 'cascade' }),
  eventType: varchar('event_type', { length: 100 }).notNull(), // menu_view, item_click, qr_scan, etc.
  eventData: jsonb('event_data').$type<Record<string, any>>(),
  userAgent: text('user_agent'),
  ipAddress: varchar('ip_address', { length: 45 }),
  sessionId: varchar('session_id', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const dailyAnalytics = pgTable('daily_analytics', {
  id: uuid('id').defaultRandom().primaryKey(),
  restaurantId: uuid('restaurant_id').notNull().references(() => restaurants.id, { onDelete: 'cascade' }),
  date: timestamp('date').notNull(),
  totalViews: integer('total_views').default(0),
  uniqueVisitors: integer('unique_visitors').default(0),
  qrScans: integer('qr_scans').default(0),
  popularItems: jsonb('popular_items').$type<Record<string, number>>(),
  revenue: decimal('revenue', { precision: 10, scale: 2 }).default('0'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// QR Code and Digital Menu Tables
export const qrCodes = pgTable('qr_codes', {
  id: uuid('id').defaultRandom().primaryKey(),
  restaurantId: uuid('restaurant_id').notNull().references(() => restaurants.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  url: text('url').notNull(),
  qrCodeImage: text('qr_code_image'), // base64 or URL
  scansCount: integer('scans_count').default(0),
  isActive: boolean('is_active').default(true),
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// API and Integration Tables
export const apiKeys = pgTable('api_keys', {
  id: uuid('id').defaultRandom().primaryKey(),
  restaurantId: uuid('restaurant_id').notNull().references(() => restaurants.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  keyHash: varchar('key_hash', { length: 255 }).notNull(),
  permissions: jsonb('permissions').$type<string[]>().default([]),
  lastUsedAt: timestamp('last_used_at'),
  isActive: boolean('is_active').default(true),
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const webhooks = pgTable('webhooks', {
  id: uuid('id').defaultRandom().primaryKey(),
  restaurantId: uuid('restaurant_id').notNull().references(() => restaurants.id, { onDelete: 'cascade' }),
  url: text('url').notNull(),
  events: jsonb('events').$type<string[]>().notNull(),
  secret: varchar('secret', { length: 255 }),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Define Relations
export const restaurantRelations = relations(restaurants, ({ many, one }) => ({
  categories: many(menuCategories),
  menuItems: many(menuItems),
  aiConfig: one(aiConfigs),
  subscription: one(subscriptions),
  qrCodes: many(qrCodes),
  analytics: many(analyticsEvents),
  dailyAnalytics: many(dailyAnalytics),
}))

export const categoryRelations = relations(menuCategories, ({ one, many }) => ({
  restaurant: one(restaurants, {
    fields: [menuCategories.restaurantId],
    references: [restaurants.id],
  }),
  menuItems: many(menuItems),
}))

export const menuItemRelations = relations(menuItems, ({ one }) => ({
  category: one(menuCategories, {
    fields: [menuItems.categoryId],
    references: [menuCategories.id],
  }),
  restaurant: one(restaurants, {
    fields: [menuItems.restaurantId],
    references: [restaurants.id],
  }),
}))

// TypeScript Types for JSON fields
export interface RestaurantSettings {
  theme?: {
    primaryColor?: string
    secondaryColor?: string
    fontFamily?: string
  }
  features?: {
    enableAI?: boolean
    enableTranslations?: boolean
    enableAnalytics?: boolean
    enableQROrdering?: boolean
  }
  integrations?: {
    posSystem?: string
    deliveryPlatforms?: string[]
    paymentMethods?: string[]
  }
}

export interface OperatingHours {
  day: string
  closed: boolean
  shifts: {
    open: string
    close: string
  }[]
}

export interface RestaurantAnalytics {
  totalViews?: number
  popularItems?: Record<string, number>
  revenueThisMonth?: number
  averageOrderValue?: number
  customerRetention?: number
}

export interface ItemAnalytics {
  views?: number
  orders?: number
  revenue?: number
  rating?: number
  lastOrdered?: string
}

// Export schema for Drizzle
export const schema = {
  users,
  accounts,
  sessions,
  verificationTokens,
  restaurants,
  menuCategories,
  menuItems,
  aiConfigs,
  aiGenerationLogs,
  subscriptions,
  payments,
  analyticsEvents,
  dailyAnalytics,
  qrCodes,
  apiKeys,
  webhooks,
}

export type Restaurant = typeof restaurants.$inferSelect
export type NewRestaurant = typeof restaurants.$inferInsert
export type MenuCategory = typeof menuCategories.$inferSelect
export type NewMenuCategory = typeof menuCategories.$inferInsert
export type MenuItem = typeof menuItems.$inferSelect
export type NewMenuItem = typeof menuItems.$inferInsert
export type AIConfig = typeof aiConfigs.$inferSelect
export type NewAIConfig = typeof aiConfigs.$inferInsert