"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");

        const res = await fetch("/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password }),
        });
        const data = await res.json();

        if (!res.ok) {
            setError(data.error || "Register failed");
            return;
        }

        const loginRes = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        if (loginRes.ok) {
            router.push("/dashboard");
            router.refresh();
        } else {
            router.push("/login");
        }
    }

    return (
        <div style={{ maxWidth: 320, margin: "80px auto", fontFamily: "sans-serif" }}>
            <h1>Register</h1>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{ display: "block", width: "100%", marginBottom: 8, padding: 8, border: "1px solid black" }}
                />
                <input
                    type="email"
                    placeholder="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ display: "block", width: "100%", marginBottom: 8, padding: 8, border: "1px solid black" }}
                />
                <input
                    type="password"
                    placeholder="password (min 6 chars)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ display: "block", width: "100%", marginBottom: 8, padding: 8, border: "1px solid black" }}
                />
                {error && <p style={{ color: "black", fontWeight: "bold" }}>{error}</p>}
                <button type="submit" style={{ width: "100%", padding: 8, background: "black", color: "white" }}>
                    Register
                </button>
            </form>
            <p style={{ marginTop: 12 }}>
                <Link href="/login">Login instead</Link>
            </p>
        </div>
    );
}