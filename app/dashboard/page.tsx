"use client";

// ============================================
// Dashboard Page — SRS-13, SRS-26, SRS-31
// Client Component: fetch data via AJAX dari /api/dashboard
// Auto-refresh via refetch setelah transaksi baru (SRS-31)
// ============================================

import { useEffect, useState, useCallback } from "react";
import type { Transaction, User } from "@/app/lib/mock-data";
import type { FinancialSummary } from "@/app/lib/calculations";

import GreetingCard from "@/app/components/dashboard/GreetingCard";
import SummaryCards from "@/app/components/dashboard/SummaryCards";
import RecentTable from "@/app/components/dashboard/RecentTable";
import BudgetCard from "@/app/components/dashboard/BudgetCard";
import LogoutButton from "./logout-button";

interface DashboardData {
  user: User;
  summary: FinancialSummary;
  recentTransactions: Transaction[];
  totalTransactions: number;
}

// Loading skeleton
function DashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-24 rounded-[40px]" style={{ background: "var(--oat)" }} />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-36 rounded-[40px]" style={{ background: "var(--card-bg)", border: "2px solid var(--card-border)" }} />
        ))}
      </div>
      <div className="h-48 rounded-[32px]" style={{ background: "var(--card-bg)", border: "2px solid var(--card-border)" }} />
      <div className="h-96 rounded-[32px]" style={{ background: "var(--card-bg)", border: "2px solid var(--card-border)" }} />
    </div>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });

  // SRS-26 & SRS-31: Fungsi fetch yang bisa dipanggil ulang (refetch)
  const fetchDashboard = useCallback(async (month: string) => {
    setLoading(true);
    setError(null);
    try {
      // Skill tip #2: Resolve data dulu, baru set state — hindari stale closure
      const res = await fetch(`/api/dashboard?month=${month}`, {
        cache: "no-store",
      });
      if (res.status === 401) {
        window.location.href = "/login";
        return;
      }
      if (!res.ok) throw new Error("Gagal mengambil data dashboard.");
      const json = await res.json() as DashboardData;
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch saat pertama kali load
  useEffect(() => {
    fetchDashboard(selectedMonth);
  }, [fetchDashboard, selectedMonth]);

  // SRS-31: Expose refetch ke window agar bisa dipanggil Programmer 2
  // setelah ada transaksi baru tanpa reload halaman
  useEffect(() => {
    (window as unknown as Record<string, unknown>).__dashboardRefetch = () =>
      fetchDashboard(selectedMonth);
    return () => {
      delete (window as unknown as Record<string, unknown>).__dashboardRefetch;
    };
  }, [fetchDashboard, selectedMonth]);

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-4 flex justify-end">
          <LogoutButton />
        </div>
        <DashboardSkeleton />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-4 flex justify-end">
          <LogoutButton />
        </div>
        <div
          className="rounded-[32px] p-8 text-center"
          style={{ background: "var(--expense-surface)", border: "2px solid var(--card-border)" }}
        >
          <p className="text-heading-sm" style={{ color: "var(--expense-color)" }}>
            Gagal memuat dashboard
          </p>
          <p className="mt-2 text-body" style={{ color: "var(--text-secondary)" }}>
            {error}
          </p>
          <button
            onClick={() => fetchDashboard(selectedMonth)}
            className="mt-4 rounded-full px-6 py-2 text-label-bold cursor-pointer"
            style={{ background: "var(--accent)", color: "var(--background)", border: "1.5px solid var(--card-border)" }}
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      {/* Logout — pojok kanan atas */}
      <div className="mb-4 flex justify-end">
        <LogoutButton />
      </div>

      {/* SRS-14: Sapaan dengan nama user */}
      <GreetingCard user={data.user} />

      {/* SRS-15 & SRS-17: Ringkasan keuangan dari DB (bukan mock) */}
      <SummaryCards summary={data.summary} />

      {/* SRS-27, 28, 29, 31: Budget monitoring */}
      <BudgetCard
        selectedMonth={selectedMonth}
        onMonthChange={setSelectedMonth}
        onBudgetSaved={() => fetchDashboard(selectedMonth)}
      />

      {/* SRS-16 & SRS-26: Transaksi terbaru dari DB, "Lihat semua" fungsional */}
      <RecentTable
        transactions={data.recentTransactions}
        totalTransactions={data.totalTransactions}
        limit={8}
        onRefetch={() => fetchDashboard(selectedMonth)}
      />
    </div>
  );
}
