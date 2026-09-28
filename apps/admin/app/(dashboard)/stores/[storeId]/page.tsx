"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import {
  ArrowLeft, ChevronRight, Store as StoreIcon,
  FolderTree, Settings2, Package, History, Layers,
} from "lucide-react";
import Link from "next/link";

import StoreOverview from "@/components/stores/StoreOverview";
import CategoriesTab from "@/components/stores/CategoriesTab";
import AttributesTab from "@/components/stores/AttributesTab";
import ProductsTab from "@/components/stores/ProductsTab";
import ActivityLogTab from "@/components/stores/ActivityLogTab";

interface Store {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  bannerUrl: string | null;
  accentColor: string | null;
  isActive: boolean;
  categories: any[];
  attributeTemplates: any[];
  _count: { products: number; categories: number };
}

const TABS = [
  { key: "overview", label: "Overview", icon: StoreIcon },
  { key: "categories", label: "Categories", icon: FolderTree },
  { key: "attributes", label: "Attributes", icon: Settings2 },
  { key: "products", label: "Products", icon: Package },
  { key: "activity", label: "Activity", icon: History },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default function StoreDetailPage() {
  const params = useParams();
  const storeId = params.storeId as string;
  const [activeTab, setActiveTab] = useState<TabKey>("overview");

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "store", storeId],
    queryFn: () => api.get<Store>(`/admin/stores/${storeId}`),
  });

  const store = data?.data;

  if (isLoading) {
    return (
      <div className="space-y-6 fade-in">
        <div className="h-5 w-48 shimmer rounded" />
        <div className="card p-6 h-20 shimmer" />
        <div className="card p-6 h-64 shimmer" />
      </div>
    );
  }

  if (!store) {
    return (
      <div className="card p-12 text-center">
        <StoreIcon size={40} className="mx-auto text-[var(--color-text-tertiary)] mb-3" />
        <h3 className="text-sm font-medium text-[var(--color-text-primary)]">Store not found</h3>
        <Link href="/stores" className="text-xs text-[var(--color-accent)] mt-2 inline-block hover:underline">
          ← Back to stores
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5 fade-in">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
        <Link href="/stores" className="hover:text-[var(--color-text-primary)] flex items-center gap-1 transition-colors">
          <ArrowLeft size={14} /> Stores
        </Link>
        <ChevronRight size={14} />
        <span className="text-[var(--color-text-primary)] font-medium">{store.name}</span>
      </div>

      {/* Store Header */}
      <div className="card p-5">
        <div className="flex items-center gap-4">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-xl text-white text-lg font-bold shadow-sm"
            style={{ backgroundColor: store.accentColor ?? "var(--color-accent)" }}
          >
            {store.name[0]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-[var(--color-text-primary)]">{store.name}</h1>
              <span className={`badge ${store.isActive ? "badge-success" : "badge-warning"}`}>
                {store.isActive ? "Active" : "Inactive"}
              </span>
            </div>
            <p className="text-xs text-[var(--color-text-tertiary)] font-mono">/{store.slug}</p>
            {store.description && (
              <p className="mt-1 text-sm text-[var(--color-text-secondary)] line-clamp-1">{store.description}</p>
            )}
          </div>
          <div className="flex items-center gap-6 text-sm">
            <div className="text-center">
              <p className="text-lg font-bold text-[var(--color-text-primary)]">{store._count?.products ?? 0}</p>
              <p className="text-[10px] text-[var(--color-text-tertiary)] uppercase tracking-wide">Products</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-[var(--color-text-primary)]">{store._count?.categories ?? 0}</p>
              <p className="text-[10px] text-[var(--color-text-tertiary)] uppercase tracking-wide">Categories</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-[var(--color-text-primary)]">{store.attributeTemplates?.length ?? 0}</p>
              <p className="text-[10px] text-[var(--color-text-tertiary)] uppercase tracking-wide">Attributes</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="card">
        <div className="flex border-b border-[var(--color-border)] px-2">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-medium transition-all border-b-2 -mb-px ${
                activeTab === key
                  ? "border-[var(--color-accent)] text-[var(--color-text-primary)]"
                  : "border-transparent text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] hover:border-[var(--color-border)]"
              }`}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-5">
          {activeTab === "overview" && <StoreOverview store={store} />}
          {activeTab === "categories" && <CategoriesTab storeId={storeId} />}
          {activeTab === "attributes" && <AttributesTab storeId={storeId} />}
          {activeTab === "products" && <ProductsTab storeId={storeId} />}
          {activeTab === "activity" && <ActivityLogTab storeId={storeId} entity="STORE" />}
        </div>
      </div>
    </div>
  );
}