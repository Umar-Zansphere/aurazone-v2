"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { Heart, ShoppingCart, Minus, Plus, ChevronRight, Check, Truck, RotateCcw, Shield } from "lucide-react";
import Link from "next/link";

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const queryClient = useQueryClient();

  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["product", slug],
    queryFn: () => api.get<any>(`/products/${slug}`),
  });

  const addToCartMutation = useMutation({
    mutationFn: (body: { variantId: string; quantity: number }) =>
      api.post("/cart", body),
    onSuccess: () => {
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });

  const product = data?.data;
  if (isLoading) {
    return (
      <div className="section-container py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="aspect-square shimmer rounded-2xl" />
          <div className="space-y-4">
            <div className="h-4 w-32 shimmer rounded" />
            <div className="h-8 w-3/4 shimmer rounded" />
            <div className="h-6 w-24 shimmer rounded" />
            <div className="h-12 w-full shimmer rounded-xl mt-6" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) return (
    <div className="section-container py-16 text-center">
      <p className="text-lg font-semibold text-[var(--color-text-primary)]">Product not found</p>
    </div>
  );

  const variant = product.variants?.[selectedVariantIdx];
  const images = variant?.images ?? [];
  const price = Number(variant?.price ?? 0);
  const comparePrice = variant?.compareAtPrice ? Number(variant.compareAtPrice) : null;
  const discount = comparePrice ? Math.round(((comparePrice - price) / comparePrice) * 100) : 0;
  const stock = variant?.inventory?.quantity ?? 0;
  const attributes = variant?.attributes ?? [];

  return (
    <div className="section-container py-6 md:py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)] mb-6">
        <Link href="/" className="hover:text-[var(--color-text-primary)]">Home</Link>
        <ChevronRight size={12} />
        {product.store && (
          <>
            <Link href={`/store/${product.store.slug}`} className="hover:text-[var(--color-text-primary)]">{product.store.name}</Link>
            <ChevronRight size={12} />
          </>
        )}
        <span className="text-[var(--color-text-primary)] truncate">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
        {/* Images */}
        <div className="space-y-3">
          <div className="relative aspect-square overflow-hidden rounded-2xl bg-[var(--color-bg-muted)]">
            {images.length > 0 ? (
              <img src={images[selectedImage]?.url} alt={product.name}
                className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-5xl">📦</div>
            )}
            {discount > 0 && (
              <span className="absolute left-3 top-3 rounded-full bg-[var(--color-accent-warm)] px-3 py-1 text-xs font-bold text-white">
                -{discount}%
              </span>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {images.map((img: any, idx: number) => (
                <button key={img.id ?? idx} onClick={() => setSelectedImage(idx)}
                  className={`h-16 w-16 shrink-0 rounded-lg overflow-hidden border-2 transition-colors ${
                    selectedImage === idx ? "border-[var(--color-accent)]" : "border-transparent"
                  }`}>
                  <img src={img.url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-5">
          {product.store && (
            <Link href={`/store/${product.store.slug}`}
              className="inline-flex text-xs font-medium uppercase tracking-wider text-[var(--color-accent)] hover:underline">
              {product.store.name}
            </Link>
          )}

          <h1 className="text-2xl md:text-3xl font-bold text-[var(--color-text-primary)] leading-tight">
            {product.name}
          </h1>

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="text-2xl font-bold text-[var(--color-text-primary)]">
              {"\u20B9"}{price.toLocaleString()}
            </span>
            {comparePrice && (
              <>
                <span className="text-lg text-[var(--color-text-tertiary)] line-through">
                  {"\u20B9"}{comparePrice.toLocaleString()}
                </span>
                <span className="text-sm font-semibold text-[var(--color-accent-warm)]">
                  {discount}% off
                </span>
              </>
            )}
          </div>

          {/* Variant selector */}
          {product.variants.length > 1 && (
            <div>
              <p className="text-xs font-semibold text-[var(--color-text-tertiary)] uppercase mb-2">Variant</p>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v: any, idx: number) => {
                  const label = v.attributes?.map((a: any) => a.value).join(" / ") ?? `Option ${idx + 1}`;
                  return (
                    <button key={v.id} onClick={() => { setSelectedVariantIdx(idx); setSelectedImage(0); }}
                      className={`rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                        selectedVariantIdx === idx
                          ? "border-[var(--color-accent)] bg-[var(--color-accent-light)] text-[var(--color-accent)]"
                          : "border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-border-strong)]"
                      }`}>
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Attributes */}
          {attributes.length > 0 && (
            <div className="flex flex-wrap gap-x-6 gap-y-1">
              {attributes.map((attr: any) => (
                <div key={attr.id ?? attr.key} className="text-sm">
                  <span className="text-[var(--color-text-tertiary)]">{attr.key}: </span>
                  <span className="font-medium text-[var(--color-text-primary)]">{attr.value}</span>
                </div>
              ))}
            </div>
          )}

          {/* Stock */}
          <div className="text-sm">
            {stock > 0 ? (
              <span className="text-emerald-600 font-medium">✓ In Stock ({stock} available)</span>
            ) : (
              <span className="text-red-500 font-medium">✕ Out of Stock</span>
            )}
          </div>

          {/* Quantity + Add to Cart */}
          <div className="flex items-center gap-3 pt-2">
            <div className="flex items-center rounded-xl border border-[var(--color-border)] overflow-hidden">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="flex h-11 w-11 items-center justify-center text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-muted)] transition-colors">
                <Minus size={16} />
              </button>
              <span className="flex h-11 w-12 items-center justify-center text-sm font-semibold text-[var(--color-text-primary)] border-x border-[var(--color-border)]">
                {quantity}
              </span>
              <button onClick={() => setQuantity(Math.min(stock, quantity + 1))}
                className="flex h-11 w-11 items-center justify-center text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-muted)] transition-colors">
                <Plus size={16} />
              </button>
            </div>

            <button
              onClick={() => variant && addToCartMutation.mutate({ variantId: variant.id, quantity })}
              disabled={stock === 0 || addToCartMutation.isPending}
              className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all ${
                addedToCart
                  ? "bg-emerald-500 text-white"
                  : "bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)]"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {addedToCart ? (
                <><Check size={16} /> Added to Cart</>
              ) : (
                <><ShoppingCart size={16} /> Add to Cart</>
              )}
            </button>

            <button className="flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-red-500 hover:border-red-300 transition-colors">
              <Heart size={18} />
            </button>
          </div>

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-[var(--color-border)]">
            {[
              { icon: Truck, label: "Free Delivery", sub: "On orders above ₹499" },
              { icon: RotateCcw, label: "Easy Returns", sub: "7-day return policy" },
              { icon: Shield, label: "Secure Payment", sub: "100% protected" },
            ].map(({ icon: Icon, label, sub }) => (
              <div key={label} className="text-center">
                <Icon size={18} className="mx-auto text-[var(--color-accent)] mb-1" />
                <p className="text-xs font-medium text-[var(--color-text-primary)]">{label}</p>
                <p className="text-[10px] text-[var(--color-text-tertiary)]">{sub}</p>
              </div>
            ))}
          </div>

          {/* Description */}
          {product.description && (
            <div className="pt-4 border-t border-[var(--color-border)]">
              <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-2">Description</h3>
              <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}