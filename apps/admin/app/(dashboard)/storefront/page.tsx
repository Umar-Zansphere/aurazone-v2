"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
  Plus, Edit2, Trash2, GripVertical, Layers,
  CheckCircle, XCircle, Copy, ChevronDown,
  Calendar, Eye, EyeOff,
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { SECTION_TEMPLATES } from "@/lib/sectionTemplates";

interface Section {
  id: string;
  type: string;
  title: string | null;
  subtitle: string | null;
  content: any;
  isActive: boolean;
  sortOrder: number;
  page: string;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
}

const PAGES = [
  { value: "", label: "All Pages" },
  { value: "home", label: "Homepage" },
  { value: "about", label: "About" },
  { value: "contact", label: "Contact" },
  { value: "sale", label: "Sale" },
];

export default function StorefrontPage() {
  const queryClient = useQueryClient();
  const [pageFilter, setPageFilter] = useState("home");
  const [showGallery, setShowGallery] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "storefront", pageFilter],
    queryFn: () => {
      const params = new URLSearchParams();
      if (pageFilter) params.set("page", pageFilter);
      return api.get<Section[]>(`/admin/storefront?${params}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/storefront/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "storefront"] }),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      api.put(`/admin/storefront/${id}`, { isActive }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "storefront"] }),
  });

  const duplicateMutation = useMutation({
    mutationFn: (id: string) => api.post(`/admin/storefront/${id}/duplicate`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "storefront"] }),
  });

  const reorderMutation = useMutation({
    mutationFn: (items: Array<{ id: string; sortOrder: number }>) =>
      api.patch("/admin/storefront/reorder", { items }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "storefront"] }),
  });

  const sections = (data?.data ?? []).sort((a, b) => a.sortOrder - b.sortOrder);

  const moveSection = (index: number, direction: "up" | "down") => {
    const swapIdx = direction === "up" ? index - 1 : index + 1;
    if (swapIdx < 0 || swapIdx >= sections.length) return;

    const items = [
      { id: sections[index].id, sortOrder: sections[swapIdx].sortOrder },
      { id: sections[swapIdx].id, sortOrder: sections[index].sortOrder },
    ];
    reorderMutation.mutate(items);
  };

  const isScheduled = (section: Section) => section.startDate || section.endDate;

  return (
    <div className="space-y-6 fade-in">
      <div className="flex items-start justify-between">
        <div>
          <p className="page-label">Content</p>
          <h1 className="page-title">Storefront Builder</h1>
        </div>
        <div className="flex items-center gap-2">
          <select
            className="form-input text-xs w-36"
            value={pageFilter}
            onChange={(e) => setPageFilter(e.target.value)}
          >
            {PAGES.map(p => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
          <Link href="/storefront/new" className="btn-primary flex items-center gap-2">
            <Plus size={16} /> New Section
          </Link>
        </div>
      </div>

      <p className="text-sm text-[var(--color-text-secondary)]">
        Manage page sections. Reorder with arrows, toggle visibility, duplicate, or edit content.
      </p>

      <div className="space-y-2">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="card p-5 h-20 shimmer" />
            ))
          : sections.map((section, index) => {
              const template = SECTION_TEMPLATES[section.type];
              const Icon = template?.icon ?? Layers;
              const color = template?.color ?? "#6B7280";

              return (
                <div
                  key={section.id}
                  className="card flex items-center gap-4 px-5 py-4 group hover:shadow-md transition-all"
                >
                  {/* Reorder */}
                  <div className="flex flex-col items-center gap-0.5">
                    <button
                      onClick={() => moveSection(index, "up")}
                      disabled={index === 0}
                      className="text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] disabled:opacity-20 disabled:cursor-not-allowed"
                    >
                      <ChevronDown size={12} className="rotate-180" />
                    </button>
                    <span className="text-[9px] text-[var(--color-text-disabled)] tabular-nums">{section.sortOrder}</span>
                    <button
                      onClick={() => moveSection(index, "down")}
                      disabled={index === sections.length - 1}
                      className="text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] disabled:opacity-20 disabled:cursor-not-allowed"
                    >
                      <ChevronDown size={12} />
                    </button>
                  </div>

                  {/* Icon */}
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl text-white"
                    style={{ backgroundColor: color }}
                  >
                    <Icon size={18} />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--color-text-primary)]">
                      {section.title ?? template?.label ?? section.type}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-[var(--color-text-tertiary)]">
                        {template?.label ?? section.type}
                      </span>
                      <span className="text-[10px] text-[var(--color-text-disabled)]">·</span>
                      <span className="text-[10px] text-[var(--color-text-tertiary)] capitalize">
                        {section.page}
                      </span>
                      {isScheduled(section) && (
                        <>
                          <span className="text-[10px] text-[var(--color-text-disabled)]">·</span>
                          <span className="text-[10px] text-[var(--color-warning-text)] flex items-center gap-0.5">
                            <Calendar size={9} /> Scheduled
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Toggle */}
                  <button
                    onClick={() => toggleMutation.mutate({ id: section.id, isActive: !section.isActive })}
                    className={`flex h-6 w-11 items-center rounded-full px-0.5 transition-colors ${
                      section.isActive ? "bg-[var(--color-accent)]" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                        section.isActive ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>

                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => duplicateMutation.mutate(section.id)}
                      title="Duplicate"
                      className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-[var(--color-bg-muted)] text-[var(--color-text-secondary)]"
                    >
                      <Copy size={13} />
                    </button>
                    <Link
                      href={`/storefront/${section.id}`}
                      className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-[var(--color-bg-muted)] text-[var(--color-text-secondary)]"
                    >
                      <Edit2 size={13} />
                    </Link>
                    <button
                      onClick={() => {
                        if (confirm("Delete this section?")) deleteMutation.mutate(section.id);
                      }}
                      className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-red-50 text-[var(--color-text-secondary)] hover:text-red-500"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })}

        {!isLoading && sections.length === 0 && (
          <div className="card p-12 text-center">
            <Layers size={40} className="mx-auto text-[var(--color-text-tertiary)] mb-3" />
            <h3 className="text-sm font-medium text-[var(--color-text-primary)]">No sections yet</h3>
            <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
              Add sections to customize the {pageFilter || "storefront"} page.
            </p>
            <Link href="/storefront/new" className="btn-primary mt-4 inline-flex items-center gap-2 text-xs">
              <Plus size={14} /> Add First Section
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}