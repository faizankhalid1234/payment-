"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowDownRight,
  ArrowUpRight,
  Download,
  Loader2,
  LogOut,
  Pencil,
  Plus,
  Search,
  Trash2,
  Upload,
  WalletCards,
  X,
} from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { Logo } from "./Logo";
import { formatDate, formatMoney, formatTime, toDatetimeLocal } from "@/lib/format";

type User = {
  id: string;
  name: string;
  email: string;
};

type Transaction = {
  _id: string;
  type: "income" | "expense";
  amount: number;
  source: string;
  note: string;
  date: string;
  createdAt: string;
};

type FormState = {
  type: "income" | "expense";
  amount: string;
  source: string;
  note: string;
  date: string;
};

const emptyForm = (): FormState => ({
  type: "income",
  amount: "",
  source: "",
  note: "",
  date: toDatetimeLocal(),
});

const DAY_OPTIONS = [
  { value: "all", label: "All days" },
  { value: "0", label: "Sunday" },
  { value: "1", label: "Monday" },
  { value: "2", label: "Tuesday" },
  { value: "3", label: "Wednesday" },
  { value: "4", label: "Thursday" },
  { value: "5", label: "Friday" },
  { value: "6", label: "Saturday" },
];

function parseCsv(text: string) {
  const lines = text
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (!lines.length) return [];

  const split = (line: string) => {
    const cells: string[] = [];
    let cur = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (ch === "," && !inQuotes) {
        cells.push(cur.trim());
        cur = "";
      } else {
        cur += ch;
      }
    }
    cells.push(cur.trim());
    return cells;
  };

  const header = split(lines[0]).map((h) => h.toLowerCase());
  const hasHeader =
    header.includes("type") ||
    header.includes("amount") ||
    header.includes("title") ||
    header.includes("source");

  const rows = hasHeader ? lines.slice(1) : lines;
  const idx = (name: string, fallback: number) => {
    const i = header.indexOf(name);
    return i >= 0 ? i : fallback;
  };

  return rows
    .map((line) => {
      const cols = split(line);
      const typeRaw = (hasHeader ? cols[idx("type", 0)] : cols[0] || "").toLowerCase();
      const type =
        typeRaw.includes("expense") || typeRaw.includes("debit") || typeRaw === "out"
          ? "expense"
          : typeRaw.includes("income") || typeRaw.includes("credit") || typeRaw === "in"
            ? "income"
            : null;
      const amount = Number(hasHeader ? cols[idx("amount", 1)] : cols[1]);
      const source = hasHeader
        ? cols[idx("title", idx("source", 2))] || cols[2] || ""
        : cols[2] || "";
      const note = hasHeader ? cols[idx("note", 3)] || "" : cols[3] || "";
      const date = hasHeader
        ? cols[idx("payment date", idx("date", 4))] || cols[4] || ""
        : cols[4] || "";

      if (!type || !amount || !source) return null;
      return {
        type,
        amount,
        source,
        note,
        date: date || new Date().toISOString(),
      };
    })
    .filter(Boolean) as Array<{
    type: "income" | "expense";
    amount: number;
    source: string;
    note: string;
    date: string;
  }>;
}

export function Dashboard({ user }: { user: User }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);
  const [message, setMessage] = useState("");

  const [typeFilter, setTypeFilter] = useState<"all" | "income" | "expense">("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [dayFilter, setDayFilter] = useState("all");
  const [timeFrom, setTimeFrom] = useState("");
  const [timeTo, setTimeTo] = useState("");
  const [search, setSearch] = useState("");

  const [applied, setApplied] = useState({
    typeFilter: "all" as "all" | "income" | "expense",
    fromDate: "",
    toDate: "",
    dayFilter: "all",
    timeFrom: "",
    timeTo: "",
    search: "",
  });

  const fetchTransactions = async (filters = applied) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.typeFilter !== "all") params.set("type", filters.typeFilter);
      if (filters.fromDate) params.set("from", filters.fromDate);
      if (filters.toDate) params.set("to", filters.toDate);
      if (filters.search.trim()) params.set("search", filters.search.trim());

      const res = await fetch(`/api/transactions?${params.toString()}`, {
        cache: "no-store",
        credentials: "include",
      });
      if (res.status === 401) {
        router.replace("/login");
        return;
      }
      const data = await res.json();
      setTransactions(data.transactions || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions({
      typeFilter: "all",
      fromDate: "",
      toDate: "",
      dayFilter: "all",
      timeFrom: "",
      timeTo: "",
      search: "",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyFilters = async () => {
    const next = {
      typeFilter,
      fromDate,
      toDate,
      dayFilter,
      timeFrom,
      timeTo,
      search,
    };
    setApplied(next);
    await fetchTransactions(next);
  };

  const showAllEntries = async () => {
    setTypeFilter("all");
    setFromDate("");
    setToDate("");
    setDayFilter("all");
    setTimeFrom("");
    setTimeTo("");
    setSearch("");
    const next = {
      typeFilter: "all" as const,
      fromDate: "",
      toDate: "",
      dayFilter: "all",
      timeFrom: "",
      timeTo: "",
      search: "",
    };
    setApplied(next);
    await fetchTransactions(next);
  };

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      const d = new Date(t.date);
      if (applied.dayFilter !== "all" && String(d.getDay()) !== applied.dayFilter) return false;

      if (applied.timeFrom || applied.timeTo) {
        const mins = d.getHours() * 60 + d.getMinutes();
        if (applied.timeFrom) {
          const [h, m] = applied.timeFrom.split(":").map(Number);
          if (mins < h * 60 + m) return false;
        }
        if (applied.timeTo) {
          const [h, m] = applied.timeTo.split(":").map(Number);
          if (mins > h * 60 + m) return false;
        }
      }
      return true;
    });
  }, [transactions, applied.dayFilter, applied.timeFrom, applied.timeTo]);

  const stats = useMemo(() => {
    const income = filtered
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
    const expense = filtered
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
    return { income, expense, balance: income - expense, count: filtered.length };
  }, [filtered]);

  const resetForm = () => {
    setForm(emptyForm());
    setEditId(null);
  };

  const startEdit = (t: Transaction) => {
    setEditId(t._id);
    setForm({
      type: t.type,
      amount: String(t.amount),
      source: t.source || "",
      note: t.note || "",
      date: toDatetimeLocal(new Date(t.date)),
    });
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const saveEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setSaving(true);

    try {
      const payload = { ...form, category: "General" };
      const res = await fetch(editId ? `/api/transactions/${editId}` : "/api/transactions", {
        method: editId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not save entry");

      if (editId) {
        setTransactions((prev) =>
          prev.map((t) => (t._id === editId ? data.transaction : t))
        );
        setMessage("Entry updated.");
      } else {
        setTransactions((prev) => [data.transaction, ...prev]);
        setMessage("Entry saved.");
      }
      resetForm();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not save entry");
    } finally {
      setSaving(false);
    }
  };

  const deleteEntry = async (id: string) => {
    if (!confirm("Delete this entry?")) return;
    const res = await fetch(`/api/transactions/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (res.ok) {
      setTransactions((prev) => prev.filter((t) => t._id !== id));
      if (editId === id) resetForm();
    }
  };

  const exportCsv = () => {
    const headers = [
      "Type",
      "Amount",
      "Title",
      "Note",
      "Payment Date",
      "Created At",
      "Status",
      "Ledger",
    ];
    const rows = filtered.map((t) => [
      t.type,
      t.amount,
      t.source,
      t.note,
      new Date(t.date).toISOString(),
      new Date(t.createdAt).toISOString(),
      t.type === "income" ? "Payment Received" : "Payment Sent",
      t.type === "income" ? "Credit" : "Debit",
    ]);
    const csv = [headers, ...rows]
      .map((row) =>
        row.map((cell) => `"${String(cell ?? "").replaceAll('"', '""')}"`).join(",")
      )
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `payment-ledger-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importCsv = async (file: File) => {
    setImporting(true);
    setMessage("");
    try {
      const text = await file.text();
      const entries = parseCsv(text);
      if (!entries.length) throw new Error("No valid rows found in CSV.");

      const res = await fetch("/api/transactions/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ entries }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Import failed");

      setMessage(`${data.imported} entries imported.`);
      await fetchTransactions();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Import failed");
    } finally {
      setImporting(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    router.replace("/login");
    router.refresh();
  };

  return (
    <main className="min-h-screen p-4 sm:p-6">
      <div className="mx-auto max-w-2xl space-y-5 animate-fade-up">
        <header className="card-panel relative overflow-hidden p-5">
          <div className="absolute -right-8 -top-10 h-28 w-28 rounded-full bg-brand/15 blur-2xl" />
          <div className="relative flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Logo size={44} />
              <div>
                <h1 className="text-lg font-extrabold tracking-tight">Payment Ledger</h1>
                <p className="text-sm text-muted">Welcome back, {user.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <button onClick={logout} className="btn-ghost !px-3" aria-label="Logout">
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </header>

        <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="card-panel p-4 text-center">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">Income</p>
            <p className="mt-1 text-sm font-bold text-income">{formatMoney(stats.income)}</p>
          </div>
          <div className="card-panel p-4 text-center">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">Expense</p>
            <p className="mt-1 text-sm font-bold text-expense">{formatMoney(stats.expense)}</p>
          </div>
          <div className="card-panel p-4 text-center">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">Balance</p>
            <p className="mt-1 text-sm font-bold text-brand">{formatMoney(stats.balance)}</p>
          </div>
          <div className="card-panel p-4 text-center">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">Shown</p>
            <p className="mt-1 text-sm font-bold text-fg">{stats.count}</p>
          </div>
        </section>

        <div className="flex flex-wrap gap-2">
          <button onClick={exportCsv} className="btn-ghost flex-1 sm:flex-none">
            <Download className="h-4 w-4" />
            Export CSV
          </button>
          <button
            onClick={() => fileRef.current?.click()}
            className="btn-ghost flex-1 sm:flex-none"
            disabled={importing}
          >
            {importing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            Import CSV
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) importCsv(file);
            }}
          />
        </div>

        <form onSubmit={saveEntry} className="card-panel space-y-4 p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-extrabold text-brand">
                {editId ? "Edit entry" : "Add entry"}
              </h2>
              <p className="mt-1 text-sm text-muted">
                {editId ? "Fix mistakes and update this entry." : "Only you can see your private ledger."}
              </p>
            </div>
            {editId && (
              <button type="button" onClick={resetForm} className="btn-ghost !px-3">
                <X className="h-4 w-4" />
                Cancel
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 rounded-2xl bg-bg p-1">
            {(["income", "expense"] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, type }))}
                className={`rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                  form.type === type
                    ? type === "income"
                      ? "bg-income text-white shadow-soft"
                      : "bg-expense text-white shadow-soft"
                    : "text-muted"
                }`}
              >
                {type === "income" ? "Income" : "Expense"}
              </button>
            ))}
          </div>

          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold">Amount</span>
            <input
              className="input"
              type="number"
              min="1"
              step="0.01"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              placeholder="0"
              required
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold">Title</span>
            <input
              className="input"
              value={form.source}
              onChange={(e) => setForm({ ...form, source: e.target.value })}
              placeholder="e.g. Salary, Rent, Gift"
              required
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold">Date & Time</span>
            <input
              className="input"
              type="datetime-local"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              required
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold">Note (optional)</span>
            <input
              className="input"
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              placeholder="Any detail..."
            />
          </label>

          {message && <p className="text-sm font-semibold text-brand">{message}</p>}

          <button className="btn-brand w-full !py-3.5" disabled={saving}>
            {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : editId ? <Pencil className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
            {editId ? "Update entry" : "Save entry"}
          </button>
        </form>

        <section className="card-panel overflow-hidden">
          <div className="space-y-3 border-b px-4 py-4 sm:px-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-extrabold text-brand">Your entries</h2>
              <button onClick={showAllEntries} className="text-xs font-semibold text-muted hover:text-brand">
                Clear filters
              </button>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                className="input pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search title or note..."
              />
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <select
                className="input"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as typeof typeFilter)}
              >
                <option value="all">All types</option>
                <option value="income">Payment Received</option>
                <option value="expense">Payment Sent</option>
              </select>
              <select
                className="input"
                value={dayFilter}
                onChange={(e) => setDayFilter(e.target.value)}
              >
                {DAY_OPTIONS.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-muted">From date</span>
                <input
                  className="input"
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-muted">To date</span>
                <input
                  className="input"
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-muted">From time</span>
                <input
                  className="input"
                  type="time"
                  value={timeFrom}
                  onChange={(e) => setTimeFrom(e.target.value)}
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-muted">To time</span>
                <input
                  className="input"
                  type="time"
                  value={timeTo}
                  onChange={(e) => setTimeTo(e.target.value)}
                />
              </label>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <button onClick={applyFilters} className="btn-brand flex-1 !py-3" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                Apply Filter
              </button>
              <button onClick={showAllEntries} className="btn-ghost flex-1 !py-3" disabled={loading}>
                Show All
              </button>
            </div>
          </div>

          {loading ? (
            <div className="grid min-h-40 place-items-center">
              <Loader2 className="h-7 w-7 animate-spin text-brand" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <WalletCards className="mx-auto mb-3 h-8 w-8 text-brand/50" />
              <p className="font-bold">No entries found</p>
              <p className="mt-1 text-sm text-muted">Try another filter or add a new entry.</p>
            </div>
          ) : (
            <div className="divide-y">
              {filtered.map((t) => {
                const isIncome = t.type === "income";
                return (
                  <article key={t._id} className="px-4 py-4 transition hover:bg-surface/50 sm:px-5">
                    <div className="flex items-start gap-3">
                      <div
                        className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${
                          isIncome ? "bg-income/12 text-income" : "bg-expense/12 text-expense"
                        }`}
                      >
                        {isIncome ? (
                          <ArrowUpRight className="h-5 w-5" />
                        ) : (
                          <ArrowDownRight className="h-5 w-5" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                              isIncome ? "bg-income/12 text-income" : "bg-expense/12 text-expense"
                            }`}
                          >
                            {isIncome ? "Payment Received" : "Payment Sent"}
                          </span>
                          <span className="rounded-full bg-brand-soft px-2.5 py-1 text-[11px] font-bold text-brand">
                            {isIncome ? "Credit" : "Debit"}
                          </span>
                        </div>

                        <div className="mt-2 flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-base font-bold">{t.source || "Entry"}</p>
                            {t.note ? (
                              <p className="mt-0.5 line-clamp-2 text-sm text-muted">{t.note}</p>
                            ) : null}
                          </div>
                          <p
                            className={`shrink-0 text-base font-extrabold ${
                              isIncome ? "text-income" : "text-expense"
                            }`}
                          >
                            {isIncome ? "+" : "-"}
                            {formatMoney(t.amount)}
                          </p>
                        </div>

                        <div className="mt-3 grid gap-1 rounded-xl bg-bg/80 px-3 py-2 text-xs text-muted sm:grid-cols-2">
                          <p>
                            <span className="font-semibold text-fg/70">Payment:</span>{" "}
                            {formatDate(t.date)} • {formatTime(t.date)}
                          </p>
                          <p>
                            <span className="font-semibold text-fg/70">Created at:</span>{" "}
                            {formatDate(t.createdAt)} • {formatTime(t.createdAt)}
                          </p>
                          <p className="sm:col-span-2">
                            <span className="font-semibold text-fg/70">Status:</span>{" "}
                            {isIncome ? "Money came in (Credit)" : "Money went out (Debit)"}
                          </p>
                        </div>

                        <div className="mt-3 flex gap-2">
                          <button
                            onClick={() => startEdit(t)}
                            className="btn-ghost !px-3 !py-2 text-xs"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Edit
                          </button>
                          <button
                            onClick={() => deleteEntry(t._id)}
                            className="btn-ghost !px-3 !py-2 text-xs hover:!border-expense/40 hover:!text-expense"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <p className="px-1 pb-2 text-center text-[11px] text-muted">
          CSV format: Type, Amount, Title, Note, Payment Date
        </p>
      </div>
    </main>
  );
}
