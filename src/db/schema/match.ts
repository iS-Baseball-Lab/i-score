// src/db/schema/match.ts
import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { teams, players } from "./team";

// ==========================================
// 🏆 大会（トーナメント）テーブル
// 試合のレギュレーション（ルール）を管理
// ==========================================
export const tournaments = sqliteTable("tournaments", {
    id: text("id").primaryKey(),
    name: text("name").notNull(), // 例: "第15回 関東秋季大会"
    season: text("season").notNull(), // 例: "2026"
    organizer: text("organizer"), // 主催者・連盟名
    bracketUrl: text("bracket_url"), // 公式のトーナメント表（Webページ）へのリンク
    timeLimit: text("time_limit"), // 例: "1時間30分 (新しいイニングに入らない)"
    coldGameRule: text("cold_game_rule"), // 例: "3回10点、5回7点差"
    tiebreakerRule: text("tiebreaker_rule"), // 例: "タイブレーク: 1アウト満塁から"
    startDate: text("start_date"), // 大会開幕日
    endDate: text("end_date"), // 大会終了日
    createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(strftime('%s', 'now'))`),
});

// ==========================================
// 🗺️ 球場・グラウンド（Venues）テーブル
// マップ連携や、グラウンド特有のコンディション情報を管理
// ==========================================
export const venues = sqliteTable("venues", {
    id: text("id").primaryKey(),
    name: text("name").notNull(), // 例: "多摩川緑地野球場"
    shortName: text("short_name"), // 画面表示用の略称
    address: text("address"), // 住所
    mapUrl: text("map_url"), // Google Map等のURL（配車や集合時にメンバーへ共有）
    surfaceType: text("surface_type"), // 'dirt'(土), 'turf'(人工芝), 'grass'(天然芝) ※スパイク指定用
    dimensions: text("dimensions"), // 球場の広さ 例: "両翼90m センター110m"
    notes: text("notes"), // 例: "駐車場から遠い", "ファウルボール注意" などのローカルメモ
    createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(strftime('%s', 'now'))`),
});

// ==========================================
// ⚾️ 試合テーブル
// スコア記録の親となる、試合ごとの基本情報
// ==========================================
export const matches = sqliteTable("matches", {
    id: text("id").primaryKey(),
    teamId: text('team_id').notNull().references(() => teams.id, { onDelete: 'cascade' }), // 自チーム
    tournamentId: text("tournament_id").references(() => tournaments.id), // 公式戦の場合は紐付け
    opponent: text("opponent").notNull(), // 対戦相手のチーム名（文字列でベタ打ち想定）
    date: text("date").notNull(), // 試合日（YYYY-MM-DD）
    matchType: text("match_type").notNull(), // 'official'(公式戦), 'practice'(練習試合)
    battingOrder: text("batting_order").notNull(), // 'first'(先攻), 'second'(後攻)
    venueId: text("venue_id").references(() => venues.id), // 開催球場
    surfaceDetails: text("surface_details"), // 例: "A面", "1番グラウンド", "三塁側ベンチ" などその日の詳細
    innings: integer("innings").notNull().default(9), // 規定イニング（草野球なら7回など）
    status: text("status").notNull().default("scheduled"), // 'scheduled'(予定), 'in_progress'(試合中), 'finished'(終了)
    myScore: integer("my_score").notNull().default(0), // 自チームの合計得点
    opponentScore: integer("opponent_score").notNull().default(0), // 相手チームの合計得点
    myInningScores: text("my_inning_scores").default('[]'), // 自チームのイニング得点（JSON文字列）
    opponentInningScores: text("opponent_inning_scores").default('[]'), // 相手チームのイニング得点（JSON文字列）
    weather: text("weather"), // 'sunny'(晴れ), 'cloudy'(曇), 'rainy'(雨) など
    createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(strftime('%s', 'now'))`),
}, (table) => ({
    teamIdx: index("idx_matches_team_id").on(table.teamId), // チームの試合履歴表示用
    tournamentIdx: index("idx_matches_tournament_id").on(table.tournamentId),
    dateIdx: index("idx_matches_date").on(table.date), // 日付でのソート用
}));

// ==========================================
// 📋 試合出場枠（スタメン＆途中出場）テーブル
// 「誰が・何番で・どこを守ったか」の歴史。スコアブック描画の要！
// ==========================================
export const matchLineups = sqliteTable('match_lineups', {
    id: text('id').primaryKey(),
    matchId: text('match_id').notNull().references(() => matches.id, { onDelete: 'cascade' }),
    playerId: text('player_id').notNull().references(() => players.id),
    battingOrder: integer('batting_order').notNull(), // 打順: 1〜9 (DH制度なら10や11も考慮)
    position: text('position').notNull(), // 守備位置: '1'(投)〜'9'(右), 'D'(DH), 'P'(代打), 'R'(代走)
    isStarting: integer("is_starting", { mode: "boolean" }).notNull().default(true), // スタメン(true)か途中出場(false)か
    inningEntered: integer("inning_entered").default(1), // 途中出場の場合、何回から出場したか（交代の波線を描画する用）
}, (table) => ({
    matchIdx: index("idx_match_lineups_match_id").on(table.matchId), // 試合詳細を開いた時にスタメンを爆速取得
}));