import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { TransactionInput } from "@/types/transaction";

async function findOwnedTransaction(id: string, userId: string) {
  // SRS-12: pastikan transaksi memang milik user yang login sebelum diubah/dihapus
  return prisma.transaction.findFirst({ where: { id, userId } });
}

/**
 * PUT /api/transactions/:id
 * Body: sebagian/seluruh field TransactionInput
 *
 * SRS-09 Edit Transaction: Pengguna dapat mengubah data transaksi miliknya.
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getSessionUser(req);
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const existing = await findOwnedTransaction(params.id, user.id);
  if (!existing) {
    return NextResponse.json(
      { message: "Transaksi tidak ditemukan" },
      { status: 404 }
    );
  }

  const body: Partial<TransactionInput> = await req.json();

  if (body.type && !["income", "expense"].includes(body.type)) {
    return NextResponse.json(
      { message: "'type' harus income atau expense" },
      { status: 400 }
    );
  }
  if (body.amount !== undefined && body.amount <= 0) {
    return NextResponse.json(
      { message: "'amount' harus lebih dari 0" },
      { status: 400 }
    );
  }

  const updated = await prisma.transaction.update({
    where: { id: params.id },
    data: {
      type: body.type,
      amount: body.amount,
      category: body.category,
      description: body.description,
      date: body.date ? new Date(body.date) : undefined,
    },
  });

  return NextResponse.json({ data: updated });
}

/**
 * DELETE /api/transactions/:id
 *
 * SRS-10 Delete Transaction: Pengguna dapat menghapus transaksi miliknya.
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getSessionUser(req);
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const existing = await findOwnedTransaction(params.id, user.id);
  if (!existing) {
    return NextResponse.json(
      { message: "Transaksi tidak ditemukan" },
      { status: 404 }
    );
  }

  await prisma.transaction.delete({ where: { id: params.id } });

  return NextResponse.json({ message: "Transaksi berhasil dihapus" });
}
