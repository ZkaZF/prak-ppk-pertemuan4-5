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

    const dashboardUser = { ...mockUser, name: user.name };
    const summary = calculateFinancials(mockTransactions);

    return (
        <div>
            <div className="mb-8 flex flex-wrap items-center justify-end gap-3">
                <span className="text-body-sm text-text-secondary">{user.email}</span>
                <LogoutButton />
            </div>
            <GreetingCard user={dashboardUser} />
            <SummaryCards summary={summary} />
            <BudgetManager initialMonth={new Date().toISOString().slice(0, 7)} />
            <RecentTable transactions={mockTransactions} limit={8} />
        </div>
    );
}