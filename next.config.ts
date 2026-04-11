// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // TypeScript チェックはビルドプロセスと分離して実行
  // (next build 時の OOM 対策 — tsc は別途 `npx tsc --noEmit` で確認)
  typescript: {
    ignoreBuildErrors: true,
  },
  // 静的エクスポートでは Middleware や Server Components (SSR) が使えないため、
  // サーバー側の設定は最小限にします。
};

export default nextConfig;
