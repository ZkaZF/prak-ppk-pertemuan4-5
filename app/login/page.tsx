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
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="sticker-card w-full max-w-sm p-8 flex flex-col gap-6 relative">
                {/* A little decorative element or simple clean top */}
                <div className="text-center">
                    <h1 className="text-display text-4xl mb-2 text-[var(--text-primary)]">Login</h1>
                    <p className="text-body-sm text-[var(--text-secondary)]">Welcome back to FinTrack</p>
                </div>
                
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                        <input
                            type="email"
                            placeholder="Email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full border-2 border-[var(--card-border)] rounded-full px-5 py-3 text-body outline-none focus:border-[var(--accent)] bg-[var(--card-bg)] text-[var(--text-primary)] transition-colors"
                            required
                        />
                    </div>
                    <div>
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full border-2 border-[var(--card-border)] rounded-full px-5 py-3 text-body outline-none focus:border-[var(--accent)] bg-[var(--card-bg)] text-[var(--text-primary)] transition-colors"
                            required
                        />
                    </div>
                    {error && <p className="text-caption text-red-600 font-bold bg-red-50 p-3 rounded-xl border-2 border-red-200">{error}</p>}
                    <button type="submit" className="pill-btn mt-2 border-2 border-[var(--card-border)] bg-[var(--text-primary)] text-[var(--background)] hover:opacity-80 focus:opacity-80 text-label-bold w-full shadow-[2px_2px_0px_var(--card-border)] active:shadow-none active:translate-y-[2px] transition-all">
                        Login
                    </button>
                </form>

                <p className="text-center text-body-sm mt-4 text-[var(--text-secondary)]">
                    Don't have an account?{" "}
                    <Link href="/register" className="text-[var(--text-primary)] font-bold hover:underline decoration-2 underline-offset-4">
                        Register instead
                    </Link>
                </p>
            </div>
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