"use client";

import { Suspense } from "react";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Lock } from "lucide-react";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const mutation = useMutation({
    mutationFn: (data: any) => api.post("/auth/reset-password", data),
    onSuccess: () => {
      setSuccess(true);
    },
    onError: (err: any) => {
      setError(err.message || "Failed to reset password. The link might be expired.");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("Reset token is missing. Please use the link from your email.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    mutation.mutate({ token, password });
  };

  if (!token && !success) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-8 text-center shadow-xl">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
            <Lock size={24} />
          </div>
          <h1 className="text-xl font-bold text-[var(--color-text-primary)]">Invalid Reset Link</h1>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)] mb-6">
            The password reset link is invalid or missing a token.
          </p>
          <Link href="/forgot-password" className="text-sm font-semibold text-[var(--color-primary)] hover:underline">
            Request a new link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-8 shadow-xl">
        {success ? (
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
              <CheckCircle2 size={32} />
            </div>
            <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Password Reset!</h1>
            <p className="mt-2 text-sm text-[var(--color-text-secondary)] mb-8">
              Your password has been successfully changed.
            </p>
            <Link
              href="/login"
              className="inline-flex w-full items-center justify-center rounded-xl bg-[var(--color-primary)] px-6 py-3 text-sm font-semibold text-white hover:bg-[var(--color-primary-hover)] transition-colors"
            >
              Sign In to Continue
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-primary)] text-white">
                <Lock size={24} />
              </div>
              <h1 className="text-2xl font-bold font-[var(--font-heading)] text-[var(--color-text-primary)]">
                Create New Password
              </h1>
              <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                Please enter your new password below.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200 text-center">
                  {error}
                </div>
              )}
              
              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--color-text-secondary)]">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-[var(--color-border)] p-3 text-sm transition-colors focus:border-[var(--color-primary)] outline-none"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-[var(--color-text-secondary)]">
                  Confirm Password
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-xl border border-[var(--color-border)] p-3 text-sm transition-colors focus:border-[var(--color-primary)] outline-none"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={mutation.isPending || !password || !confirmPassword}
                className="w-full rounded-xl bg-[var(--color-primary)] py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-primary-hover)] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {mutation.isPending ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[70vh] items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-8 shadow-xl">
            <div className="flex flex-col items-center gap-4">
              <div className="h-12 w-12 animate-pulse rounded-full bg-[var(--color-bg-muted)]" />
              <div className="h-6 w-48 animate-pulse rounded bg-[var(--color-bg-muted)]" />
              <div className="h-4 w-64 animate-pulse rounded bg-[var(--color-bg-muted)]" />
            </div>
          </div>
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
