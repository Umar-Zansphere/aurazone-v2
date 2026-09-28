"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { CreditCard, Search } from "lucide-react";
import { useState } from "react";

export default function PaymentsPage() {
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "payments", search],
    queryFn: () => api.get<any[]>(`/admin/orders?search=${search}`),
  });

  const orders = data?.data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <p className="page-label">Operations</p>
        <h1 className="page-title">Payments</h1>
      </div>

      <div className="flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-3 py-2 w-80">
        <Search size={14} className="text-[var(--color-text-tertiary)]" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by order number..."
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--color-text-tertiary)]" />
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg-muted)]">
              <th className="px-5 py-3 text-left text-xs font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider">Order</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider">Method</th>
              <th className="px-5 py-3 text-right text-xs font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider">Amount</th>
              <th className="px-5 py-3 text-center text-xs font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider">Status</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i}>{Array.from({ length: 5 }).map((_, j) => (
                  <td key={j} className="px-5 py-3"><div className="w-20 h-4 shimmer rounded" /></td>
                ))}</tr>
              ))
            ) : orders.map((order: any) => (
              <tr key={order.id} className="hover:bg-[var(--color-bg-muted)] transition-colors">
                <td className="px-5 py-3 text-xs font-mono text-[var(--color-accent)]">{order.orderNumber}</td>
                <td className="px-5 py-3 text-xs text-[var(--color-text-secondary)]">{order.paymentMethod}</td>
                <td className="px-5 py-3 text-right font-medium text-[var(--color-text-primary)]">
                  {"\u20B9"}{Number(order.totalAmount).toLocaleString()}
                </td>
                <td className="px-5 py-3 text-center">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    order.paymentStatus === "SUCCESS" ? "bg-emerald-50 text-emerald-600" :
                    order.paymentStatus === "FAILED" ? "bg-red-50 text-red-600" :
                    "bg-amber-50 text-amber-600"
                  }`}>
                    {order.paymentStatus}
                  </span>
                </td>
                <td className="px-5 py-3 text-xs text-[var(--color-text-secondary)]">
                  {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!isLoading && orders.length === 0 && (
          <div className="p-12 text-center">
            <CreditCard size={40} className="mx-auto text-[var(--color-text-tertiary)] mb-3" />
            <p className="text-sm text-[var(--color-text-secondary)]">No payment records yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}