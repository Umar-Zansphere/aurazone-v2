"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Minus, Plus, Trash2, ShoppingCart, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function CartPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["cart"],
    queryFn: () => api.get<any>("/cart"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      api.patch(`/cart/${itemId}`, { quantity }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cart"] }),
  });

  const removeMutation = useMutation({
    mutationFn: (itemId: string) => api.delete(`/cart/${itemId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cart"] }),
  });

  const cart = data?.data;
  const items = cart?.items ?? [];
  const subtotal = cart?.subtotal ?? 0;
  const itemCount = cart?.itemCount ?? 0;

  if (isLoading) {
    return (
      <div className="section-container py-8">
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-6">Shopping Cart</h1>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 shimmer rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="section-container py-16 text-center">
        <ShoppingCart size={56} className="mx-auto text-[var(--color-text-tertiary)] mb-4" />
        <h1 className="text-xl font-bold text-[var(--color-text-primary)]">Your cart is empty</h1>
        <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
          Start adding products to your cart.
        </p>
        <Link href="/products" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[var(--color-primary)] px-6 py-3 text-sm font-semibold text-white hover:bg-[var(--color-primary-hover)] transition-colors">
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="section-container py-8">
      <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-6">
        Shopping Cart <span className="text-base font-normal text-[var(--color-text-tertiary)]">({itemCount} items)</span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-3">
          {items.map((item: any) => {
            const imageUrl = item.variant?.images?.[0]?.url;
            const productName = item.variant?.product?.name ?? "Product";
            const storeName = item.variant?.product?.store?.name;
            const unitPrice = Number(item.unitPrice);

            return (
              <div key={item.id} className="flex gap-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-4">
                {/* Image */}
                <div className="h-20 w-20 shrink-0 rounded-lg bg-[var(--color-bg-muted)] overflow-hidden">
                  {imageUrl ? (
                    <img src={imageUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-2xl">📦</div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <Link href={`/product/${item.variant?.product?.slug ?? ""}`}
                    className="text-sm font-medium text-[var(--color-text-primary)] hover:text-[var(--color-accent)] line-clamp-2">
                    {productName}
                  </Link>
                  {storeName && <p className="text-[10px] text-[var(--color-text-tertiary)] mt-0.5">{storeName}</p>}
                  {item.variant?.attributes?.length > 0 && (
                    <p className="text-[10px] text-[var(--color-text-tertiary)] mt-0.5">
                      {item.variant.attributes.map((a: any) => `${a.key}: ${a.value}`).join(" · ")}
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center rounded-lg border border-[var(--color-border)] overflow-hidden">
                      <button onClick={() => updateMutation.mutate({ itemId: item.id, quantity: Math.max(1, item.quantity - 1) })}
                        className="flex h-8 w-8 items-center justify-center text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-muted)]">
                        <Minus size={12} />
                      </button>
                      <span className="flex h-8 w-10 items-center justify-center text-xs font-semibold border-x border-[var(--color-border)]">
                        {item.quantity}
                      </span>
                      <button onClick={() => updateMutation.mutate({ itemId: item.id, quantity: item.quantity + 1 })}
                        className="flex h-8 w-8 items-center justify-center text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-muted)]">
                        <Plus size={12} />
                      </button>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-[var(--color-text-primary)]">
                        {"\u20B9"}{(unitPrice * item.quantity).toLocaleString()}
                      </span>
                      <button onClick={() => removeMutation.mutate(item.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-text-tertiary)] hover:bg-red-50 hover:text-red-500 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5 sticky top-20">
            <h2 className="text-sm font-semibold text-[var(--color-text-primary)] mb-4">Order Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--color-text-secondary)]">Subtotal ({itemCount} items)</span>
                <span className="font-medium text-[var(--color-text-primary)]">{"\u20B9"}{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-text-secondary)]">Delivery</span>
                <span className="font-medium text-emerald-600">{subtotal >= 499 ? "Free" : "₹49"}</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-[var(--color-border)] flex justify-between text-base font-bold text-[var(--color-text-primary)]">
              <span>Total</span>
              <span>{"\u20B9"}{(subtotal + (subtotal >= 499 ? 0 : 49)).toLocaleString()}</span>
            </div>
            <Link href="/checkout"
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] py-3 text-sm font-semibold text-white hover:bg-[var(--color-primary-hover)] transition-colors">
              Checkout <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}