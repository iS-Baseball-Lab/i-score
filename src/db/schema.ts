// src/db/schema.ts
import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

// ==========================================
// 💡 Auth 関連テーブル
// ==========================================
export const user = sqliteTable("user", {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    emailVerified: integer("email_verified", { mode: "boolean" }).notNull(),
    image: text("image"),
    role: text("role").notNull().default("user"),
    banned: integer("banned", { mode: "boolean" }),
    banReason: text("ban_reason"),
    banExpires: integer("ban_expires", { mode: "timestamp" }),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const session = sqliteTable("session", {
    id: text("id").primaryKey(),
    expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
    token: text("token").notNull().unique(),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id").notNull().references(() => user.id),
});

export const account = sqliteTable("account", {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id").notNull().references(() => user.id),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: integer("access_token_expires_at", { mode: "timestamp" }),
    refreshTokenExpiresAt: integer("refresh_token_expires_at", { mode: "timestamp" }),
    scope: text("scope"),
    password: text("password"),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const verification = sqliteTable("verification", {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }),
    updatedAt: integer("updated_at", { mode: "timestamp" }),
});

// ==========================================
// 💡 組織（クラブ）テーブル
// ==========================================
export const organizations = sqliteTable("organizations", {
    id: text("id").primaryKey(),
    name: text("name").notNull(), // 例: "川崎中央シニア"
    category: text("category").notNull().default('other'),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

// ==========================================
// 💡 組織メンバー（権限管理）テーブル
// ==========================================
export const organizationMembers = sqliteTable("organization_members", {
    id: text("id").primaryKey(),
    organizationId: text("organization_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull().references(() => user.id),
    role: text("role").notNull(), // 例: 'OWNER' (代表), 'ADMIN' (総監督), 'MEMBER' (保護者/選手)
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

// ==========================================
// 💡 チームを管理するテーブル（拡張）
// ==========================================
export const teams = sqliteTable('teams', {
    id: text('id').primaryKey(),
    // 💡 追加：どの組織に属するか（既存データの移行ができるよう、一時的に notNull はつけません）
    organizationId: text('organization_id').references(() => organizations.id),
    // 💡 1. ユーザーが自由に名付ける表示名（例: "2025年度 1軍"）
    name: text('name').notNull(),
    // 💡 2. 【必須キー】年度（データ混在を防ぐ絶対的な壁）
    year: integer('year').notNull(),
    // 💡 3. 【任意キー】階層・実力区分（A/B, 1軍/2軍など）
    tier: text('tier'), 
    // 💡 4. 【任意キー】世代・入団期
    generation: text('generation'), 
    // 💡 5. 【任意キー】チームの特性
    teamType: text('team_type').default('regular'), // 'regular', 'selection', 'practice'
    createdBy: text('created_by').notNull().references(() => user.id),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

// ==========================================
// 💡チーム所属（メンバー）テーブル
// ==========================================
export const teamMembers = sqliteTable('team_members', {
    id: text('id').primaryKey(),
    teamId: text('team_id').notNull().references(() => teams.id),
    opponentTeamId: text('opponent_team_id').references(() => teams.id),
    userId: text('user_id').notNull().references(() => user.id),
    role: text('role').notNull(),
    joinedAt: integer('joined_at', { mode: 'timestamp' }).notNull(),
});

// ==========================================
// 💡 試合テーブル
// ==========================================
export const matches = sqliteTable("matches", {
    id: text("id").primaryKey(),
    teamId: text('team_id').notNull().references(() => teams.id),
    opponentTeamId: text('opponent_team_id').references(() => teams.id),
    opponent: text("opponent").notNull(),
    season: text('season').notNull(),
    date: text("date").notNull(),
    location: text("location"),
    matchType: text("match_type").notNull(),
    battingOrder: text("batting_order").notNull(),
    innings: integer("innings").notNull().default(9),
    status: text("status").notNull().default("scheduled"),
    myScore: integer("my_score").notNull().default(0),
    opponentScore: integer("opponent_score").notNull().default(0),
    myInningScores: text("my_inning_scores").default('[]'),
    opponentInningScores: text("opponent_inning_scores").default('[]'),
    createdAt: integer("created_at", { mode: "timestamp" })
        .notNull()
        .default(sql`(strftime('%s', 'now'))`),
});

// ==========================================
// 💡 打席（At Bat）テーブル
// ==========================================
export const atBats = sqliteTable("at_bats", {
    id: text("id").primaryKey(),
    matchId: text("match_id").notNull().references(() => matches.id, { onDelete: "cascade" }),
    inning: integer("inning").notNull(),
    isTop: integer("is_top", { mode: "boolean" }).notNull(),
    batterName: text("batter_name"),
    pitcherName: text("pitcher_name"),
    result: text("result"),
    createdAt: integer("created_at", { mode: "timestamp" })
        .notNull()
        .default(sql`(strftime('%s', 'now'))`),
});

// ==========================================
// 💡 1球ごとの投球（Pitch）テーブル
// ==========================================
export const pitches = sqliteTable("pitches", {
    id: text("id").primaryKey(),
    atBatId: text("at_bat_id").notNull().references(() => atBats.id, { onDelete: "cascade" }),
    pitchNumber: integer("pitch_number").notNull(),
    result: text("result").notNull(),
    ballsBefore: integer("balls_before").notNull().default(0),
    strikesBefore: integer("strikes_before").notNull().default(0),
    zoneX: real("zone_x"),
    zoneY: real("zone_y"),
    hitX: real("hit_x"),
    hitY: real("hit_y"),
    createdAt: integer("created_at", { mode: "timestamp" })
        .notNull()
        .default(sql`(strftime('%s', 'now'))`),
});

// ==========================================
// 💡 チームに所属する選手名簿（ロースター）テーブル
// ==========================================
export const players = sqliteTable('players', {
    id: text('id').primaryKey(),
    teamId: text('team_id').notNull().references(() => teams.id),
    name: text('name').notNull(),
    uniformNumber: text('uniform_number').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// ==========================================
// 💡 各試合のスタメン・打順テーブル
// ==========================================
export const matchLineups = sqliteTable('match_lineups', {
    id: text('id').primaryKey(),
    matchId: text('match_id').notNull().references(() => matches.id),
    playerId: text('player_id').notNull().references(() => players.id),
    battingOrder: integer('batting_order').notNull(),
    position: text('position').notNull(),
});

// ==========================================
// 💡 スタメンテンプレート（事前作成パターン）テーブル
// ==========================================
export const lineupTemplates = sqliteTable("lineup_templates", {
    id: text("id").primaryKey(),
    teamId: text('team_id').notNull().references(() => teams.id),
    name: text("name").notNull(),
    lineupData: text("lineup_data").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" })
        .notNull()
        .default(sql`(strftime('%s', 'now'))`),
});

// 💡 最後にまとめて export
export const schema = {
    user,
    session,
    account,
    verification,
    organizations,
    organizationMembers,
    teams,
    teamMembers,
    matches,
    atBats,
    pitches,
    players,
    matchLineups,
    lineupTemplates,
};