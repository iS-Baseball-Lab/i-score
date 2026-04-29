// filepath: `src/app/(public)/privacy/page.tsx`
import React from "react";
import { ShieldCheck, Lock, Fingerprint } from "lucide-react";

export default function PrivacyPage() {
  const styles = {
    section: "space-y-4 pt-10 first:pt-0 border-t border-border/40 first:border-none",
    h2: "text-lg font-black text-foreground flex items-center gap-3 tracking-tight",
    p: "text-sm leading-relaxed text-muted-foreground/90 pl-9",
    ol: "list-none space-y-3 pl-9",
    li: "text-sm leading-relaxed text-muted-foreground/90 flex gap-3"
  };

  return (
    <div className="max-w-3xl mx-auto space-y-12">
      <header className="space-y-4 pb-10 border-b-2 border-primary/20">
        <div className="flex items-center gap-3 text-primary">
          <ShieldCheck className="h-5 w-5" />
          <span className="text-xs font-black tracking-[0.2em] uppercase">Security Policy</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-black italic tracking-tighter">
          プライバシーポリシー <span className="text-muted-foreground/30 ml-2 text-2xl md:text-3xl">Privacy Policy</span>
        </h1>
        <div className="flex items-center gap-4 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
          <span>最終改訂: 2026.04.30</span>
          <span className="w-1 h-1 rounded-full bg-border" />
          <span>iS Baseball Lab</span>
        </div>
      </header>

      <div className="space-y-12">
        {/* 前文 */}
        <section className={styles.section}>
          <div className="flex items-start gap-4">
            <Lock className="h-5 w-5 text-primary/40 shrink-0 mt-1" />
            <p className="text-sm font-medium leading-relaxed italic">
              iS Baseball Lab（以下、「当ラボ」）は、提供するアプリケーション「iScore」におけるユーザーの個人情報の取扱いについて、以下の通りポリシーを定めます。
            </p>
          </div>
        </section>

        {/* 第1条 */}
        <section className={styles.section}>
          <h2 className={styles.h2}>
            <span className="text-primary font-mono text-sm underline decoration-2">01.</span>
            第1条（個人情報の収集）
          </h2>
          <p className={styles.p}>
            当ラボは、ユーザーが利用登録をする際に氏名、メールアドレス、SNSアカウント情報（LINE、Google等）を収集することがあります。
          </p>
        </section>

        {/* 第2条 */}
        <section className={styles.section}>
          <h2 className={styles.h2}>
            <span className="text-primary font-mono text-sm underline decoration-2">02.</span>
            第2条（利用目的）
          </h2>
          <div className={styles.ol}>
            {[
              "本サービスの提供・運営のため",
              "本人確認およびお問い合わせ対応のため",
              "新機能や重要なお知らせの通知のため",
              "不正利用の防止およびセキュリティ維持のため"
            ].map((text, i) => (
              <div key={i} className={styles.li}>
                <Fingerprint className="h-4 w-4 text-primary/40 shrink-0 mt-0.5" />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </section>

        {/* 第3条 */}
        <section className={styles.section}>
          <h2 className={styles.h2}>
            <span className="text-primary font-mono text-sm underline decoration-2">03.</span>
            第3条（第三者提供）
          </h2>
          <p className={styles.p}>
            法令で認められる場合を除き、ユーザーの同意を得ることなく第三者に個人情報を提供することはありません。
          </p>
        </section>
      </div>
    </div>
  );
}
