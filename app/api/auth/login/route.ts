import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import pool from "@/lib/db";
import { createSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
    try {
        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json(
                { error: "Email dan password wajib diisi." },
                { status: 400 }
            );
        }

        const normalizedEmail = String(email).toLowerCase().trim();

        const result = await pool.query(
            "SELECT id, name, email, password_hash FROM users WHERE email = $1",
            [normalizedEmail]
        );

        const user = result.rows[0];

        // Same error for both cases so we don't leak whether the email exists
        if (!user) {
            return NextResponse.json(
                { error: "Email atau password salah." },
                { status: 401 }
            );
        }

        const passwordMatch = await bcrypt.compare(password, user.password_hash);

        if (!passwordMatch) {
            return NextResponse.json(
                { error: "Email atau password salah." },
                { status: 401 }
            );
        }

        await createSession(user.id);

        return NextResponse.json({
            user: { id: user.id, name: user.name, email: user.email },
        });
    } catch (err) {
        console.error("Login error:", err);
        return NextResponse.json(
            { error: "Terjadi kesalahan pada server." },
            { status: 500 }
        );
    }
}