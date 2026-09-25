"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");

        const res = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });
        const data = await res.json();

        if (!res.ok) {
            setError(data.error || "Login failed");
            return;
        }

        router.push(searchParams.get("redirect") || "/dashboard");
        router.refresh();
    }

    return (
        <div style={{ maxWidth: 320, margin: "80px auto", fontFamily: "sans-serif" }}>
            <h1>Login</h1>
            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    placeholder="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ display: "block", width: "100%", marginBottom: 8, padding: 8, border: "1px solid black" }}
                />
                <input
                    type="password"
                    placeholder="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ display: "block", width: "100%", marginBottom: 8, padding: 8, border: "1px solid black" }}
                />
                {error && <p style={{ color: "black", fontWeight: "bold" }}>{error}</p>}
                <button type="submit" style={{ width: "100%", padding: 8, background: "black", color: "white" }}>
                    Login
                </button>
            </form>
            <p style={{ marginTop: 12 }}>
                <Link href="/register">Register instead</Link>
            </p>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense>
            <LoginForm />
        </Suspense>
    );
}