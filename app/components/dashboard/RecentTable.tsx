"use client";

// ============================================
// RecentTable — SRS-16
// Ko-fi: Sticker card container, pill badges,
// no shadows, black border
// ============================================

import { motion } from "motion/react";
import { ArrowUp, ArrowDown, Receipt, CalendarBlank } from "@phosphor-icons/react";
import type { Transaction } from "@/app/lib/mock-data";
import { formatCurrency, formatDate } from "@/app/lib/calculations";

interface RecentTableProps {
  transactions: Transaction[];
  limit?: number;
}

const containerVar = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04, delayChildren: 0.2 } },
};
const rowVar = {
  hidden: { opacity: 0, x: -8 },
  show: { opacity: 1, x: 0, transition: { duration: 0.28, ease: [0.16, 1, 0.3, 1] as const} },
};

export default function RecentTable({ transactions, limit = 8 }: RecentTableProps) {
  const recent = [...transactions]
    .sort((a, b) => new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime())
    .slice(0, limit);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.25, ease: [0.16, 1, 0.3, 1] as const}}
    >
      {/* Section header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
          <Receipt size={15} weight="regular" style={{ color: "var(--text-secondary)" }} />
          <h2 className="text-label-bold">Transaksi Terbaru</h2>
        </div>
        <div className="flex items-center gap-1.5" style={{ color: "var(--text-secondary)" }}>
          <CalendarBlank size={13} weight="regular" />
          <span className="text-caption">{recent.length} entri terakhir</span>
        </div>
      </div>

      {/* ── Sticker Card container ── */}
      <div
        className="overflow-hidden rounded-[32px]"
        style={{ background: "var(--card-bg)", border: "2px solid var(--card-border)" }}
      >
        {/* Desktop Table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr style={{ borderBottom: "1.5px solid var(--oat)", background: "var(--oat)" }}>
                {["Tanggal", "Keterangan", "Kategori", "Jenis", "Jumlah"].map((h) => (
                  <th
                    key={h}
                    className={`px-5 py-3 ${h === "Jumlah" ? "text-right" : "text-left"}`}
                  >
                    <span className="font-mono text-[11px] font-semibold uppercase tracking-widest" style={{ color: "var(--text-secondary)" }}>
                      {h}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <motion.tbody variants={containerVar} initial="hidden" animate="show">
              {recent.map((txn, i) => (
                  <motion.tr
                  key={txn.id}
                  variants={rowVar}
                  className="transition-colors duration-100"
                  style={{
                    borderBottom: i < recent.length - 1 ? "1px solid var(--background)" : "none",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--oat)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <td className="px-5 py-3.5">
                    <span className="font-mono text-body-sm tabular-nums" style={{ color: "var(--text-secondary)" }}>
                      {formatDate(txn.transaction_date)}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-body font-medium" style={{ color: "var(--text-primary)" }}>
                      {txn.description}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    {/* Category pill tag */}
                    <span
                      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-caption font-medium"
                      style={{
                        background: "var(--background)",
                        border: "1px solid var(--oat)",
                        color: "var(--text-secondary)",
                      }}
                    >
                      {txn.category}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    {/* Type pill — Ko-fi style */}
                    <span
                      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-mono text-xs font-semibold"
                      style={{
                        background: txn.type === "income" ? "var(--income-surface)" : "var(--expense-surface)",
                        border: "1px solid var(--card-border)",
                        color: txn.type === "income" ? "var(--income-color)" : "var(--expense-color)",
                      }}
                    >
                      {txn.type === "income"
                        ? <ArrowUp size={10} weight="bold" />
                        : <ArrowDown size={10} weight="bold" />}
                      {txn.type === "income" ? "Masuk" : "Keluar"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <span
                      className="font-mono text-body tabular-nums font-semibold"
                      style={{ color: txn.type === "income" ? "var(--income-color)" : "var(--expense-color)" }}
                    >
                      {txn.type === "income" ? "+" : "−"}{formatCurrency(txn.amount)}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </motion.tbody>
          </table>
        </div>

        {/* Mobile List */}
        <motion.div
          variants={containerVar}
          initial="hidden"
          animate="show"
          className="block sm:hidden"
          style={{ borderTop: "none" }}
        >
          {recent.map((txn, i) => (
            <motion.div
              key={txn.id}
              variants={rowVar}
              className="flex items-center gap-3 px-4 py-4"
              style={{ borderBottom: i < recent.length - 1 ? "1px solid var(--background)" : "none" }}
            >
              <div
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full"
                style={{
                  background: txn.type === "income" ? "var(--income-surface)" : "var(--expense-surface)",
                  border: "1.5px solid var(--card-border)",
                  color: txn.type === "income" ? "var(--income-color)" : "var(--expense-color)",
                }}
              >
                {txn.type === "income" ? <ArrowUp size={14} weight="bold" /> : <ArrowDown size={14} weight="bold" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-body font-medium truncate" style={{ color: "var(--text-primary)" }}>
                  {txn.description}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <p className="font-mono text-caption" style={{ color: "var(--text-secondary)" }}>
                    {formatDate(txn.transaction_date)}
                  </p>
                  <span style={{ color: "var(--oat)" }}>·</span>
                  <p className="text-caption" style={{ color: "var(--text-secondary)" }}>
                    {txn.category}
                  </p>
                </div>
              </div>
              <p
                className="font-mono text-body tabular-nums font-semibold flex-shrink-0"
                style={{ color: txn.type === "income" ? "var(--income-color)" : "var(--expense-color)" }}
              >
                {txn.type === "income" ? "+" : "−"}{formatCurrency(txn.amount)}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Footer */}
        <div
          className="flex items-center justify-between px-5 py-3"
          style={{ borderTop: "1.5px solid var(--background)", background: "var(--oat)" }}
        >
          <span className="font-mono text-caption" style={{ color: "var(--text-secondary)" }}>
            {recent.length} / {transactions.length} transaksi
          </span>
          <button
            type="button"
            className="rounded-full px-4 py-1.5 text-caption font-semibold cursor-pointer transition-colors duration-150"
            style={{
              background: "var(--accent)",
              border: "1.5px solid var(--card-border)",
              color: "var(--background)",
            }}
          >
            Lihat semua
          </button>
        </div>
      </div>
    </motion.div>
  );
}
