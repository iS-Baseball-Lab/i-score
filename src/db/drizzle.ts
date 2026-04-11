// src/db/drizzle.ts
import { drizzle } from 'drizzle-orm/d1';
import type { WorkerEnv } from '@/types/api';

/**
 * 💡 D1 データベースインスタンスを取得し、Drizzle オブジェクトを返します。
 * Next.js (Cloudflare Workers runtime) 環境では process.env.DB に injection されます。
 */
export const getDb = () => {
  const d1 = (process.env as unknown as WorkerEnv).DB;

  if (!d1) {
    // 💡 ローカル開発時や環境構築ミスを早期に発見するためのエラーハンドリング
    throw new Error("D1 database binding 'DB' not found. Check your wrangler.toml or Cloudflare dashboard.");
  }

  return drizzle(d1);
};


/*
import { drizzle } from 'drizzle-orm/d1';
import { getCloudflareContext } from '@opennextjs/cloudflare'

// Cloudflare Workers の環境型定義
export interface Env {
  DB: D1Database;  // wrangler.toml で定義した binding 名
}

// Drizzle ORM インスタンスを作成する関数
export function getDB(env: Env) {
  return drizzle(env.DB);
}

export const db = async () => {
    try {
        return (getDB(getCloudflareContext().env as any));
    } catch (e) {
        console.error(e)
        return null
    }
}
*/