"use client";

import { ProductCard } from "@/components/product/ProductCard";
import Link from "next/link";
import { ChevronRight, ShoppingBag, Shirt, Footprints, Sparkles, Home, Gamepad2 } from "lucide-react";

interface Section {
  id: string;
  type: string;
  title: string | null;
  subtitle: string | null;
  content: any;
  sortOrder: number;
}

interface SectionRendererProps {
  sections: Section[];
  products?: any[];
  stores?: any[];
  categories?: any[];
}

function HeroBanner({ section }: { section: Section }) {
  const content = section.content as {
    heading?: string;
    subheading?: string;
    buttonText?: string;
    buttonLink?: string;
    imageUrl?: string;
    gradient?: string;
  };

  return (
    <div
      className="relative overflow-hidden rounded-2xl"
      style={{
        background: content.gradient ?? "linear-gradient(135deg, var(--color-accent) 0%, var(--color-primary) 100%)",
        minHeight: "360px",
      }}
    >
      <div className="relative z-10 flex h-full min-h-[360px] flex-col justify-center px-8 py-12 md:px-16 md:max-w-[60%]">
        <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight">
          {content.heading ?? section.title ?? "Welcome to AuraZone"}
        </h2>
        {content.subheading && (
          <p className="mt-3 text-base text-white/80 max-w-md">
            {content.subheading}
          </p>
        )}
        {content.buttonText && (
          <Link
            href={content.buttonLink ?? "/products"}
            className="mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-[var(--color-primary)] hover:bg-white/90 transition-colors"
          >
            {content.buttonText}
            <ChevronRight size={16} />
          </Link>
        )}
      </div>
      {content.imageUrl && (
        <img
          src={content.imageUrl}
          alt=""
          className="absolute right-0 top-0 h-full w-1/2 object-cover object-center opacity-30 md:opacity-60"
        />
      )}
    </div>
  );
}

function ProductCarousel({ section, products }: { section: Section; products: any[] }) {
  const content = section.content as { productIds?: string[]; storeId?: string; categoryId?: string; limit?: number };
  let filtered = products;

  if (content.storeId) filtered = products.filter((p) => p.store?.id === content.storeId);
  if (content.categoryId) filtered = products.filter((p) => p.category?.id === content.categoryId);
  filtered = filtered.slice(0, content.limit ?? 8);

  return (
    <div>
      {(section.title || section.subtitle) && (
        <div className="mb-5">
          {section.title && (
            <h2 className="text-xl font-bold text-[var(--color-text-primary)]">{section.title}</h2>
          )}
          {section.subtitle && (
            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{section.subtitle}</p>
          )}
        </div>
      )}
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
        {filtered.map((product) => (
          <div key={product.id ?? product.slug} className="w-44 shrink-0 snap-start md:w-52">
            <ProductCard product={product} />
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-sm text-[var(--color-text-tertiary)] py-8">No products to show.</p>
        )}
      </div>
    </div>
  );
}

const STORE_ICONS: Record<string, React.ElementType> = {
  fashion: Shirt,
  shoes: Footprints,
  cosmetics: Sparkles,
  home: Home,
  toys: Gamepad2,
};

function StoreGrid({ section, stores }: { section: Section; stores: any[] }) {
  return (
    <div>
      {section.title && (
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-[var(--color-text-primary)] tracking-tight">{section.title}</h2>
            {section.subtitle && <p className="mt-1.5 text-sm text-[var(--color-text-secondary)]">{section.subtitle}</p>}
          </div>
          <Link href="/products" className="hidden md:flex items-center gap-1 text-sm font-medium text-[var(--color-primary)] hover:text-[var(--color-accent)] transition-colors">
            View all <ChevronRight size={16} />
          </Link>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-5">
        {stores.map((store) => {
          const Icon = STORE_ICONS[store.slug] ?? ShoppingBag;
          return (
            <Link
              key={store.id}
              href={`/store/${store.slug}`}
              className="group flex flex-col justify-between rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-6 transition-all duration-300 hover:border-[var(--color-text-primary)] hover:shadow-[var(--shadow-md)]"
              style={{ minHeight: "180px" }}
            >
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-bg-muted)] text-[var(--color-text-primary)] transition-transform duration-500 group-hover:scale-110 group-hover:bg-[var(--color-text-primary)] group-hover:text-[var(--color-bg-surface)]">
                <Icon size={24} strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-lg font-bold text-[var(--color-text-primary)] leading-tight">{store.name}</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)] transition-colors">
                    {store._count?.products ?? 0} Products
                  </span>
                  <ChevronRight size={18} className="text-[var(--color-text-tertiary)] opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-[var(--color-text-primary)]" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function CategoryGrid({ section, categories }: { section: Section; categories: any[] }) {
  return (
    <div>
      {section.title && (
        <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-5">{section.title}</h2>
      )}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/products?categoryId=${cat.id}`}
            className="group rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-surface)] p-4 hover:shadow-md transition-all"
          >
            <div className="h-24 rounded-lg bg-[var(--color-bg-muted)] mb-3 overflow-hidden">
              {cat.imageUrl ? (
                <img src={cat.imageUrl} alt={cat.name} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
              ) : (
                <div className="flex h-full items-center justify-center text-2xl">🏷️</div>
              )}
            </div>
            <p className="text-sm font-medium text-[var(--color-text-primary)]">{cat.name}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

function PromoBanner({ section }: { section: Section }) {
  const content = section.content as {
    heading?: string; subheading?: string; bgColor?: string; link?: string; imageUrl?: string;
  };

  return (
    <Link
      href={content.link ?? "/products"}
      className="block overflow-hidden rounded-xl transition-all hover:shadow-lg"
      style={{ backgroundColor: content.bgColor ?? "var(--color-accent-warm-light)" }}
    >
      <div className="flex items-center justify-between px-8 py-8">
        <div>
          <h3 className="text-lg font-bold text-[var(--color-text-primary)]">
            {content.heading ?? section.title ?? "Special Offer"}
          </h3>
          {content.subheading && (
            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{content.subheading}</p>
          )}
        </div>
        <ChevronRight size={20} className="text-[var(--color-text-tertiary)]" />
      </div>
    </Link>
  );
}

function TextBlock({ section }: { section: Section }) {
  const content = section.content as { body?: string };
  return (
    <div className="rounded-xl bg-[var(--color-bg-surface)] border border-[var(--color-border)] p-6">
      {section.title && <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-2">{section.title}</h2>}
      {content.body && <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{content.body}</p>}
    </div>
  );
}

export function SectionRenderer({ sections, products = [], stores = [], categories = [] }: SectionRendererProps) {
  const sorted = [...sections].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="space-y-8 md:space-y-12">
      {sorted.map((section) => {
        switch (section.type) {
          case "HERO_BANNER": return <HeroBanner key={section.id} section={section} />;
          case "PRODUCT_CAROUSEL": return <ProductCarousel key={section.id} section={section} products={products} />;
          case "STORE_GRID": return <StoreGrid key={section.id} section={section} stores={stores} />;
          case "CATEGORY_GRID": return <CategoryGrid key={section.id} section={section} categories={categories} />;
          case "PROMO_BANNER": return <PromoBanner key={section.id} section={section} />;
          case "TEXT_BLOCK": return <TextBlock key={section.id} section={section} />;
          default: return null;
        }
      })}
    </div>
  );
}