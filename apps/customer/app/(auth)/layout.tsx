import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--color-bg-base)] px-4">
      <Link href="/" className="text-xl font-bold font-[var(--font-heading)] text-[var(--color-text-primary)] mb-8">
        AuraZone
      </Link>
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}