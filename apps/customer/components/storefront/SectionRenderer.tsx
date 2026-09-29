"use client";

import { ProductCard } from "@/components/product/ProductCard";
import Link from "next/link";
import { ChevronRight, ShoppingBag, Shirt, Footprints, Sparkles, Home, Gamepad2 } from "lucide-react";
import { useState, useEffect } from "react";

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
    // Accept both admin template keys and legacy keys
    buttonText?: string; ctaText?: string;
    buttonLink?: string; ctaLink?: string;
    imageUrl?: string;
    gradient?: string;
    bgColor?: string;
    textColor?: string;
    overlayOpacity?: number;
  };

  const buttonText = content.ctaText ?? content.buttonText;
  const buttonLink = content.ctaLink ?? content.buttonLink ?? "/products";

  return (
    <div
      className="relative overflow-hidden rounded-2xl"
      style={{
        background: content.bgColor ?? content.gradient ?? "linear-gradient(135deg, var(--color-accent) 0%, var(--color-primary) 100%)",
        minHeight: "360px",
      }}
    >
      {content.imageUrl && (
        <img
          src={content.imageUrl}
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
      )}
      {content.imageUrl && (
        <div
          className="absolute inset-0"
          style={{ backgroundColor: `rgba(0,0,0,${content.overlayOpacity ?? 0.4})` }}
        />
      )}
      <div className="relative z-10 flex h-full min-h-[360px] flex-col justify-center px-8 py-12 md:px-16 md:max-w-[60%]">
        <h2
          className="text-3xl md:text-4xl font-bold leading-tight"
          style={{ color: content.textColor ?? "#ffffff" }}
        >
          {content.heading ?? section.title ?? "Welcome to AuraZone"}
        </h2>
        {content.subheading && (
          <p className="mt-3 text-base max-w-md" style={{ color: content.textColor ? `${content.textColor}cc` : "rgba(255,255,255,0.8)" }}>
            {content.subheading}
          </p>
        )}
        {buttonText && (
          <Link
            href={buttonLink}
            className="mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-[var(--color-primary)] hover:bg-white/90 transition-colors"
          >
            {buttonText}
            <ChevronRight size={16} />
          </Link>
        )}
      </div>
    </div>
  );
}

function ProductCarousel({ section, products }: { section: Section; products: any[] }) {
  const content = section.content as {
    productIds?: string[];
    storeId?: string;
    categoryId?: string;
    limit?: number;
    maxItems?: number;
    heading?: string;
    showPrice?: boolean;
    autoScroll?: boolean;
  };
  let filtered = products;

  if (content.storeId) filtered = products.filter((p) => p.store?.id === content.storeId);
  if (content.categoryId) filtered = products.filter((p) => p.category?.id === content.categoryId);
  filtered = filtered.slice(0, content.maxItems ?? content.limit ?? 8);

  return (
    <div>
      {(section.title || section.subtitle || content.heading) && (
        <div className="mb-5">
          <h2 className="text-xl font-bold text-[var(--color-text-primary)]">
            {content.heading ?? section.title}
          </h2>
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
    <div className="py-2">
      {/* Desktop View (Hidden on mobile/tablet) */}
      <div className="hidden lg:block">
        {section.title && (
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[var(--color-text-primary)] font-[var(--font-heading)]">
                {section.title}
              </h2>
              {section.subtitle && (
                <p className="mt-2 text-sm text-[var(--color-text-secondary)]">{section.subtitle}</p>
              )}
            </div>
            <Link href="/products" className="hidden md:flex items-center gap-1 text-sm font-medium text-[var(--color-primary)] hover:text-[var(--color-accent)] transition-colors">
              View all <ChevronRight size={16} />
            </Link>
          </div>
        )}
        <div className="grid grid-cols-3 xl:grid-cols-4 gap-6">
          {stores.map((store) => {
            const Icon = STORE_ICONS[store.slug] ?? ShoppingBag;
            
            return (
              <Link
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
                  {/* Logo */}
                  <div className="absolute -top-10 left-5 rounded-2xl p-1 bg-[var(--color-bg-surface)] shadow-sm">
                    <div className="h-14 w-14 overflow-hidden rounded-xl flex items-center justify-center border border-[var(--color-border)]">
                      {store.logoUrl ? (
                        <img src={store.logoUrl} alt={store.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-[var(--color-bg-base)] to-[var(--color-bg-muted)]">
                          <div className="absolute inset-0 opacity-[0.15]" style={{ backgroundColor: store.accentColor ?? "var(--color-accent)" }} />
                          <Icon size={24} strokeWidth={1.5} className="relative z-10 drop-shadow-sm transition-transform duration-300 group-hover:scale-110" style={{ color: store.accentColor ?? "var(--color-accent)" }} />
                        </div>
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
                  
                  <div className="mt-5 flex items-center justify-between">
                    <span className="text-xs font-semibold text-[var(--color-text-secondary)]">
                      {store._count?.products ?? 0} Products
                    </span>
                    <span className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)] transition-colors">
                      Explore 
                      <ChevronRight size={14} className="transform translate-x-0 group-hover:translate-x-1 transition-transform duration-300" />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Mobile/Tablet View (Instagram Stories Style) */}
      <div className="lg:hidden">
        {section.title && (
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-[var(--color-text-primary)] tracking-tight">{section.title}</h2>
            <Link href="/products" className="text-xs font-semibold text-[var(--color-primary)] hover:underline">
              View all
            </Link>
          </div>
        )}
        
        <div className="flex overflow-x-auto gap-4 pb-4 snap-x scrollbar-hide">
          {stores.map((store) => {
            const Icon = STORE_ICONS[store.slug] ?? ShoppingBag;
            return (
              <Link key={store.id} href={`/store/${store.slug}`} className="flex flex-col items-center gap-2 min-w-[72px] snap-start group">
                {/* Story Ring */}
                <div className="h-16 w-16 rounded-full p-[2px] bg-gradient-to-tr from-[var(--color-primary)] to-[var(--color-accent)] group-hover:scale-105 transition-transform duration-300">
                  <div className="h-full w-full rounded-full border-2 border-[var(--color-bg-base)] overflow-hidden bg-[var(--color-bg-surface)] flex items-center justify-center">
                    {store.logoUrl ? (
                      <img src={store.logoUrl} alt={store.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-[var(--color-bg-base)] to-[var(--color-bg-muted)]">
                        <div className="absolute inset-0 opacity-[0.15]" style={{ backgroundColor: store.accentColor ?? "var(--color-accent)" }} />
                        <Icon size={20} strokeWidth={1.5} className="relative z-10 drop-shadow-sm" style={{ color: store.accentColor ?? "var(--color-accent)" }} />
                      </div>
                    )}
                  </div>
                </div>
                {/* Store Name */}
                <span className="text-[10px] font-medium text-[var(--color-text-primary)] text-center leading-tight line-clamp-1 w-16 group-hover:text-[var(--color-accent)] transition-colors">
                  {store.name}
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  );
}

function CategoryGrid({ section, categories }: { section: Section; categories: any[] }) {
  const content = section.content as {
    heading?: string;
    columns?: number;
    storeId?: string;
    showDescription?: boolean;
    bgColor?: string;
  };

  let filtered = categories;
  if (content.storeId) filtered = categories.filter((c) => c.store?.id === content.storeId);

  const getGridColsClass = (cols: number) => {
    switch (cols) {
      case 2: return "grid-cols-2";
      case 3: return "grid-cols-2 sm:grid-cols-3";
      case 5: return "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5";
      case 6: return "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6";
      case 4:
      default: return "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4";
    }
  };

  return (
    <div style={content.bgColor ? { backgroundColor: content.bgColor, borderRadius: "12px", padding: "24px" } : undefined}>
      {(section.title || content.heading) && (
        <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-5">{content.heading ?? section.title}</h2>
      )}
      <div className={`grid gap-4 ${getGridColsClass(content.columns ?? 4)}`}>
        {filtered.map((cat) => (
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
            {content.showDescription && cat.description && (
              <p className="text-xs text-[var(--color-text-secondary)] mt-1 line-clamp-2">{cat.description}</p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}

function PromoBanner({ section }: { section: Section }) {
  const content = section.content as {
    heading?: string; subheading?: string; bgColor?: string;
    link?: string; ctaLink?: string; ctaText?: string;
    imageUrl?: string; variant?: string;
  };

  const link = content.ctaLink ?? content.link ?? "/products";
  const buttonText = content.ctaText;

  return (
    <Link
      href={link}
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
          {buttonText && (
            <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-[var(--color-primary)]">
              {buttonText} <ChevronRight size={14} />
            </span>
          )}
        </div>
        {content.imageUrl && (
          <img src={content.imageUrl} alt="" className="h-24 w-24 object-contain" />
        )}
        {!content.imageUrl && <ChevronRight size={20} className="text-[var(--color-text-tertiary)]" />}
      </div>
    </Link>
  );
}

function TextBlock({ section }: { section: Section }) {
  const content = section.content as {
    body?: string;
    heading?: string;
    alignment?: string;
    bgColor?: string;
    maxWidth?: number;
  };
  return (
    <div
      className="rounded-xl bg-[var(--color-bg-surface)] border border-[var(--color-border)] p-6"
      style={{
        textAlign: (content.alignment as any) ?? "left",
        maxWidth: content.maxWidth ? `${content.maxWidth}px` : undefined,
        margin: content.alignment === "center" ? "0 auto" : undefined,
        backgroundColor: content.bgColor ?? undefined,
      }}
    >
      {(section.title || content.heading) && (
        <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-2">{content.heading ?? section.title}</h2>
      )}
      {content.body && <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{content.body}</p>}
    </div>
  );
}

// ─── NEW: Image Gallery ────────────────────────────────────────────────────────
function ImageGallery({ section }: { section: Section }) {
  const content = section.content as {
    heading?: string;
    columns?: number;
    images?: Array<{ url: string; alt?: string; link?: string }> | string;
    gap?: number;
  };

  let images: Array<{ url: string; alt?: string; link?: string }> = [];
  if (typeof content.images === "string") {
    try { images = JSON.parse(content.images); } catch { images = []; }
  } else if (Array.isArray(content.images)) {
    images = content.images;
  }

  const getGridColsClass = (cols: number) => {
    switch (cols) {
      case 2: return "grid-cols-2";
      case 3: return "grid-cols-2 sm:grid-cols-3";
      case 5: return "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5";
      case 6: return "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6";
      case 4:
      default: return "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4";
    }
  };

  return (
    <div>
      {(section.title || content.heading) && (
        <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-5">{content.heading ?? section.title}</h2>
      )}
      <div
        className={`grid ${getGridColsClass(content.columns ?? 3)}`}
        style={{ gap: `${content.gap ?? 8}px` }}
      >
        {images.map((img, i) => {
          const inner = (
            <div key={i} className="overflow-hidden rounded-lg aspect-square">
              <img src={img.url} alt={img.alt ?? ""} className="h-full w-full object-cover hover:scale-105 transition-transform duration-300" />
            </div>
          );
          return img.link ? <Link key={i} href={img.link}>{inner}</Link> : <div key={i}>{inner}</div>;
        })}
      </div>
    </div>
  );
}

// ─── NEW: Countdown Timer ──────────────────────────────────────────────────────
function CountdownTimer({ section }: { section: Section }) {
  const content = section.content as {
    heading?: string;
    subheading?: string;
    targetDate?: string;
    ctaText?: string;
    ctaLink?: string;
    bgColor?: string;
  };

  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    if (!content.targetDate) return;
    const target = new Date(content.targetDate).getTime();

    const tick = () => {
      const now = Date.now();
      const diff = target - now;
      if (diff <= 0) {
        setExpired(true);
        return;
      }
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [content.targetDate]);

  if (!content.targetDate) return null;

  return (
    <div
      className="rounded-2xl p-8 text-center"
      style={{ backgroundColor: content.bgColor ?? "var(--color-primary)", color: "#fff" }}
    >
      {(section.title || content.heading) && (
        <h2 className="text-2xl font-bold mb-2">{content.heading ?? section.title}</h2>
      )}
      {content.subheading && <p className="text-sm opacity-80 mb-6">{content.subheading}</p>}
      {expired ? (
        <p className="text-lg font-semibold">This offer has ended.</p>
      ) : (
        <div className="flex justify-center gap-4">
          {(["days", "hours", "minutes", "seconds"] as const).map((unit) => (
            <div key={unit} className="flex flex-col items-center">
              <span className="text-3xl md:text-4xl font-bold tabular-nums bg-white/20 rounded-lg px-4 py-2 min-w-[70px]">
                {String(timeLeft[unit]).padStart(2, "0")}
              </span>
              <span className="text-xs uppercase tracking-wider mt-2 opacity-70">{unit}</span>
            </div>
          ))}
        </div>
      )}
      {content.ctaText && content.ctaLink && !expired && (
        <Link
          href={content.ctaLink}
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-[var(--color-primary)] hover:bg-white/90 transition-colors"
        >
          {content.ctaText} <ChevronRight size={16} />
        </Link>
      )}
    </div>
  );
}

// ─── NEW: Custom HTML ──────────────────────────────────────────────────────────
function CustomHtml({ section }: { section: Section }) {
  const content = section.content as {
    html?: string;
    css?: string;
    containerClass?: string;
  };

  return (
    <div className={content.containerClass ?? ""}>
      {content.css && <style dangerouslySetInnerHTML={{ __html: content.css }} />}
      {content.html && <div dangerouslySetInnerHTML={{ __html: content.html }} />}
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
          case "IMAGE_GALLERY": return <ImageGallery key={section.id} section={section} />;
          case "COUNTDOWN_TIMER": return <CountdownTimer key={section.id} section={section} />;
          case "CUSTOM_HTML": return <CustomHtml key={section.id} section={section} />;
          default: return null;
        }
      })}
    </div>
  );
}