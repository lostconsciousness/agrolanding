import type {
  CustomerCreatedEvent,
  CustomerUpdatedEvent,
  SubscriptionCanceledEvent,
  SubscriptionCreatedEvent,
  SubscriptionUpdatedEvent,
  TransactionCompletedEvent,
} from '@paddle/paddle-node-sdk';
import { getDatabase } from '@/lib/server/database';

type CustomerEvent = CustomerCreatedEvent | CustomerUpdatedEvent;
type SubscriptionEvent =
  | SubscriptionCreatedEvent
  | SubscriptionUpdatedEvent
  | SubscriptionCanceledEvent;

const placeholderEventAt = '0001-01-01T00:00:00.000Z';

async function ensureCustomerPlaceholder(customerId: string) {
  const database = getDatabase();
  await database
    .prepare(
      `INSERT INTO customers (
        customer_id, email, last_event_id, last_event_at
      ) VALUES (?, '', '', ?)
      ON CONFLICT(customer_id) DO NOTHING`,
    )
    .bind(customerId, placeholderEventAt)
    .run();
}

export async function upsertCustomer(event: CustomerEvent) {
  const customer = event.data;
  const database = getDatabase();

  await database
    .prepare(
      `INSERT INTO customers (
        customer_id, email, last_event_id, last_event_at, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(customer_id) DO UPDATE SET
        email = excluded.email,
        last_event_id = excluded.last_event_id,
        last_event_at = excluded.last_event_at,
        updated_at = excluded.updated_at
      WHERE excluded.last_event_at >= customers.last_event_at`,
    )
    .bind(
      customer.id,
      customer.email.trim().toLowerCase(),
      event.eventId,
      event.occurredAt,
      customer.createdAt,
      customer.updatedAt,
    )
    .run();
}

export async function upsertSubscription(event: SubscriptionEvent) {
  const subscription = event.data;
  const item = subscription.items[0];
  const priceId = item?.price?.id;
  const productId = item?.price?.productId ?? item?.product?.id;

  if (!priceId || !productId) {
    throw new Error(`Subscription ${subscription.id} has no price or product.`);
  }

  await ensureCustomerPlaceholder(subscription.customerId);

  const database = getDatabase();
  await database
    .prepare(
      `INSERT INTO subscriptions (
        subscription_id, customer_id, status, price_id, product_id,
        scheduled_change_action, scheduled_change_at,
        last_event_id, last_event_at, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(subscription_id) DO UPDATE SET
        customer_id = excluded.customer_id,
        status = excluded.status,
        price_id = excluded.price_id,
        product_id = excluded.product_id,
        scheduled_change_action = excluded.scheduled_change_action,
        scheduled_change_at = excluded.scheduled_change_at,
        last_event_id = excluded.last_event_id,
        last_event_at = excluded.last_event_at,
        updated_at = excluded.updated_at
      WHERE excluded.last_event_at >= subscriptions.last_event_at`,
    )
    .bind(
      subscription.id,
      subscription.customerId,
      subscription.status,
      priceId,
      productId,
      subscription.scheduledChange?.action ?? null,
      subscription.scheduledChange?.effectiveAt ?? null,
      event.eventId,
      event.occurredAt,
      subscription.createdAt,
      subscription.updatedAt,
    )
    .run();
}

export async function upsertCompletedTransaction(event: TransactionCompletedEvent) {
  const transaction = event.data;
  if (transaction.customerId) await ensureCustomerPlaceholder(transaction.customerId);

  const database = getDatabase();
  await database
    .prepare(
      `INSERT INTO transactions (
        transaction_id, customer_id, subscription_id, status,
        currency_code, total, last_event_id, last_event_at,
        completed_at, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(transaction_id) DO UPDATE SET
        customer_id = excluded.customer_id,
        subscription_id = excluded.subscription_id,
        status = excluded.status,
        currency_code = excluded.currency_code,
        total = excluded.total,
        last_event_id = excluded.last_event_id,
        last_event_at = excluded.last_event_at,
        completed_at = excluded.completed_at,
        updated_at = excluded.updated_at
      WHERE excluded.last_event_at >= transactions.last_event_at`,
    )
    .bind(
      transaction.id,
      transaction.customerId,
      transaction.subscriptionId,
      transaction.status,
      transaction.currencyCode,
      transaction.details?.totals?.total ?? '0',
      event.eventId,
      event.occurredAt,
      event.occurredAt,
      transaction.createdAt,
      transaction.updatedAt,
    )
    .run();
}

export interface CustomerBillingRecord {
  customerId: string;
  email: string;
}

export interface SubscriptionBillingRecord {
  subscriptionId: string;
  status: string;
  priceId: string;
  productId: string;
  scheduledChangeAction: string | null;
  scheduledChangeAt: string | null;
}

export async function getBillingByEmail(email: string) {
  const database = getDatabase();
  const customer = await database
    .prepare(
      `SELECT customer_id AS customerId, email
      FROM customers
      WHERE email = ?
      ORDER BY updated_at DESC
      LIMIT 1`,
    )
    .bind(email.trim().toLowerCase())
    .first<CustomerBillingRecord>();

  if (!customer) return { customer: null, subscriptions: [] as SubscriptionBillingRecord[] };

  const result = await database
    .prepare(
      `SELECT
        subscription_id AS subscriptionId,
        status,
        price_id AS priceId,
        product_id AS productId,
        scheduled_change_action AS scheduledChangeAction,
        scheduled_change_at AS scheduledChangeAt
      FROM subscriptions
      WHERE customer_id = ?
      ORDER BY updated_at DESC`,
    )
    .bind(customer.customerId)
    .all<SubscriptionBillingRecord>();

  return { customer, subscriptions: result.results };
}
