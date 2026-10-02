import { cookies } from "next/headers";
import pool from "@/lib/db";

export const SESSION_COOKIE = "session";
const SESSION_DURATION_SECONDS = 60 * 60 * 24; // 24 hours

export async function createSession(userId: string) {
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, userId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: SESSION_DURATION_SECONDS,
    });
}

export async function getCurrentUser() {
    const cookieStore = await cookies();
    const userId = cookieStore.get(SESSION_COOKIE)?.value;
    if (!userId) return null;

    const result = await pool.query(
        "SELECT id, name, email FROM users WHERE id = $1",
        [userId]
    );
    return result.rows[0] ?? null;
}

export async function requireAuth() {
    const user = await getCurrentUser();
    if (!user) {
        return new Response(JSON.stringify({ error: "Belum login." }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
        });
    }
    return user;
}

export async function destroySession() {
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE);
}