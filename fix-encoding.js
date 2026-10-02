const fs = require("fs");
const content = `// ============================================
// Financial Calculations — SRS-17
// Saldo = Total Pemasukan - Total Pengeluaran
// ============================================

import type { Transaction } from "./mock-data";

export interface FinancialSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

/**
 * Menghitung ringkasan keuangan dari array transaksi.
 * SRS-17: Saldo = total pemasukan - total pengeluaran
 */
export function calculateFinancials(transactions: Transaction[]): FinancialSummary {
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;

  return { totalIncome, totalExpense, balance };
}

/**
 * Format angka ke format Rupiah Indonesia.
 * Contoh: 5000000 -> "Rp 5.000.000"
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format tanggal ke format Indonesia.
 * Contoh: "2026-09-24" -> "24 Sep 2026"
 */
export function formatDate(dateString: string): string {
  // transaction_date dari DB adalah format date ISO: YYYY-MM-DD
  const date = new Date(dateString + "T00:00:00"); // hindari timezone shift
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

// ============================================
// Budget Calculations — SRS-28, SRS-29
// ============================================

export type BudgetStatus = "aman" | "waspada" | "hampir_habis" | "melebihi";

export interface BudgetInfo {
  budget: number;
  totalExpense: number;
  remaining: number;
  percentage: number;
  status: BudgetStatus;
  label: string;
  colorVar: string;
}

/**
 * Hitung status penggunaan budget (SRS-29).
 * Threshold: <=50% Aman, <=80% Waspada, <=100% Hampir Habis, >100% Melebihi.
 */
export function calculateBudgetStatus(budget: number, totalExpense: number): BudgetInfo {
  const remaining = budget - totalExpense;
  const percentage = budget > 0 ? (totalExpense / budget) * 100 : 0;

  let status: BudgetStatus;
  let label: string;
  let colorVar: string;

  if (percentage <= 50) {
    status = "aman"; label = "Aman"; colorVar = "--income-color";
  } else if (percentage <= 80) {
    status = "waspada"; label = "Waspada"; colorVar = "--color-warning";
  } else if (percentage <= 100) {
    status = "hampir_habis"; label = "Hampir Habis"; colorVar = "--color-danger";
  } else {
    status = "melebihi"; label = "Melebihi Budget"; colorVar = "--expense-color";
  }

  return {
    budget,
    totalExpense,
    remaining,
    percentage: Math.round(percentage * 10) / 10,
    status,
    label,
    colorVar,
  };
}

/**
 * Format bulan ke tampilan Indonesia.
 * "2026-10" -> "Oktober 2026"
 */
export function formatMonth(monthStr: string): string {
  const [year, month] = monthStr.split("-").map(Number);
  return new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric" })
    .format(new Date(year, month - 1, 1));
}
`;
fs.writeFileSync("app/lib/calculations.ts", Buffer.from(content, "utf-8"));
