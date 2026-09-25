import { redirect } from "next/navigation";

// Redirect root "/" ke "/dashboard"
// Nanti setelah Programmer 1 selesai, ini bisa diubah
// untuk redirect ke "/login" jika belum login
export default function Home() {
  redirect("/dashboard");
}
