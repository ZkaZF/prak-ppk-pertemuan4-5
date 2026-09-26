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
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="sticker-card w-full max-w-sm p-8 flex flex-col gap-6 relative">
                <div className="text-center">
                    <h1 className="text-display text-4xl mb-2 text-[var(--text-primary)]">Register</h1>
                    <p className="text-body-sm text-[var(--text-secondary)]">Create your FinTrack account</p>
                </div>
                
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                        <input
                            type="text"
                            placeholder="Full Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full border-2 border-[var(--card-border)] rounded-full px-5 py-3 text-body outline-none focus:border-[var(--accent)] bg-[var(--card-bg)] text-[var(--text-primary)] transition-colors"
                            required
                        />
                    </div>
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
                            placeholder="Password (min 6 chars)"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full border-2 border-[var(--card-border)] rounded-full px-5 py-3 text-body outline-none focus:border-[var(--accent)] bg-[var(--card-bg)] text-[var(--text-primary)] transition-colors"
                            required
                        />
                    </div>
                    {error && <p className="text-caption text-red-600 font-bold bg-red-50 p-3 rounded-xl border-2 border-red-200">{error}</p>}
                    <button type="submit" className="pill-btn mt-2 border-2 border-[var(--card-border)] bg-[var(--text-primary)] text-[var(--background)] hover:opacity-80 focus:opacity-80 text-label-bold w-full shadow-[2px_2px_0px_var(--card-border)] active:shadow-none active:translate-y-[2px] transition-all">
                        Register
                    </button>
                </form>

                <p className="text-center text-body-sm mt-4 text-[var(--text-secondary)]">
                    Already have an account?{" "}
                    <Link href="/login" className="text-[var(--text-primary)] font-bold hover:underline decoration-2 underline-offset-4">
                        Login instead
                    </Link>
                </p>
            </div>
        </div>
    );
}