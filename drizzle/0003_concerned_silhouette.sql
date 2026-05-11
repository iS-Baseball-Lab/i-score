CREATE TABLE `attendances` (
	`event_id` text NOT NULL,
	`user_id` text NOT NULL,
	`status` text DEFAULT 'pending',
	`role_in_event` text DEFAULT 'player',
	`has_car` integer DEFAULT false,
	`comment` text,
	`updated_at` integer NOT NULL,
	PRIMARY KEY(`event_id`, `user_id`),
	FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `events` (
	`id` text PRIMARY KEY NOT NULL,
	`team_id` text NOT NULL,
	`title` text NOT NULL,
	`start_at` integer NOT NULL,
	`event_type` text DEFAULT 'practice',
	FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE no action
);
