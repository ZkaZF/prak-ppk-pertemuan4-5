import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import LogoutButton from "./logout-button";

export default async function DashboardPage() {
    const user = await getCurrentUser();

    if (!user) {
        redirect("/login");
    }

    return (
        <div style={{ maxWidth: 480, margin: "80px auto", fontFamily: "sans-serif" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h1>Hi, {user.name}</h1>
                <LogoutButton />
            </div>
            <p>Email: {user.email}</p>
            <p style={{ marginTop: 24 }}>Dashboard content goes here later.</p>
        </div>
    );
}