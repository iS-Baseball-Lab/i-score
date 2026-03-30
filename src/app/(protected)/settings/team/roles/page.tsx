// src/app/(protected)/settings/team/roles/page.tsx
"use client";

import React, { useState } from "react";
/**
 * 💡 役割管理（Manager's Office）
 * 1. 整理: 各ロールが持つ権限を可視化し、チェックボックスで容易にON/OFF。
 * 2. 意匠: 影なし。透過カード。野球のスコアブックを整理するような整然としたUI。
 * 3. 柔軟性: 「新しい役割を追加」ボタンを配置し、チーム独自の役割を定義可能に。
 */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  ShieldCheck, 
  Plus, 
  Save, 
  Trash2, 
  UserCog, 
  Info,
  Lock,
  Unlock
} from "lucide-react";

const ALL_PERMISSIONS = [
  { id: 'score_write', label: 'スコア入力', desc: '試合のプレイ記録・編集' },
  { id: 'roster_edit', label: '選手管理', desc: '新入部員の登録・退部処理' },
  { id: 'match_manage', label: '試合作成', desc: '新規試合の設定・対戦相手管理' },
  { id: 'stats_view', label: 'データ閲覧', desc: 'チーム・個人の詳細分析' },
  { id: 'team_settings', label: '設定変更', desc: 'チーム名やロゴ、役割の編集' },
];

export default function TeamRolesPage() {
  const [roles, setRoles] = useState([
    { id: 'manager', label: '監督/代表者', permissions: ['score_write', 'roster_edit', 'match_manage', 'stats_view', 'team_settings'], isLocked: true },
    { id: 'coach', label: 'コーチ', permissions: ['score_write', 'roster_edit', 'stats_view'], isLocked: false },
    { id: 'player', label: '選手', permissions: ['stats_view'], isLocked: false },
  ]);

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      
      {/* 🏟 ヘッダー */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-border/20 pb-10">
        <div className="space-y-4">
          <Badge variant="outline" className="border-primary/30 text-primary bg-primary/5 rounded-full px-4 py-1 text-[10px] font-black tracking-widest uppercase">
            Administration
          </Badge>
          <h1 className="text-5xl font-black italic tracking-tighter uppercase text-foreground">
            Team <span className="text-primary">Roles</span>
          </h1>
          <p className="text-sm text-muted-foreground font-bold max-w-lg">
            チームメンバーの役割と権限を管理します。役割は後から追加・編集ができ、チームの運用スタイルに合わせることができます。
          </p>
        </div>
        
        <Button className="rounded-[24px] h-14 px-8 bg-primary font-black text-lg shadow-none flex items-center gap-2">
          <Plus className="h-5 w-5 stroke-[3px]" /> ADD ROLE
        </Button>
      </div>

      {/* 役割一覧グリッド */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {roles.map((role) => (
          <Card key={role.id} className="bg-card/20 backdrop-blur-xl border-border/40 rounded-[40px] overflow-hidden shadow-none group">
            <CardHeader className="p-8 border-b border-border/10 bg-muted/5 flex flex-row items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-background border border-border flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500">
                  <UserCog className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-black italic tracking-tight">{role.label}</CardTitle>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">ID: {role.id}</p>
                </div>
              </div>
              {role.isLocked && <Lock className="h-5 w-5 text-muted-foreground/30" />}
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="space-y-4">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] px-2">Assigned Permissions</p>
                <div className="grid grid-cols-1 gap-2">
                  {ALL_PERMISSIONS.map((perm) => {
                    const hasPerm = role.permissions.includes(perm.id);
                    return (
                      <div 
                        key={perm.id} 
                        className={cn(
                          "flex items-center justify-between p-4 rounded-2xl border transition-all",
                          hasPerm ? "bg-primary/5 border-primary/20" : "bg-transparent border-border/10 opacity-40"
                        )}
                      >
                        <div className="flex flex-col">
                          <span className="text-sm font-black italic">{perm.label}</span>
                          <span className="text-[9px] font-bold text-muted-foreground">{perm.desc}</span>
                        </div>
                        <Checkbox 
                          checked={hasPerm} 
                          disabled={role.isLocked}
                          className="h-5 w-5 rounded-md border-2 border-primary/20 data-[state=checked]:bg-primary"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 flex items-center gap-3">
                <Button variant="outline" className="flex-1 rounded-2xl h-12 border-border/40 font-black italic uppercase tracking-widest hover:bg-muted/50">
                  <Save className="h-4 w-4 mr-2" /> Update
                </Button>
                {!role.isLocked && (
                  <Button variant="outline" className="h-12 w-12 rounded-2xl border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <footer className="py-12 opacity-20 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <ShieldCheck className="h-4 w-4" />
          <span className="text-[10px] font-black uppercase tracking-[0.4em]">Tactical Authority Protocol</span>
        </div>
      </footer>
    </div>
  );
}
