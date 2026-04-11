// src/app/(protected)/matches/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Swords, Loader2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MatchList } from "@/components/matches/match-list";
import { toast } from "sonner";
import { Match } from "@/types/match";

export default function AllMatchesPage() {
  const router = useRouter();
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const teamId = localStorage.getItem("iScore_selectedTeamId");
        if (!teamId) return;

        const res = await fetch(`/api/matches?teamId=${teamId}`);
        if (res.ok) {
          const data = await res.json();
          setMatches(Array.isArray(data) ? (data as Match[]).sort((a, b) => b.date.localeCompare(a.date)) : []);
        }
      } catch (error) {
        toast.error("データの読み込みに失敗しました");
      } finally {
        setIsLoading(false);
      }
    };
    fetchMatches();
  }, []);

  const totalPages = Math.ceil(matches.length / itemsPerPage);
  const paginatedMatches = matches.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="min-h-screen bg-transparent p-4 sm:p-6 max-w-4xl mx-auto pb-24">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full bg-white/50 dark:bg-zinc-900/50 border border-border/40 h-10 w-10">
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-black tracking-tight flex items-center gap-3">
          <Swords className="h-6 w-6 text-primary" />
          Match History
        </h1>
      </div>

      <MatchList matches={paginatedMatches} isLoading={isLoading} />

      {/* 🌟 ページングナビゲーション（背景色付きのフラットデザイン） */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-8">
          <Button
            variant="outline"
            size="icon"
            className="rounded-full h-11 w-11 bg-primary/10 hover:bg-primary/20 border-primary/20 text-primary shadow-sm"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => p - 1)}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <span className="text-sm font-black tabular-nums bg-white/50 dark:bg-zinc-800/50 backdrop-blur-sm px-4 py-2 rounded-full border border-border/50 shadow-sm">
            {currentPage} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="rounded-full h-11 w-11 bg-primary/10 hover:bg-primary/20 border-primary/20 text-primary shadow-sm"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => p + 1)}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>
      )}
    </div>
  );
}