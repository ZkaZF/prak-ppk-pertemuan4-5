"use client";

// ============================================
// GreetingCard — SRS-14
// Ko-fi style: warm, friendly, DM Sans
// ============================================

import { motion } from "motion/react";
import { Sun, CloudSun, SunHorizon, Moon, Pulse } from "@phosphor-icons/react";
import type { User } from "@/app/lib/mock-data";

interface GreetingCardProps {
  user: User;
}

function getTimeContext() {
  const hour = new Date().getHours();
  const p = { size: 15, weight: "regular" as const };
  if (hour >= 5 && hour < 12) return { greeting: "Selamat pagi", icon: <Sun {...p} /> };
  if (hour >= 12 && hour < 15) return { greeting: "Selamat siang", icon: <CloudSun {...p} /> };
  if (hour >= 15 && hour < 18) return { greeting: "Selamat sore", icon: <SunHorizon {...p} /> };
  return { greeting: "Selamat malam", icon: <Moon {...p} /> };
}

export default function GreetingCard({ user }: GreetingCardProps) {
  const { greeting, icon } = getTimeContext();
  const today = new Date().toLocaleDateString("id-ID", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="mb-10 flex items-start justify-between"
    >
      <div>
        {/* Date pill */}
        <div
          className="mb-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5"
          style={{ background: "var(--oat)", border: "1.5px solid var(--card-border)", color: "var(--text-secondary)" }}
        >
          <span>{icon}</span>
          <span className="text-caption font-medium">{today}</span>
        </div>

        {/* Greeting — DM Sans semibold at heading-sm (Ko-fi UI size) */}
        <h1 className="text-heading-sm" style={{ color: "var(--text-primary)" }}>
          {greeting},{" "}
          <span style={{ color: "var(--accent)" }}>{user.name}</span>
        </h1>
        <p className="mt-1 text-body" style={{ color: "var(--text-secondary)" }}>
          Berikut ringkasan kondisi keuangan Anda.
        </p>
      </div>

      {/* Live badge — Ko-fi pill style */}
      <div
        className="hidden sm:inline-flex items-center gap-1.5 self-start rounded-full px-3 py-1.5"
        style={{ background: "var(--card-bg)", border: "1.5px solid var(--card-border)", color: "var(--text-secondary)" }}
      >
        <Pulse size={13} weight="regular" style={{ color: "var(--income-color)" }} />
        <span className="text-caption font-medium">Live</span>
        <motion.span
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="h-1.5 w-1.5 rounded-full"
          style={{ background: "var(--income-color)" }}
        />
      </div>
    </motion.div>
  );
}
