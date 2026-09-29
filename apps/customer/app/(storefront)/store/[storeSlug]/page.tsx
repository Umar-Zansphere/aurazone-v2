"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { ProductCard } from "@/components/product/ProductCard";
import Link from "next/link";
import { ChevronRight, Package } from "lucide-react";

export default function StorePage() {
  const params = useParams();
  const storeSlug = params.storeSlug as string;

  const { data: storeData, isLoading: storeLoading } = useQuery({
    queryKey: ["store", storeSlug],
    queryFn: () => api.get<any>(`/stores/${storeSlug}`),
  });

  const store = storeData?.data;

  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ["products", "store", store?.id],
    queryFn: () => api.get<{ products: any[] }>(`/products?storeId=${store.id}&take=50`),
    enabled: !!store?.id,
  });

  const products = Array.isArray(productsData?.data) ? productsData.data : [];

  if (storeLoading) {
    return (
      <div className="section-container py-8">
        <div className="h-40 shimmer rounded-2xl mb-8" />
        <div className="product-grid">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i}><div className="aspect-[3/4] shimmer rounded-xl" /></div>
          ))}
        </div>
      </div>
    );
  }

  if (!store) return (
    <div className="section-container py-16 text-center">
      <p className="text-lg font-semibold">Store not found</p>
    </div>
  );

  return (
    <div className="section-container py-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)] mb-6">
        <Link href="/" className="hover:text-[var(--color-text-primary)]">Home</Link>
        <ChevronRight size={12} />
        <span className="text-[var(--color-text-primary)]">{store.name}</span>
      </nav>

      {/* Store Header */}
      <div className="rounded-2xl overflow-hidden mb-8"
        style={{ background: `linear-gradient(135deg, ${store.accentColor ?? '#6F7F5F'} 0%, var(--color-primary) 100%)` }}>
        <div className="px-8 py-10 md:py-14">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm text-white text-2xl font-bold">
              {store.name[0]}
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">{store.name}</h1>
              {store.description && (
                <p className="mt-1 text-sm text-white/80 max-w-lg">{store.description}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Categories */}
      {store.categories?.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
          {store.categories.map((cat: any) => (
            <Link key={cat.id} href={`/store/${storeSlug}/${cat.slug}`}
              className="shrink-0 rounded-full border border-[var(--color-border)] px-4 py-2 text-xs font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-accent-light)] hover:text-[var(--color-accent)] hover:border-[var(--color-accent)] transition-colors">
              {cat.name}
            </Link>
          ))}
        </div>
      )}

      {/* Products */}
      <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-4">
        All Products
        {!productsLoading && <span className="text-sm font-normal text-[var(--color-text-tertiary)] ml-2">({products.length})</span>}
      </h2>

      {productsLoading ? (
        <div className="product-grid">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i}><div className="aspect-[3/4] shimmer rounded-xl" /></div>
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="product-grid">
          {products.map((p: any) => <ProductCard key={p.id} product={p} />)}
        </div>
      ) : (
        <div className="py-12 text-center">
          <Package size={40} className="mx-auto text-[var(--color-text-tertiary)] mb-3" />
          <p className="text-sm text-[var(--color-text-secondary)]">No products in this store yet.</p>
        </div>
      )}
    </div>
  );
}