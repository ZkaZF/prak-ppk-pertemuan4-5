import type { Metadata } from "next";
import { DM_Sans, Bowlby_One } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "600"],
});

const bowlbyOne = Bowlby_One({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "FinTrack — Dashboard Keuangan Pribadi",
  description:
    "Pantau saldo, pemasukan, dan pengeluaran Anda dengan mudah. PPK Pertemuan 3 — UNDIP.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="id"
      data-theme="light"
      className={`${dmSans.variable} ${bowlbyOne.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
