"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { ArrowLeft, Plus, Trash2, Package, Check, X } from "lucide-react";
import Link from "next/link";

interface Store { id: string; name: string; slug: string; }
interface Category { id: string; name: string; slug: string; storeId: string; }

interface VariantForm {
  sku: string;
  price: string;
  compareAtPrice: string;
  attributes: Array<{ key: string; value: string }>;
}

export default function NewProductPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [storeId, setStoreId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [variants, setVariants] = useState<VariantForm[]>([
    { sku: "", price: "", compareAtPrice: "", attributes: [] },
  ]);

  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  const { data: storesData } = useQuery({
    queryKey: ["admin", "stores"],
    queryFn: () => api.get<Store[]>("/admin/stores"),
  });

  const { data: catsData } = useQuery({
    queryKey: ["admin", "categories", storeId],
    queryFn: () => api.get<Category[]>(`/admin/categories?storeId=${storeId}`),
    enabled: !!storeId,
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post("/admin/products", data),
    onSuccess: () => router.push("/products"),
  });

  const stores = storesData?.data ?? [];
  const categories = (catsData?.data ?? []).filter((c) => c.storeId === storeId);

  const slugify = (text: string) =>
    text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const addVariant = () => {
    setVariants((v) => [...v, { sku: "", price: "", compareAtPrice: "", attributes: [] }]);
  };

  const removeVariant = (idx: number) => {
    setVariants((v) => v.filter((_, i) => i !== idx));
  };

  const updateVariant = (idx: number, field: keyof VariantForm, value: string) => {
    setVariants((v) =>
      v.map((variant, i) => (i === idx ? { ...variant, [field]: value } : variant))
    );
  };

  const addAttribute = (variantIdx: number) => {
    setVariants((v) =>
      v.map((variant, i) =>
        i === variantIdx
          ? { ...variant, attributes: [...variant.attributes, { key: "", value: "" }] }
          : variant
      )
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      storeId,
      categoryId,
      name,
      slug: slug || slugify(name),
      description: description || undefined,
      variants: variants.map((v) => ({
        sku: v.sku || undefined,
        price: Number(v.price),
        compareAtPrice: v.compareAtPrice ? Number(v.compareAtPrice) : undefined,
        attributes: v.attributes.filter((a) => a.key && a.value),
      })),
    });
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
        <Link href="/products" className="hover:text-[var(--color-text-primary)] flex items-center gap-1">
          <ArrowLeft size={14} /> Products
        </Link>
      </div>

      <div>
        <p className="page-label">Catalog</p>
        <h1 className="page-title">New Product</h1>
      </div>

      {createMutation.isError && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
          {(createMutation.error as Error).message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="card p-5 space-y-4">
          <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">Basic Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Store</label>
              <select className="form-input" required value={storeId}
                onChange={(e) => { setStoreId(e.target.value); setCategoryId(""); }}>
                <option value="">Select store...</option>
                {stores.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="form-label !mb-0">Category</label>
                {storeId && !isCreatingCategory && (
                  <button
                    type="button"
                    onClick={() => setIsCreatingCategory(true)}
                    className="text-[10px] text-[var(--color-accent)] hover:underline font-medium"
                  >
                    + Quick Create
                  </button>
                )}
              </div>

              {isCreatingCategory ? (
                <div className="flex items-center gap-2 mb-1">
                  <input
                    type="text"
                    autoFocus
                    className="form-input py-2 text-sm flex-1"
                    placeholder="Category name"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        if (newCategoryName) {
                          api.post("/admin/categories", {
                            storeId,
                            name: newCategoryName,
                            slug: slugify(newCategoryName),
                            isActive: true,
                          }).then((res: any) => {
                            const evt = new Event("focus");
                            window.dispatchEvent(evt); 
                            setCategoryId(res.data.id);
                            setIsCreatingCategory(false);
                            setNewCategoryName("");
                          }).catch(err => alert(err.message));
                        }
                      } else if (e.key === "Escape") {
                        setIsCreatingCategory(false);
                        setNewCategoryName("");
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newCategoryName) {
                        api.post("/admin/categories", {
                          storeId,
                          name: newCategoryName,
                          slug: slugify(newCategoryName),
                          isActive: true,
                        }).then((res: any) => {
                          const evt = new Event("focus");
                          window.dispatchEvent(evt); 
                          setCategoryId(res.data.id);
                          setIsCreatingCategory(false);
                          setNewCategoryName("");
                        }).catch(err => alert(err.message));
                      }
                    }}
                    className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-accent)] text-white hover:bg-black transition-colors"
                  >
                    <Check size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreatingCategory(false);
                      setNewCategoryName("");
                    }}
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--color-border)] text-gray-500 hover:bg-gray-50 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <select className="form-input" required value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)} disabled={!storeId}>
                  <option value="">Select category...</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              )}
              {storeId && categories.length === 0 && !isCreatingCategory && (
                <p className="text-xs text-amber-500 mt-1">This store has no categories. Create one first.</p>
              )}
            </div>
          </div>
          <div>
            <label className="form-label">Product Name</label>
            <input type="text" className="form-input" required value={name}
              onChange={(e) => { setName(e.target.value); setSlug(slugify(e.target.value)); }} />
          </div>
          <div>
            <label className="form-label">Slug</label>
            <input type="text" className="form-input font-mono text-xs" value={slug}
              onChange={(e) => setSlug(e.target.value)} />
          </div>
          <div>
            <label className="form-label">Description</label>
            <textarea className="form-input min-h-[100px] resize-y" value={description}
              onChange={(e) => setDescription(e.target.value)} />
          </div>
        </div>

        {/* Variants */}
        <div className="card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">Variants</h2>
            <button type="button" onClick={addVariant} className="btn-secondary text-xs flex items-center gap-1">
              <Plus size={12} /> Add Variant
            </button>
          </div>

          {variants.map((variant, idx) => (
            <div key={idx} className="rounded-lg border border-[var(--color-border)] p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[var(--color-text-tertiary)]">
                  Variant {idx + 1}
                </span>
                {variants.length > 1 && (
                  <button type="button" onClick={() => removeVariant(idx)}
                    className="text-red-400 hover:text-red-600">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="form-label">SKU</label>
                  <input type="text" className="form-input text-xs font-mono" placeholder="Auto-generated"
                    value={variant.sku} onChange={(e) => updateVariant(idx, "sku", e.target.value)} />
                </div>
                <div>
                  <label className="form-label">Price ({"\u20B9"})</label>
                  <input type="number" className="form-input" required step="0.01" min="0"
                    value={variant.price} onChange={(e) => updateVariant(idx, "price", e.target.value)} />
                </div>
                <div>
                  <label className="form-label">Compare Price</label>
                  <input type="number" className="form-input" step="0.01" min="0" placeholder="Optional"
                    value={variant.compareAtPrice}
                    onChange={(e) => updateVariant(idx, "compareAtPrice", e.target.value)} />
                </div>
              </div>

              {/* Attributes */}
              {variant.attributes.length > 0 && (
                <div className="space-y-2">
                  {variant.attributes.map((attr, attrIdx) => (
                    <div key={attrIdx} className="grid grid-cols-2 gap-2">
                      <input type="text" className="form-input text-xs" placeholder="e.g. color"
                        value={attr.key}
                        onChange={(e) => {
                          const newAttrs = [...variant.attributes];
                          newAttrs[attrIdx] = { ...newAttrs[attrIdx], key: e.target.value };
                          setVariants((v) =>
                            v.map((vr, i) => (i === idx ? { ...vr, attributes: newAttrs } : vr))
                          );
                        }} />
                      <input type="text" className="form-input text-xs" placeholder="e.g. Red"
                        value={attr.value}
                        onChange={(e) => {
                          const newAttrs = [...variant.attributes];
                          newAttrs[attrIdx] = { ...newAttrs[attrIdx], value: e.target.value };
                          setVariants((v) =>
                            v.map((vr, i) => (i === idx ? { ...vr, attributes: newAttrs } : vr))
                          );
                        }} />
                    </div>
                  ))}
                </div>
              )}
              <button type="button" onClick={() => addAttribute(idx)}
                className="text-xs text-[var(--color-accent)] hover:underline">
                + Add Attribute
              </button>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-2">
          <Link href="/products" className="btn-secondary">Cancel</Link>
          <button type="submit" className="btn-primary flex items-center gap-2"
            disabled={createMutation.isPending}>
            <Package size={14} />
            {createMutation.isPending ? "Creating..." : "Create Product"}
          </button>
        </div>
      </form>
    </div>
  );
}