"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function Footer() {
  const { data: storesData } = useQuery({
    queryKey: ["stores", "footer"],
    queryFn: () => api.get<any>("/stores?activeOnly=true"),
  });

  const stores = storesData?.data?.stores ?? [];

  return (
    <footer className="border-t border-[var(--color-border)] bg-[var(--color-bg-surface)] pt-12 pb-24 md:pb-12 mt-12">
      <div className="section-container">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <p className="font-bold font-[var(--font-heading)] text-[var(--color-text-primary)] mb-3">AuraZone</p>
            <p className="text-sm text-[var(--color-text-secondary)]">Your one-stop multi-store destination for fashion, home, cosmetics and more.</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)] mb-3">Stores</p>
            <ul className="space-y-2 text-sm text-[var(--color-text-secondary)]">
              {stores.length > 0 ? (
                stores.map((s: any) => (
                  <li key={s.id}>
                    <Link href={`/store/${s.slug}`} className="hover:text-[var(--color-text-primary)] transition-colors">
                      {s.name}
                    </Link>
                  </li>
                ))
              ) : (
                ["Fashion", "Shoes", "Cosmetics", "Home"].map((s) => (
                  <li key={s}>
                    <Link href={`/store/${s.toLowerCase()}`} className="hover:text-[var(--color-text-primary)] transition-colors">
                      {s}
                    </Link>
                  </li>
                ))
              )}
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)] mb-3">Help</p>
            <ul className="space-y-2 text-sm text-[var(--color-text-secondary)]">
              <li><Link href="/track-order" className="hover:text-[var(--color-text-primary)] transition-colors">Track Order</Link></li>
              <li><Link href="/refund-policy" className="hover:text-[var(--color-text-primary)] transition-colors">Returns</Link></li>
              <li><Link href="/shipping-policy" className="hover:text-[var(--color-text-primary)] transition-colors">Shipping</Link></li>
              <li><Link href="/contact" className="hover:text-[var(--color-text-primary)] transition-colors">Contact</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-tertiary)] mb-3">Legal</p>
            <ul className="space-y-2 text-sm text-[var(--color-text-secondary)]">
              <li><Link href="/privacy" className="hover:text-[var(--color-text-primary)] transition-colors">Privacy</Link></li>
              <li><Link href="/terms" className="hover:text-[var(--color-text-primary)] transition-colors">Terms</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-10 border-t border-[var(--color-border)] pt-6 text-center text-xs text-[var(--color-text-tertiary)]">
          &copy; {new Date().getFullYear()} AuraZone. All rights reserved.
        </div>
      </div>
    </footer>
  );
}