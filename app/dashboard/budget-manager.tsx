"use client";

import { useEffect, useState, type FormEvent } from "react";

type MonthlyBudget = {
    month: string;
    budget: string | null;
    expenses: string;
};

const currencyFormatter = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 2,
});

function formatCurrency(value: string | number) {
    return currencyFormatter.format(Number(value));
}

export default function BudgetManager({ initialMonth }: { initialMonth: string }) {
    const [month, setMonth] = useState(initialMonth);
    const [budget, setBudget] = useState<MonthlyBudget | null>(null);
    const [amount, setAmount] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");

    useEffect(() => {
        const controller = new AbortController();

        async function fetchBudget() {
            try {
                const response = await fetch(
                    `/api/budget?month=${encodeURIComponent(month)}`,
                    { cache: "no-store", signal: controller.signal },
                );
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error ?? "Gagal memuat budget.");
                }

                setBudget(data);
                setAmount(data.budget ?? "");
                setError("");
                setNotice("");
            } catch (loadError) {
                if (loadError instanceof DOMException && loadError.name === "AbortError") {
                    return;
                }
                setError(loadError instanceof Error ? loadError.message : "Gagal memuat budget.");
            } finally {
                if (!controller.signal.aborted) {
                    setIsLoading(false);
                }
            }
        }

        void fetchBudget();
        return () => controller.abort();
    }, [month]);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsSaving(true);
        setError("");
        setNotice("");

        try {
            const response = await fetch("/api/budget", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ month, amount }),
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error ?? "Gagal menyimpan budget.");
            }

            setBudget(data);
            setAmount(data.budget ?? "");
            setNotice("Budget berhasil disimpan.");
        } catch (saveError) {
            setError(saveError instanceof Error ? saveError.message : "Gagal menyimpan budget.");
        } finally {
            setIsSaving(false);
        }
    }

    const remaining = budget?.budget === null || !budget
        ? null
        : Number(budget.budget) - Number(budget.expenses);

    return (
        <section aria-labelledby="budget-heading" className="sticker-card mb-10 p-6 sm:p-8">
            <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h2 id="budget-heading" className="text-heading-sm text-text-primary">Budget Bulanan</h2>
                    <p className="mt-1 text-body-sm text-text-secondary">
                        Atur batas pengeluaran dan pantau budget per bulan.
                    </p>
                </div>
                <label htmlFor="budget-month" className="flex flex-col gap-2 text-label-bold text-text-primary">
                    Pilih bulan
                    <input
                        id="budget-month"
                        type="month"
                        value={month}
                        disabled={isSaving}
                        onChange={(event) => {
                            setIsLoading(true);
                            setMonth(event.target.value);
                        }}
                        className="rounded-full border-2 border-[var(--card-border)] bg-[var(--card-bg)] px-4 py-2 text-body text-[var(--text-primary)]"
                    />
                </label>
            </div>

            <form onSubmit={handleSubmit} className="mb-6">
                <label htmlFor="budget-amount" className="text-label-bold text-text-primary">
                    Batas pengeluaran
                </label>
                <div className="mt-2 flex flex-col gap-3 sm:flex-row">
                    <input
                        id="budget-amount"
                        type="number"
                        min="0.01"
                        max="999999999999.99"
                        step="0.01"
                        required
                        value={amount}
                        onChange={(event) => setAmount(event.target.value)}
                        placeholder="Masukkan nominal budget"
                        className="min-w-0 flex-1 rounded-full border-2 border-[var(--card-border)] bg-[var(--card-bg)] px-5 py-3 text-body text-[var(--text-primary)] outline-none focus:border-[var(--accent)]"
                    />
                    <button
                        type="submit"
                        disabled={isSaving || isLoading}
                        className="pill-btn border-2 border-[var(--card-border)] bg-[var(--text-primary)] text-[var(--background)] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {isSaving ? "Menyimpan..." : budget?.budget ? "Ubah budget" : "Atur budget"}
                    </button>
                </div>
            </form>

            <div aria-live="polite">
                {isLoading ? (
                    <p className="text-body-sm text-text-secondary">Memuat data budget...</p>
                ) : budget ? (
                    <dl className="grid gap-3 sm:grid-cols-3">
                        <div className="rounded-3xl border-2 border-[var(--card-border)] bg-[var(--oat)] p-4">
                            <dt className="text-caption font-semibold uppercase tracking-wider text-text-secondary">
                                Budget bulan ini
                            </dt>
                            <dd className="mt-2 font-mono text-lg font-semibold text-text-primary">
                                {budget.budget === null ? "Belum diatur" : formatCurrency(budget.budget)}
                            </dd>
                        </div>
                        <div className="rounded-3xl border-2 border-[var(--card-border)] bg-[var(--card-bg)] p-4">
                            <dt className="text-caption font-semibold uppercase tracking-wider text-text-secondary">
                                Total pengeluaran
                            </dt>
                            <dd className="mt-2 font-mono text-lg font-semibold text-expense">
                                {formatCurrency(budget.expenses)}
                            </dd>
                        </div>
                        {remaining !== null && (
                            <div className="rounded-3xl border-2 border-[var(--card-border)] bg-[var(--card-bg)] p-4">
                                <dt className="text-caption font-semibold uppercase tracking-wider text-text-secondary">
                                    Sisa budget
                                </dt>
                                <dd className={`mt-2 font-mono text-lg font-semibold ${remaining < 0 ? "text-expense" : "text-income"}`}>
                                    {formatCurrency(remaining)}
                                </dd>
                            </div>
                        )}
                    </dl>
                ) : null}
                {notice && <p role="status" className="mt-4 rounded-2xl bg-[var(--income-surface)] p-3 text-body-sm text-income">{notice}</p>}
                {error && <p role="alert" className="mt-4 rounded-2xl bg-[var(--expense-surface)] p-3 text-body-sm text-expense">{error}</p>}
            </div>
        </section>
    );
}
