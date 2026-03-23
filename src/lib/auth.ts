// src/lib/auth.ts
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin } from "better-auth/plugins";
import { drizzle } from "drizzle-orm/d1"; // D1用drizzle
import * as schema from "@/db/schema"; // schema全体をインポート

let authCache: ReturnType<typeof betterAuth> | null = null;
let lastD1: D1Database | null = null;

export const getAuth = (d1: D1Database, env?: any) => {
  // 💡 パフォーマンス最適化: ID が同じならキャッシュを返す (CPU 制限対策)
  if (authCache && lastD1 === d1) {
    return authCache;
  }

  const db = drizzle(d1);
  authCache = betterAuth({
    //emailAndPassword: {
    //  enabled: true,
    //},
    user: {
      additionalFields: {
        role: {
          type: "string",
          defaultValue: "pending",
          input: false,
        },
      },
    },
    database: drizzleAdapter(db, {
      provider: "sqlite",
      schema: schema,
    }),
    session: {
      // セッションの有効期限: 30日 (秒計算: 60秒 * 60分 * 24時間 * 30日)
      // ※半年(180日)にしたい場合は 60 * 60 * 24 * 180 にします
      expiresIn: 60 * 60 * 24 * 180,
      // セッションの更新頻度: 1日 (1日1回アクセスがあれば、そこからまた30日延長される)
      updateAge: 60 * 60 * 24,
    },
    plugins: [
      admin(),
    ],
    socialProviders: {
      ...(env?.GOOGLE_CLIENT_ID ? {
        google: {
          clientId: env.GOOGLE_CLIENT_ID,
          clientSecret: env.GOOGLE_CLIENT_SECRET || "",
        },
      } : {}),
      ...(env?.LINE_CLIENT_ID ? {
        line: {
          clientId: env.LINE_CLIENT_ID,
          clientSecret: env.LINE_CLIENT_SECRET || "",
        },
      } : {}),
    }
  });

  lastD1 = d1;
  return authCache;
};
