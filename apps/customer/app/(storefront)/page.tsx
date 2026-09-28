"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { SectionRenderer } from "@/components/storefront/SectionRenderer";

export default function HomePage() {
  const { data: sectionsData, isLoading: sectionsLoading } = useQuery({
    queryKey: ["storefront", "sections"],
    queryFn: () => api.get<any[]>("/storefront?page=home"),
  });

  const { data: productsData } = useQuery({
    queryKey: ["products", "featured"],
    queryFn: () => api.get<{ products: any[] }>("/products?take=16"),
  });

  const { data: storesData } = useQuery({
    queryKey: ["stores"],
    queryFn: () => api.get<any[]>("/stores"),
  });

  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: () => api.get<any[]>("/categories"),
  });

  const sections = sectionsData?.data ?? [];
  const products = (productsData?.data as any)?.products ?? productsData?.data ?? [];
  const stores = storesData?.data ?? [];
  const categories = categoriesData?.data ?? [];

  // If no CMS sections exist, show default layout
  const hasCustomSections = sections.length > 0;

  return (
    <div className="section-container py-6 md:py-10">
      {sectionsLoading ? (
        <div className="space-y-8">
          <div className="h-[360px] shimmer rounded-2xl" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="aspect-[3/4] shimmer rounded-xl" />
                <div className="h-3 w-3/4 shimmer rounded" />
                <div className="h-3 w-1/2 shimmer rounded" />
              </div>
            ))}
          </div>
        </div>
      ) : hasCustomSections ? (
        <SectionRenderer
          sections={sections}
          products={products}
          stores={stores}
          categories={categories}
        />
      ) : (
        <div className="space-y-10">
          {/* Default Hero */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-primary)] min-h-[360px]">
            <div className="relative z-10 flex min-h-[360px] flex-col justify-center px-8 py-12 md:px-16 md:max-w-[60%]">
              <p className="text-sm font-medium text-white/70 uppercase tracking-wider">Multi-Store Platform</p>
              <h1 className="mt-2 text-3xl md:text-5xl font-bold text-white leading-tight">
                Shop Your Style,{" "}
                <span className="text-[var(--color-accent-warm)]">Your Way</span>
              </h1>
              <p className="mt-4 text-base text-white/80 max-w-md">
                Discover unique products across multiple stores — fashion, home, cosmetics, and more.
              </p>
              <a
                href="/products"
                className="mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-[var(--color-primary)] hover:bg-white/90 transition-colors"
              >
                Shop Now
              </a>
            </div>
          </div>

          {/* Stores */}
          {stores.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-5">Our Stores</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {stores.map((store: any) => (
                  <a
                    key={store.id}
                    href={`/store/${store.slug}`}
                    className="group relative overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-5 text-center hover:shadow-lg transition-all hover:-translate-y-1"
                  >
                    <div
                      className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl text-white text-lg font-bold mb-3 transition-transform group-hover:scale-110"
                      style={{ backgroundColor: store.accentColor ?? "var(--color-accent)" }}
                    >
                      {store.name?.[0] ?? "S"}
                    </div>
                    <p className="text-sm font-semibold text-[var(--color-text-primary)]">{store.name}</p>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Featured Products */}
          {products.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-5">Featured Products</h2>
              <div className="product-grid">
                {products.slice(0, 12).map((product: any) => (
                  <div key={product.id ?? product.slug}>
                    {/* Inline card */}
                    <a href={`/product/${product.slug}`} className="product-card group">
                      <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-[var(--color-bg-muted)]">
                        {product.variants?.[0]?.images?.[0]?.url ? (
                          <img src={product.variants[0].images[0].url} alt={product.name}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        ) : (
                          <div className="flex h-full items-center justify-center text-3xl">📦</div>
                        )}
                      </div>
                      <div className="mt-3 space-y-1">
                        {product.store && (
                          <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--color-accent)]">{product.store.name}</p>
                        )}
                        <h3 className="text-sm font-medium text-[var(--color-text-primary)] line-clamp-2 leading-snug">{product.name}</h3>
                        <p className="text-sm font-bold text-[var(--color-text-primary)]">
                          {"\u20B9"}{Number(product.variants?.[0]?.price ?? 0).toLocaleString()}
                        </p>
                      </div>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}