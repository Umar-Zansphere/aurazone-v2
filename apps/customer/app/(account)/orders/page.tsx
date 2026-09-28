"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import Link from "next/link";
import { ShoppingCart, ChevronRight } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  RECEIVED: "bg-blue-100 text-blue-700",
  SHIPPED: "bg-indigo-100 text-indigo-700",
  DELIVERED: "bg-emerald-100 text-emerald-700",
  SUCCESS: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

export default function OrdersPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["my-orders"],
    queryFn: () => api.get<{ orders: any[]; total: number }>("/orders"),
  });

  const orders = (data?.data as any)?.orders ?? [];

  if (isLoading) return (
    <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-20 shimmer rounded-xl" />)}</div>
  );

  if (orders.length === 0) return (
    <div className="py-12 text-center">
      <ShoppingCart size={40} className="mx-auto text-[var(--color-text-tertiary)] mb-3" />
      <p className="text-sm font-medium text-[var(--color-text-primary)]">No orders yet</p>
      <p className="mt-1 text-xs text-[var(--color-text-secondary)]">Your orders will appear here.</p>
    </div>
  );

  return (
    <div className="space-y-3">
      {orders.map((order: any) => (
        <Link key={order.id} href={`/orders/${order.id}`}
          className="flex items-center gap-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-4 hover:shadow-md transition-all group">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono font-medium text-[var(--color-text-primary)]">{order.orderNumber}</span>
              <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${STATUS_COLORS[order.status] ?? "bg-gray-100"}`}>
                {order.status}
              </span>
            </div>
            <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">
              {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
              {" · "}{order.items?.reduce((s: number, i: any) => s + i.quantity, 0) ?? 0} items
            </p>
          </div>
          <span className="text-sm font-bold text-[var(--color-text-primary)]">
            {"\u20B9"}{Number(order.totalAmount).toLocaleString()}
          </span>
          <ChevronRight size={16} className="text-[var(--color-text-tertiary)] group-hover:text-[var(--color-text-primary)] transition-colors" />
        </Link>
      ))}
    </div>
  );
}