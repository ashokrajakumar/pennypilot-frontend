
"use client";

import { useCallback, useEffect, useState } from "react";
import Shell from "@/components/Shell";
import { Modal, Field, MonthPicker, Notice } from "@/components/UI";

import {
    api,
    currency,
    currentMonth,
    currentYear,
    today,
    dateOnly,
} from "@/lib/api";

import {
    Plus,
    Trash2,
    Pencil,
    ReceiptText,
    Search,
} from "lucide-react";

const categories = [
    "Food",
    "Travel",
    "Groceries",
    "Shopping",
    "Bills",
    "Healthcare",
    "Entertainment",
    "Education",
    "Others",
];

const blank = () => ({
    title: "",
    category: "Food",
    amount: "",
    expense_date: today(),
    description: "",
});

export default function Expenses() {
    const [month, setMonth] = useState(currentMonth());
    const [year, setYear] = useState(currentYear());

    const [rows, setRows] = useState([]);
    const [modal, setModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(blank());
    const [query, setQuery] = useState("");

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    // =========================================
    // REFRESH EXPENSE DATA AFTER CRUD ACTIONS
    // =========================================

    const load = useCallback(async () => {
        try {
            const response = await api(
                `/expenses?month=${month}&year=${year}`
            );

            setRows(response.data || []);
            setError("");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [month, year]);

    // =========================================
    // INITIAL FETCH / MONTH-YEAR CHANGES
    // =========================================

    useEffect(() => {
        let cancelled = false;

        async function fetchExpenses() {
            try {
                const response = await api(
                    `/expenses?month=${month}&year=${year}`
                );

                if (!cancelled) {
                    setRows(response.data || []);
                    setError("");
                }
            } catch (err) {
                if (!cancelled) {
                    setRows([]);
                    setError(err.message);
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        fetchExpenses();

        return () => {
            cancelled = true;
        };
    }, [month, year]);

    // =========================================
    // MONTH / YEAR CHANGE
    // =========================================

    const handleMonthChange = (value) => {
        setLoading(true);
        setRows([]);
        setMonth(value);
    };

    const handleYearChange = (value) => {
        setLoading(true);
        setRows([]);
        setYear(value);
    };

    // =========================================
    // ADD EXPENSE
    // =========================================

    const startAdd = () => {
        setEditing(null);

        setForm({
            ...blank(),
            expense_date: `${year}-${String(month).padStart(2, "0")}-01`,
        });

        setError("");
        setMessage("");
        setModal(true);
    };

    // =========================================
    // EDIT EXPENSE
    // =========================================

    const startEdit = (row) => {
        setEditing(row.id);

        setForm({
            title: row.title,
            category: row.category,
            amount: String(row.amount),
            expense_date: dateOnly(row.expense_date),
            description: row.description || "",
        });

        setError("");
        setMessage("");
        setModal(true);
    };

    // =========================================
    // SAVE EXPENSE
    // =========================================

    const save = async (event) => {
        event.preventDefault();

        if (saving) return;

        setSaving(true);
        setError("");

        try {
            await api(
                editing ? `/expenses/${editing}` : "/expenses",
                {
                    method: editing ? "PUT" : "POST",
                    body: JSON.stringify(form),
                }
            );

            setModal(false);
            setMessage(
                editing ? "Expense updated" : "Expense added"
            );

            await load();
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    // =========================================
    // DELETE EXPENSE
    // =========================================

    const remove = async (row) => {
        const confirmed = window.confirm(
            `Delete ${row.title}?`
        );

        if (!confirmed) return;

        setError("");

        try {
            await api(`/expenses/${row.id}`, {
                method: "DELETE",
            });

            setMessage("Expense deleted");

            await load();
        } catch (err) {
            setError(err.message);
        }
    };

    // =========================================
    // SEARCH FILTER
    // =========================================

    const visible = rows.filter((row) =>
        `${row.title} ${row.category}`
            .toLowerCase()
            .includes(query.toLowerCase())
    );

    // =========================================
    // TOTAL EXPENSES
    // =========================================

    const totalSpent = rows.reduce(
        (sum, row) => sum + Number(row.amount),
        0
    );

    return (
        <Shell
            title="Track your expenses"
            subtitle="Small expenses add up. Know exactly where they go."
        >
            {/* MONTH SELECTOR AND ADD BUTTON */}

            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <MonthPicker
                    month={month}
                    year={year}
                    setMonth={handleMonthChange}
                    setYear={handleYearChange}
                />

                <button
                    type="button"
                    className="btn"
                    onClick={startAdd}
                >
                    <Plus size={17} />
                    Add expense
                </button>
            </div>

            {/* ERROR / SUCCESS MESSAGE */}

            <Notice
                error={!modal ? error : ""}
                message={message}
            />

            {/* EXPENSE SUMMARY CARDS */}

            <div className="mb-6 grid gap-4 sm:grid-cols-3">
                <div className="panel sm:col-span-2">
                    <p className="muted">
                        Total spent this month
                    </p>

                    <p className="mt-2 text-3xl font-extrabold">
                        {currency(totalSpent)}
                    </p>
                </div>

                <div className="panel">
                    <p className="muted">
                        Recorded transactions
                    </p>

                    <p className="mt-2 text-3xl font-extrabold">
                        {rows.length}
                    </p>
                </div>
            </div>

            {/* EXPENSE HISTORY */}

            <div className="panel">
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                    <h2 className="text-lg font-bold">
                        Expense history
                    </h2>

                    <div className="relative">
                        <Search
                            size={16}
                            className="absolute left-3 top-3 text-slate-400"
                        />

                        <input
                            type="search"
                            className="field pl-9"
                            placeholder="Search expenses"
                            value={query}
                            onChange={(event) =>
                                setQuery(event.target.value)
                            }
                        />
                    </div>
                </div>

                {/* LOADING */}

                {loading ? (
                    <p className="muted py-10">
                        Loading...
                    </p>
                ) : visible.length === 0 ? (
                    <div className="py-12 text-center text-slate-400">
                        <ReceiptText
                            className="mx-auto mb-3"
                            size={36}
                        />

                        No expenses found for this month.
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {visible.map((row) => (
                            <div
                                key={row.id}
                                className="flex flex-wrap items-center justify-between gap-3 py-4"
                            >
                                {/* EXPENSE DETAILS */}

                                <div>
                                    <b>{row.title}</b>

                                    <p className="mt-1 text-xs text-slate-400">
                                        {row.category} ·{" "}
                                        {dateOnly(row.expense_date)}

                                        {row.description
                                            ? ` · ${row.description}`
                                            : ""}
                                    </p>
                                </div>

                                {/* AMOUNT / ACTION BUTTONS */}

                                <div className="flex items-center gap-2">
                                    <b className="mr-2 text-rose-600">
                                        −{currency(row.amount)}
                                    </b>

                                    <button
                                        type="button"
                                        title="Edit"
                                        aria-label="Edit"
                                        className="btn-light"
                                        onClick={() => startEdit(row)}
                                    >
                                        <Pencil size={16} />
                                    </button>

                                    <button
                                        type="button"
                                        title="Delete"
                                        aria-label="Delete"
                                        className="btn-light text-rose-600"
                                        onClick={() => remove(row)}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ADD / EDIT EXPENSE MODAL */}

            {modal && (
                <Modal
                    title={
                        editing ? "Edit expense" : "Add new expense"
                    }
                    onClose={() => setModal(false)}
                >
                    <Notice error={error} />

                    <form
                        onSubmit={save}
                        className="space-y-4"
                    >
                        {/* EXPENSE NAME */}

                        <Field label="Expense name">
                            <input
                                className="field"
                                required
                                maxLength={150}
                                value={form.title}
                                onChange={(event) =>
                                    setForm({
                                        ...form,
                                        title: event.target.value,
                                    })
                                }
                                placeholder="e.g. Coffee, petrol"
                            />
                        </Field>

                        {/* AMOUNT AND CATEGORY */}

                        <div className="grid gap-4 sm:grid-cols-2">
                            <Field label="Amount (₹)">
                                <input
                                    className="field"
                                    required
                                    type="number"
                                    min="0.01"
                                    step="0.01"
                                    value={form.amount}
                                    onChange={(event) =>
                                        setForm({
                                            ...form,
                                            amount: event.target.value,
                                        })
                                    }
                                />
                            </Field>

                            <Field label="Category">
                                <select
                                    className="field"
                                    value={form.category}
                                    onChange={(event) =>
                                        setForm({
                                            ...form,
                                            category: event.target.value,
                                        })
                                    }
                                >
                                    {categories.map((category) => (
                                        <option key={category} value={category}>
                                            {category}
                                        </option>
                                    ))}
                                </select>
                            </Field>
                        </div>

                        {/* EXPENSE DATE */}

                        <Field label="Expense date">
                            <input
                                className="field"
                                required
                                type="date"
                                value={form.expense_date}
                                onChange={(event) =>
                                    setForm({
                                        ...form,
                                        expense_date: event.target.value,
                                    })
                                }
                            />
                        </Field>

                        {/* DESCRIPTION */}

                        <Field label="Description (optional)">
                            <textarea
                                className="field"
                                rows={3}
                                maxLength={1000}
                                value={form.description}
                                onChange={(event) =>
                                    setForm({
                                        ...form,
                                        description: event.target.value,
                                    })
                                }
                            />
                        </Field>

                        {/* SAVE BUTTON */}

                        <button
                            type="submit"
                            disabled={saving}
                            className="btn w-full"
                        >
                            {saving
                                ? "Saving..."
                                : editing
                                    ? "Update expense"
                                    : "Save expense"}
                        </button>
                    </form>
                </Modal>
            )}
        </Shell>
    );
}
