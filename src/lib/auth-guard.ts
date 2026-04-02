// src/lib/auth-guard.ts
import { getAuth } from "@/lib/auth";
import { getDb } from "@/db/drizzle"; // 💡 getDb を使用するように統一
import { redirect } from "next/navigation";

// 💡 headers は呼び出し元の Server Component から引数として受け取る
export async function requireSession(headerList: Headers) {
  // getDb() 内で D1 取得と Drizzle 初期化が行われます
  // ただし getAuth は D1Database を直接必要とするため、ここではまず D1 を取得します
  const d1 = (process.env as any).DB as D1Database;

  if (!d1) {
    console.error("D1 Database 'DB' is not bound to process.env");
    throw new Error("Database connection failed");
  }

  const auth = getAuth(d1);

  // 引数で受け取った headerList を使用
  const session = await auth.api.getSession({
    headers: headerList,
  });

  if (!session) {
    redirect("/login");
  }
  return session;
}

export async function requireAdmin(headerList: Headers) {
  // session 取得時にも headerList を引き継ぐ
  const session = await requireSession(headerList);

  if ((session.user as any).role !== "SYSTEM_ADMIN") {
    redirect("/");
  }
  return session;
}