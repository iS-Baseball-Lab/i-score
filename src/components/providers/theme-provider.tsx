// src/components/theme-provider.tsx
"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
// 💡 修正: 型定義も next-themes から直接インポートするように修正 (2307エラー解消)
import { type ThemeProviderProps } from "next-themes";

/**
 * 💡 テーマプロバイダー
 * 1. 役割: アプリ全体でライト/ダーク/システムモードの切り替えを管理。
 * 2. 補足: Hydration Error を防ぐため、next-themes をラップしています。
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}