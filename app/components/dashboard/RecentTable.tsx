"use client";

// ============================================
// RecentTable — SRS-16, SRS-26
// Tabel transaksi terbaru dengan "Lihat semua"
// fungsional via AJAX fetch /api/transactions
// ============================================

import { useState } from "react";
import { motion } from "motion/react";
import { ArrowUp, ArrowDown, Receipt, CalendarBlank, X } from "@phosphor-icons/react";
import type { Transaction } from "@/app/lib/mock-data";
import { formatCurrency, formatDate } from "@/app/lib/calculations";

interface RecentTableProps {
  transactions: Transaction[];
  totalTransactions: number;
  limit?: number;
  onRefetch?: () => void;  // SRS-31: trigger dashboard refresh
}

const containerVar = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04, delayChildren: 0.2 } },
};
const rowVar = {
  hidden: { opacity: 0, x: -8 },
  show: { opacity: 1, x: 0, transition: { duration: 0.28, ease: [0.16, 1, 0.3, 1] } },
};

export default function RecentTable({
  transactions,
  totalTransactions,
  limit = 8,
  onRefetch,
}: RecentTableProps) {
  const [allTxns, setAllTxns] = useState<Transaction[] | null>(null);
  const [loadingAll, setLoadingAll] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // SRS-26: Fetch semua transaksi via AJAX saat "Lihat semua" diklik
  async function handleLihatSemua() {
    setShowModal(true);
    if (allTxns !== null) return; // sudah ter-cache
    setLoadingAll(true);
    try {
      const res = await fetch("/api/transactions?limit=100", { cache: "no-store" });
      if (!res.ok) throw new Error();
      const json = await res.json() as { transactions: Transaction[] };
      setAllTxns(json.transactions);
    } catch {
      setAllTxns([]);
    } finally {
      setLoadingAll(false);
    }
  }

  const displayedTxns = transactions.slice(0, limit);
  const modalTxns = allTxns ?? displayedTxns;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Section header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
            <Receipt size={15} weight="regular" style={{ color: "var(--text-secondary)" }} />
            <h2 className="text-label-bold">Transaksi Terbaru</h2>
          </div>
          <div className="flex items-center gap-1.5" style={{ color: "var(--text-secondary)" }}>
            <CalendarBlank size={13} weight="regular" />
            <span className="text-caption">{displayedTxns.length} entri terakhir</span>
          </div>
        </div>

        {/* Sticker Card container */}
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
                    <th key={h} className={`px-5 py-3 ${h === "Jumlah" ? "text-right" : "text-left"}`}>
                      <span className="font-mono text-[11px] font-semibold uppercase tracking-widest" style={{ color: "var(--text-secondary)" }}>
                        {h}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <motion.tbody variants={containerVar} initial="hidden" animate="show">
                {displayedTxns.map((txn, i) => (
                  <motion.tr
                    key={txn.id}
                    variants={rowVar}
                    className="transition-colors duration-100"
                    style={{ borderBottom: i < displayedTxns.length - 1 ? "1px solid var(--background)" : "none" }}
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
                      <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-caption font-medium"
                        style={{ background: "var(--background)", border: "1px solid var(--oat)", color: "var(--text-secondary)" }}>
                        {txn.category}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-mono text-xs font-semibold"
                        style={{
                          background: txn.type === "income" ? "var(--income-surface)" : "var(--expense-surface)",
                          border: "1px solid var(--card-border)",
                          color: txn.type === "income" ? "var(--income-color)" : "var(--expense-color)",
                        }}>
                        {txn.type === "income" ? <ArrowUp size={10} weight="bold" /> : <ArrowDown size={10} weight="bold" />}
                        {txn.type === "income" ? "Masuk" : "Keluar"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <span className="font-mono text-body tabular-nums font-semibold"
                        style={{ color: txn.type === "income" ? "var(--income-color)" : "var(--expense-color)" }}>
                        {txn.type === "income" ? "+" : "−"}{formatCurrency(txn.amount)}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </motion.tbody>
            </table>
          </div>

          {/* Mobile List */}
          <motion.div variants={containerVar} initial="hidden" animate="show" className="block sm:hidden">
            {displayedTxns.map((txn, i) => (
              <motion.div key={txn.id} variants={rowVar}
                className="flex items-center gap-3 px-4 py-4"
                style={{ borderBottom: i < displayedTxns.length - 1 ? "1px solid var(--background)" : "none" }}>
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full"
                  style={{
                    background: txn.type === "income" ? "var(--income-surface)" : "var(--expense-surface)",
                    border: "1.5px solid var(--card-border)",
                    color: txn.type === "income" ? "var(--income-color)" : "var(--expense-color)",
                  }}>
                  {txn.type === "income" ? <ArrowUp size={14} weight="bold" /> : <ArrowDown size={14} weight="bold" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-body font-medium truncate" style={{ color: "var(--text-primary)" }}>{txn.description}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <p className="font-mono text-caption" style={{ color: "var(--text-secondary)" }}>{formatDate(txn.transaction_date)}</p>
                    <span style={{ color: "var(--oat)" }}>·</span>
                    <p className="text-caption" style={{ color: "var(--text-secondary)" }}>{txn.category}</p>
                  </div>
                </div>
                <p className="font-mono text-body tabular-nums font-semibold flex-shrink-0"
                  style={{ color: txn.type === "income" ? "var(--income-color)" : "var(--expense-color)" }}>
                  {txn.type === "income" ? "+" : "−"}{formatCurrency(txn.amount)}
                </p>
              </motion.div>
            ))}
          </motion.div>

          {/* Footer */}
          <div className="flex items-center justify-between px-5 py-3"
            style={{ borderTop: "1.5px solid var(--background)", background: "var(--oat)" }}>
            <span className="font-mono text-caption" style={{ color: "var(--text-secondary)" }}>
              {displayedTxns.length} / {totalTransactions} transaksi
            </span>
            <button
              type="button"
              onClick={handleLihatSemua}
              className="rounded-full px-4 py-1.5 text-caption font-semibold cursor-pointer transition-colors duration-150"
              style={{ background: "var(--accent)", border: "1.5px solid var(--card-border)", color: "var(--background)" }}
            >
              Lihat semua
            </button>
          </div>
        </div>
      </motion.div>

      {/* Modal: Semua Transaksi (SRS-26) */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-3xl max-h-[80vh] overflow-hidden rounded-[32px] flex flex-col"
            style={{ background: "var(--card-bg)", border: "2px solid var(--card-border)" }}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4"
              style={{ borderBottom: "1.5px solid var(--oat)", background: "var(--oat)" }}>
              <span className="text-label-bold" style={{ color: "var(--text-primary)" }}>
                Semua Transaksi ({totalTransactions})
              </span>
              <button onClick={() => setShowModal(false)}
                className="h-8 w-8 flex items-center justify-center rounded-full cursor-pointer"
                style={{ border: "1.5px solid var(--card-border)", color: "var(--text-secondary)" }}>
                <X size={14} weight="bold" />
              </button>
            </div>

            {/* Modal body */}
            <div className="overflow-y-auto flex-1">
              {loadingAll ? (
                <div className="flex items-center justify-center py-12">
                  <div className="h-8 w-8 rounded-full border-2 animate-spin"
                    style={{ borderColor: "var(--card-border)", borderTopColor: "var(--accent)" }} />
                </div>
              ) : (
                <table className="w-full border-collapse">
                  <thead className="sticky top-0" style={{ background: "var(--card-bg)" }}>
                    <tr style={{ borderBottom: "1.5px solid var(--oat)" }}>
                      {["Tanggal", "Keterangan", "Kategori", "Jenis", "Jumlah"].map((h) => (
                        <th key={h} className={`px-5 py-3 ${h === "Jumlah" ? "text-right" : "text-left"}`}>
                          <span className="font-mono text-[11px] font-semibold uppercase tracking-widest" style={{ color: "var(--text-secondary)" }}>
                            {h}
                          </span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {modalTxns.map((txn, i) => (
                      <tr key={txn.id}
                        style={{ borderBottom: i < modalTxns.length - 1 ? "1px solid var(--background)" : "none" }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--oat)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                        <td className="px-5 py-3">
                          <span className="font-mono text-body-sm tabular-nums" style={{ color: "var(--text-secondary)" }}>
                            {formatDate(txn.transaction_date)}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <span className="text-body font-medium" style={{ color: "var(--text-primary)" }}>{txn.description}</span>
                        </td>
                        <td className="px-5 py-3">
                          <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-caption font-medium"
                            style={{ background: "var(--background)", border: "1px solid var(--oat)", color: "var(--text-secondary)" }}>
                            {txn.category}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-mono text-xs font-semibold"
                            style={{
                              background: txn.type === "income" ? "var(--income-surface)" : "var(--expense-surface)",
                              border: "1px solid var(--card-border)",
                              color: txn.type === "income" ? "var(--income-color)" : "var(--expense-color)",
                            }}>
                            {txn.type === "income" ? <ArrowUp size={10} weight="bold" /> : <ArrowDown size={10} weight="bold" />}
                            {txn.type === "income" ? "Masuk" : "Keluar"}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <span className="font-mono text-body tabular-nums font-semibold"
                            style={{ color: txn.type === "income" ? "var(--income-color)" : "var(--expense-color)" }}>
                            {txn.type === "income" ? "+" : "−"}{formatCurrency(txn.amount)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}
