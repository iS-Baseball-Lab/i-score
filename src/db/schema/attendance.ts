// filepath: src/db/schema/attendance.ts
/* 💡 i-Score 規約: 選手・スタッフ両対応の出欠スキーマ */

import { sqliteTable, text, integer, primaryKey } from "drizzle-orm/sqlite-core";
import { user } from "./auth";
import { teams } from "./team";

export const events = sqliteTable("events", {
  id: text("id").primaryKey(),
  teamId: text("team_id").notNull().references(() => teams.id),
  title: text("title").notNull(),
  startAt: integer("start_at", { mode: "timestamp" }).notNull(),
  eventType: text("event_type").$type<"match" | "practice" | "meeting">().default("practice"),
});

export const attendances = sqliteTable("attendances", {
  eventId: text("event_id").notNull().references(() => events.id),
  userId: text("user_id").notNull().references(() => user.id),
  // 💡 選手以外も考慮したステータス
  status: text("status").$type<"present" | "absent" | "pending" | "late">().default("pending"),
  // 💡 その日の役割（選手、監督、審判、配車スタッフ、カメラ等）
  roleInEvent: text("role_in_event").default("player"),
  hasCar: integer("has_car", { mode: "boolean" }).default(false),
  comment: text("comment"),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.eventId, table.userId] }),
}));
