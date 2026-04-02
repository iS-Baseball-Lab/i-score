// src/app/terms/page.tsx
import React from "react";
import Link from "next/link";
import { ArrowLeft, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TermsPage() {
  return (
    <div className="min-h-screen text-foreground selection:bg-primary/30 pb-20">

      {/* 🌟 シンプルで美しいヘッダー */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2 font-bold text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
              ホームへ戻る
            </Button>
          </Link>
        </div>
      </header>

      {/* 🌟 メインコンテンツ */}
      <main className="max-w-4xl mx-auto px-4 pt-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-primary/10 rounded-2xl">
            <Scale className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight">利用規約</h1>
            <p className="text-muted-foreground font-medium mt-1">2026年4月1日 制定</p>
          </div>
        </div>

        {/* 💡 規約のテキストを美しいカード内に収める */}
        <div className="p-6 md:p-10 rounded-[32px] bg-card/40 backdrop-blur-xl border border-border/50 shadow-md space-y-10 leading-relaxed">

          <section className="space-y-4">
            <p className="text-muted-foreground">
              この利用規約（以下、「本規約」といいます。）は、iS Baseball Lab（以下、「当ラボ」といいます。）が提供するアプリケーション「i-Score」（以下、「本サービス」といいます。）の利用条件を定めるものです。ユーザーの皆さま（以下、「ユーザー」といいます。）には、本規約に従って、本サービスをご利用いただきます。
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold border-b border-border/50 pb-2">第1条（適用）</h2>
            <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
              <li>本規約は、ユーザーと当ラボとの間の本サービスの利用に関わる一切の関係に適用されるものとします。</li>
              <li>当ラボは本サービスに関し、本規約のほか、ご利用にあたってのルール等、各種の定め（以下、「個別規定」といいます。）をすることがあります。これら個別規定はその名称のいかんに関わらず、本規約の一部を構成するものとします。</li>
            </ol>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold border-b border-border/50 pb-2">第2条（アカウント管理）</h2>
            <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
              <li>ユーザーは、自己の責任において、本サービスのアカウント情報（SNS連携情報を含む）を適切に管理するものとします。</li>
              <li>ユーザーは、いかなる場合にも、アカウント情報を第三者に譲渡または貸与し、もしくは第三者と共用することはできません。</li>
            </ol>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold border-b border-border/50 pb-2">第3条（禁止事項）</h2>
            <p className="text-muted-foreground">ユーザーは、本サービスの利用にあたり、以下の行為をしてはなりません。</p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>法令または公序良俗に違反する行為</li>
              <li>犯罪行為に関連する行為</li>
              <li>本サービスの内容等、本サービスに含まれる著作権、商標権ほか知的財産権を侵害する行為</li>
              <li>当ラボ、ほかのユーザー、またはその他第三者のサーバーまたはネットワークの機能を破壊したり、妨害したりする行為</li>
              <li>本サービスによって得られた情報を商業的に利用する行為</li>
              <li>当ラボのサービスの運営を妨害するおそれのある行為</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold border-b border-border/50 pb-2">第4条（本サービスの提供の停止等）</h2>
            <p className="text-muted-foreground">
              当ラボは、以下のいずれかの事由があると判断した場合、ユーザーに事前に通知することなく本サービスの全部または一部の提供を停止または中断することができるものとします。
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>本サービスにかかるコンピュータシステムの保守点検または更新を行う場合</li>
              <li>地震、落雷、火災、停電または天災などの不可抗力により、本サービスの提供が困難となった場合</li>
              <li>コンピュータまたは通信回線等が事故により停止した場合</li>
              <li>その他、当ラボが本サービスの提供が困難と判断した場合</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold border-b border-border/50 pb-2">第5条（免責事項）</h2>
            <p className="text-muted-foreground">
              当ラボは、本サービスに事実上または法律上の瑕疵（安全性、信頼性、正確性、完全性、有効性、特定の目的への適合性、セキュリティなどに関する欠陥、エラーやバグ、権利侵害などを含みます。）がないことを明示的にも黙示的にも保証しておりません。
            </p>
          </section>

        </div>
      </main>
    </div>
  );
}