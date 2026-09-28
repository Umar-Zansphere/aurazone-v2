"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { ProductCard } from "@/components/product/ProductCard";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default function StoreCategoryPage() {
  const params = useParams();
  const storeSlug = params.storeSlug as string;
  const categorySlug = params.categorySlug as string;

  const { data: storeData } = useQuery({
    queryKey: ["store", storeSlug],
    queryFn: () => api.get<any>(`/stores/${storeSlug}`),
  });

  const { data: categoryData } = useQuery({
    queryKey: ["category", categorySlug],
    queryFn: () => api.get<any>(`/categories/${categorySlug}`),
  });

  const store = storeData?.data;
  const category = categoryData?.data;

  const { data: productsData, isLoading } = useQuery({
    queryKey: ["products", "category", category?.id],
    queryFn: () => api.get<{ products: any[] }>(`/products?categoryId=${category.id}&take=50`),
    enabled: !!category?.id,
  });

  const products = (productsData?.data as any)?.products ?? [];

  return (
    <div className="section-container py-6">
      <nav className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)] mb-6">
        <Link href="/" className="hover:text-[var(--color-text-primary)]">Home</Link>
        <ChevronRight size={12} />
        <Link href={`/store/${storeSlug}`} className="hover:text-[var(--color-text-primary)]">{store?.name ?? storeSlug}</Link>
        <ChevronRight size={12} />
        <span className="text-[var(--color-text-primary)]">{category?.name ?? categorySlug}</span>
      </nav>

      <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-6">
        {category?.name ?? "Category"}
      </h1>

      {isLoading ? (
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
        <div className="py-12 text-center text-sm text-[var(--color-text-secondary)]">
          No products in this category yet.
        </div>
      )}
    </div>
  );
}