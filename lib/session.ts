import { NextRequest } from "next/server";

/**
 * ============================================================
 * BLACK BOX — akan digantikan implementasi ASLI dari
 * Programmer 1 (Authentication & Authorization / SRS-01..06)
 * saat merge oleh PM.
 *
 * Kontrak yang diasumsikan Programmer 2:
 *  - getSessionUser(req) mengembalikan user yang sedang login
 *    (berdasarkan cookie/session/JWT), atau null jika belum login.
 * ============================================================
 */

export type SessionUser = {
  id: string;
  name: string;
  email: string;
};

export async function getSessionUser(
  req: NextRequest
): Promise<SessionUser | null> {
  // TODO(PM / Programmer 1): ganti dengan pengecekan session asli.
  // Mock sementara supaya endpoint transaksi bisa dites via header:
  // "x-user-id: <uuid-user>"
  const mockUserId = req.headers.get("x-user-id");
  if (!mockUserId) return null;

  return { id: mockUserId, name: "Mock User", email: "mock@example.com" };
}
