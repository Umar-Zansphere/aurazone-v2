"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { MapPin, Plus, CreditCard, Lock, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function CheckoutPage() {
  const router = useRouter();
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("COD");

  const { data: cartData } = useQuery({
    queryKey: ["cart"],
    queryFn: () => api.get<any>("/cart"),
  });

  const { data: addressData } = useQuery({
    queryKey: ["addresses"],
    queryFn: () => api.get<any[]>("/users/addresses"),
  });

  const placeOrderMutation = useMutation({
    mutationFn: (data: { addressId: string; paymentMethod: string }) =>
      api.post<{ order: { id: string } }>("/orders", data),
    onSuccess: (res) => {
      const orderId = res.data?.order?.id;
      if (orderId) router.push(`/order-confirmation/${orderId}`);
    },
  });

  const cart = cartData?.data;
  const addresses = addressData?.data ?? [];
  const items = cart?.items ?? [];
  const subtotal = cart?.subtotal ?? 0;
  const deliveryFee = subtotal >= 499 ? 0 : 49;
  const total = subtotal + deliveryFee;

  if (items.length === 0) {
    return (
      <div className="section-container py-16 text-center">
        <p className="text-lg font-semibold text-[var(--color-text-primary)]">Your cart is empty</p>
        <Link href="/products" className="mt-4 inline-flex rounded-xl bg-[var(--color-primary)] px-6 py-3 text-sm font-semibold text-white">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="section-container py-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-6">Checkout</h1>

      {placeOrderMutation.isError && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600 mb-6">
          {(placeOrderMutation.error as Error).message}
        </div>
      )}

      <div className="space-y-6">
        {/* Delivery Address */}
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5">
          <h2 className="text-sm font-semibold text-[var(--color-text-primary)] flex items-center gap-2 mb-4">
            <MapPin size={16} /> Delivery Address
          </h2>
          {addresses.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-sm text-[var(--color-text-secondary)] mb-3">No saved addresses.</p>
              <Link href="/addresses" className="text-xs font-medium text-[var(--color-accent)] hover:underline">
                <Plus size={12} className="inline mr-1" /> Add Address
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {addresses.map((addr: any) => (
                <button key={addr.id} onClick={() => setSelectedAddressId(addr.id)}
                  className={`w-full text-left rounded-lg border p-3 text-sm transition-colors ${
                    selectedAddressId === addr.id
                      ? "border-[var(--color-accent)] bg-[var(--color-accent-light)]"
                      : "border-[var(--color-border)] hover:border-[var(--color-border-strong)]"
                  }`}>
                  <p className="font-medium text-[var(--color-text-primary)]">{addr.name}</p>
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    {addr.addressLine1}, {addr.city}, {addr.state} {addr.postalCode}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Payment Method */}
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5">
          <h2 className="text-sm font-semibold text-[var(--color-text-primary)] flex items-center gap-2 mb-4">
            <CreditCard size={16} /> Payment Method
          </h2>
          <div className="space-y-2">
            {[
              { value: "COD", label: "Cash on Delivery", desc: "Pay when you receive your order" },
              { value: "RAZORPAY", label: "Online Payment", desc: "UPI, Cards, Net Banking" },
            ].map(({ value, label, desc }) => (
              <button key={value} onClick={() => setPaymentMethod(value)}
                className={`w-full text-left rounded-lg border p-3 transition-colors ${
                  paymentMethod === value
                    ? "border-[var(--color-accent)] bg-[var(--color-accent-light)]"
                    : "border-[var(--color-border)] hover:border-[var(--color-border-strong)]"
                }`}>
                <p className="text-sm font-medium text-[var(--color-text-primary)]">{label}</p>
                <p className="text-xs text-[var(--color-text-tertiary)]">{desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5">
          <h2 className="text-sm font-semibold text-[var(--color-text-primary)] mb-3">Order Summary</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[var(--color-text-secondary)]">Subtotal ({items.length} items)</span>
              <span className="font-medium">{"\u20B9"}{subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--color-text-secondary)]">Delivery</span>
              <span className="font-medium text-emerald-600">{deliveryFee === 0 ? "Free" : `₹${deliveryFee}`}</span>
            </div>
            <div className="pt-3 mt-3 border-t border-[var(--color-border)] flex justify-between text-base font-bold">
              <span>Total</span>
              <span>{"\u20B9"}{total.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => placeOrderMutation.mutate({ addressId: selectedAddressId, paymentMethod })}
          disabled={!selectedAddressId || placeOrderMutation.isPending}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] py-4 text-sm font-semibold text-white hover:bg-[var(--color-primary-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Lock size={14} />
          {placeOrderMutation.isPending ? "Placing Order..." : `Place Order · ₹${total.toLocaleString()}`}
        </button>
      </div>
    </div>
  );
}