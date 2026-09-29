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
  const products = Array.isArray(productsData?.data) ? productsData.data : [];
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
            <div className="pt-4 pb-6">
              <div className="mb-8">
                <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[var(--color-text-primary)] font-[var(--font-heading)]">
                  Explore Our Stores
                </h2>
                <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                  Discover specialized collections curated just for you.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {stores.map((store: any) => (
                  <a
                    key={store.id}
                    href={`/store/${store.slug}`}
                    className="group relative flex flex-col overflow-hidden rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border)] hover:border-[var(--color-accent)]/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                  >
                    {/* Banner or Gradient Top */}
                    <div 
                      className="h-24 w-full relative overflow-hidden transition-transform duration-700 group-hover:scale-105"
                      style={
                        store.bannerUrl 
                          ? { backgroundImage: `url(${store.bannerUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                          : { background: `linear-gradient(120deg, ${store.accentColor ?? 'var(--color-primary)'}40 0%, ${store.accentColor ?? 'var(--color-primary)'}10 100%)` }
                      }
                    >
                      {store.bannerUrl && <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-500" />}
                    </div>

                    {/* Content */}
                    <div className="flex flex-col flex-1 px-6 pb-6 relative pt-4">
                      {/* Logo (Overlapping the banner) */}
                      <div className="absolute -top-10 left-5 rounded-2xl p-1 bg-[var(--color-bg-surface)] shadow-sm">
                        <div 
                          className="h-14 w-14 overflow-hidden rounded-xl flex items-center justify-center border border-[var(--color-border)]"
                        >
                          {store.logoUrl ? (
                            <img src={store.logoUrl} alt={store.name} className="h-full w-full object-cover" />
                          ) : (
                            <span className="text-lg font-bold text-white w-full h-full flex items-center justify-center" style={{ backgroundColor: store.accentColor ?? "var(--color-accent)" }}>
                              {store.name?.[0] ?? "S"}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="mt-5 flex-1">
                        <h3 className="text-lg font-bold text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)] transition-colors">
                          {store.name}
                        </h3>
                        {store.description ? (
                          <p className="mt-1.5 text-xs text-[var(--color-text-secondary)] line-clamp-2 leading-relaxed">
                            {store.description}
                          </p>
                        ) : (
                          <p className="mt-1.5 text-xs text-[var(--color-text-tertiary)] italic">
                            Explore our specialized collection of premium items.
                          </p>
                        )}
                      </div>
                      
                      <div className="mt-5 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)] transition-colors">
                        Explore Store 
                        <span className="transform translate-x-0 group-hover:translate-x-1.5 transition-transform duration-300">
                          &rarr;
                        </span>
                      </div>
                    </div>
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