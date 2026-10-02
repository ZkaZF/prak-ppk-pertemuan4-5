// ============================================
// GET  /api/budget?month=2026-10 — SRS-27,28,29,31
// POST /api/budget { month, amount } — set budget
// ============================================

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import pool from "@/lib/db";

// Menentukan status berdasarkan persentase (SRS-29)
function getBudgetStatus(percentage: number): {
  status: "aman" | "waspada" | "hampir_habis" | "melebihi";
  label: string;
  color: string;
} {
  if (percentage <= 50)  return { status: "aman",         label: "Aman",           color: "income"  };
  if (percentage <= 80)  return { status: "waspada",      label: "Waspada",        color: "warning" };
  if (percentage <= 100) return { status: "hampir_habis", label: "Hampir Habis",   color: "danger"  };
  return                        { status: "melebihi",     label: "Melebihi Budget", color: "expense" };
}

// ─── GET: Ambil budget + kalkulasi ─────────────────────────────────────────
export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Belum login." }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const monthParam = searchParams.get("month");

  // Default: bulan ini
  const now = new Date();
  const defaultYear = now.getFullYear();
  const defaultMonth = now.getMonth() + 1;
  let year = defaultYear;
  let month = defaultMonth;

  if (monthParam && /^\d{4}-\d{2}$/.test(monthParam)) {
    [year, month] = monthParam.split("-").map(Number);
  }

  const monthDate = `${year}-${String(month).padStart(2, "0")}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const dateEnd = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

  try {
    // Ambil budget yang di-set user untuk bulan ini
    const budgetResult = await pool.query(
      `SELECT amount FROM budgets
       WHERE user_id = $1 AND month = $2`,
      [user.id, monthDate]
    );

    // Hitung total pengeluaran bulan ini (SRS-28)
    const expenseResult = await pool.query(
      `SELECT COALESCE(SUM(amount), 0)::float AS total
       FROM transactions
       WHERE user_id = $1
         AND type = 'expense'
         AND transaction_date BETWEEN $2 AND $3`,
      [user.id, monthDate, dateEnd]
    );

    const budget = budgetResult.rows[0] ? Number(budgetResult.rows[0].amount) : null;
    const totalExpense = Number(expenseResult.rows[0].total);

    if (budget === null) {
      // Budget belum di-set
      return NextResponse.json({
        budget: null,
        totalExpense,
        remaining: null,
        percentage: null,
        status: null,
        month: `${year}-${String(month).padStart(2, "0")}`,
      });
    }

    const remaining = budget - totalExpense;
    const percentage = budget > 0 ? (totalExpense / budget) * 100 : 0;
    const statusInfo = getBudgetStatus(percentage);

    return NextResponse.json({
      budget,
      totalExpense,
      remaining,
      percentage: Math.round(percentage * 10) / 10,
      ...statusInfo,
      month: `${year}-${String(month).padStart(2, "0")}`,
    });
  } catch (err) {
    console.error("[api/budget GET] Error:", err);
    return NextResponse.json({ error: "Gagal mengambil data budget." }, { status: 500 });
  }
}

// ─── POST: Set / update budget bulan tertentu ──────────────────────────────
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Belum login." }, { status: 401 });

  try {
    const body = await req.json() as { month?: string; amount?: number };
    const { month: monthParam, amount } = body;

    if (!monthParam || !/^\d{4}-\d{2}$/.test(monthParam)) {
      return NextResponse.json({ error: "Format bulan tidak valid. Gunakan YYYY-MM." }, { status: 400 });
    }
    if (!amount || typeof amount !== "number" || amount <= 0) {
      return NextResponse.json({ error: "Amount budget harus berupa angka positif." }, { status: 400 });
    }

    const [year, month] = monthParam.split("-").map(Number);
    const monthDate = `${year}-${String(month).padStart(2, "0")}-01`;

    // UPSERT — insert atau update jika sudah ada
    await pool.query(
      `INSERT INTO budgets (user_id, month, amount)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, month) DO UPDATE SET amount = EXCLUDED.amount`,
      [user.id, monthDate, amount]
    );

    return NextResponse.json({ success: true, month: monthParam, amount });
  } catch (err) {
    console.error("[api/budget POST] Error:", err);
    return NextResponse.json({ error: "Gagal menyimpan budget." }, { status: 500 });
  }
}
