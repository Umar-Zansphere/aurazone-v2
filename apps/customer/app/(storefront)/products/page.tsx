"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { ProductCard } from "@/components/product/ProductCard";
import { Search, SlidersHorizontal, ChevronDown, X } from "lucide-react";

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("categoryId") ?? "";
  const initialStore = searchParams.get("storeId") ?? "";
  const initialSearch = searchParams.get("q") ?? "";

  const [search, setSearch] = useState(initialSearch);
  const [storeId, setStoreId] = useState(initialStore);
  const [categoryId, setCategoryId] = useState(initialCategory);
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);

  const queryStr = [
    `search=${search}`, `sortBy=${sortBy}`, `take=24`,
    storeId && `storeId=${storeId}`,
    categoryId && `categoryId=${categoryId}`,
  ].filter(Boolean).join("&");

  const { data, isLoading } = useQuery({
    queryKey: ["products", queryStr],
    queryFn: () => api.get<{ products: any[]; total: number }>(`/products?${queryStr}`),
  });

  const { data: storesData } = useQuery({
    queryKey: ["stores"],
    queryFn: () => api.get<any[]>("/stores"),
  });

  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: () => api.get<any[]>("/categories"),
  });

  const products = (data?.data as any)?.products ?? [];
  const total = (data?.data as any)?.total ?? 0;
  const stores = storesData?.data ?? [];
  const categories = categoriesData?.data ?? [];

  const activeFilterCount = [storeId, categoryId].filter(Boolean).length;

  return (
    <div className="section-container py-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Products</h1>
          {!isLoading && (
            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
              {total} product{total !== 1 ? "s" : ""} found
            </p>
          )}
        </div>
      </div>

      {/* Search + Filter bar */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-4 py-2.5 flex-1 min-w-[200px] max-w-md">
          <Search size={16} className="text-[var(--color-text-tertiary)]" />
          <input
            type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--color-text-tertiary)]"
          />
          {search && (
            <button onClick={() => setSearch("")} className="text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]">
              <X size={14} />
            </button>
          )}
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors ${
            showFilters || activeFilterCount > 0
              ? "border-[var(--color-accent)] bg-[var(--color-accent-light)] text-[var(--color-accent)]"
              : "border-[var(--color-border)] bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)]"
          }`}
        >
          <SlidersHorizontal size={14} />
          Filters
          {activeFilterCount > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-accent)] text-[10px] text-white font-bold">
              {activeFilterCount}
            </span>
          )}
        </button>

        <select
          value={sortBy} onChange={(e) => setSortBy(e.target.value)}
          className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-4 py-2.5 text-sm text-[var(--color-text-secondary)] outline-none"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="name_asc">Name A-Z</option>
          <option value="name_desc">Name Z-A</option>
        </select>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="mb-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-4 flex flex-wrap gap-4 items-end">
          <div className="min-w-[180px]">
            <label className="text-xs font-semibold text-[var(--color-text-tertiary)] uppercase mb-1 block">Store</label>
            <select value={storeId} onChange={(e) => setStoreId(e.target.value)}
              className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm outline-none">
              <option value="">All Stores</option>
              {stores.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div className="min-w-[180px]">
            <label className="text-xs font-semibold text-[var(--color-text-tertiary)] uppercase mb-1 block">Category</label>
            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}
              className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm outline-none">
              <option value="">All Categories</option>
              {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          {activeFilterCount > 0 && (
            <button onClick={() => { setStoreId(""); setCategoryId(""); }}
              className="text-xs text-[var(--color-accent)] hover:underline">
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* Product Grid */}
      {isLoading ? (
        <div className="product-grid">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="aspect-[3/4] shimmer rounded-xl" />
              <div className="h-3 w-3/4 shimmer rounded" />
              <div className="h-3 w-1/2 shimmer rounded" />
            </div>
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="product-grid">
          {products.map((product: any) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center">
          <p className="text-lg font-semibold text-[var(--color-text-primary)]">No products found</p>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            Try adjusting your search or filters.
          </p>
        </div>
      )}
    </div>
  );
}