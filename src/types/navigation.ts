// src/types/navigation.ts
import React from "react";
import type { UserSession } from "@/types/auth";

/**
 * 💡 ナビゲーション・アイテム定義
 */
export interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  show: boolean;
  exact?: boolean;
  badge?: number;
}

/**
 * 💡 各コンポーネントのプロパティ定義
 */
export interface SidebarProps {
  session: UserSession | null;
  pathname: string;
  isCollapsed: boolean;
  toggleSidebar: () => void;
  mainNavItems: NavItem[];
  bottomNavItems: NavItem[];
  onClickAvatar: () => void;
  isUploadingAvatar: boolean;
  onLogout: () => void;
}

export interface BottomNavigationProps {
  activeTab: string;
  onNavigate: (path: string) => void;
  onOpenDrawer: () => void;
}

export interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (path: string) => void;
}