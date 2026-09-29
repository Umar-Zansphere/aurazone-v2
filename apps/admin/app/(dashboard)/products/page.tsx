"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
  Plus, Search, Edit2, Trash2, Package,
  CheckCircle, XCircle, Eye, Filter,
} from "lucide-react";
import Link from "next/link";

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  store: { id: string; name: string; slug: string };
  category: { id: string; name: string; slug: string };
  variants: Array<{
    id: string;
    price: number;
    compareAtPrice: number | null;
    images: Array<{ url: string }>;
  }>;
  _count: { variants: number };
}

interface Store {
  id: string;
  name: string;
  slug: string;
}

export default function ProductsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [storeFilter, setStoreFilter] = useState("");

  const { data: storesData } = useQuery({
    queryKey: ["admin", "stores"],
    queryFn: () => api.get<Store[]>("/admin/stores"),
  });

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "products", search, storeFilter],
    queryFn: () =>
      api.get<Product[]>(
        `/admin/products?search=${search}${storeFilter ? `&storeId=${storeFilter}` : ""}`
      ),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/products/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "products"] }),
  });

  const products = data?.data ?? [];
  const stores = storesData?.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="page-label">Catalog</p>
          <h1 className="page-title">Products</h1>
        </div>
        <Link href="/products/new" className="btn-primary flex items-center gap-2">
          <Plus size={16} />
          New Product
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row md:items-center gap-3">
        <div className="flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-3 py-2 w-full md:w-72">
          <Search size={14} className="text-[var(--color-text-tertiary)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--color-text-tertiary)]"
          />
        </div>
        <select
          value={storeFilter}
          onChange={(e) => setStoreFilter(e.target.value)}
          className="form-input w-48 py-2"
        >
          <option value="">All Stores</option>
          {stores.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>

      {/* Products Table */}
      <div className="card overflow-x-auto">
        <table className="w-full text-sm whitespace-nowrap min-w-[600px]">
          <thead>
            <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg-muted)]">
              <th className="px-5 py-3 text-left text-xs font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider">
                Product
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider">
                Store
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider">
                Category
              </th>
              <th className="px-5 py-3 text-right text-xs font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider">
                Price
              </th>
              <th className="px-5 py-3 text-center text-xs font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider">
                Variants
              </th>
              <th className="px-5 py-3 text-center text-xs font-semibold text-[var(--color-text-tertiary)] uppercase tracking-wider">
                Status
              </th>
              <th className="px-5 py-3 w-24" />
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {isLoading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-5 py-3"><div className="w-40 h-4 shimmer rounded" /></td>
                    <td className="px-5 py-3"><div className="w-20 h-4 shimmer rounded" /></td>
                    <td className="px-5 py-3"><div className="w-24 h-4 shimmer rounded" /></td>
                    <td className="px-5 py-3"><div className="w-16 h-4 shimmer rounded ml-auto" /></td>
                    <td className="px-5 py-3"><div className="w-8 h-4 shimmer rounded mx-auto" /></td>
                    <td className="px-5 py-3"><div className="w-14 h-5 shimmer rounded-full mx-auto" /></td>
                    <td className="px-5 py-3" />
                  </tr>
                ))
              : products.map((product) => {
                  const price = product.variants[0]?.price;
                  const comparePrice = product.variants[0]?.compareAtPrice;
                  const imageUrl = product.variants[0]?.images?.[0]?.url;

                  return (
                    <tr key={product.id} className="hover:bg-[var(--color-bg-muted)] transition-colors group">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-lg bg-[var(--color-bg-muted)] flex items-center justify-center overflow-hidden">
                            {imageUrl ? (
                              <img src={imageUrl} alt="" className="h-full w-full object-cover" />
                            ) : (
                              <Package size={14} className="text-[var(--color-text-tertiary)]" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-[var(--color-text-primary)] truncate max-w-[200px]">
                              {product.name}
                            </p>
                            <p className="text-[10px] font-mono text-[var(--color-text-tertiary)]">
                              /{product.slug}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-xs text-[var(--color-text-secondary)]">
                        {product.store.name}
                      </td>
                      <td className="px-5 py-3 text-xs text-[var(--color-text-secondary)]">
                        {product.category.name}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <span className="font-medium text-[var(--color-text-primary)]">
                          {"\u20B9"}{Number(price ?? 0).toLocaleString()}
                        </span>
                        {comparePrice && (
                          <span className="ml-1 text-xs text-[var(--color-text-tertiary)] line-through">
                            {"\u20B9"}{Number(comparePrice).toLocaleString()}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-center text-xs text-[var(--color-text-secondary)]">
                        {product._count.variants}
                      </td>
                      <td className="px-5 py-3 text-center">
                        {product.isActive ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-600">
                            <CheckCircle size={10} /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-[var(--color-text-tertiary)]">
                            <XCircle size={10} /> Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link
                            href={`/products/${product.id}`}
                            className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-[var(--color-bg-muted)] text-[var(--color-text-secondary)]"
                          >
                            <Edit2 size={13} />
                          </Link>
                          <button
                            onClick={() => {
                              if (confirm(`Delete "${product.name}"?`)) deleteMutation.mutate(product.id);
                            }}
                            className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-red-50 text-[var(--color-text-secondary)] hover:text-red-500"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
          </tbody>
        </table>

        {!isLoading && products.length === 0 && (
          <div className="p-12 text-center">
            <Package size={40} className="mx-auto text-[var(--color-text-tertiary)] mb-3" />
            <h3 className="text-sm font-medium text-[var(--color-text-primary)]">No products yet</h3>
            <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
              Add your first product to start selling.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}