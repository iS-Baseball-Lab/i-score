CREATE TABLE `venues` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`short_name` text,
	`address` text,
	`map_url` text,
	`surface_type` text,
	`dimensions` text,
	`notes` text,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `base_advances` (
	`id` text PRIMARY KEY NOT NULL,
	`match_id` text NOT NULL,
	`at_bat_id` text NOT NULL,
	`pitch_id` text,
	`runner_id` text NOT NULL,
	`from_base` integer NOT NULL,
	`to_base` integer NOT NULL,
	`reason` text NOT NULL,
	`is_out` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	FOREIGN KEY (`match_id`) REFERENCES `matches`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`at_bat_id`) REFERENCES `at_bats`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`pitch_id`) REFERENCES `pitches`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`runner_id`) REFERENCES `players`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_base_advances_match_id` ON `base_advances` (`match_id`);--> statement-breakpoint
CREATE INDEX `idx_base_advances_at_bat_id` ON `base_advances` (`at_bat_id`);--> statement-breakpoint
DROP TABLE `organization_members`;--> statement-breakpoint
DROP TABLE `team_members`;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_at_bats` (
	`id` text PRIMARY KEY NOT NULL,
	`match_id` text NOT NULL,
	`inning` integer NOT NULL,
	`is_top` integer NOT NULL,
	`batter_id` text,
	`pitcher_id` text,
	`result` text,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	FOREIGN KEY (`match_id`) REFERENCES `matches`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`batter_id`) REFERENCES `players`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`pitcher_id`) REFERENCES `players`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_at_bats`("id", "match_id", "inning", "is_top", "batter_id", "pitcher_id", "result", "created_at") SELECT "id", "match_id", "inning", "is_top", "batter_id", "pitcher_id", "result", "created_at" FROM `at_bats`;--> statement-breakpoint
DROP TABLE `at_bats`;--> statement-breakpoint
ALTER TABLE `__new_at_bats` RENAME TO `at_bats`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `idx_at_bats_match_id` ON `at_bats` (`match_id`);--> statement-breakpoint
CREATE INDEX `idx_at_bats_batter_id` ON `at_bats` (`batter_id`);--> statement-breakpoint
CREATE INDEX `idx_at_bats_pitcher_id` ON `at_bats` (`pitcher_id`);--> statement-breakpoint
CREATE TABLE `__new_lineup_templates` (
	`id` text PRIMARY KEY NOT NULL,
	`team_id` text NOT NULL,
	`name` text NOT NULL,
	`lineup_data` text NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_lineup_templates`("id", "team_id", "name", "lineup_data", "created_at") SELECT "id", "team_id", "name", "lineup_data", "created_at" FROM `lineup_templates`;--> statement-breakpoint
DROP TABLE `lineup_templates`;--> statement-breakpoint
ALTER TABLE `__new_lineup_templates` RENAME TO `lineup_templates`;--> statement-breakpoint
CREATE INDEX `idx_lineup_templates_team_id` ON `lineup_templates` (`team_id`);--> statement-breakpoint
CREATE TABLE `__new_match_lineups` (
	`id` text PRIMARY KEY NOT NULL,
	`match_id` text NOT NULL,
	`player_id` text NOT NULL,
	`batting_order` integer NOT NULL,
	`position` text NOT NULL,
	`is_starting` integer DEFAULT true NOT NULL,
	`inning_entered` integer DEFAULT 1,
	FOREIGN KEY (`match_id`) REFERENCES `matches`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`player_id`) REFERENCES `players`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_match_lineups`("id", "match_id", "player_id", "batting_order", "position", "is_starting", "inning_entered") SELECT "id", "match_id", "player_id", "batting_order", "position", "is_starting", "inning_entered" FROM `match_lineups`;--> statement-breakpoint
DROP TABLE `match_lineups`;--> statement-breakpoint
ALTER TABLE `__new_match_lineups` RENAME TO `match_lineups`;--> statement-breakpoint
CREATE INDEX `idx_match_lineups_match_id` ON `match_lineups` (`match_id`);--> statement-breakpoint
CREATE TABLE `__new_matches` (
	`id` text PRIMARY KEY NOT NULL,
	`team_id` text NOT NULL,
	`tournament_id` text,
	`opponent` text NOT NULL,
	`date` text NOT NULL,
	`match_type` text NOT NULL,
	`batting_order` text NOT NULL,
	`venue_id` text,
	`surface_details` text,
	`innings` integer DEFAULT 9 NOT NULL,
	`status` text DEFAULT 'scheduled' NOT NULL,
	`my_score` integer DEFAULT 0 NOT NULL,
	`opponent_score` integer DEFAULT 0 NOT NULL,
	`weather` text,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`tournament_id`) REFERENCES `tournaments`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`venue_id`) REFERENCES `venues`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_matches`("id", "team_id", "tournament_id", "opponent", "date", "match_type", "batting_order", "venue_id", "surface_details", "innings", "status", "my_score", "opponent_score", "weather", "created_at") SELECT "id", "team_id", "tournament_id", "opponent", "date", "match_type", "batting_order", "venue_id", "surface_details", "innings", "status", "my_score", "opponent_score", "weather", "created_at" FROM `matches`;--> statement-breakpoint
DROP TABLE `matches`;--> statement-breakpoint
ALTER TABLE `__new_matches` RENAME TO `matches`;--> statement-breakpoint
CREATE INDEX `idx_matches_team_id` ON `matches` (`team_id`);--> statement-breakpoint
CREATE INDEX `idx_matches_tournament_id` ON `matches` (`tournament_id`);--> statement-breakpoint
CREATE INDEX `idx_matches_date` ON `matches` (`date`);--> statement-breakpoint
CREATE TABLE `__new_players` (
	`id` text PRIMARY KEY NOT NULL,
	`team_id` text NOT NULL,
	`name` text NOT NULL,
	`uniform_number` text NOT NULL,
	`nickname` text,
	`primary_position` text,
	`sub_positions` text,
	`throws` text,
	`bats` text,
	`height` integer,
	`weight` integer,
	`profile_image_url` text,
	`notes` text,
	`is_active` integer DEFAULT true,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_players`("id", "team_id", "name", "uniform_number", "nickname", "primary_position", "sub_positions", "throws", "bats", "height", "weight", "profile_image_url", "notes", "is_active", "created_at") SELECT "id", "team_id", "name", "uniform_number", "nickname", "primary_position", "sub_positions", "throws", "bats", "height", "weight", "profile_image_url", "notes", "is_active", "created_at" FROM `players`;--> statement-breakpoint
DROP TABLE `players`;--> statement-breakpoint
ALTER TABLE `__new_players` RENAME TO `players`;--> statement-breakpoint
CREATE INDEX `idx_players_team_id` ON `players` (`team_id`);--> statement-breakpoint
CREATE TABLE `__new_tournaments` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`season` text NOT NULL,
	`organizer` text,
	`bracket_url` text,
	`time_limit` text,
	`cold_game_rule` text,
	`tiebreaker_rule` text,
	`start_date` text,
	`end_date` text,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_tournaments`("id", "name", "season", "organizer", "bracket_url", "time_limit", "cold_game_rule", "tiebreaker_rule", "start_date", "end_date", "created_at") SELECT "id", "name", "season", "organizer", "bracket_url", "time_limit", "cold_game_rule", "tiebreaker_rule", "start_date", "end_date", "created_at" FROM `tournaments`;--> statement-breakpoint
DROP TABLE `tournaments`;--> statement-breakpoint
ALTER TABLE `__new_tournaments` RENAME TO `tournaments`;--> statement-breakpoint
CREATE TABLE `__new_organizations` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`short_name` text,
	`logo_image_url` text,
	`description` text,
	`founded_year` integer,
	`category` text DEFAULT 'other' NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_organizations`("id", "name", "short_name", "logo_image_url", "description", "founded_year", "category", "created_at") SELECT "id", "name", "short_name", "logo_image_url", "description", "founded_year", "category", "created_at" FROM `organizations`;--> statement-breakpoint
DROP TABLE `organizations`;--> statement-breakpoint
ALTER TABLE `__new_organizations` RENAME TO `organizations`;--> statement-breakpoint
CREATE TABLE `__new_teams` (
	`id` text PRIMARY KEY NOT NULL,
	`organization_id` text,
	`name` text NOT NULL,
	`year` integer DEFAULT 2026 NOT NULL,
	`manager_name` text,
	`captain_id` text,
	`home_ground` text,
	`tier` text,
	`team_type` text DEFAULT 'regular',
	`created_by` text NOT NULL,
	`created_at` integer DEFAULT (strftime('%s', 'now')) NOT NULL,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`created_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_teams`("id", "organization_id", "name", "year", "manager_name", "captain_id", "home_ground", "tier", "team_type", "created_by", "created_at") SELECT "id", "organization_id", "name", "year", "manager_name", "captain_id", "home_ground", "tier", "team_type", "created_by", "created_at" FROM `teams`;--> statement-breakpoint
DROP TABLE `teams`;--> statement-breakpoint
ALTER TABLE `__new_teams` RENAME TO `teams`;--> statement-breakpoint
ALTER TABLE `pitches` ADD `pitch_type` text;--> statement-breakpoint
ALTER TABLE `pitches` ADD `pitch_speed` integer;--> statement-breakpoint
CREATE INDEX `idx_pitches_at_bat_id` ON `pitches` (`at_bat_id`);--> statement-breakpoint
ALTER TABLE `pitches` DROP COLUMN `hit_x`;--> statement-breakpoint
ALTER TABLE `pitches` DROP COLUMN `hit_y`;--> statement-breakpoint
CREATE INDEX `idx_play_logs_match_id` ON `play_logs` (`match_id`);--> statement-breakpoint
ALTER TABLE `play_logs` DROP COLUMN `batter_name`;--> statement-breakpoint
ALTER TABLE `play_logs` DROP COLUMN `timestamp`;