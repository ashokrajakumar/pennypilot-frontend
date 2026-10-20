
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import Shell from "@/components/Shell";
import { MonthPicker, Notice } from "@/components/UI";

import {
    api,
    currency,
    currentMonth,
    currentYear,
    months,
} from "@/lib/api";

import {
    Wallet,
    ArrowUpRight,
    CreditCard,
    Landmark,
    ArrowRight,
    ReceiptText,
    Info,
} from "lucide-react";

// =========================================
// DASHBOARD SUMMARY CARDS
// =========================================

const cards = [
    {
        key: "salary",
        name: "Monthly Income",
        icon: Landmark,
        iconBg: "bg-teal-50 text-teal-700",
    },
    {
        key: "emi_paid",
        name: "EMIs Paid",
        icon: CreditCard,
        iconBg: "bg-amber-50 text-amber-700",
    },
    {
        key: "expenses",
        name: "Other Expenses",
        icon: ArrowUpRight,
        iconBg: "bg-rose-50 text-rose-600",
    },
    {
        key: "balance",
        name: "Remaining Balance",
        icon: Wallet,
        iconBg: "bg-violet-50 text-violet-700",
    },
];

export default function Home() {
    const [month, setMonth] = useState(currentMonth());
    const [year, setYear] = useState(currentYear());

    const [data, setData] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    // =========================================
    // FETCH DASHBOARD DATA
    // =========================================

    useEffect(() => {
        let cancelled = false;

        async function fetchDashboard() {
            try {
                const response = await api(
                    `/dashboard?month=${month}&year=${year}`
                );

                if (!cancelled) {
                    setData(response.data);
                    setError("");
                    setLoading(false);
                }
            } catch (err) {
                if (!cancelled) {
                    setData(null);
                    setError(err.message);
                    setLoading(false);
                }
            }
        }

        fetchDashboard();

        return () => {
            cancelled = true;
        };
    }, [month, year]);

    // =========================================
    // MONTH / YEAR HANDLERS
    // =========================================

    const handleMonthChange = (value) => {
        setLoading(true);
        setError("");
        setMonth(value);
    };

    const handleYearChange = (value) => {
        setLoading(true);
        setError("");
        setYear(value);
    };

    // =========================================
    // FINANCIAL CALCULATIONS
    // =========================================

    const income = Number(data?.salary || 0);

    const emiPaid = Number(data?.emi_paid || 0);

    const otherExpenses = Number(data?.expenses || 0);

    const totalSpend = emiPaid + otherExpenses;

    const segments = [
        {
            label: "EMI",
            val: emiPaid,
            color: "#e9b869",
        },
        {
            label: "Expenses",
            val: otherExpenses,
            color: "#ed8a8a",
        },
        {
            label: "Available",
            val: Math.max(0, income - totalSpend),
            color: "#30bba0",
        },
    ];

    return (
        <Shell
            title="Good to have you here 👋"
            subtitle="Your money at a glance. Make every rupee count."
        >
            {/* =========================================
          MONTH / YEAR SELECTOR
      ========================================= */}

            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-slate-500">
                    Showing{" "}
                    <b>
                        {months[month - 1]} {year}
                    </b>
                </p>

                <MonthPicker
                    month={month}
                    year={year}
                    setMonth={handleMonthChange}
                    setYear={handleYearChange}
                />
            </div>

            {/* API ERROR MESSAGE */}

            <Notice error={error} />

            {loading ? (
                <div className="panel">
                    Loading your finance overview...
                </div>
            ) : (
                <>
                    {/* =========================================
              SUMMARY CARDS
          ========================================= */}

                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        {cards.map(({ key, name, icon: Icon, iconBg }) => (
                            <div key={key} className="panel">
                                <span
                                    className={`mb-5 inline-flex rounded-xl p-3 ${iconBg}`}
                                >
                                    <Icon size={22} />
                                </span>

                                <p className="muted">{name}</p>

                                <p className="mt-2 text-[29px] font-extrabold tracking-tight">
                                    {currency(data?.[key])}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* =========================================
              MONEY BREAKDOWN + QUICK ACTIONS
          ========================================= */}

                    <div className="mt-6 grid gap-6 lg:grid-cols-[1.25fr_.75fr]">
                        {/* WHERE YOUR MONEY GOES */}

                        <section className="panel">
                            <h2 className="text-lg font-bold">
                                Where your money goes
                            </h2>

                            <p className="muted mt-1">
                                Income and outflow in {months[month - 1]}
                            </p>

                            {/* Progress bar */}

                            <div className="mt-8 flex h-5 overflow-hidden rounded-full bg-slate-100">
                                {segments.map((segment) => (
                                    <div
                                        key={segment.label}
                                        title={segment.label}
                                        style={{
                                            width: `${income > 0
                                                    ? (segment.val / income) * 100
                                                    : 0
                                                }%`,
                                            background: segment.color,
                                        }}
                                    />
                                ))}
                            </div>

                            {/* Breakdown details */}

                            <div className="mt-6 grid gap-3 sm:grid-cols-3">
                                {segments.map((segment) => (
                                    <div key={segment.label}>
                                        <div className="mb-1 flex items-center gap-2 text-xs text-slate-500">
                                            <span
                                                className="h-2.5 w-2.5 rounded-full"
                                                style={{
                                                    background: segment.color,
                                                }}
                                            />

                                            {segment.label}
                                        </div>

                                        <b className="text-lg">
                                            {currency(segment.val)}
                                        </b>
                                    </div>
                                ))}
                            </div>

                            {/* Salary reminder */}

                            {income === 0 && (
                                <p className="mt-4 text-sm text-amber-700">
                                    Add this month&apos;s salary to see the breakdown.
                                </p>
                            )}

                            {/* Overspending warning */}

                            {Number(data?.balance || 0) < 0 && (
                                <p className="mt-4 text-sm text-rose-600">
                                    Your spending has exceeded this month&apos;s income.
                                </p>
                            )}
                        </section>

                        {/* =========================================
                QUICK ACTIONS
            ========================================= */}

                        <section className="panel">
                            <h2 className="text-lg font-bold">
                                Quick actions
                            </h2>

                            <p className="muted mt-1">
                                Your most-used money tools
                            </p>

                            <div className="mt-6 space-y-3">
                                {[
                                    {
                                        label: "Add an expense",
                                        href: "/expenses",
                                        icon: ReceiptText,
                                    },
                                    {
                                        label: "Update salary",
                                        href: "/salary",
                                        icon: Landmark,
                                    },
                                    {
                                        label: "Manage EMI payments",
                                        href: "/emis",
                                        icon: CreditCard,
                                    },
                                ].map(({ label, href, icon: Icon }) => (
                                    <Link
                                        key={href}
                                        href={href}
                                        className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 hover:border-teal-200 hover:bg-teal-50"
                                    >
                                        <span className="rounded-lg bg-slate-100 p-2">
                                            <Icon size={18} />
                                        </span>

                                        <span className="flex-1 text-sm font-semibold">
                                            {label}
                                        </span>

                                        <ArrowRight size={17} />
                                    </Link>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* =========================================
              RECENT SPENDING + EMI OVERVIEW
          ========================================= */}

                    <div className="mt-6 grid gap-6 lg:grid-cols-2">
                        {/* RECENT SPENDING */}

                        <section className="panel">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-bold">
                                    Recent spending
                                </h2>

                                <Link
                                    href="/expenses"
                                    className="text-sm font-semibold text-teal-700"
                                >
                                    View all →
                                </Link>
                            </div>

                            <div className="mt-4 divide-y divide-slate-100">
                                {data?.recent_expenses?.length ? (
                                    data.recent_expenses.map((expense) => (
                                        <div
                                            key={expense.id}
                                            className="flex justify-between gap-3 py-3"
                                        >
                                            <div>
                                                <p className="font-semibold">
                                                    {expense.title}
                                                </p>

                                                <p className="text-xs text-slate-400">
                                                    {expense.category} ·{" "}
                                                    {String(expense.expense_date).slice(0, 10)}
                                                </p>
                                            </div>

                                            <b className="text-rose-600">
                                                −{currency(expense.amount)}
                                            </b>
                                        </div>
                                    ))
                                ) : (
                                    <p className="muted py-5">
                                        No expenses recorded yet.
                                    </p>
                                )}
                            </div>
                        </section>

                        {/* =========================================
                ACTIVE EMI OVERVIEW
            ========================================= */}

                        <section className="panel">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-bold">
                                    Active EMI overview
                                </h2>

                                <Link
                                    href="/emis"
                                    className="text-sm font-semibold text-teal-700"
                                >
                                    Manage →
                                </Link>
                            </div>

                            <p className="mt-6 text-4xl font-extrabold">
                                {currency(data?.emi_due)}
                            </p>

                            <p className="muted mt-1">
                                EMIs due for selected month (including paid)
                            </p>

                            <div className="mt-5 rounded-xl bg-[#f1f9f7] p-4 text-sm text-teal-800">
                                <Info
                                    className="mr-2 inline"
                                    size={18}
                                />

                                {currency(data?.emi_pending)} still unpaid this month
                            </div>
                        </section>
                    </div>
                </>
            )}
        </Shell>
    );
}
