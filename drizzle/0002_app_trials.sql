CREATE TABLE `app_trials` (
	`user_id` text PRIMARY KEY NOT NULL,
	`plan` text NOT NULL,
	`started_at` integer NOT NULL,
	`expires_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `app_users`(`id`) ON UPDATE no action ON DELETE no action
);
