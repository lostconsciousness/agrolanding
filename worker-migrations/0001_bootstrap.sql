-- Standalone Cloudflare Worker bootstrap. Mirrors the existing Drizzle schema.
-- IF NOT EXISTS preserves any live Paddle or chat tables already present.
CREATE TABLE IF NOT EXISTS `customers` (
  `customer_id` text PRIMARY KEY NOT NULL,
  `email` text NOT NULL,
  `last_event_id` text NOT NULL,
  `last_event_at` text NOT NULL,
  `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE INDEX IF NOT EXISTS `idx_customers_email` ON `customers` (`email`);

CREATE TABLE IF NOT EXISTS `subscriptions` (
  `subscription_id` text PRIMARY KEY NOT NULL,
  `customer_id` text NOT NULL,
  `status` text NOT NULL,
  `price_id` text NOT NULL,
  `product_id` text NOT NULL,
  `scheduled_change_action` text,
  `scheduled_change_at` text,
  `last_event_id` text NOT NULL,
  `last_event_at` text NOT NULL,
  `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (`customer_id`) REFERENCES `customers`(`customer_id`) ON UPDATE no action ON DELETE no action
);
CREATE INDEX IF NOT EXISTS `idx_subscriptions_customer_id` ON `subscriptions` (`customer_id`);
CREATE INDEX IF NOT EXISTS `idx_subscriptions_status` ON `subscriptions` (`status`);

CREATE TABLE IF NOT EXISTS `transactions` (
  `transaction_id` text PRIMARY KEY NOT NULL,
  `customer_id` text,
  `subscription_id` text,
  `status` text NOT NULL,
  `currency_code` text NOT NULL,
  `total` text NOT NULL,
  `last_event_id` text NOT NULL,
  `last_event_at` text NOT NULL,
  `completed_at` text NOT NULL,
  `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (`customer_id`) REFERENCES `customers`(`customer_id`) ON UPDATE no action ON DELETE no action
);
CREATE INDEX IF NOT EXISTS `idx_transactions_customer_id` ON `transactions` (`customer_id`);
CREATE INDEX IF NOT EXISTS `idx_transactions_subscription_id` ON `transactions` (`subscription_id`);

CREATE TABLE IF NOT EXISTS `app_users` (
  `id` text PRIMARY KEY NOT NULL,
  `email` text NOT NULL,
  `context` text DEFAULT '' NOT NULL,
  `created_at` integer NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS `app_users_email_unique` ON `app_users` (`email`);

CREATE TABLE IF NOT EXISTS `auth_codes` (
  `id` text PRIMARY KEY NOT NULL,
  `email` text NOT NULL,
  `code_hash` text NOT NULL,
  `attempts` integer DEFAULT 0 NOT NULL,
  `expires_at` integer NOT NULL
);

CREATE TABLE IF NOT EXISTS `auth_sessions` (
  `token_hash` text PRIMARY KEY NOT NULL,
  `user_id` text NOT NULL,
  `expires_at` integer NOT NULL,
  FOREIGN KEY (`user_id`) REFERENCES `app_users`(`id`) ON UPDATE no action ON DELETE no action
);

CREATE TABLE IF NOT EXISTS `chats` (
  `id` text PRIMARY KEY NOT NULL,
  `user_id` text NOT NULL,
  `title` text NOT NULL,
  `summary` text DEFAULT '' NOT NULL,
  `summary_through` integer DEFAULT 0 NOT NULL,
  `created_at` integer NOT NULL,
  `updated_at` integer NOT NULL,
  FOREIGN KEY (`user_id`) REFERENCES `app_users`(`id`) ON UPDATE no action ON DELETE no action
);
CREATE INDEX IF NOT EXISTS `idx_chats_owner_updated` ON `chats` (`user_id`,`updated_at`);

CREATE TABLE IF NOT EXISTS `chat_locks` (
  `user_id` text PRIMARY KEY NOT NULL,
  `token` text NOT NULL,
  `expires_at` integer NOT NULL,
  FOREIGN KEY (`user_id`) REFERENCES `app_users`(`id`) ON UPDATE no action ON DELETE no action
);

CREATE TABLE IF NOT EXISTS `chat_messages` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `chat_id` text NOT NULL,
  `request_id` text NOT NULL,
  `role` text NOT NULL,
  `content` text NOT NULL,
  `citations` text DEFAULT '[]' NOT NULL,
  `created_at` integer NOT NULL,
  FOREIGN KEY (`chat_id`) REFERENCES `chats`(`id`) ON UPDATE no action ON DELETE no action
);
CREATE INDEX IF NOT EXISTS `idx_messages_chat_id` ON `chat_messages` (`chat_id`,`id`);
CREATE UNIQUE INDEX IF NOT EXISTS `idx_message_request_role` ON `chat_messages` (`request_id`,`role`);

CREATE TABLE IF NOT EXISTS `request_limits` (
  `key` text PRIMARY KEY NOT NULL,
  `count` integer NOT NULL,
  `expires_at` integer NOT NULL
);
