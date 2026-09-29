"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, ShieldCheck } from "lucide-react";

function VerifyForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  
  const [verifying, setVerifying] = useState(true);

  useEffect(() => {
    // Mocking email verification since there's no backend field for it currently
    const timer = setTimeout(() => {
      setVerifying(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, [token]);

  return (
    <div className="flex min-h-[70vh] items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-8 text-center shadow-xl">
        {verifying ? (
          <div className="flex flex-col items-center">
            <div className="mb-6 h-16 w-16 animate-pulse rounded-full bg-[var(--color-bg-muted)]" />
            <h1 className="text-xl font-bold text-[var(--color-text-primary)]">Verifying Email...</h1>
            <p className="mt-2 text-sm text-[var(--color-text-secondary)]">Please wait while we confirm your details.</p>
          </div>
        ) : (
          <div>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
              <ShieldCheck size={32} />
            </div>
            <h1 className="text-2xl font-bold font-[var(--font-heading)] text-[var(--color-text-primary)]">
              Account Verified!
            </h1>
            <p className="mt-2 text-sm text-[var(--color-text-secondary)] mb-8">
              Thank you for verifying your email address. Your account is now fully active.
            </p>
            <Link
              href="/login"
              className="inline-flex w-full items-center justify-center rounded-xl bg-[var(--color-primary)] px-6 py-3 text-sm font-semibold text-white hover:bg-[var(--color-primary-hover)] transition-colors"
            >
              Continue to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[70vh] items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-8 text-center shadow-xl">
          <div className="flex flex-col items-center">
            <div className="mb-6 h-16 w-16 animate-pulse rounded-full bg-[var(--color-bg-muted)]" />
            <h1 className="text-xl font-bold text-[var(--color-text-primary)]">Verifying Email...</h1>
            <p className="mt-2 text-sm text-[var(--color-text-secondary)]">Please wait while we confirm your details.</p>
          </div>
        </div>
      </div>
    }>
      <VerifyForm />
    </Suspense>
  );
}
