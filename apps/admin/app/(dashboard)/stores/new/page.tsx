import type { Metadata } from "next";
export const metadata: Metadata = { title: "New Store" };
export default function NewStorePage() {
  return (
    <div className="space-y-6">
      <div><p className="page-label">AuraZone Admin</p><h1 className="page-title">New Store</h1></div>
      <div className="card p-6 h-64 shimmer" />
    </div>
  );
}
