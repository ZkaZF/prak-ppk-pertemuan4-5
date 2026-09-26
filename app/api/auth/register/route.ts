import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import pool from "@/lib/db";

export async function POST(req: NextRequest) {
    try {
        const { name, email, password } = await req.json();

        if (!name || !email || !password) {
            return NextResponse.json(
                { error: "Nama, email, dan password wajib diisi." },
                { status: 400 }
            );
        }

        if (typeof password !== "string" || password.length < 6) {
            return NextResponse.json(
                { error: "Password minimal 6 karakter." },
                { status: 400 }
            );
        }

        const normalizedEmail = String(email).toLowerCase().trim();

        const existing = await pool.query(
            "SELECT id FROM users WHERE email = $1",
            [normalizedEmail]
        );

        if (existing.rows.length > 0) {
            return NextResponse.json(
                { error: "Email sudah terdaftar." },
                { status: 409 }
            );
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const result = await pool.query(
            `INSERT INTO users (name, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, name, email, created_at`,
            [name, normalizedEmail, passwordHash]
        );

        return NextResponse.json({ user: result.rows[0] }, { status: 201 });
    } catch (err) {
        console.error("Register error:", err);
        return NextResponse.json(
            { error: "Terjadi kesalahan pada server." },
            { status: 500 }
        );
    }
}