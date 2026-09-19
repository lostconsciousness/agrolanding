import {
  EventName,
  type EventEntity,
  type CustomerCreatedEvent,
  type CustomerUpdatedEvent,
  type SubscriptionCanceledEvent,
  type SubscriptionCreatedEvent,
  type SubscriptionUpdatedEvent,
  type TransactionCompletedEvent,
} from '@paddle/paddle-node-sdk';
import {
  upsertCompletedTransaction,
  upsertCustomer,
  upsertSubscription,
} from '@/lib/server/billing-store';

export async function processPaddleEvent(event: EventEntity) {
  switch (event.eventType) {
    case EventName.CustomerCreated:
    case EventName.CustomerUpdated:
      return upsertCustomer(event as CustomerCreatedEvent | CustomerUpdatedEvent);
    case EventName.SubscriptionCreated:
    case EventName.SubscriptionUpdated:
    case EventName.SubscriptionCanceled:
      return upsertSubscription(
        event as SubscriptionCreatedEvent | SubscriptionUpdatedEvent | SubscriptionCanceledEvent,
      );
    case EventName.TransactionCompleted:
      return upsertCompletedTransaction(event as TransactionCompletedEvent);
    default:
      return;
  }
}
