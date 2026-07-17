"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { Logo } from "./Logo";

type Mode = "login" | "register";

export function AuthForm() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      router.replace("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center">
        <div className="grid w-full gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-teal-400 via-cyan-600 to-sky-700 p-8 text-white shadow-glow lg:p-10">
            <div className="absolute -right-16 -top-16 h-52 w-52 rounded-full bg-white/20 blur-2xl" />
            <div className="absolute -bottom-20 left-16 h-64 w-64 rounded-full bg-cyan-200/25 blur-3xl" />
            <div className="relative z-10 flex h-full min-h-[440px] flex-col justify-center">
              <div className="mb-7">
                <Logo size={56} />
              </div>
              <h1 className="max-w-xl text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
                Clean money tracking with a fresh modern look.
              </h1>
              <p className="mt-5 max-w-lg text-base leading-7 text-white/85">
                Login only works with your correct password. Every entry stays private to your account.
              </p>
            </div>
          </section>

          <section className="card-panel p-5 sm:p-7 lg:p-8">
            <div className="mb-8 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Logo size={44} />
                <div>
                  <h2 className="text-lg font-extrabold tracking-tight">Payment Ledger</h2>
                  <p className="text-sm text-muted">Secure payment entry</p>
                </div>
              </div>
              <ThemeToggle />
            </div>

            <div className="mb-6 grid grid-cols-2 rounded-2xl bg-bg p-1">
              {(["login", "register"] as Mode[]).map((item) => (
                <button
                  key={item}
                  onClick={() => {
                    setMode(item);
                    setError("");
                  }}
                  className={`rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                    mode === item ? "bg-surface shadow-soft" : "text-muted hover:text-fg"
                  }`}
                >
                  {item === "login" ? "Login" : "Register"}
                </button>
              ))}
            </div>

            <form onSubmit={submit} className="space-y-4">
              {mode === "register" && (
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold">Name</span>
                  <input
                    className="input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    required={mode === "register"}
                  />
                </label>
              )}

              <label className="block">
                <span className="mb-2 block text-sm font-semibold">Email</span>
                <input
                  className="input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold">Password</span>
                <div className="relative">
                  <input
                    className="input pr-12"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-fg"
                    aria-label="Show password"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </label>

              {error && (
                <div className="rounded-xl border border-expense/30 bg-expense/10 px-4 py-3 text-sm font-semibold text-expense">
                  {error}
                </div>
              )}

              <button className="btn-brand w-full !py-3" disabled={loading}>
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
                {mode === "login" ? "Open Dashboard" : "Create Account"}
                {!loading ? <ArrowRight className="h-5 w-5" /> : null}
              </button>
            </form>

            <div className="mt-6 flex items-start gap-3 rounded-2xl bg-brand-soft/70 p-4 text-sm text-muted">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
              <p>
                Correct password is required to login. Your entries are private — other users cannot see your data.
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
