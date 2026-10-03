import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import pool from "@/lib/db";

function isValidMonth(value: string | null): value is string {
    if (!value || !/^\d{4}-(0[1-9]|1[0-2])$/.test(value)) {
        return false;
    }
    const year = Number(value.slice(0, 4));
    return year >= 1 && year <= 9999;
}

function isValidAmount(value: unknown): value is string {
    if (typeof value !== "string" || !/^\d{1,12}(?:\.\d{1,2})?$/.test(value)) {
        return false;
    }
    return Number(value) > 0;
}

function isMissingBudgetTable(error: unknown): boolean {
    return typeof error === "object"
        && error !== null
        && "code" in error
        && error.code === "42P01";
}

export async function GET(request: Request) {
    const user = await getCurrentUser();
    if (!user) {
        return NextResponse.json({ error: "Belum login." }, { status: 401 });
    }

    const month = new URL(request.url).searchParams.get("month");
    if (!isValidMonth(month)) {
        return NextResponse.json({ error: "Format bulan harus YYYY-MM." }, { status: 400 });
    }

    try {
        const monthStart = `${month}-01`;
        const [budgetResult, expenseResult] = await Promise.all([
            pool.query(
                `SELECT amount::text AS amount
                 FROM budgets
                 WHERE user_id = $1 AND month = $2::date`,
                [user.id, monthStart],
            ),
            pool.query(
                `SELECT COALESCE(SUM(amount), 0)::text AS total
                 FROM transactions
                 WHERE user_id = $1
                   AND type = 'expense'
                   AND transaction_date >= $2::date
                   AND transaction_date < ($2::date + INTERVAL '1 month')`,
                [user.id, monthStart],
            ),
        ]);

        return NextResponse.json(
            {
                month,
                budget: budgetResult.rows[0]?.amount ?? null,
                expenses: expenseResult.rows[0].total,
            },
            { headers: { "Cache-Control": "private, no-store" } },
        );
    } catch (error) {
        console.error("Get monthly budget error:", error);
        if (isMissingBudgetTable(error)) {
            return NextResponse.json(
                { error: "Tabel budgets belum tersedia di database aplikasi." },
                { status: 503 },
            );
        }
        return NextResponse.json({ error: "Gagal memuat data budget." }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    const user = await getCurrentUser();
    if (!user) {
        return NextResponse.json({ error: "Belum login." }, { status: 401 });
    }

    let payload: unknown;
    try {
        payload = await request.json();
    } catch {
        return NextResponse.json({ error: "Body request harus berupa JSON yang valid." }, { status: 400 });
    }

    if (!payload || typeof payload !== "object" || !("month" in payload) || !("amount" in payload)) {
        return NextResponse.json({ error: "Bulan dan nominal budget wajib diisi." }, { status: 400 });
    }

    const { month, amount } = payload;
    if (typeof month !== "string" || !isValidMonth(month)) {
        return NextResponse.json({ error: "Format bulan harus YYYY-MM." }, { status: 400 });
    }
    if (!isValidAmount(amount)) {
        return NextResponse.json(
            { error: "Nominal budget harus lebih dari 0 dan maksimal 2 angka desimal." },
            { status: 400 },
        );
    }

    try {
        const result = await pool.query(
            `INSERT INTO budgets (user_id, month, amount, created_at)
             VALUES ($1, $2::date, $3, now())
             ON CONFLICT (user_id, month)
             DO UPDATE SET amount = EXCLUDED.amount
             RETURNING amount::text AS amount`,
            [user.id, `${month}-01`, amount],
        );

        const expenseResult = await pool.query(
            `SELECT COALESCE(SUM(amount), 0)::text AS total
             FROM transactions
             WHERE user_id = $1
               AND type = 'expense'
               AND transaction_date >= $2::date
               AND transaction_date < ($2::date + INTERVAL '1 month')`,
            [user.id, `${month}-01`],
        );

        return NextResponse.json(
            {
                month,
                budget: result.rows[0].amount,
                expenses: expenseResult.rows[0].total,
            },
            { headers: { "Cache-Control": "private, no-store" } },
        );
    } catch (error) {
        console.error("Save monthly budget error:", error);
        if (isMissingBudgetTable(error)) {
            return NextResponse.json(
                { error: "Tabel budgets belum tersedia di database aplikasi." },
                { status: 503 },
            );
        }
        return NextResponse.json({ error: "Gagal menyimpan budget." }, { status: 500 });
    }
}
