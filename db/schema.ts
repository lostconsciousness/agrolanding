import { sql } from 'drizzle-orm';
import { index, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const customers = sqliteTable(
  'customers',
  {
    customerId: text('customer_id').primaryKey(),
    email: text('email').notNull(),
    lastEventId: text('last_event_id').notNull(),
    lastEventAt: text('last_event_at').notNull(),
    createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`),
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
    createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`),
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
    createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index('idx_transactions_customer_id').on(table.customerId),
    index('idx_transactions_subscription_id').on(table.subscriptionId),
  ],
);
