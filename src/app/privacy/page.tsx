// src/app/privacy/page.tsx
import React from "react";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PrivacyPage() {
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
          <div className="p-3 bg-blue-500/10 rounded-2xl">
            <ShieldCheck className="h-8 w-8 text-blue-500" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight">プライバシーポリシー</h1>
            <p className="text-muted-foreground font-medium mt-1">2026年4月1日 制定</p>
          </div>
        </div>

        {/* 💡 テキストを美しいカード内に収める */}
        <div className="p-6 md:p-10 rounded-[32px] bg-card/40 backdrop-blur-xl border border-border/50 shadow-md space-y-10 leading-relaxed">

          <section className="space-y-4">
            <p className="text-muted-foreground">
              iS Baseball Lab（以下、「当ラボ」といいます。）は、当ラボが提供するアプリケーション「iScore」（以下、「本サービス」といいます。）における、ユーザーの個人情報の取扱いについて、以下のとおりプライバシーポリシー（以下、「本ポリシー」といいます。）を定めます。
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold border-b border-border/50 pb-2">第1条（個人情報）</h2>
            <p className="text-muted-foreground">
              「個人情報」とは、個人情報保護法にいう「個人情報」を指すものとし、生存する個人に関する情報であって、当該情報に含まれる氏名、生年月日、住所、電話番号、連絡先その他の記述等により特定の個人を識別できる情報、及び容貌、指紋、声紋にかかるデータ、及び健康保険証の保険者番号などの当該情報単体から特定の個人を識別できる情報（個人識別情報）を指します。
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold border-b border-border/50 pb-2">第2条（個人情報の収集方法）</h2>
            <p className="text-muted-foreground">
              当ラボは、ユーザーが利用登録をする際に氏名、メールアドレス、SNSアカウント情報などの個人情報をお尋ねすることがあります。また、ユーザーと提携先などとの間でなされたユーザーの個人情報を含む取引記録や決済に関する情報を、当ラボの提携先（情報提供元、広告主、広告配信先などを含みます。以下、｢提携先｣といいます。）などから収集することがあります。
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold border-b border-border/50 pb-2">第3条（個人情報を収集・利用する目的）</h2>
            <p className="text-muted-foreground">当ラボが個人情報を収集・利用する目的は、以下のとおりです。</p>
            <ol className="list-decimal list-inside space-y-2 text-muted-foreground ml-4">
              <li>当ラボサービスの提供・運営のため</li>
              <li>ユーザーからのお問い合わせに回答するため（本人確認を行うことを含む）</li>
              <li>ユーザーが利用中のサービスの新機能、更新情報、キャンペーン等及び当ラボが提供する他のサービスの案内のメールを送付するため</li>
              <li>メンテナンス、重要なお知らせなど必要に応じたご連絡のため</li>
              <li>利用規約に違反したユーザーや、不正・不当な目的でサービスを利用しようとするユーザーの特定をし、ご利用をお断りするため</li>
              <li>上記の利用目的に付随する目的</li>
            </ol>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold border-b border-border/50 pb-2">第4条（個人情報の第三者提供）</h2>
            <p className="text-muted-foreground">
              当ラボは、次に掲げる場合を除いて、あらかじめユーザーの同意を得ることなく、第三者に個人情報を提供することはありません。ただし、個人情報保護法その他の法令で認められる場合を除きます。
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold border-b border-border/50 pb-2">第5条（プライバシーポリシーの変更）</h2>
            <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
              <li>本ポリシーの内容は、法令その他本ポリシーに別段の定めのある事項を除いて、ユーザーに通知することなく、変更することができるものとします。</li>
              <li>当ラボが別途定める場合を除いて、変更後のプライバシーポリシーは、本ウェブサイトに掲載したときから効力を生じるものとします。</li>
            </ol>
          </section>

        </div>
      </main>
    </div>
  );
}