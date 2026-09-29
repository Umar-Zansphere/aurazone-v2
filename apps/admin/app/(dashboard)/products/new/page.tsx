"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function NewProductPage() {
  const router = useRouter();
  
  // Redirect to stores — product creation now lives inside each store
  return (
    <div className="space-y-6 fade-in">
      <div>
        <p className="page-label">AuraZone Admin</p>
        <h1 className="page-title">New Product</h1>
      </div>
      <div className="card p-8 text-center space-y-3">
        <p className="text-sm text-[var(--color-text-primary)] font-medium">
          Product creation has moved inside each store
        </p>
        <p className="text-xs text-[var(--color-text-secondary)]">
          Navigate to a store, open the <strong>Products</strong> tab, and click <strong>Add Product</strong> to create products with image uploads and store-specific attributes.
        </p>
        <Link href="/stores" className="btn-primary text-xs inline-flex items-center gap-2 mt-2">
          <ArrowLeft size={14} /> Go to Stores
        </Link>
      </div>
    </div>
  );
}