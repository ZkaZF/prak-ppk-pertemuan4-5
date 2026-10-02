import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { TransactionInput } from "@/types/transaction";

/**
 * GET /api/transactions
 * GET /api/transactions?type=income | expense
 * GET /api/transactions?month=2026-10
 * GET /api/transactions?page=1&limit=20
 *
 * SRS-08 Transaction History : Pengguna dapat melihat riwayat transaksi keuangannya.
 * SRS-11 Transaction Filter  : Pengguna dapat memfilter transaksi berdasarkan jenis.
 * SRS-12 User-Transaction    : hanya mengembalikan transaksi milik user yang login.
 * SRS-26 Dashboard AJAX      : "Lihat semua" memakai pagination dan filter bulan.
 *
 * Pagination bersifat opsional. Jika "page" dan "limit" tidak dikirim,
 * semua transaksi yang cocok dengan filter dikembalikan.
 */
export async function GET(req: NextRequest) {
  const user = await getSessionUser(req);
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const monthParam = searchParams.get("month");
  const pageParam = searchParams.get("page");
  const limitParam = searchParams.get("limit");

  if (type && type !== "income" && type !== "expense") {
    return NextResponse.json(
      { message: "Parameter 'type' harus income atau expense" },
      { status: 400 }
    );
  }

  if (monthParam && !/^\d{4}-(0[1-9]|1[0-2])$/.test(monthParam)) {
    return NextResponse.json(
      { message: "Parameter 'month' harus berformat YYYY-MM" },
      { status: 400 }
    );
  }

  // Filter bulan: dari tanggal 1 bulan terpilih sampai sebelum tanggal 1 bulan berikutnya
  let dateFilter = {};
  if (monthParam) {
    const [year, month] = monthParam.split("-").map(Number);
    dateFilter = {
      date: {
        gte: new Date(Date.UTC(year, month - 1, 1)),
        lt: new Date(Date.UTC(year, month, 1)),
      },
    };
  }

  const where = {
    userId: user.id, // SRS-12: relasi user-transaksi
    ...(type ? { type } : {}),
    ...dateFilter,
  };

  const paginated = pageParam !== null || limitParam !== null;
  const page = Math.max(1, Number(pageParam ?? 1) || 1);
  const limit = Math.min(100, Math.max(1, Number(limitParam ?? 20) || 20));

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      orderBy: { date: "desc" },
      ...(paginated ? { skip: (page - 1) * limit, take: limit } : {}),
    }),
    prisma.transaction.count({ where }),
  ]);

  return NextResponse.json({
    data: transactions,
    total,
    page: paginated ? page : 1,
    limit: paginated ? limit : total,
    totalPages: paginated ? Math.ceil(total / limit) : 1,
  });
}

/**
 * POST /api/transactions
 * Body: { type, amount, category?, description?, date? }
 *
 * SRS-07 Add Transaction: Pengguna dapat menambahkan transaksi
 * berupa pemasukan atau pengeluaran.
 */
export async function POST(req: NextRequest) {
  const user = await getSessionUser(req);
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body: TransactionInput = await req.json();

  if (!body.type || !["income", "expense"].includes(body.type)) {
    return NextResponse.json(
      { message: "'type' wajib diisi (income atau expense)" },
      { status: 400 }
    );
  }
  if (typeof body.amount !== "number" || body.amount <= 0) {
    return NextResponse.json(
      { message: "'amount' wajib diisi dan harus lebih dari 0" },
      { status: 400 }
    );
  }

  const transaction = await prisma.transaction.create({
    data: {
      type: body.type,
      amount: body.amount,
      category: body.category,
      description: body.description,
      date: body.date ? new Date(body.date) : new Date(),
      userId: user.id, // SRS-12
    },
  });

  return NextResponse.json({ data: transaction }, { status: 201 });
}