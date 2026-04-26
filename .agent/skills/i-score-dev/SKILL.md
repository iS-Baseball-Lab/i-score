---
name: iScore-dev
description: 次世代野球スコア登録アプリ「iScore」の開発を支援し、技術スタック（Next.js, D1, Drizzle, Better-Auth）に基づいたコーディングと実装をガイドします。
---

# iScore 開発スキル

このスキルは、プロジェクト「i-Score」の開発において、AIアシスタントがプロジェクト固有の技術選定やコーディング標準を遵守するためのものです。

## 1. 技術スタックの概要
iScore は以下の技術スタックを採用しています。

- **Frontend**: Next.js (App Router), React 19
- **Backend/API**: Hono (Next.js 上で稼働)
- **Database**: Cloudflare D1 (SQLite-based)
- **ORM**: Drizzle ORM
- **Authentication**: Better-Auth
- **UI Components**: Radix UI, Lucide React, Tailwind CSS
- **Deployment**: Cloudflare Workers
  - **制約**: OpenNext および Cloudflare Pages は使用しないでください。

## 2. コーディング標準
- **TypeScript**: 全てのコードで厳密な型定義を使用してください。
- **コンポーネント**: React 関数コンポーネントを使用し、Hooks を適切に活用してください。
- **スタイリング**: Tailwind CSS をメインで使用し、プロジェクト内の `components/ui` にある Shadcn/UI パターンのコンポーネントを優先的に利用してください。
- **ディレクトリ構成**:
  - `src/app`: ページとレイアウト
  - `src/components`: UIコンポーネント（機能別・共通）
  - `src/db`: データベーススキーマと設定
  - `src/lib`: ユーティリティ、共有ロジック、認証設定

## 3. データベース操作
- スキーマ変更が必要な場合は `src/db/schema.ts` を編集してください。
- マイグレーションは Cloudflare D1 の手順（`wrangler d1 migrations`）に従ってください。

## 4. 特記事項：野球ドメイン知識
- 野球のスコア記録に関するロジック（打撃、投球、走塁のステータス管理）については、正確な用語とルールに基づいて実装を提案してください。
- 今後、具体的なスコア登録フロー（打席結果の入力、イニングの切り替え等）に関する詳細を追加予定です。
