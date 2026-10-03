// ============================================
// Dashboard Page — SRS-13 (Main Dashboard)
// Compose: GreetingCard (SRS-14),
//          SummaryCards (SRS-15, SRS-17),
//          RecentTable (SRS-16)
// ============================================

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import LogoutButton from "./logout-button";
import BudgetManager from "./budget-manager";

import GreetingCard from "@/app/components/dashboard/GreetingCard";
import SummaryCards from "@/app/components/dashboard/SummaryCards";
import RecentTable from "@/app/components/dashboard/RecentTable";
import { mockUser, mockTransactions } from "@/app/lib/mock-data";
import { calculateFinancials } from "@/app/lib/calculations";

export const metadata = {
  title: "Dashboard — FinTrack",
  description: "Dashboard keuangan pribadi Anda. Pantau saldo, pemasukan, dan pengeluaran.",
};

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
      redirect("/login");
  }

  // SRS-17: Hitung saldo berdasarkan total pemasukan - total pengeluaran
  const summary = calculateFinancials(mockTransactions);

  // Use actual logged-in user name but fallback to mock data structure for compatibility
  const dashboardUser = {
      ...mockUser,
      name: user.name,
  };

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1rem" }}>
          <span className="mr-3 text-body-sm text-text-secondary">{user.email}</span>
          <LogoutButton />
      </div>

      {/* SRS-14: Greeting with user name */}
      <GreetingCard user={dashboardUser} />

      {/* SRS-15 & SRS-17: Financial summary cards */}
      <SummaryCards summary={summary} />

      <BudgetManager initialMonth={new Date().toISOString().slice(0, 7)} />

      {/* SRS-16: Recent transactions table */}
      <RecentTable transactions={mockTransactions} limit={8} />
    </div>
  );
}
