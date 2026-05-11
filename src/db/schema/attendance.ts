// filepath: src/db/schema/attendance.ts
import { sqliteTable, text, integer, primaryKey } from "drizzle-orm/sqlite-core";
import { users } from "./users";
import { teams } from "./teams";

// 💡 予定（試合や練習）テーブル
export const events = sqliteTable("events", {
  id: text("id").primaryKey(),
  teamId: text("team_id").notNull().references(() => teams.id),
  title: text("title").notNull(), // 練習、練習試合、公式戦など
  description: text("description"),
  location: text("location"),
  startAt: integer("start_at", { mode: "timestamp" }).notNull(),
  endAt: integer("end_at", { mode: "timestamp" }),
  eventType: text("event_type").$type<"match" | "practice" | "other">().default("practice"),
});

// 💡 出欠回答テーブル
export const attendances = sqliteTable("attendances", {
  eventId: text("event_id").notNull().references(() => events.id),
  userId: text("user_id").notNull().references(() => users.id),
  status: text("status").$type<"present" | "absent" | "pending" | "late" | "early">().default("pending"),
  comment: text("comment"),
  hasCar: integer("has_car", { mode: "boolean" }).default(false), // 車出し可否
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.eventId, table.userId] }),
}));
