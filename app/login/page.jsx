
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LockKeyhole, Wallet, ArrowRight } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(event) {
        event.preventDefault();
        setLoading(true);
        setError("");

        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Login failed");
            }

            setPassword("");
            router.replace("/");
            router.refresh();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-[#f3f7f6] px-4 py-10">
            <div className="w-full max-w-[420px] rounded-3xl border border-[#e3ebe8] bg-white p-7 shadow-xl shadow-[#163f34]/10 sm:p-9">
                <div className="mb-8 flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#146c57] text-white">
                        <Wallet size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-[#173f35]">
                            PennyPilot
                        </h1>
                        <p className="text-xs text-slate-500">
                            Personal money manager
                        </p>
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-slate-900">
                    Welcome back
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                    Enter your password to access your finances.
                </p>

                <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                    <div>
                        <label
                            htmlFor="password"
                            className="mb-2 block text-sm font-semibold text-slate-700"
                        >
                            Password
                        </label>

                        <div className="relative">
                            <LockKeyhole
                                size={18}
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                            />

                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                autoComplete="current-password"
                                required
                                className="h-13 w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-20 outline-none focus:border-[#146c57] focus:ring-2 focus:ring-[#146c57]/10"
                            />

                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#146c57]"
                            >
                                {showPassword ? "Hide" : "Show"}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <p role="alert" className="text-sm text-red-600">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#146c57] px-5 py-3.5 font-semibold text-white transition hover:bg-[#105341] disabled:opacity-60"
                    >
                        {loading ? "Signing in..." : "Sign in"}
                        {!loading && <ArrowRight size={18} />}
                    </button>
                </form>

                <p className="mt-8 text-center text-xs text-slate-400">
                    Your private finance workspace
                </p>
            </div>
        </main>
    );
}
