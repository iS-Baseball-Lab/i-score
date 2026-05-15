// filepath: src/components/layout/protected-client-layout.tsx
/* 💡 認証ガード・レイアウト（オフライン耐性強化版） */
"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

export function ProtectedClientLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, setIsPending] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      // 🌟 オフライン時はチェックをスキップし、既存の認証状態を信じる
      if (typeof window !== "undefined" && !navigator.onLine) {
        console.log("Offline mode: Skipping auth check and maintaining current state.");
        // すでに一度認証を通っていれば、そのまま表示を維持
        if (isAuthorized) {
          setIsPending(false);
          return;
        }
      }

      try {
        const { data: session, error } = await authClient.getSession();

        if (error || !session) {
          // 🌟 通信エラー（ネットワークダウン）の場合はリダイレクトしない
          if (error && !navigator.onLine) {
             console.warn("Auth check failed due to network. Staying on page.");
             return; 
          }
          
          console.log("No session found, redirecting to login...");
          router.replace("/login");
          return;
        }

        // 承認待ちチェック（GUEST = 新規登録直後、PENDING = 申請済み未承認）
        if ((session.user.role === "GUEST" || session.user.role === "PENDING") && pathname !== "/pending-approval") {
          router.replace("/pending-approval");
          return;
        }

        setIsAuthorized(true);
      } catch (err) {
        // 🌟 通信例外が発生しても、オフラインならログアウトさせない
        if (!navigator.onLine) {
          console.error("Network error during auth check, but user is offline. Keeping session.");
        } else {
          router.replace("/login");
        }
      } finally {
        setIsPending(false);
      }
    };

    checkAuth();

    // 🌟 ネットワーク復帰時に自動で再チェックするリスナー
    const handleOnline = () => {
      console.log("Network restored. Re-validating session...");
      checkAuth();
    };
    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);

  }, [router, pathname, isAuthorized]);

  // ローディング中かつ未認証時のみスケルトン等を表示
  if (isPending && !isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <>{children}</>;
}
