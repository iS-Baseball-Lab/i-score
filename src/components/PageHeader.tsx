// src/components/PageHeader.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
    href: string;            // 戻る先のURL (例: "/dashboard")
    icon: React.ElementType; // Lucideアイコン
    title: string;           // 画面のタイトル
    subtitle: string;        // サブタイトル（簡易説明）
}

export function PageHeader({ href, icon: Icon, title, subtitle }: PageHeaderProps) {
    return (
        <header className="bg-muted/30 border-b border-border p-4 sticky top-0 z-10 backdrop-blur-md">
            <div className="flex items-center gap-3">
                
                {/* 💡 カッコいい戻るボタン（立体的な丸ボタン＋ホバーで光る） */}
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-10 w-10 rounded-full bg-background border border-border shadow-sm hover:bg-muted hover:text-primary transition-all group shrink-0" 
                    asChild
                >
                    <Link href={href}>
                        {/* 従来の ArrowLeft ではなく、よりアプリらしい ChevronLeft を使用 */}
                        <ChevronLeft className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors pr-0.5" />
                    </Link>
                </Button>
                
                {/* 💡 アイコン＋タイトル（メインカラー）＋サブタイトル */}
                <div className="flex flex-col min-w-0">
                    <h1 className="font-black text-lg sm:text-xl tracking-tight flex items-center gap-2 text-primary truncate">
                        <Icon className="h-5 w-5 shrink-0" />
                        <span className="truncate">{title}</span>
                    </h1>
                    <p className="text-xs text-muted-foreground font-bold truncate mt-0.5 tracking-wider">
                        {subtitle}
                    </p>
                </div>
                
            </div>
        </header>
    );
}
