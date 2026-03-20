CREATE TABLE `play_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`match_id` text NOT NULL,
	`inning_text` text NOT NULL,
	`result_type` text NOT NULL,
	`batter_name` text,
	`description` text NOT NULL,
	`timestamp` text NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	FOREIGN KEY (`match_id`) REFERENCES `matches`(`id`) ON UPDATE no action ON DELETE cascade
);
