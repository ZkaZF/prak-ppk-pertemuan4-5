"use client";

// ============================================
// SummaryCards — SRS-15 & SRS-17
// Ko-fi design: Sticker Cards (white + 2px black border)
// Oat Cream feature surface for balance card
// Pill badges, no shadows
// ============================================

import { motion } from "motion/react";
import { Wallet, TrendUp, TrendDown, ArrowUpRight } from "@phosphor-icons/react";
import type { FinancialSummary } from "@/app/lib/calculations";
import { formatCurrency } from "@/app/lib/calculations";

interface SummaryCardsProps {
  summary: FinancialSummary;
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

const cardAnim = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const} },
};

export default function SummaryCards({ summary }: SummaryCardsProps) {
  const isPositive = summary.balance >= 0;

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5"
    >
      {/* ── Balance — Oat Feature Card (wider) ── */}
      <motion.div
        variants={cardAnim}
        className="col-span-1 sm:col-span-2 lg:col-span-2 flex flex-col justify-between rounded-[40px] p-7"
        style={{
          background: "var(--oat)",
          border: "2px solid var(--card-border)",
        }}
      >
        {/* Top row */}
        <div className="mb-6 flex items-start justify-between">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-full"
            style={{ background: "var(--accent-surface)", border: "2px solid var(--card-border)" }}
          >
            <Wallet size={18} weight="fill" style={{ color: "var(--text-primary)" }} />
          </div>
          {/* Surplus / Defisit pill badge */}
          <span
            className="flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold"
            style={{
              background: isPositive ? "var(--accent-surface)" : "var(--expense-surface)",
              border: "1.5px solid var(--card-border)",
              color: "var(--text-primary)",
            }}
          >
            <ArrowUpRight size={11} weight="bold" className={isPositive ? "" : "rotate-90"} />
            {isPositive ? "Surplus" : "Defisit"}
          </span>
        </div>

        <div>
          <p className="mb-1 text-caption font-semibold uppercase tracking-widest" style={{ color: "#7a6a58" }}>
            Saldo Bersih
          </p>
          <p
            className="font-mono text-2xl sm:text-3xl font-semibold tabular-nums leading-none tracking-tight truncate"
            style={{ color: isPositive ? "var(--text-primary)" : "var(--expense-color)" }}
            title={formatCurrency(summary.balance)}
          >
            {formatCurrency(summary.balance)}
          </p>
          <p className="mt-2 text-caption" style={{ color: "#7a6a58" }}>
            Total aset tersedia saat ini
          </p>
        </div>
      </motion.div>

      {/* ── Income + Expense — Sticker Cards ── */}
      <motion.div
        variants={cardAnim}
        className="col-span-1 lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-4"
      >
        {/* Income */}
        <div
          className="flex flex-col justify-between rounded-[40px] p-6 cursor-default group"
          style={{ background: "var(--card-bg)", border: "2px solid var(--card-border)" }}
        >
          <div className="mb-4">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-full mb-4"
              style={{ background: "var(--income-surface)", border: "1.5px solid var(--card-border)" }}
            >
              <TrendUp size={18} weight="fill" style={{ color: "var(--income-color)" }} />
            </div>
            <p className="text-caption font-semibold uppercase tracking-widest truncate" style={{ color: "var(--text-secondary)" }} title="Total Pemasukan">
              Total Pemasukan
            </p>
          </div>
          <p
            className="font-mono text-xl sm:text-2xl lg:text-xl xl:text-2xl font-semibold tabular-nums leading-none truncate"
            style={{ color: "var(--income-color)" }}
            title={`+${formatCurrency(summary.totalIncome)}`}
          >
            +{formatCurrency(summary.totalIncome)}
          </p>
        </div>

        {/* Expense */}
        <div
          className="flex flex-col justify-between rounded-[40px] p-6 cursor-default"
          style={{ background: "var(--card-bg)", border: "2px solid var(--card-border)" }}
        >
          <div className="mb-4">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-full mb-4"
              style={{ background: "var(--expense-surface)", border: "1.5px solid var(--card-border)" }}
            >
              <TrendDown size={18} weight="fill" style={{ color: "var(--expense-color)" }} />
            </div>
            <p className="text-caption font-semibold uppercase tracking-widest truncate" style={{ color: "var(--text-secondary)" }} title="Total Pengeluaran">
              Total Pengeluaran
            </p>
          </div>
          <p
            className="font-mono text-xl sm:text-2xl lg:text-xl xl:text-2xl font-semibold tabular-nums leading-none truncate"
            style={{ color: "var(--expense-color)" }}
            title={`-${formatCurrency(summary.totalExpense)}`}
          >
            −{formatCurrency(summary.totalExpense)}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
