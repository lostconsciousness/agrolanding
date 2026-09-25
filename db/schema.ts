import { sql } from 'drizzle-orm';
import {
  index,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from 'drizzle-orm/sqlite-core';

export const customers = sqliteTable(
  'customers',
  {
    customerId: text('customer_id').primaryKey(),
    email: text('email').notNull(),
    lastEventId: text('last_event_id').notNull(),
    lastEventAt: text('last_event_at').notNull(),
    createdAt: text('created_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text('updated_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [index('idx_customers_email').on(table.email)],
);

export const subscriptions = sqliteTable(
  'subscriptions',
  {
    subscriptionId: text('subscription_id').primaryKey(),
    customerId: text('customer_id')
      .notNull()
      .references(() => customers.customerId),
    status: text('status').notNull(),
    priceId: text('price_id').notNull(),
    productId: text('product_id').notNull(),
    scheduledChangeAction: text('scheduled_change_action'),
    scheduledChangeAt: text('scheduled_change_at'),
    lastEventId: text('last_event_id').notNull(),
    lastEventAt: text('last_event_at').notNull(),
    createdAt: text('created_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text('updated_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index('idx_subscriptions_customer_id').on(table.customerId),
    index('idx_subscriptions_status').on(table.status),
  ],
);

export const transactions = sqliteTable(
  'transactions',
  {
    transactionId: text('transaction_id').primaryKey(),
    customerId: text('customer_id').references(() => customers.customerId),
    subscriptionId: text('subscription_id'),
    status: text('status').notNull(),
    currencyCode: text('currency_code').notNull(),
    total: text('total').notNull(),
    lastEventId: text('last_event_id').notNull(),
    lastEventAt: text('last_event_at').notNull(),
    completedAt: text('completed_at').notNull(),
    createdAt: text('created_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text('updated_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index('idx_transactions_customer_id').on(table.customerId),
    index('idx_transactions_subscription_id').on(table.subscriptionId),
  ],
);

export const appUsers = sqliteTable('app_users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  context: text('context').notNull().default(''),
  createdAt: integer('created_at').notNull(),
});
export const authCodes = sqliteTable('auth_codes', {
  id: text('id').primaryKey(),
  email: text('email').notNull(),
  codeHash: text('code_hash').notNull(),
  attempts: integer('attempts').notNull().default(0),
  expiresAt: integer('expires_at').notNull(),
});
export const authSessions = sqliteTable('auth_sessions', {
  tokenHash: text('token_hash').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => appUsers.id),
  expiresAt: integer('expires_at').notNull(),
});
export const requestLimits = sqliteTable('request_limits', {
  key: text('key').primaryKey(),
  count: integer('count').notNull(),
  expiresAt: integer('expires_at').notNull(),
});
export const chatLocks = sqliteTable('chat_locks', {
  userId: text('user_id')
    .primaryKey()
    .references(() => appUsers.id),
  token: text('token').notNull(),
  expiresAt: integer('expires_at').notNull(),
});
export const chats = sqliteTable(
  'chats',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => appUsers.id),
    title: text('title').notNull(),
    summary: text('summary').notNull().default(''),
    summaryThrough: integer('summary_through').notNull().default(0),
    createdAt: integer('created_at').notNull(),
    updatedAt: integer('updated_at').notNull(),
  },
  (t) => [index('idx_chats_owner_updated').on(t.userId, t.updatedAt)],
);
export const chatMessages = sqliteTable(
  'chat_messages',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    chatId: text('chat_id')
      .notNull()
      .references(() => chats.id),
    requestId: text('request_id').notNull(),
    role: text('role', { enum: ['user', 'assistant'] }).notNull(),
    content: text('content').notNull(),
    citations: text('citations').notNull().default('[]'),
    createdAt: integer('created_at').notNull(),
  },
  (t) => [
    index('idx_messages_chat_id').on(t.chatId, t.id),
    uniqueIndex('idx_message_request_role').on(t.requestId, t.role),
  ],
);
