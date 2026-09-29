"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { CheckCircle, Package, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function OrderConfirmationPage() {
  const params = useParams();
  const orderId = params.orderId as string;

  const { data, isLoading } = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => api.get<any>(`/orders/track/${orderId}`),
  });

  const order = data?.data;

  if (isLoading) {
    return (
      <div className="section-container py-16 text-center">
        <div className="h-12 w-12 shimmer rounded-full mx-auto mb-4" />
        <div className="h-6 w-48 shimmer rounded mx-auto mb-2" />
        <div className="h-4 w-64 shimmer rounded mx-auto" />
      </div>
    );
  }

  return (
    <div className="section-container py-12 max-w-lg mx-auto text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 mx-auto mb-4">
        <CheckCircle size={32} className="text-emerald-600" />
      </div>
      <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Order Placed!</h1>
      <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
        Thank you for your order. Your order number is{" "}
        <span className="font-mono font-semibold text-[var(--color-text-primary)]">{order?.orderNumber ?? orderId}</span>
      </p>

      {order && (
        <div className="mt-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5 text-left">
          <div className="space-y-3">
            {order.items?.map((item: any) => (
              <div key={item.id} className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-[var(--color-bg-muted)] flex items-center justify-center overflow-hidden shrink-0">
                  {item.imageUrl ? <img src={item.imageUrl} alt={item.productName} className="h-full w-full object-cover" />
                    : <Package size={14} className="text-[var(--color-text-tertiary)]" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[var(--color-text-primary)] truncate">{item.productName}</p>
                  <p className="text-[10px] text-[var(--color-text-tertiary)]">Qty: {item.quantity}</p>
                </div>
                <span className="text-sm font-medium">{"\u20B9"}{Number(item.subtotal).toLocaleString()}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-[var(--color-border)] flex justify-between font-bold">
            <span>Total</span>
            <span>{"\u20B9"}{Number(order.totalAmount).toLocaleString()}</span>
          </div>
        </div>
      )}

      <div className="mt-8 flex flex-col gap-3">
        <Link href="/orders" className="flex items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] py-3 text-sm font-semibold text-white hover:bg-[var(--color-primary-hover)]">
          View My Orders <ArrowRight size={14} />
        </Link>
        <Link href="/products" className="text-sm text-[var(--color-accent)] hover:underline">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}