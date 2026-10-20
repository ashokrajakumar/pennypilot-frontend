
"use client";

import { useCallback, useEffect, useState } from "react";

import Shell from "@/components/Shell";
import { MonthPicker, Modal, Field, Notice } from "@/components/UI";
import {
    api,
    currency,
    currentMonth,
    currentYear,
} from "@/lib/api";

import {
    Plus,
    Pencil,
    Trash2,
    Landmark,
} from "lucide-react";

export default function Salary() {
    const [month, setMonth] = useState(currentMonth());
    const [year, setYear] = useState(currentYear());

    const [rows, setRows] = useState([]);
    const [show, setShow] = useState(false);
    const [amount, setAmount] = useState("");

    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [busy, setBusy] = useState(false);

    // =========================================
    // REFRESH SALARY RECORDS
    // =========================================

    const load = useCallback(async () => {
        try {
            const response = await api("/salaries");
            setRows(response.data || []);
            setError("");
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to load salaries"
            );
        }
    }, []);

    // =========================================
    // INITIAL API FETCH
    // =========================================

    useEffect(() => {
        let cancelled = false;

        async function fetchSalaries() {
            try {
                const response = await api("/salaries");

                if (!cancelled) {
                    setRows(response.data || []);
                    setError("");
                }
            } catch (err) {
                if (!cancelled) {
                    setError(
                        err instanceof Error
                            ? err.message
                            : "Failed to load salaries"
                    );
                }
            }
        }

        fetchSalaries();

        return () => {
            cancelled = true;
        };
    }, []);

    // =========================================
    // SELECTED MONTH SALARY
    // =========================================

    const existing = rows.find(
        (row) =>
            Number(row.month) === month &&
            Number(row.year) === year
    );

    // =========================================
    // ADD / EDIT SALARY
    // =========================================

    const openSalaryModal = () => {
        setAmount(existing?.amount?.toString() || "");
        setError("");
        setMessage("");
        setShow(true);
    };

    // =========================================
    // SAVE SALARY
    // =========================================

    const save = async (event) => {
        event.preventDefault();

        if (busy) return;

        setBusy(true);
        setError("");

        try {
            await api("/salaries", {
                method: "POST",
                body: JSON.stringify({
                    month,
                    year,
                    amount,
                }),
            });

            setShow(false);
            setMessage("Salary saved successfully");

            await load();
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to save salary"
            );
        } finally {
            setBusy(false);
        }
    };

    // =========================================
    // DELETE SALARY
    // =========================================

    const remove = async () => {
        if (
            !existing ||
            !window.confirm("Delete salary for this month?")
        ) {
            return;
        }

        if (busy) return;

        setBusy(true);
        setError("");

        try {
            await api(`/salaries/${existing.id}`, {
                method: "DELETE",
            });

            await load();
            setMessage("Salary deleted");
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to delete salary"
            );
        } finally {
            setBusy(false);
        }
    };

    return (
        <Shell
            title="Salary & income"
            subtitle="Record your monthly take-home pay and review past income."
        >
            {/* MONTH SELECTOR */}

            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <MonthPicker
                    month={month}
                    year={year}
                    setMonth={setMonth}
                    setYear={setYear}
                />

                <button
                    type="button"
                    className="btn"
                    onClick={openSalaryModal}
                >
                    {existing ? <Pencil size={18} /> : <Plus size={18} />}

                    {existing ? "Edit salary" : "Add salary"}
                </button>
            </div>

            {/* MESSAGES */}

            <Notice error={!show ? error : ""} message={message} />

            {/* SALARY SUMMARY */}

            <div className="panel mb-6">
                <div className="flex justify-between">
                    <div>
                        <p className="muted">
                            Salary for selected month
                        </p>

                        <h2 className="mt-3 text-4xl font-extrabold">
                            {currency(existing?.amount || 0)}
                        </h2>

                        <p className="muted mt-2">
                            Add your actual take-home salary after deductions
                        </p>
                    </div>

                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
                        <Landmark />
                    </span>
                </div>

                {existing && (
                    <button
                        type="button"
                        disabled={busy}
                        className="mt-6 text-sm font-semibold text-rose-600 disabled:opacity-50"
                        onClick={remove}
                    >
                        <Trash2 size={15} className="mr-1 inline" />
                        Delete selected month&apos;s salary
                    </button>
                )}
            </div>

            {/* SALARY HISTORY */}

            <div className="panel">
                <h3 className="mb-4 text-lg font-bold">
                    Salary history
                </h3>

                {rows.length ? (
                    rows.map((row) => (
                        <div
                            key={row.id}
                            className="flex justify-between border-b border-slate-100 py-3"
                        >
                            <span>
                                {String(row.month).padStart(2, "0")}/{row.year}
                            </span>

                            <b>{currency(row.amount)}</b>
                        </div>
                    ))
                ) : (
                    <p className="muted">
                        No salary records yet.
                    </p>
                )}
            </div>

            {/* ADD / EDIT MODAL */}

            {show && (
                <Modal
                    title={
                        existing
                            ? "Update monthly salary"
                            : "Add monthly salary"
                    }
                    onClose={() => setShow(false)}
                >
                    <Notice error={error} />

                    <form onSubmit={save} className="space-y-5">
                        <p className="muted">
                            Month {month} / {year}
                        </p>

                        <Field label="Take-home salary (₹)">
                            <input
                                type="number"
                                required
                                step="0.01"
                                min="0"
                                className="field"
                                value={amount}
                                onChange={(event) =>
                                    setAmount(event.target.value)
                                }
                            />
                        </Field>

                        <button
                            type="submit"
                            className="btn w-full"
                            disabled={busy}
                        >
                            {busy ? "Saving..." : "Save salary"}
                        </button>
                    </form>
                </Modal>
            )}
        </Shell>
    );
}
