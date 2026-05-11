PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_matches` (
	`id` text PRIMARY KEY NOT NULL,
	`team_id` text NOT NULL,
	`tournament_id` text,
	`opponent` text NOT NULL,
	`date` text NOT NULL,
	`match_type` text NOT NULL,
	`batting_order` text NOT NULL,
	`current_inning` integer DEFAULT 1 NOT NULL,
	`is_bottom` integer DEFAULT false NOT NULL,
	`is_tiebreaker` integer DEFAULT false NOT NULL,
	`is_cold_game` integer DEFAULT false NOT NULL,
	`venue_id` text,
	`surface_details` text,
	`innings` integer DEFAULT 7 NOT NULL,
	`status` text DEFAULT 'scheduled' NOT NULL,
	`my_score` integer DEFAULT 0 NOT NULL,
	`opponent_score` integer DEFAULT 0 NOT NULL,
	`my_inning_scores` text DEFAULT '[]',
	`opponent_inning_scores` text DEFAULT '[]',
	`weather` text,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`tournament_id`) REFERENCES `tournaments`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`venue_id`) REFERENCES `venues`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_matches`("id", "team_id", "tournament_id", "opponent", "date", "match_type", "batting_order", "current_inning", "is_bottom", "is_tiebreaker", "is_cold_game", "venue_id", "surface_details", "innings", "status", "my_score", "opponent_score", "my_inning_scores", "opponent_inning_scores", "weather", "created_at") SELECT "id", "team_id", "tournament_id", "opponent", "date", "match_type", "batting_order", "current_inning", "is_bottom", "is_tiebreaker", "is_cold_game", "venue_id", "surface_details", "innings", "status", "my_score", "opponent_score", "my_inning_scores", "opponent_inning_scores", "weather", "created_at" FROM `matches`;--> statement-breakpoint
DROP TABLE `matches`;--> statement-breakpoint
ALTER TABLE `__new_matches` RENAME TO `matches`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `idx_matches_team_id` ON `matches` (`team_id`);--> statement-breakpoint
CREATE INDEX `idx_matches_tournament_id` ON `matches` (`tournament_id`);--> statement-breakpoint
CREATE INDEX `idx_matches_date` ON `matches` (`date`);