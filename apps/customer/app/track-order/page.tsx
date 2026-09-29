"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Search, Package, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function TrackOrderPage() {
  const router = useRouter();
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber || !email) return;

    setLoading(true);
    setError("");
    
    try {
      const res = await api.get<{ trackingToken: string }>(`/orders/track/lookup?orderNumber=${encodeURIComponent(orderNumber)}&email=${encodeURIComponent(email)}`);
      if (res.data?.trackingToken) {
        router.push(`/track-order/${res.data.trackingToken}`);
      } else {
        setError("Invalid response from server.");
      }
    } catch (err: any) {
      setError(err.message || "Could not find an order matching these details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="section-container py-16 max-w-xl mx-auto min-h-[60vh] flex flex-col justify-center">
      <div className="text-center mb-8">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-bg-muted)] text-[var(--color-primary)] mb-6">
          <Package size={32} />
        </div>
        <h1 className="text-3xl font-bold text-[var(--color-text-primary)] tracking-tight">Track Your Order</h1>
        <p className="mt-3 text-[var(--color-text-secondary)]">Enter your order number and email address to see your order status.</p>
      </div>

      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6 md:p-8 shadow-sm">
        <form onSubmit={handleLookup} className="space-y-5">
          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--color-text-primary)]">Order Number</label>
            <input 
              type="text" 
              value={orderNumber} 
              onChange={e => setOrderNumber(e.target.value)} 
              required
              placeholder="e.g., ORD-123456" 
              className="w-full rounded-xl border border-[var(--color-border)] p-3 text-sm focus:border-[var(--color-primary)] outline-none" 
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--color-text-primary)]">Email Address</label>
            <input 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required
              placeholder="The email used during checkout" 
              className="w-full rounded-xl border border-[var(--color-border)] p-3 text-sm focus:border-[var(--color-primary)] outline-none" 
            />
          </div>

          <button
            type="submit"
            disabled={loading || !orderNumber || !email}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] py-3.5 text-sm font-semibold text-white hover:bg-[var(--color-primary-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Searching..." : (
              <>
                <Search size={16} /> Track Order
              </>
            )}
          </button>
        </form>
      </div>

      <p className="mt-8 text-center text-sm text-[var(--color-text-tertiary)]">
        Logged in users can also view their orders directly in the <Link href="/orders" className="text-[var(--color-accent)] font-medium hover:underline">Order History</Link>.
      </p>
    </div>
  );
}
