import type { Metadata } from "next";
export const metadata: Metadata = { title: "Track Order" };
export default function TrackOrderPage() {
  return (
    <div className="section-container py-8">
      <h1 className="text-2xl font-bold font-[var(--font-heading)]">Track Order</h1>
      <div className="mt-6 h-64 shimmer rounded-[var(--radius-lg)]" />
    </div>
  );
}
