import Link from "next/link";
import { Heart } from "lucide-react";

interface ProductCardProps {
  product: {
    name: string;
    slug: string;
    store?: { name: string; slug: string };
    variants?: Array<{
      price: number;
      compareAtPrice?: number | null;
      images?: Array<{ url: string }>;
    }>;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const variant = product.variants?.[0];
  const price = Number(variant?.price ?? 0);
  const comparePrice = variant?.compareAtPrice ? Number(variant.compareAtPrice) : null;
  const imageUrl = variant?.images?.[0]?.url;
  const discount = comparePrice ? Math.round(((comparePrice - price) / comparePrice) * 100) : 0;

  return (
    <Link href={`/product/${product.slug}`} className="product-card group">
      {/* Image */}
      <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-[var(--color-bg-muted)]">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="text-3xl text-[var(--color-text-tertiary)]">📦</span>
          </div>
        )}

        {/* Discount badge */}
        {discount > 0 && (
          <span className="absolute left-2 top-2 rounded-full bg-[var(--color-accent-warm)] px-2 py-0.5 text-[10px] font-bold text-white">
            -{discount}%
          </span>
        )}

        {/* Wishlist button */}
        <button
          onClick={(e) => { e.preventDefault(); }}
          className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 backdrop-blur-sm text-[var(--color-text-secondary)] opacity-0 group-hover:opacity-100 transition-all hover:text-red-500 hover:bg-white"
        >
          <Heart size={14} />
        </button>
      </div>

      {/* Info */}
      <div className="mt-3 space-y-1">
        {product.store && (
          <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--color-accent)]">
            {product.store.name}
          </p>
        )}
        <h3 className="text-sm font-medium text-[var(--color-text-primary)] line-clamp-2 leading-snug">
          {product.name}
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-[var(--color-text-primary)]">
            {"\u20B9"}{price.toLocaleString()}
          </span>
          {comparePrice && (
            <span className="text-xs text-[var(--color-text-tertiary)] line-through">
              {"\u20B9"}{comparePrice.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}