"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      router.push("/");
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6 space-y-4">
      <div>
        <h1 className="text-lg font-bold text-[var(--color-text-primary)]">Welcome back</h1>
        <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5">Sign in to continue shopping.</p>
      </div>
      {error && <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-600">{error}</div>}
      <div className="space-y-3">
        <div>
          <label className="text-xs font-semibold text-[var(--color-text-tertiary)] uppercase block mb-1">Email</label>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoFocus
            className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-accent)]" />
        </div>
        <div>
          <label className="text-xs font-semibold text-[var(--color-text-tertiary)] uppercase block mb-1">Password</label>
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-accent)]" />
        </div>
      </div>
      <div className="flex justify-end">
        <Link href="/forgot-password" className="text-xs text-[var(--color-accent)] hover:underline">Forgot password?</Link>
      </div>
      <button type="submit" disabled={loading}
        className="w-full rounded-xl bg-[var(--color-primary)] py-3 text-sm font-semibold text-white hover:bg-[var(--color-primary-hover)] transition-colors disabled:opacity-50">
        {loading ? "Signing in..." : "Sign in"}
      </button>
      <p className="text-center text-xs text-[var(--color-text-tertiary)]">
        Don{"\u2019"}t have an account? <Link href="/signup" className="text-[var(--color-accent)] font-medium hover:underline">Sign up</Link>
      </p>
    </form>
  );
}