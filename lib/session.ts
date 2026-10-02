import { NextRequest } from "next/server";
import pool from "./db";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
};

export async function getSessionUser(req: NextRequest): Promise<SessionUser | null> {
  const sessionCookie = req.cookies.get("session")?.value;
  const mockHeader = req.headers.get("x-user-id");
  const candidate = sessionCookie || mockHeader;

  if (!candidate) return null;

  try {
    // lib/auth.ts kamu set session = user.id, jadi cari user langsung
    const r = await pool.query(
      `SELECT id, name, email FROM users WHERE id = $1`,
      [candidate]
    );
    if (r.rows[0]) return r.rows[0];

    // fallback kalau Programmer 1 nanti pakai tabel sessions beneran
    const r2 = await pool.query(
      `SELECT u.id, u.name, u.email FROM users u
       JOIN sessions s ON s.user_id = u.id
       WHERE s.id = $1 AND (s.expires_at IS NULL OR s.expires_at > NOW())`,
      [candidate]
    );
    if (r2.rows[0]) return r2.rows[0];
  } catch (e) {
    console.error("[getSessionUser]", e);
  }

  if (mockHeader) {
    return { id: mockHeader, name: "Mock User", email: "mock@example.com" };
  }
  return null;
}
