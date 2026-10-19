
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import LogoutButton from "@/components/LogoutButton";

import {
    LayoutDashboard,
    WalletCards,
    HandCoins,
    ReceiptText,
    ChartColumnIncreasing,
    Menu,
    X,
    Coins,
    CalendarDays,
} from "lucide-react";

const nav = [
    {
        href: "/",
        label: "Overview",
        icon: LayoutDashboard,
    },
    {
        href: "/salary",
        label: "Income & Salary",
        icon: HandCoins,
    },
    {
        href: "/emis",
        label: "My EMIs",
        icon: WalletCards,
    },
    {
        href: "/expenses",
        label: "Expenses",
        icon: ReceiptText,
    },
    {
        href: "/reports",
        label: "Reports",
        icon: ChartColumnIncreasing,
    },
];

export default function Shell({ children, title, subtitle }) {
    const path = usePathname();
    const [open, setOpen] = useState(false);

    return (
        <div className="min-h-screen bg-[#f5f7fb] md:flex">

            {/* Mobile sidebar overlay */}
            <div
                className={`fixed inset-0 z-40 bg-black/40 md:hidden ${open ? "block" : "hidden"
                    }`}
                onClick={() => setOpen(false)}
            />

            {/* Sidebar */}
            <aside
                className={`fixed z-50 flex h-screen w-[252px] flex-col border-r border-[#e8edf1] bg-white px-4 py-6 transition-transform md:sticky md:top-0 md:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"
                    }`}
            >

                {/* Logo */}
                <div className="mb-10 flex items-center justify-between px-2">
                    <Link href="/" className="flex items-center gap-3">
                        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0b7775] text-white">
                            <Coins size={24} />
                        </span>

                        <span>
                            <b className="block text-xl tracking-tight">
                                PennyPilot
                            </b>

                            <small className="text-xs text-slate-400">
                                PERSONAL FINANCE
                            </small>
                        </span>
                    </Link>

                    <button
                        type="button"
                        className="md:hidden"
                        onClick={() => setOpen(false)}
                        aria-label="Close menu"
                    >
                        <X />
                    </button>
                </div>

                {/* Workspace */}
                <div className="mb-3 px-3 text-[11px] font-bold uppercase tracking-[.2em] text-slate-400">
                    Workspace
                </div>

                {/* Navigation */}
                <nav className="space-y-1">
                    {nav.map(({ href, label, icon: Icon }) => (
                        <Link
                            key={href}
                            href={href}
                            onClick={() => setOpen(false)}
                            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${path === href
                                ? "bg-[#e8f7f3] text-[#096d6c]"
                                : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                                }`}
                        >
                            <Icon size={19} />
                            {label}
                        </Link>
                    ))}
                </nav>

                {/* Sidebar Bottom */}
                <div className="mt-auto">

                    {/* Logout Button */}
                    <div className="mb-4 border-t border-slate-100 pt-4">
                        <LogoutButton />
                    </div>

                    {/* Just for you */}
                    <div className="rounded-2xl bg-[#f0f8f6] p-4">
                        <div className="mb-1 flex items-center gap-2 font-bold text-[#176d69]">
                            <CalendarDays size={17} />
                            Just for you
                        </div>

                        <p className="text-xs leading-5 text-[#59817e]">
                            All your money details in one simple, private dashboard.
                        </p>
                    </div>

                </div>
            </aside>

            {/* Main Content */}
            <div className="min-w-0 flex-1">

                {/* Header */}
                <header className="flex h-[75px] items-center justify-between border-b border-[#e9edf2] bg-white px-5 md:px-9">

                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            className="rounded-lg p-2 hover:bg-slate-100 md:hidden"
                            onClick={() => setOpen(true)}
                            aria-label="Open menu"
                        >
                            <Menu />
                        </button>

                        <span className="text-xs font-bold uppercase tracking-[.17em] text-slate-400">
                            Your financial workspace
                        </span>
                    </div>

                    {/* Profile */}
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#d7efe9] text-sm font-bold text-[#096967]">
                        ME
                    </div>

                </header>

                {/* Page Content */}
                <main className="mx-auto max-w-[1330px] px-4 py-7 md:px-9 md:py-9">
                    <div className="mb-7">
                        <h1 className="text-[27px] font-bold tracking-tight text-[#172c37] md:text-3xl">
                            {title}
                        </h1>

                        <p className="mt-2 text-sm text-slate-500">
                            {subtitle}
                        </p>
                    </div>

                    {children}
                </main>

            </div>
        </div>
    );
}
