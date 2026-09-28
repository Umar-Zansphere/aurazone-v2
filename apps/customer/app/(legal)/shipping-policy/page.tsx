import type { Metadata } from "next";
export const metadata: Metadata = { title: "Shipping Policy" };
export default function ShippingPolicyPage() {
  return (
    <div className="section-container py-8">
      <h1 className="text-2xl font-bold font-[var(--font-heading)]">Shipping Policy</h1>
      <div className="mt-6 h-64 shimmer rounded-[var(--radius-lg)]" />
    </div>
  );
}
