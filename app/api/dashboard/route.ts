// ============================================
// GET /api/dashboard — SRS-26 Dashboard AJAX
// Returns user info, financial summary, recent transactions
// ============================================

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import pool from "@/lib/db";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Belum login." }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const monthParam = searchParams.get("month"); // "2026-10"

  // Rentang tanggal (default: bulan ini)
  let dateStart: string;
  let dateEnd: string;
  if (monthParam && /^\d{4}-\d{2}$/.test(monthParam)) {
    const [year, month] = monthParam.split("-").map(Number);
    dateStart = `${year}-${String(month).padStart(2, "0")}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    dateEnd = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
  } else {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    dateStart = `${year}-${String(month).padStart(2, "0")}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    dateEnd = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
  }

  try {
    // Hitung income & expense bulan terpilih (SRS-17)
    const summaryResult = await pool.query<{ type: string; total: string }>(
      `SELECT type, COALESCE(SUM(amount), 0)::text AS total
       FROM transactions
       WHERE user_id = $1 AND transaction_date BETWEEN $2 AND $3
       GROUP BY type`,
      [user.id, dateStart, dateEnd]
    );

    let totalIncome = 0;
    let totalExpense = 0;
    for (const row of summaryResult.rows) {
      if (row.type === "income") totalIncome = Number(row.total);
      if (row.type === "expense") totalExpense = Number(row.total);
    }

    // 8 transaksi terbaru (semua waktu, bukan hanya bulan ini) (SRS-16)
    const recentResult = await pool.query(
      `SELECT id, user_id, type,
              CAST(amount AS FLOAT) AS amount,
              COALESCE(category, '') AS category,
              COALESCE(description, '') AS description,
              TO_CHAR(transaction_date, 'YYYY-MM-DD') AS transaction_date,
              created_at
       FROM transactions
       WHERE user_id = $1
       ORDER BY transaction_date DESC, created_at DESC
       LIMIT 8`,
      [user.id]
    );

    // Total semua transaksi user (untuk counter "X / N transaksi")
    const countResult = await pool.query(
      `SELECT COUNT(*)::int AS total FROM transactions WHERE user_id = $1`,
      [user.id]
    );

    return NextResponse.json({
      user: { id: user.id, name: user.name, email: user.email },
      summary: { totalIncome, totalExpense, balance: totalIncome - totalExpense },
      recentTransactions: recentResult.rows,
      totalTransactions: countResult.rows[0].total,
    });
  } catch (err) {
    console.error("[api/dashboard] Error:", err);
    return NextResponse.json({ error: "Gagal mengambil data dashboard." }, { status: 500 });
  }
}
