// ============================================
// Dashboard Page — SRS-13 (Main Dashboard)
// Compose: GreetingCard (SRS-14),
//          SummaryCards (SRS-15, SRS-17),
//          RecentTable (SRS-16)
// ============================================

import GreetingCard from "@/app/components/dashboard/GreetingCard";
import SummaryCards from "@/app/components/dashboard/SummaryCards";
import RecentTable from "@/app/components/dashboard/RecentTable";
import { mockUser, mockTransactions } from "@/app/lib/mock-data";
import { calculateFinancials } from "@/app/lib/calculations";

export const metadata = {
  title: "Dashboard — FinTrack",
  description: "Dashboard keuangan pribadi Anda. Pantau saldo, pemasukan, dan pengeluaran.",
};

export default function DashboardPage() {
  // SRS-17: Hitung saldo berdasarkan total pemasukan - total pengeluaran
  const summary = calculateFinancials(mockTransactions);

  return (
    <>
      {/* SRS-14: Greeting with user name */}
      <GreetingCard user={mockUser} />

      {/* SRS-15 & SRS-17: Financial summary cards */}
      <SummaryCards summary={summary} />

      {/* SRS-16: Recent transactions table */}
      <RecentTable transactions={mockTransactions} limit={8} />
    </>
  );
}
