CREATE TABLE `customers` (
	`customer_id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`last_event_id` text NOT NULL,
	`last_event_at` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_customers_email` ON `customers` (`email`);--> statement-breakpoint
CREATE TABLE `subscriptions` (
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
--> statement-breakpoint
CREATE INDEX `idx_subscriptions_customer_id` ON `subscriptions` (`customer_id`);--> statement-breakpoint
CREATE INDEX `idx_subscriptions_status` ON `subscriptions` (`status`);--> statement-breakpoint
CREATE TABLE `transactions` (
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
--> statement-breakpoint
CREATE INDEX `idx_transactions_customer_id` ON `transactions` (`customer_id`);--> statement-breakpoint
CREATE INDEX `idx_transactions_subscription_id` ON `transactions` (`subscription_id`);