ALTER TABLE `teams` ADD `year` integer DEFAULT 2026 NOT NULL;--> statement-breakpoint
ALTER TABLE `teams` ADD `tier` text;--> statement-breakpoint
ALTER TABLE `teams` ADD `generation` text;--> statement-breakpoint
ALTER TABLE `teams` ADD `team_type` text DEFAULT 'regular';