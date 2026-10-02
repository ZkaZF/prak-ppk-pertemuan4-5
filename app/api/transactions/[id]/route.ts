import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { TransactionInput } from "@/types/transaction";

async function findOwnedTransaction(id: string, userId: string) {
  return prisma.transaction.findFirst({ where: { id, userId } });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser(req);
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { id } = await params; // <-- ini yang di-fix
  const existing = await findOwnedTransaction(id, user.id);
  if (!existing) return NextResponse.json({ message: "Transaksi tidak ditemukan" }, { status: 404 });

  const body: Partial<TransactionInput> = await req.json();
  
  const updated = await prisma.transaction.update({
    where: { id },
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

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser(req);
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { id } = await params; // <-- ini yang di-fix
  const existing = await findOwnedTransaction(id, user.id);
  if (!existing) return NextResponse.json({ message: "Transaksi tidak ditemukan" }, { status: 404 });

  await prisma.transaction.delete({ where: { id } });
  return NextResponse.json({ message: "Transaksi berhasil dihapus" });
}
