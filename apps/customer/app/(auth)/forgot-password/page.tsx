"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import Link from "next/link";
import { ArrowLeft, Mail } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState(false);

  const mutation = useMutation({
    mutationFn: (data: { email: string }) => api.post("/auth/forgot-password", data),
    onSuccess: () => {
      setSuccess(true);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    mutation.mutate({ email });
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-8 shadow-xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-primary)] text-white">
            <Mail size={24} />
          </div>
          <h1 className="text-2xl font-bold font-[var(--font-heading)] text-[var(--color-text-primary)]">
            Reset Password
          </h1>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        {success ? (
          <div className="rounded-xl bg-green-50 p-6 text-center border border-green-200">
            <h3 className="text-sm font-semibold text-green-800 mb-2">Check your email</h3>
            <p className="text-sm text-green-700 mb-6">
              If an account exists with <strong>{email}</strong>, we have sent a password reset link.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-xl bg-green-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-green-700 transition-colors"
            >
              Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {mutation.isError && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-200 text-center">
                {(mutation.error as Error).message}
              </div>
            )}
            
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-[var(--color-text-secondary)]">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-[var(--color-border)] p-3 text-sm transition-colors focus:border-[var(--color-primary)] outline-none"
                placeholder="you@example.com"
              />
            </div>

            <button
              type="submit"
              disabled={mutation.isPending || !email}
              className="w-full rounded-xl bg-[var(--color-primary)] py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-primary-hover)] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {mutation.isPending ? "Sending..." : "Send Reset Link"}
            </button>

            <div className="text-center pt-2">
              <Link href="/login" className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors">
                <ArrowLeft size={16} /> Back to Login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
