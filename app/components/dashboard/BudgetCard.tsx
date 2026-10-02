"use client";

// ============================================
// BudgetCard — SRS-27, SRS-28, SRS-29, SRS-31
// Budget bulan terpilih: set, tampil, indikator
// AJAX: fetch /api/budget, update tanpa reload
// ============================================

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { PiggyBank, PencilSimple, Check, X, ChartBar } from "@phosphor-icons/react";
import { formatCurrency, formatMonth } from "@/app/lib/calculations";

interface BudgetData {
  budget: number | null;
  totalExpense: number;
  remaining: number | null;
  percentage: number | null;
  status: "aman" | "waspada" | "hampir_habis" | "melebihi" | null;
  label: string | null;
  month: string;
}

interface BudgetCardProps {
  selectedMonth: string;          // "2026-10"
  onMonthChange: (m: string) => void;
  onBudgetSaved: () => void;      // callback agar dashboard refetch setelah budget di-set
}

const STATUS_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  aman:         { bg: "var(--income-surface)",  text: "var(--income-color)",  border: "var(--income-color)" },
  waspada:      { bg: "#fff8e1",               text: "#b45309",              border: "#b45309" },
  hampir_habis: { bg: "#fff1e6",               text: "#c2410c",              border: "#c2410c" },
  melebihi:     { bg: "var(--expense-surface)", text: "var(--expense-color)", border: "var(--expense-color)" },
};

// Generate daftar 6 bulan terakhir + bulan ini
function getLast6Months(): string[] {
  const months: string[] = [];
  const now = new Date();
  for (let i = 0; i <= 5; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }
  return months;
}

export default function BudgetCard({ selectedMonth, onMonthChange, onBudgetSaved }: BudgetCardProps) {
  const [budgetData, setBudgetData] = useState<BudgetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // SRS-31: Fetch budget via AJAX
  const fetchBudget = useCallback(async (month: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/budget?month=${month}`, { cache: "no-store" });
      if (!res.ok) throw new Error();
      const json = await res.json() as BudgetData;
      setBudgetData(json);
      if (json.budget !== null) setInputValue(String(json.budget));
    } catch {
      setBudgetData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBudget(selectedMonth);
  }, [fetchBudget, selectedMonth]);

  // Simpan budget via AJAX POST (SRS-27)
  async function handleSave() {
    const amount = Number(inputValue.replace(/\D/g, ""));
    if (!amount || amount <= 0) {
      setSaveError("Masukkan nominal yang valid.");
      return;
    }
    setSaving(true);
    setSaveError(null);
    try {
      const res = await fetch("/api/budget", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ month: selectedMonth, amount }),
      });
      if (!res.ok) throw new Error();
      setEditing(false);
      await fetchBudget(selectedMonth);  // Refresh budget card (SRS-31)
      onBudgetSaved();                   // Trigger dashboard refetch
    } catch {
      setSaveError("Gagal menyimpan budget.");
    } finally {
      setSaving(false);
    }
  }

  const months = getLast6Months();
  const style = budgetData?.status ? STATUS_STYLES[budgetData.status] : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
      className="mb-8"
    >
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
          <ChartBar size={15} weight="regular" style={{ color: "var(--text-secondary)" }} />
          <h2 className="text-label-bold">Budget Monitoring</h2>
        </div>

        {/* Month selector */}
        <select
          value={selectedMonth}
          onChange={(e) => onMonthChange(e.target.value)}
          className="rounded-full px-3 py-1 text-caption font-medium cursor-pointer"
          style={{
            background: "var(--card-bg)",
            border: "1.5px solid var(--card-border)",
            color: "var(--text-primary)",
            outline: "none",
          }}
        >
          {months.map((m) => (
            <option key={m} value={m}>{formatMonth(m)}</option>
          ))}
        </select>
      </div>

      {/* Card */}
      <div
        className="overflow-hidden rounded-[32px]"
        style={{ background: "var(--card-bg)", border: "2px solid var(--card-border)" }}
      >
        {loading ? (
          <div className="animate-pulse p-6">
            <div className="h-4 w-32 rounded-full mb-4" style={{ background: "var(--oat)" }} />
            <div className="h-8 w-48 rounded-full" style={{ background: "var(--oat)" }} />
          </div>
        ) : (
          <div className="p-6">
            {/* Budget belum di-set */}
            {budgetData?.budget === null && !editing && (
              <div className="flex flex-col items-center py-4 text-center gap-3">
                <PiggyBank size={36} weight="regular" style={{ color: "var(--text-secondary)" }} />
                <p className="text-body" style={{ color: "var(--text-secondary)" }}>
                  Belum ada budget untuk <strong>{formatMonth(selectedMonth)}</strong>.
                </p>
                <button
                  onClick={() => setEditing(true)}
                  className="rounded-full px-5 py-2 text-label-bold cursor-pointer"
                  style={{ background: "var(--accent)", color: "var(--background)", border: "1.5px solid var(--card-border)" }}
                >
                  Set Budget
                </button>
              </div>
            )}

            {/* Form set/edit budget */}
            <AnimatePresence>
              {editing && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4 overflow-hidden"
                >
                  <p className="text-caption font-semibold mb-2" style={{ color: "var(--text-secondary)" }}>
                    Budget untuk {formatMonth(selectedMonth)}
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 flex items-center gap-2 rounded-full px-4 py-2"
                      style={{ border: "1.5px solid var(--card-border)", background: "var(--background)" }}>
                      <span className="text-body" style={{ color: "var(--text-secondary)" }}>Rp</span>
                      <input
                        type="number"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="0"
                        className="flex-1 bg-transparent text-body tabular-nums outline-none"
                        style={{ color: "var(--text-primary)" }}
                        min={0}
                        autoFocus
                      />
                    </div>
                    <button onClick={handleSave} disabled={saving}
                      className="h-9 w-9 flex items-center justify-center rounded-full cursor-pointer"
                      style={{ background: "var(--income-surface)", border: "1.5px solid var(--income-color)", color: "var(--income-color)" }}>
                      <Check size={16} weight="bold" />
                    </button>
                    <button onClick={() => { setEditing(false); setSaveError(null); }}
                      className="h-9 w-9 flex items-center justify-center rounded-full cursor-pointer"
                      style={{ background: "var(--expense-surface)", border: "1.5px solid var(--expense-color)", color: "var(--expense-color)" }}>
                      <X size={16} weight="bold" />
                    </button>
                  </div>
                  {saveError && <p className="mt-1 text-caption" style={{ color: "var(--expense-color)" }}>{saveError}</p>}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Budget sudah di-set — tampilkan info (SRS-27, 28, 29) */}
            {budgetData?.budget !== null && budgetData && (
              <>
                {/* Row: 3 angka */}
                <div className="grid grid-cols-3 gap-4 mb-5">
                  {/* Budget */}
                  <div>
                    <p className="text-caption font-semibold uppercase tracking-widest mb-1" style={{ color: "var(--text-secondary)" }}>
                      Budget
                    </p>
                    <p className="font-mono text-xl font-semibold tabular-nums truncate" style={{ color: "var(--text-primary)" }}>
                      {formatCurrency(budgetData.budget!)}
                    </p>
                  </div>
                  {/* Pengeluaran */}
                  <div>
                    <p className="text-caption font-semibold uppercase tracking-widest mb-1" style={{ color: "var(--text-secondary)" }}>
                      Terpakai
                    </p>
                    <p className="font-mono text-xl font-semibold tabular-nums truncate" style={{ color: "var(--expense-color)" }}>
                      {formatCurrency(budgetData.totalExpense)}
                    </p>
                  </div>
                  {/* Sisa */}
                  <div>
                    <p className="text-caption font-semibold uppercase tracking-widest mb-1" style={{ color: "var(--text-secondary)" }}>
                      Sisa
                    </p>
                    <p className="font-mono text-xl font-semibold tabular-nums truncate"
                      style={{ color: (budgetData.remaining ?? 0) >= 0 ? "var(--income-color)" : "var(--expense-color)" }}>
                      {formatCurrency(budgetData.remaining ?? 0)}
                    </p>
                  </div>
                </div>

                {/* Progress bar (SRS-28) */}
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-caption" style={{ color: "var(--text-secondary)" }}>
                      {budgetData.percentage}% terpakai
                    </span>
                    {/* Status badge (SRS-29) */}
                    {style && (
                      <span
                        className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
                        style={{ background: style.bg, color: style.text, border: `1px solid ${style.border}` }}
                      >
                        {budgetData.label}
                      </span>
                    )}
                  </div>
                  <div className="h-2.5 w-full rounded-full overflow-hidden" style={{ background: "var(--background)" }}>
                    <motion.div
                      className="h-full rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(budgetData.percentage ?? 0, 100)}%` }}
                      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                      style={{
                        background: style
                          ? `linear-gradient(90deg, ${style.border}88, ${style.border})`
                          : "var(--accent)",
                      }}
                    />
                  </div>
                </div>

                {/* Edit budget button */}
                {!editing && (
                  <button
                    onClick={() => setEditing(true)}
                    className="flex items-center gap-1.5 text-caption font-medium cursor-pointer hover:underline"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    <PencilSimple size={13} weight="regular" />
                    Ubah budget
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
