import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { TransactionInput } from "@/types/transaction";

/**
 * GET /api/transactions
 * GET /api/transactions?type=income | expense
 *
 * SRS-08 Transaction History : Pengguna dapat melihat riwayat transaksi keuangannya.
 * SRS-11 Transaction Filter  : Pengguna dapat memfilter transaksi berdasarkan jenis.
 * SRS-12 User-Transaction    : hanya mengembalikan transaksi milik user yang login.
 */
export async function GET(req: NextRequest) {
  const user = await getSessionUser(req);
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");

  if (type && type !== "income" && type !== "expense") {
    return NextResponse.json(
      { message: "Parameter 'type' harus income atau expense" },
      { status: 400 }
    );
  }

  const transactions = await prisma.transaction.findMany({
    where: {
      userId: user.id, // SRS-12: relasi user-transaksi
      ...(type ? { type } : {}),
    },
    orderBy: { date: "desc" },
  });

  return NextResponse.json({ data: transactions });
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
