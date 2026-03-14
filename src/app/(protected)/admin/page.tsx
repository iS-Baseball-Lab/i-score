// src/app/(protected)/admin/page.tsx
"use client";

import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DatabaseZap, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

export default function AdminPage() {

    // 💡 チーム管理画面から引っ越してきた関数（fetchOrgsの呼び出しは不要になるので削除）
    const handleSeedData = async () => {
        if (!confirm('【開発用】テストデータを一括生成します。よろしいですか？\n（※既存のデータは消えません）')) return;

        const loadingToast = toast.loading('データを生成中...');
        try {
            const res = await fetch('/api/seed', { method: 'POST' });
            if (res.ok) {
                toast.success('テストデータの生成が完了しました！', { id: loadingToast });
            } else {
                toast.error('生成に失敗しました。', { id: loadingToast });
            }
        } catch (e) {
            toast.error('通信エラーが発生しました。', { id: loadingToast });
        }
    };

    return (
        <div className="flex flex-col min-h-screen text-foreground pb-32 relative overflow-hidden">
            <PageHeader
                href="/dashboard"
                icon={ShieldAlert}
                title="管理者設定"
                subtitle="システムの設定や開発者用ツールの管理を行います。"
            />

            <main className="flex-1 px-4 sm:px-6 max-w-4xl mx-auto w-full mt-6 sm:mt-8 relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="grid gap-6">

                    {/* 💡 開発者ツールセクション */}
                    <Card className="border-orange-500/20 bg-orange-500/5 shadow-sm overflow-hidden relative">
                        {/* 背景の装飾 */}
                        <div className="absolute -top-24 -right-24 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

                        <CardHeader className="relative z-10">
                            <CardTitle className="text-orange-600 dark:text-orange-500 flex items-center gap-2 text-xl font-black">
                                <DatabaseZap className="h-5 w-5" />
                                開発用シードツール
                            </CardTitle>
                            <CardDescription className="font-bold text-muted-foreground">
                                テスト用のダミーデータ（クラブ、チーム、選手、過去の試合結果）をデータベースに一括で流し込みます。UIやグラフの挙動確認に使用してください。
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="relative z-10">
                            <Button
                                onClick={handleSeedData}
                                className="bg-orange-500 hover:bg-orange-600 text-white font-black shadow-md shadow-orange-500/20 transition-all active:scale-95"
                            >
                                <DatabaseZap className="h-4 w-4 mr-2" />
                                テストデータを生成する
                            </Button>
                        </CardContent>
                    </Card>

                    {/* 将来的に追加する他の管理者設定はここに並べられます */}
                    {/* <Card> ... </Card> */}

                </div>
            </main>
        </div>
    );
}