"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowDownRight,
  ArrowUpRight,
  BadgeDollarSign,
  CalendarClock,
  Download,
  Loader2,
  LogOut,
  Plus,
  Search,
  Trash2,
  WalletCards,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ThemeToggle } from "./ThemeToggle";
import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  formatDate,
  formatMoney,
  formatTime,
  toDatetimeLocal,
} from "@/lib/format";

type User = {
  id: string;
  name: string;
  email: string;
};

type Transaction = {
  _id: string;
  type: "income" | "expense";
  amount: number;
  category: string;
  source: string;
  note: string;
  date: string;
  createdAt: string;
  updatedAt: string;
};

type FormState = {
  type: "income" | "expense";
  amount: string;
  category: string;
  source: string;
  note: string;
  date: string;
};

const emptyForm = (): FormState => ({
  type: "income",
  amount: "",
  category: "Salary",
  source: "",
  note: "",
  date: toDatetimeLocal(),
});

export function Dashboard({ user }: { user: User }) {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "income" | "expense">("all");

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query.trim()) params.set("search", query.trim());
      if (typeFilter !== "all") params.set("type", typeFilter);
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
    const t = setTimeout(fetchTransactions, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, typeFilter]);

  const stats = useMemo(() => {
    const income = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
    const expense = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
    return {
      income,
      expense,
      balance: income - expense,
      entries: transactions.length,
    };
  }, [transactions]);

  const chartData = useMemo(() => {
    const map = new Map<string, { date: string; income: number; expense: number }>();
    [...transactions]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .forEach((t) => {
        const key = formatDate(t.date);
        const row = map.get(key) || { date: key, income: 0, expense: 0 };
        row[t.type] += t.amount;
        map.set(key, row);
      });
    return Array.from(map.values()).slice(-10);
  }, [transactions]);

  const categories = form.type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const setType = (type: "income" | "expense") => {
    setForm((prev) => ({
      ...prev,
      type,
      category: type === "income" ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0],
    }));
  };

  const createEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setSaving(true);

    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not save entry");
      setTransactions((prev) => [data.transaction, ...prev]);
      setForm(emptyForm());
      setMessage("Entry saved successfully.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not save entry");
    } finally {
      setSaving(false);
    }
  };

  const deleteEntry = async (id: string) => {
    if (!confirm("Are you sure you want to delete this entry?")) return;
    const res = await fetch(`/api/transactions/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (res.ok) {
      setTransactions((prev) => prev.filter((t) => t._id !== id));
    }
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    router.replace("/login");
    router.refresh();
  };

  const exportCsv = () => {
    const headers = ["Type", "Amount", "Category", "Source", "Note", "Payment Date", "Entry Created"];
    const rows = transactions.map((t) => [
      t.type,
      t.amount,
      t.category,
      t.source,
      t.note,
      new Date(t.date).toLocaleString(),
      new Date(t.createdAt).toLocaleString(),
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `paisabook-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-screen p-3 sm:p-5 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="card-panel flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-soft text-brand shadow-glow">
              <BadgeDollarSign className="h-7 w-7" />
            </div>
            <div>
              <p className="text-sm font-semibold text-muted">Welcome back, {user.name}</p>
              <h1 className="text-2xl font-black tracking-tight sm:text-3xl">PaisaBook Dashboard</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button onClick={exportCsv} className="btn-ghost">
              <Download className="h-4 w-4" />
              CSV
            </button>
            <button onClick={logout} className="btn-ghost">
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total Income"
            value={formatMoney(stats.income)}
            icon={<ArrowUpRight className="h-6 w-6" />}
            tone="income"
          />
          <StatCard
            title="Total Expense"
            value={formatMoney(stats.expense)}
            icon={<ArrowDownRight className="h-6 w-6" />}
            tone="expense"
          />
          <StatCard
            title="Balance"
            value={formatMoney(stats.balance)}
            icon={<WalletCards className="h-6 w-6" />}
            tone="brand"
          />
          <StatCard
            title="Entries"
            value={String(stats.entries)}
            icon={<CalendarClock className="h-6 w-6" />}
            tone="brand"
          />
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <form onSubmit={createEntry} className="card-panel p-5">
            <div className="mb-5">
              <h2 className="text-xl font-black">New payment entry</h2>
              <p className="mt-1 text-sm text-muted">
                Record income or expense with the exact date and time.
              </p>
            </div>

            <div className="mb-4 grid grid-cols-2 rounded-2xl bg-bg p-1">
              {(["income", "expense"] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setType(type)}
                  className={`rounded-xl px-4 py-3 text-sm font-extrabold transition ${
                    form.type === type
                      ? type === "income"
                        ? "bg-income text-white shadow-soft"
                        : "bg-expense text-white shadow-soft"
                      : "text-muted hover:text-fg"
                  }`}
                >
                  {type === "income" ? "Income" : "Expense"}
                </button>
              ))}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold">Amount</span>
                <input
                  className="input"
                  type="number"
                  min="1"
                  step="0.01"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  placeholder="5000"
                  required
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold">Category</span>
                <select
                  className="input"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                >
                  {categories.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </label>
              <label className="block sm:col-span-2">
                <span className="mb-2 block text-sm font-semibold">
                  Source / Place
                </span>
                <input
                  className="input"
                  value={form.source}
                  onChange={(e) => setForm({ ...form, source: e.target.value })}
                  placeholder={form.type === "income" ? "Client, salary, shop..." : "Market, bill, person..."}
                />
              </label>
              <label className="block sm:col-span-2">
                <span className="mb-2 block text-sm font-semibold">Date & Time</span>
                <input
                  className="input"
                  type="datetime-local"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  required
                />
              </label>
              <label className="block sm:col-span-2">
                <span className="mb-2 block text-sm font-semibold">Note</span>
                <textarea
                  className="input min-h-24 resize-none"
                  value={form.note}
                  onChange={(e) => setForm({ ...form, note: e.target.value })}
                  placeholder="Add a short note..."
                />
              </label>
            </div>

            {message && (
              <div className="mt-4 rounded-xl bg-brand-soft px-4 py-3 text-sm font-semibold text-brand">
                {message}
              </div>
            )}

            <button className="btn-brand mt-5 w-full !py-3" disabled={saving}>
              {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Plus className="h-5 w-5" />}
              Save Entry
            </button>
          </form>

          <div className="card-panel min-h-[390px] p-5">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-black">Cash flow</h2>
                <p className="mt-1 text-sm text-muted">Last 10 active days income vs expense.</p>
              </div>
            </div>
            <div className="h-[310px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="income" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="rgb(var(--income))" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="rgb(var(--income))" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="expense" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="rgb(var(--expense))" stopOpacity={0.32} />
                      <stop offset="95%" stopColor="rgb(var(--expense))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border))" />
                  <XAxis dataKey="date" stroke="rgb(var(--muted))" fontSize={12} />
                  <YAxis stroke="rgb(var(--muted))" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      background: "rgb(var(--card))",
                      border: "1px solid rgb(var(--border))",
                      borderRadius: 16,
                      color: "rgb(var(--fg))",
                    }}
                  />
                  <Area type="monotone" dataKey="income" stroke="rgb(var(--income))" fill="url(#income)" strokeWidth={3} />
                  <Area type="monotone" dataKey="expense" stroke="rgb(var(--expense))" fill="url(#expense)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        <section className="card-panel overflow-hidden">
          <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-black">All entries</h2>
              <p className="mt-1 text-sm text-muted">
                Shows both payment date/time and when the entry was created.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <input
                  className="input pl-9 sm:w-64"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search source, category..."
                />
              </div>
              <select
                className="input sm:w-36"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as typeof typeFilter)}
              >
                <option value="all">All</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="grid min-h-56 place-items-center">
              <Loader2 className="h-8 w-8 animate-spin text-brand" />
            </div>
          ) : transactions.length === 0 ? (
            <div className="grid min-h-56 place-items-center p-8 text-center">
              <div>
                <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-3xl bg-brand-soft text-brand">
                  <WalletCards className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-black">No entries yet</h3>
                <p className="mt-1 text-sm text-muted">Save your first income or expense entry.</p>
              </div>
            </div>
          ) : (
            <div className="divide-y">
              {transactions.map((t) => (
                <article key={t._id} className="grid gap-3 p-4 transition hover:bg-surface/55 md:grid-cols-[1fr_auto] md:items-center">
                  <div className="min-w-0">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className={`chip ${t.type === "income" ? "bg-income/12 text-income" : "bg-expense/12 text-expense"}`}>
                        {t.type === "income" ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                        {t.type === "income" ? "Income" : "Expense"}
                      </span>
                      <span className="chip bg-brand-soft text-brand">{t.category}</span>
                    </div>
                    <h3 className="truncate text-lg font-extrabold">
                      {t.source || (t.type === "income" ? "Income source" : "Expense place")}
                    </h3>
                    {t.note && <p className="mt-1 line-clamp-2 text-sm text-muted">{t.note}</p>}
                    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs font-medium text-muted">
                      <span>Payment: {formatDate(t.date)} • {formatTime(t.date)}</span>
                      <span>Entry created: {formatDate(t.createdAt)} • {formatTime(t.createdAt)}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-3 md:justify-end">
                    <p className={`text-xl font-black ${t.type === "income" ? "text-income" : "text-expense"}`}>
                      {t.type === "income" ? "+" : "-"}{formatMoney(t.amount)}
                    </p>
                    <button
                      onClick={() => deleteEntry(t._id)}
                      className="rounded-xl p-2 text-muted transition hover:bg-expense/10 hover:text-expense"
                      aria-label="Delete entry"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function StatCard({
  title,
  value,
  icon,
  tone,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  tone: "income" | "expense" | "brand";
}) {
  const toneClass =
    tone === "income"
      ? "bg-income/12 text-income"
      : tone === "expense"
        ? "bg-expense/12 text-expense"
        : "bg-brand-soft text-brand";

  return (
    <div className="card-panel p-5 animate-fade-up">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-muted">{title}</p>
          <p className="mt-2 text-2xl font-black tracking-tight">{value}</p>
        </div>
        <div className={`grid h-12 w-12 place-items-center rounded-2xl ${toneClass}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
