
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export default function LogoutButton() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleLogout = async () => {
        if (loading) return;

        setLoading(true);

        try {
            const response = await fetch("/api/auth/logout", {
                method: "POST",
                credentials: "same-origin",
            });

            if (!response.ok) {
                throw new Error("Logout failed");
            }

            router.replace("/login");
            router.refresh();
        } catch (error) {
            console.error(error);
            alert("Unable to log out. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            type="button"
            onClick={handleLogout}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
        >
            <LogOut size={18} />
            {loading ? "Logging out..." : "Logout"}
        </button>
    );
}
