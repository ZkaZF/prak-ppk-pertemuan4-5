// ============================================
// GET /api/transactions — SRS-26 (Lihat Semua)
// Paginated list semua transaksi user
// Query params: ?page=1&limit=20&month=2026-10
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
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? 20)));
  const offset = (page - 1) * limit;
  const monthParam = searchParams.get("month");

  // Build filter kondisi
  const conditions: string[] = ["user_id = $1"];
  const params: (string | number)[] = [user.id];

  if (monthParam && /^\d{4}-\d{2}$/.test(monthParam)) {
    const [year, month] = monthParam.split("-").map(Number);
    const dateStart = `${year}-${String(month).padStart(2, "0")}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const dateEnd = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
    conditions.push(`transaction_date BETWEEN $${params.length + 1} AND $${params.length + 2}`);
    params.push(dateStart, dateEnd);
  }

  const where = conditions.join(" AND ");

  try {
    const [dataResult, countResult] = await Promise.all([
      pool.query(
        `SELECT id, user_id, type,
                CAST(amount AS FLOAT) AS amount,
                COALESCE(category, '') AS category,
                COALESCE(description, '') AS description,
                TO_CHAR(transaction_date, 'YYYY-MM-DD') AS transaction_date,
                created_at
         FROM transactions
         WHERE ${where}
         ORDER BY transaction_date DESC, created_at DESC
         LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
        [...params, limit, offset]
      ),
      pool.query(
        `SELECT COUNT(*)::int AS total FROM transactions WHERE ${where}`,
        params
      ),
    ]);

    const total = countResult.rows[0].total;
    return NextResponse.json({
      transactions: dataResult.rows,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("[api/transactions] Error:", err);
    return NextResponse.json({ error: "Gagal mengambil transaksi." }, { status: 500 });
  }
}
