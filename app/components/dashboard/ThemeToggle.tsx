"use client";

// ============================================
// ThemeToggle — SRS-18 Cookie Preference
// Ko-fi style: pill button, sticker border
// ============================================

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sun, Moon } from "@phosphor-icons/react";
import { getCookie, setCookie } from "@/app/lib/cookies";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = getCookie("user_theme") as "light" | "dark" | null;
    const resolved = saved === "dark" ? "dark" : "light";
    setTheme(resolved);
    document.documentElement.setAttribute("data-theme", resolved);
    setMounted(true);
  }, []);

  const toggle = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    setCookie("user_theme", next, 365);
    document.documentElement.setAttribute("data-theme", next);
  };

  const iconProps = { size: 17, weight: "regular" as const };

  return (
    <button
      id="theme-toggle"
      onClick={toggle}
      disabled={!mounted}
      className="flex h-9 w-9 items-center justify-center rounded-full text-text-secondary transition-colors duration-150 hover:text-accent cursor-pointer disabled:opacity-40"
      style={{
        border: "1.5px solid var(--card-border)",
        background: "var(--card-bg)"
      }}
      aria-label={`Ubah ke tema ${theme === "light" ? "gelap" : "terang"}`}
      title={`Tema: ${theme === "light" ? "Terang" : "Gelap"}`}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={theme}
          initial={{ rotate: -30, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          exit={{ rotate: 30, opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="flex items-center justify-center"
        >
          {theme === "light" ? <Sun {...iconProps} /> : <Moon {...iconProps} />}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
