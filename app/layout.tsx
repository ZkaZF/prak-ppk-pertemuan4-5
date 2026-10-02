import type { Metadata } from "next";
import "./globals.css";

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
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
