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
    user: {
      additionalFields: {
        role: {
          type: "string",
          defaultValue: "GUEST",
          input: false,
        },
      },
    },
    // 🔥 databaseHooks は adminプラグインと競合するため完全に削除しました！

    database: drizzleAdapter(db, {
      provider: "sqlite",
      schema: schema,
    }),
    session: {
      expiresIn: 60 * 60 * 24 * 180,
      updateAge: 60 * 60 * 24,
    },
    plugins: [
      admin({
        // 🔥 公式の機能を使って、管理者ロール名とデフォルトロールを設定！
        adminRole: "SYSTEM_ADMIN",
        defaultRole: "GUEST",
      }),
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
    },
    account: {
      accountLinking: {
        enabled: true,
        trustedProviders: ["google", "line"], // 信頼するプロバイダを指定
      },
    },
  });

  lastD1 = d1;
  return authCache;
};
