ALTER TABLE `teams` ADD `line_group_id` text;--> statement-breakpoint
ALTER TABLE `teams` ADD `is_auto_report_enabled` integer DEFAULT false;