"use client";

import { useRouter } from "next/navigation";
import { SignOut } from "@phosphor-icons/react";

export default function LogoutButton() {
    const router = useRouter();

    async function handleLogout() {
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/login");
        router.refresh();
    }

    return (
        <button 
            onClick={handleLogout} 
            className="pill-btn border-2 border-[var(--card-border)] bg-[var(--card-bg)] text-[var(--text-primary)] hover:bg-[var(--oat)] flex items-center gap-2 px-4 py-2 text-label-bold transition-colors"
        >
            <SignOut weight="bold" size={20} />
            Logout
        </button>
    );
}