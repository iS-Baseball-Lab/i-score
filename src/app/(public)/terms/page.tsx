// filepath: `src/app/(public)/terms/page.tsx`
import React from "react";
import { Scale, FileText } from "lucide-react";

export default function TermsPage() {
  // 共通のスタイルクラス
  const styles = {
    section: "space-y-4 pt-10 first:pt-0 border-t border-border/40 first:border-none",
    h2: "text-lg font-black text-foreground flex items-center gap-3 tracking-tight",
    p: "text-sm leading-relaxed text-muted-foreground/90 pl-9",
    ol: "list-none space-y-3 pl-9",
    li: "text-sm leading-relaxed text-muted-foreground/90 flex gap-2"
  };

  return (
    <div className="max-w-3xl mx-auto space-y-12">
      
      {/* 🌟 統一ヘッダー */}
      <header className="space-y-4 pb-10 border-b-2 border-primary/20">
        <div className="flex items-center gap-3 text-primary">
          <Scale className="h-5 w-5" />
          <span className="text-xs font-black tracking-[0.2em] uppercase">Legal Document</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-black italic tracking-tighter">
          利用規約 <span className="text-muted-foreground/30 ml-2 text-2xl md:text-3xl">Terms of Service</span>
        </h1>
        <div className="flex items-center gap-4 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
          <span>制定: 2026.04.01</span>
          <span className="w-1 h-1 rounded-full bg-border" />
          <span>iS Baseball Lab</span>
        </div>
      </header>

      {/* 🌟 コンテンツエリア（統一されたリズム） */}
      <div className="space-y-12">
        
        {/* 前文 */}
        <section className={styles.section}>
          <div className="flex items-start gap-4">
            <FileText className="h-5 w-5 text-primary/40 shrink-0 mt-1" />
            <p className="text-sm font-medium leading-relaxed">
              この利用規約（以下、「本規約」）は、iS Baseball Lab（以下、「当ラボ」）が提供する「iScore」（以下、「本サービス」）の利用条件を定めるものです。ユーザーの皆さまには、本規約に従って本サービスをご利用いただきます。
            </p>
          </div>
        </section>

        {/* 第1条 */}
        <section className={styles.section}>
          <h2 className={styles.h2}>
            <span className="text-primary font-mono text-sm">01.</span>
            第1条（適用）
          </h2>
          <div className={styles.ol}>
            <div className={styles.li}>
              <span className="font-mono text-primary/60">1.</span>
              <span>本規約は、ユーザーと当ラボとの間の本サービスの利用に関わる一切の関係に適用されるものとします。</span>
            </div>
            <div className={styles.li}>
              <span className="font-mono text-primary/60">2.</span>
              <span>当ラボは本サービスに関し、本規約のほか、各種の定め（以下、「個別規定」）をすることがあります。これらはその名称に関わらず、本規約の一部を構成するものとします。</span>
            </div>
          </div>
        </section>

        {/* 第2条 */}
        <section className={styles.section}>
          <h2 className={styles.h2}>
            <span className="text-primary font-mono text-sm">02.</span>
            第2条（アカウント管理）
          </h2>
          <div className={styles.ol}>
            <div className={styles.li}>
              <span className="font-mono text-primary/60">1.</span>
              <span>ユーザーは、自己の責任において、本サービスのアカウント情報を適切に管理するものとします。</span>
            </div>
            <div className={styles.li}>
              <span className="font-mono text-primary/60">2.</span>
              <span>アカウント情報を第三者に譲渡または貸与し、もしくは第三者と共用することはできません。</span>
            </div>
          </div>
        </section>

        {/* 第3条（禁止事項） */}
        <section className={styles.section}>
          <h2 className={styles.h2}>
            <span className="text-primary font-mono text-sm">03.</span>
            第3条（禁止事項）
          </h2>
          <p className={styles.p}>ユーザーは、本サービスの利用にあたり、以下の行為をしてはなりません。</p>
          <div className={styles.ol}>
            {[
              "法令または公序良俗に違反する行為",
              "犯罪行為に関連する行為",
              "本サービスに含まれる知的財産権を侵害する行為",
              "当ラボのサーバーまたはネットワークの機能を破壊・妨害する行為",
              "本サービスによって得られた情報を商業的に利用する行為",
              "当ラボの運営を妨害するおそれのある行為"
            ].map((text, i) => (
              <div key={i} className={styles.li}>
                <span className="text-primary/60">・</span>
                <span>{text}</span>
              </div>
            ))}
          </div>
        </section>

        {/* 免責事項 */}
        <section className={styles.section}>
          <h2 className={styles.h2}>
            <span className="text-primary font-mono text-sm">04.</span>
            第4条（免責事項）
          </h2>
          <p className={styles.p}>
            当ラボは、本サービスに事実上または法律上の瑕疵（安全性、信頼性、正確性、バグ等）がないことを保証しておりません。
          </p>
        </section>

      </div>
    </div>
  );
}
