"use client";

// ============================================
// Dashboard Layout — SRS-13
// Ko-fi design: floating nav, pill CTAs,
// Morning Fog canvas, Sticker Black borders
// ============================================

import { useState } from "react";
import { motion, useScroll, useMotionValueEvent } from "motion/react";
import { Stack, Bell, UserCircle } from "@phosphor-icons/react";
import ThemeToggle from "@/app/components/dashboard/ThemeToggle";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 8);
  });

  return (
    <div className="min-h-screen bg-background">
      {/* ── Ko-fi Nav: floating, no background bar ── */}
      <motion.header
        animate={{
          backgroundColor: scrolled
            ? "color-mix(in srgb, var(--background) 85%, transparent)"
            : "transparent",
          backdropFilter: scrolled ? "blur(16px)" : "none",
          borderBottomColor: scrolled ? "var(--oat)" : "transparent",
          borderBottomWidth: "1px",
          borderBottomStyle: "solid",
        }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="sticky top-0 z-50 h-[68px]"
        style={{ WebkitBackdropFilter: scrolled ? "blur(16px)" : "none" }}
      >
        <div className="mx-auto flex h-full max-w-5xl items-center justify-between px-6">
          {/* Brand — Ko-fi style chunky wordmark feel */}
          <div className="flex items-center gap-3">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-full text-white"
              style={{ background: "var(--accent)", border: "2px solid var(--card-border)" }}
            >
              <Stack size={18} weight="fill" />
            </div>
            <span
              className="text-[22px] font-bold tracking-tight"
              style={{ color: "var(--text-primary)", fontFamily: "var(--font-display)" }}
            >
              FinTrack
            </span>
          </div>

          {/* Nav center */}
          <nav className="hidden md:block text-body-sm text-text-secondary font-medium">
            Dashboard
          </nav>

          {/* Right controls */}
          <div className="flex items-center gap-2">
            {/* Bell — pill style */}
            <button
              type="button"
              className="relative flex h-9 w-9 items-center justify-center rounded-full text-text-secondary transition-colors duration-150 hover:text-accent cursor-pointer"
              style={{ border: "1.5px solid var(--card-border)", background: "var(--card-bg)" }}
              aria-label="Notifikasi"
            >
              <Bell size={17} weight="regular" />
              <span
                className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full border-2 border-background"
                style={{ background: "var(--expense-color)" }}
                aria-hidden="true"
              />
            </button>

            {/* User */}
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-full text-text-secondary transition-colors duration-150 hover:text-accent cursor-pointer"
              style={{ border: "1.5px solid var(--card-border)", background: "var(--card-bg)" }}
              aria-label="Profil pengguna"
            >
              <UserCircle size={17} weight="regular" />
            </button>

            <div className="mx-1 h-5 w-px" style={{ background: "var(--card-border)" }} />
            <ThemeToggle />
          </div>
        </div>
      </motion.header>

      {/* Main content */}
      <main className="mx-auto max-w-5xl px-6 py-10">{children}</main>

      {/* Footer — Ko-fi: minimal, Morning Fog tinted */}
      <footer style={{ borderTop: "1px solid var(--oat)" }}>
        <div className="mx-auto max-w-5xl px-6 py-5 flex items-center justify-between">
          <p className="text-caption text-text-secondary">PPK Pertemuan 3 · UNDIP 2026</p>
          <p className="text-caption text-text-secondary">Programmer 3 — Dashboard &amp; Preference</p>
        </div>
      </footer>
    </div>
  );
}
