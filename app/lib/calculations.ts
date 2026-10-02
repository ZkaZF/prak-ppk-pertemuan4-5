// ============================================
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
 * Contoh: 5000000 → "Rp 5.000.000"
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
 * Contoh: "2026-09-24" → "24 Sep 2026"
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
