"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, ShoppingCart, Heart, MapPin, ArrowLeft } from "lucide-react";
import { AuthGate } from "@/components/providers/AuthGate";

const ACCOUNT_TABS = [
  { href: "/profile",   label: "Profile",   icon: User },
  { href: "/orders",    label: "Orders",    icon: ShoppingCart },
  { href: "/wishlist",  label: "Wishlist",  icon: Heart },
  { href: "/addresses", label: "Addresses", icon: MapPin },
];

/** Map pathname prefixes → human-readable label and icon shown in the gate */
const PAGE_META: Record<string, { label: string; icon: React.ReactNode }> = {
  "/profile":   { label: "your profile",          icon: <User  size={28} className="text-[var(--color-text-tertiary)]" /> },
  "/orders":    { label: "your orders",            icon: <ShoppingCart size={28} className="text-[var(--color-text-tertiary)]" /> },
  "/wishlist":  { label: "your wishlist",          icon: <Heart size={28} className="text-[var(--color-text-tertiary)]" /> },
  "/addresses": { label: "your saved addresses",   icon: <MapPin size={28} className="text-[var(--color-text-tertiary)]" /> },
};

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Pick the best matching meta for the current path
  const meta = Object.entries(PAGE_META).find(([prefix]) => pathname.startsWith(prefix))?.[1]
    ?? { label: "this page", icon: undefined };

  return (
    <div className="section-container py-8">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] mb-4 transition-colors"
      >
        <ArrowLeft size={14} /> Back to shop
      </Link>
      <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-6">My Account</h1>

      <AuthGate pageLabel={meta.label} icon={meta.icon}>
        <div className="flex flex-col md:flex-row gap-8">
          {/* Desktop Sidebar */}
          <nav className="hidden md:block w-48 shrink-0 space-y-1">
            {ACCOUNT_TABS.map(({ href, label, icon: Icon }) => {
              const active = pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    active
                      ? "bg-[var(--color-accent-light)] text-[var(--color-accent)]"
                      : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-muted)]"
                  }`}
                >
                  <Icon size={16} /> {label}
                </Link>
              );
            })}
          </nav>

          {/* Mobile tab pills */}
          <div className="md:hidden flex gap-1 overflow-x-auto pb-4 mb-2 w-full scrollbar-hide">
            {ACCOUNT_TABS.map(({ href, label, icon: Icon }) => {
              const active = pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-xs font-medium transition-colors ${
                    active
                      ? "bg-[var(--color-accent)] text-white"
                      : "bg-[var(--color-bg-muted)] text-[var(--color-text-secondary)]"
                  }`}
                >
                  <Icon size={14} /> {label}
                </Link>
              );
            })}
          </div>

          {/* Page content */}
          <div className="flex-1 min-w-0">{children}</div>
        </div>
      </AuthGate>
    </div>
  );
}