import type { Metadata } from "next";
export const metadata: Metadata = { title: "Edit Product" };
export default function EditProductPage() {
  return (
    <div className="space-y-6">
      <div><p className="page-label">AuraZone Admin</p><h1 className="page-title">Edit Product</h1></div>
      <div className="card p-6 h-64 shimmer" />
    </div>
  );
}
