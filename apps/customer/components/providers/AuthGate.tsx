"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/stores/auth.store";
import { Lock, X, Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";

type Tab = "login" | "signup";

function AuthModal({ onClose }: { onClose?: () => void }) {
  const [tab, setTab] = useState<Tab>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, signup } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (tab === "login") {
        await login(email, password);
      } else {
        await signup(email, password, fullName);
      }
      // On success the parent re-renders via isAuthenticated
    } catch (err: unknown) {
      setError((err as Error).message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4">
      <div
        className="w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border)] shadow-[var(--shadow-xl)] overflow-hidden"
        style={{ animation: "slideInUp 250ms cubic-bezier(0.22,1,0.36,1) both" }}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6 pb-4">
          <div>
            <h2 className="text-lg font-bold text-[var(--color-text-primary)]">
              {tab === "login" ? "Welcome back" : "Create account"}
            </h2>
            <p className="mt-0.5 text-xs text-[var(--color-text-tertiary)]">
              {tab === "login"
                ? "Sign in to access your account."
                : "Join AuraZone to start shopping."}
            </p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--color-text-tertiary)] hover:bg-[var(--color-bg-muted)] transition-colors shrink-0"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="mx-6 mb-5 flex rounded-[var(--radius-md)] bg-[var(--color-bg-muted)] p-1">
          {(["login", "signup"] as Tab[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => { setTab(t); setError(""); }}
              className={`flex-1 rounded-[var(--radius-sm)] py-2 text-xs font-semibold capitalize transition-all ${
                tab === t
                  ? "bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] shadow-[var(--shadow-xs)]"
                  : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              {t === "login" ? "Sign In" : "Sign Up"}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4">
          {error && (
            <div className="rounded-[var(--radius-md)] border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-700">
              {error}
            </div>
          )}

          {tab === "signup" && (
            <div>
              <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
                Full Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your full name"
                autoFocus
                className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-base)] px-3 py-2.5 text-sm outline-none placeholder:text-[var(--color-text-tertiary)] focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/10 transition-colors"
              />
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoFocus={tab === "login"}
              className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-base)] px-3 py-2.5 text-sm outline-none placeholder:text-[var(--color-text-tertiary)] focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/10 transition-colors"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
                Password
              </label>
              {tab === "login" && (
                <Link href="/forgot-password" className="text-[10px] text-[var(--color-accent)] hover:underline">
                  Forgot password?
                </Link>
              )}
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-base)] px-3 py-2.5 pr-10 text-sm outline-none placeholder:text-[var(--color-text-tertiary)] focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/10 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] transition-colors"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-primary)] py-3 text-sm font-semibold text-white transition-all hover:bg-[var(--color-primary-hover)] hover:shadow-[var(--shadow-md)] disabled:opacity-50 active:scale-[0.98]"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <>
                {tab === "login" ? "Sign In" : "Create Account"}
                <ArrowRight size={15} />
              </>
            )}
          </button>

          <p className="text-center text-[10px] text-[var(--color-text-tertiary)]">
            By continuing you agree to our{" "}
            <Link href="/terms" className="underline hover:text-[var(--color-text-secondary)]">Terms</Link>
            {" "}and{" "}
            <Link href="/privacy" className="underline hover:text-[var(--color-text-secondary)]">Privacy Policy</Link>.
          </p>
        </form>
      </div>
    </div>
  );
}

interface AuthGateProps {
  children: React.ReactNode;
  /** Page label shown in the gate e.g. "your profile" */
  pageLabel?: string;
  /** Icon to show in the gate (pass a Lucide icon element) */
  icon?: React.ReactNode;
}

export function AuthGate({ children, pageLabel = "this page", icon }: AuthGateProps) {
  const { isAuthenticated, isLoading, fetchUser } = useAuthStore();
  const [showModal, setShowModal] = useState(false);
  const [defaultTab] = useState<"login" | "signup">("login");

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // While checking auth, show skeleton
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-32 shimmer rounded-2xl" />
        <div className="h-48 shimmer rounded-2xl" />
      </div>
    );
  }

  // Authenticated — render the page
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // Not authenticated — show gate
  return (
    <>
      <div className="flex flex-col items-center justify-center py-16 px-6 text-center rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)]">
        {/* Icon */}
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-bg-muted)] mb-5">
          {icon ?? <Lock size={28} className="text-[var(--color-text-tertiary)]" />}
        </div>

        <h2 className="text-lg font-bold text-[var(--color-text-primary)]">Sign in required</h2>
        <p className="mt-2 text-sm text-[var(--color-text-secondary)] max-w-xs">
          You need to be signed in to view {pageLabel}. Join thousands of happy shoppers on AuraZone!
        </p>

        {/* Actions */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3 w-full max-w-xs">
          <button
            onClick={() => setShowModal(true)}
            className="flex-1 flex items-center justify-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-primary)] py-2.5 text-sm font-semibold text-white hover:bg-[var(--color-primary-hover)] transition-all hover:shadow-[var(--shadow-md)] active:scale-[0.98]"
          >
            Sign In
            <ArrowRight size={15} />
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex-1 flex items-center justify-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-base)] py-2.5 text-sm font-medium text-[var(--color-text-primary)] hover:border-[var(--color-border-strong)] hover:bg-[var(--color-bg-muted)] transition-colors"
          >
            Create Account
          </button>
        </div>

        <p className="mt-5 text-[11px] text-[var(--color-text-tertiary)]">
          Your cart and wishlist are saved across sessions.
        </p>
      </div>

      {showModal && <AuthModal onClose={() => setShowModal(false)} />}
    </>
  );
}
