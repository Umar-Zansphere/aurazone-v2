"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { ArrowLeft, Package, MapPin, CreditCard } from "lucide-react";
import Link from "next/link";

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  RECEIVED: "bg-blue-100 text-blue-700",
  SHIPPED: "bg-indigo-100 text-indigo-700",
  DELIVERED: "bg-emerald-100 text-emerald-700",
  SUCCESS: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params.orderId as string;

  const { data, isLoading } = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => api.get<any>(`/orders/${orderId}`),
  });

  const order = data?.data;

  if (isLoading) return (
    <div className="space-y-4">
      <div className="h-6 w-48 shimmer rounded" />
      <div className="h-40 shimmer rounded-xl" />
    </div>
  );

  if (!order) return <p className="text-sm text-[var(--color-text-secondary)]">Order not found.</p>;

  return (
    <div className="space-y-5">
      <Link href="/orders" className="inline-flex items-center gap-1 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">
        <ArrowLeft size={14} /> Back to Orders
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-[var(--color-text-primary)] font-mono">{order.orderNumber}</h2>
          <p className="text-xs text-[var(--color-text-tertiary)]">
            {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${STATUS_COLORS[order.status] ?? "bg-gray-100"}`}>
          {order.status}
        </span>
      </div>

      {/* Items */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] divide-y divide-[var(--color-border)]">
        {order.items?.map((item: any) => (
          <div key={item.id} className="flex items-center gap-3 p-4">
            <div className="h-12 w-12 rounded-lg bg-[var(--color-bg-muted)] flex items-center justify-center overflow-hidden shrink-0">
              {item.imageUrl ? <img src={item.imageUrl} alt={item.productName} className="h-full w-full object-cover" />
                : <Package size={14} className="text-[var(--color-text-tertiary)]" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">{item.productName}</p>
              <p className="text-[10px] text-[var(--color-text-tertiary)]">{item.storeName} · Qty: {item.quantity}</p>
            </div>
            <span className="text-sm font-medium">{"\u20B9"}{Number(item.subtotal).toLocaleString()}</span>
          </div>
        ))}
        <div className="p-4 flex justify-between font-bold text-sm">
          <span>Total</span>
          <span>{"\u20B9"}{Number(order.totalAmount).toLocaleString()}</span>
        </div>
      </div>

      {/* Address */}
      {order.orderAddress && (
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-4">
          <h3 className="text-xs font-semibold text-[var(--color-text-tertiary)] uppercase flex items-center gap-1 mb-2">
            <MapPin size={12} /> Delivery Address
          </h3>
          <div className="text-sm text-[var(--color-text-secondary)] space-y-0.5">
            <p className="font-medium text-[var(--color-text-primary)]">{order.orderAddress.name}</p>
            <p>{order.orderAddress.addressLine1}</p>
            <p>{order.orderAddress.city}, {order.orderAddress.state} {order.orderAddress.postalCode}</p>
          </div>
        </div>
      )}
    </div>
  );
}