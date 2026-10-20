
"use client";

import { useCallback, useEffect, useState } from "react";
import Shell from "@/components/Shell";
import { Modal, Field, MonthPicker, Notice } from "@/components/UI";
import {
    api,
    currency,
    currentMonth,
    currentYear,
    dateOnly,
    today,
} from "@/lib/api";

import {
    Plus,
    Trash2,
    Pencil,
    Check,
    Undo2,
    CreditCard,
} from "lucide-react";

const empty = () => ({
    name: "",
    monthly_amount: "",
    total_amount: "",
    total_months: "12",
    start_date: today().slice(0, 7) + "-01",
    due_day: "5",
    status: "active",
});

export default function Emis() {
    const [rows, setRows] = useState([]);
    const [month, setMonth] = useState(currentMonth());
    const [year, setYear] = useState(currentYear());

    const [show, setShow] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(empty());

    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [busy, setBusy] = useState(false);

    // =========================================
    // LOAD EMI DATA
    // =========================================

    const load = useCallback(async () => {
        try {
            const response = await api(
                `/emis?month=${month}&year=${year}`
            );

            setRows(response.data || []);
            setError("");
        } catch (err) {
            setError(err.message);
        }
    }, [month, year]);

    // =========================================
    // INITIAL FETCH + MONTH/YEAR CHANGES
    // =========================================

    useEffect(() => {
        let cancelled = false;

        async function fetchEmis() {
            try {
                const response = await api(
                    `/emis?month=${month}&year=${year}`
                );

                if (!cancelled) {
                    setRows(response.data || []);
                    setError("");
                }
            } catch (err) {
                if (!cancelled) {
                    setError(err.message);
                }
            }
        }

        fetchEmis();

        return () => {
            cancelled = true;
        };
    }, [month, year]);

    // =========================================
    // ADD EMI
    // =========================================

    const add = () => {
        setEditing(null);
        setForm(empty());
        setError("");
        setMessage("");
        setShow(true);
    };

    // =========================================
    // EDIT EMI
    // =========================================

    const edit = (row) => {
        setEditing(row.id);

        setForm({
            name: row.name,
            monthly_amount: row.monthly_amount,
            total_amount: row.total_amount,
            total_months: String(row.total_months),
            start_date: dateOnly(row.start_date),
            due_day: String(row.due_day),
            status: row.status,
        });

        setError("");
        setMessage("");
        setShow(true);
    };

    // =========================================
    // SAVE EMI
    // =========================================

    const save = async (event) => {
        event.preventDefault();

        if (busy) return;

        setBusy(true);
        setError("");

        try {
            await api(editing ? `/emis/${editing}` : "/emis", {
                method: editing ? "PUT" : "POST",
                body: JSON.stringify(form),
            });

            setShow(false);
            setMessage("EMI saved successfully");

            await load();
        } catch (err) {
            setError(err.message);
        } finally {
            setBusy(false);
        }
    };

    // =========================================
    // DELETE EMI
    // =========================================

    const remove = async (row) => {
        const confirmed = window.confirm(
            `Delete ${row.name} and its payment history?`
        );

        if (!confirmed) return;

        try {
            await api(`/emis/${row.id}`, {
                method: "DELETE",
            });

            setMessage("EMI deleted successfully");

            await load();
        } catch (err) {
            setError(err.message);
        }
    };

    // =========================================
    // MARK PAID / UNDO PAYMENT
    // =========================================

    const toggle = async (row) => {
        if (busy) return;

        setBusy(true);
        setError("");

        try {
            await api(`/emis/${row.id}/payments`, {
                method: "POST",
                body: JSON.stringify({
                    month,
                    year,
                    paid: !row.is_paid,
                }),
            });

            setMessage(
                row.is_paid
                    ? "Payment marked pending"
                    : "Payment marked paid"
            );

            await load();
        } catch (err) {
            setError(err.message);
        } finally {
            setBusy(false);
        }
    };

    // =========================================
    // EMI SUMMARY
    // =========================================

    const scheduled = rows
        .filter((row) => row.is_due)
        .reduce(
            (sum, row) => sum + Number(row.monthly_amount),
            0
        );

    const paid = rows
        .filter((row) => row.is_paid)
        .reduce(
            (sum, row) => sum + Number(row.monthly_amount),
            0
        );

    const pending = rows
        .filter((row) => row.is_due && !row.is_paid)
        .reduce(
            (sum, row) => sum + Number(row.monthly_amount),
            0
        );

    return (
        <Shell
            title="EMI manager"
            subtitle="Manage your loans and mark each month's installments as paid."
        >
            {/* Month Selector and Add EMI */}

            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <MonthPicker
                    month={month}
                    year={year}
                    setMonth={setMonth}
                    setYear={setYear}
                />

                <button type="button" className="btn" onClick={add}>
                    <Plus size={18} />
                    Add EMI
                </button>
            </div>

            <Notice error={!show ? error : ""} message={message} />

            {/* Summary Cards */}

            <div className="grid gap-4 md:grid-cols-3">
                <div className="panel">
                    <p className="muted">Scheduled this month</p>

                    <p className="mt-2 text-3xl font-extrabold">
                        {currency(scheduled)}
                    </p>
                </div>

                <div className="panel">
                    <p className="muted">Paid this month</p>

                    <p className="mt-2 text-3xl font-extrabold">
                        {currency(paid)}
                    </p>
                </div>

                <div className="panel">
                    <p className="muted">Pending this month</p>

                    <p className="mt-2 text-3xl font-extrabold">
                        {currency(pending)}
                    </p>
                </div>
            </div>

            {/* EMI List */}

            <div className="mt-6 grid gap-4 lg:grid-cols-2">
                {rows.map((row) => {
                    const progress = Math.min(
                        100,
                        (Number(row.paid_count) /
                            Math.max(1, Number(row.total_months))) *
                        100
                    );

                    return (
                        <article key={row.id} className="panel">
                            <div className="mb-5 flex items-start justify-between gap-2">
                                <div className="flex gap-3">
                                    <span className="rounded-xl bg-amber-50 p-3 text-amber-700">
                                        <CreditCard />
                                    </span>

                                    <div>
                                        <h3 className="font-bold">{row.name}</h3>

                                        <p className="muted mt-1">
                                            Due on day {row.due_day} ·{" "}
                                            {row.total_months} months
                                        </p>
                                    </div>
                                </div>

                                <span
                                    className={`rounded-full px-3 py-1 text-xs font-bold ${row.is_paid
                                            ? "bg-emerald-50 text-emerald-700"
                                            : row.is_due
                                                ? "bg-amber-50 text-amber-700"
                                                : "bg-slate-100 text-slate-500"
                                        }`}
                                >
                                    {row.is_paid
                                        ? "Paid"
                                        : row.is_due
                                            ? "Pending"
                                            : "Not due"}
                                </span>
                            </div>

                            {/* EMI Amount */}

                            <div className="flex items-end justify-between">
                                <div>
                                    <p className="muted">Monthly installment</p>

                                    <p className="text-2xl font-bold">
                                        {currency(row.monthly_amount)}
                                    </p>
                                </div>

                                <div className="text-right">
                                    <p className="muted">Payments recorded</p>

                                    <p className="text-lg font-bold">
                                        {row.paid_count}/{row.total_months}
                                    </p>
                                </div>
                            </div>

                            {/* Progress Bar */}

                            <div className="my-5 h-2 overflow-hidden rounded-full bg-slate-100">
                                <div
                                    className="h-full rounded-full bg-teal-500"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>

                            {/* Action Buttons */}

                            <div className="flex flex-wrap gap-2">
                                <button
                                    type="button"
                                    className="btn-light"
                                    onClick={() => edit(row)}
                                >
                                    <Pencil size={15} />
                                    Edit
                                </button>

                                <button
                                    type="button"
                                    className="btn-light text-rose-600"
                                    onClick={() => remove(row)}
                                >
                                    <Trash2 size={15} />
                                    Delete
                                </button>

                                {row.is_due && (
                                    <button
                                        type="button"
                                        disabled={busy}
                                        className="btn ml-auto"
                                        onClick={() => toggle(row)}
                                    >
                                        {row.is_paid ? (
                                            <Undo2 size={15} />
                                        ) : (
                                            <Check size={15} />
                                        )}

                                        {row.is_paid
                                            ? "Undo payment"
                                            : "Mark paid"}
                                    </button>
                                )}
                            </div>
                        </article>
                    );
                })}

                {rows.length === 0 && (
                    <div className="panel text-center text-slate-500 lg:col-span-2">
                        No EMIs yet. Add your first monthly EMI.
                    </div>
                )}
            </div>

            {/* Add / Edit EMI Modal */}

            {show && (
                <Modal
                    title={editing ? "Edit EMI" : "Add new EMI"}
                    onClose={() => setShow(false)}
                >
                    <Notice error={error} />

                    <form
                        onSubmit={save}
                        className="grid gap-4 sm:grid-cols-2"
                    >
                        <div className="sm:col-span-2">
                            <Field label="EMI name">
                                <input
                                    required
                                    className="field"
                                    maxLength={150}
                                    placeholder="e.g. Bike loan"
                                    value={form.name}
                                    onChange={(event) =>
                                        setForm({
                                            ...form,
                                            name: event.target.value,
                                        })
                                    }
                                />
                            </Field>
                        </div>

                        <Field label="Monthly installment (₹)">
                            <input
                                required
                                type="number"
                                step="0.01"
                                min="0.01"
                                className="field"
                                value={form.monthly_amount}
                                onChange={(event) =>
                                    setForm({
                                        ...form,
                                        monthly_amount: event.target.value,
                                    })
                                }
                            />
                        </Field>

                        <Field label="Total repayment (₹)">
                            <input
                                required
                                type="number"
                                step="0.01"
                                min="0.01"
                                className="field"
                                value={form.total_amount}
                                onChange={(event) =>
                                    setForm({
                                        ...form,
                                        total_amount: event.target.value,
                                    })
                                }
                            />
                        </Field>

                        <Field label="Number of months">
                            <input
                                required
                                type="number"
                                min="1"
                                max="600"
                                className="field"
                                value={form.total_months}
                                onChange={(event) =>
                                    setForm({
                                        ...form,
                                        total_months: event.target.value,
                                    })
                                }
                            />
                        </Field>

                        <Field label="Monthly due day (1–28)">
                            <input
                                required
                                type="number"
                                min="1"
                                max="28"
                                className="field"
                                value={form.due_day}
                                onChange={(event) =>
                                    setForm({
                                        ...form,
                                        due_day: event.target.value,
                                    })
                                }
                            />
                        </Field>

                        <Field label="First installment date">
                            <input
                                required
                                type="date"
                                className="field"
                                value={form.start_date}
                                onChange={(event) =>
                                    setForm({
                                        ...form,
                                        start_date: event.target.value,
                                    })
                                }
                            />
                        </Field>

                        <Field label="Status">
                            <select
                                className="field"
                                value={form.status}
                                onChange={(event) =>
                                    setForm({
                                        ...form,
                                        status: event.target.value,
                                    })
                                }
                            >
                                <option value="active">Active</option>
                                <option value="completed">Completed</option>
                            </select>
                        </Field>

                        <div className="sm:col-span-2">
                            <p className="mb-4 text-xs text-slate-500">
                                Total repayment is informational; monthly EMI drives
                                monthly spending. Payments must be marked paid
                                manually.
                            </p>

                            <button
                                type="submit"
                                className="btn w-full"
                                disabled={busy}
                            >
                                {busy ? "Saving..." : "Save EMI"}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}
        </Shell>
    );
}
