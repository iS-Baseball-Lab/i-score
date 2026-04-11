// src/types/api.ts
// API・サービス層・コンポーネント間で共有する共通型定義

import type { DrizzleD1Database } from "drizzle-orm/d1";
import type * as schema from "@/db/schema";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Cloudflare Workers / Hono 環境型
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/** wrangler.toml で定義した Worker バインディング */
export interface WorkerEnv {
    DB: D1Database;
    ASSETS: Fetcher;
    BUCKET?: R2Bucket;
    BETTER_AUTH_URL?: string;
    NEXT_PUBLIC_API_URL?: string;
    GOOGLE_CLIENT_ID?: string;
    GOOGLE_CLIENT_SECRET?: string;
    LINE_CLIENT_ID?: string;
    LINE_CLIENT_SECRET?: string;
    GEMINI_API_KEY?: string;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Drizzle DB 型
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/** Drizzle ORM の D1 インスタンス型（スキーマ付き） */
export type DrizzleDB = DrizzleD1Database<typeof schema>;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// better-auth ユーザー拡張型
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/** better-auth の user オブジェクトに additionalFields で追加した role を含む型 */
export interface AuthUser {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    image?: string | null;
    createdAt: Date;
    updatedAt: Date;
    /** admin プラグインが追加するロールフィールド */
    role?: string | null;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// チームメンバーシップ型
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/** /api/auth/me が返すメンバーシップ 1 件 */
export interface Membership {
    teamId: string;
    teamName: string;
    organizationName: string;
    organizationId?: string;
    role: string;
    roleLabel: string;
    isMainTeam: boolean;
}

/** /api/auth/me レスポンス全体 */
export interface MeResponse {
    success: boolean;
    data: {
        id: string;
        name: string;
        email: string;
        avatarUrl: string;
        role: string;
        systemRole: string;
        memberships: Membership[];
    };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// match.service.ts 用リクエスト型
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface CreateMatchBody {
    teamId: string;
    opponent: string;
    date: string;
    matchType: "official" | "practice";
    battingOrder: "first" | "second";
    location?: string;
    innings?: number;
    tournamentName?: string;
}

export interface UpdateMatchBody {
    opponent: string;
    date: string;
    matchType: "official" | "practice";
    battingOrder: "first" | "second";
    location?: string;
    innings?: number;
    tournamentName?: string;
}

export interface FinishMatchBody {
    myScore: number;
    opponentScore: number;
    myInningScores?: number[];
    opponentInningScores?: number[];
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// getMatchesByTeam の戻り値型
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface MatchRow {
    id: string;
    opponent: string;
    date: string;
    myScore: number;
    opponentScore: number;
    status: string;
    matchType: "official" | "practice";
    battingOrder: "first" | "second";
    surfaceDetails: string | null;
    tournamentName: string | null;
    innings: number;
    myInningScores: number[];
    opponentInningScores: number[];
}

export interface InningRow {
    teamType: "home" | "away";
    inningNumber: number;
    runs: number;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Player 統計型（team/page.tsx など）
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface PlayerStatRow {
    playerId?: string;
    atBats?: number;
    hits?: number;
    homeRuns?: number;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// lineup/page.tsx 用型
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface LineupPlayer {
    id: string;
    name: string;
    uniformNumber: string;
    primaryPosition: string | null;
}

export interface LineupSlot {
    playerId: string | null;
    position: string | null;
}
