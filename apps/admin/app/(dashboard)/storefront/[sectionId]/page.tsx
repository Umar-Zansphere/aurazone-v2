"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { ArrowLeft, Check, Layers, Trash2 } from "lucide-react";
import Link from "next/link";
import { SECTION_TEMPLATES, type TemplateField } from "@/lib/sectionTemplates";

interface Section {
  id: string;
  type: string;
  title: string | null;
  subtitle: string | null;
  content: Record<string, unknown>;
  isActive: boolean;
  sortOrder: number;
  page: string;
  startDate: string | null;
  endDate: string | null;
}

export default function EditSectionPage() {
  const params = useParams();
  const sectionId = params.sectionId as string;
  const router = useRouter();

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "storefront", sectionId],
    queryFn: async () => {
      // Fetch all sections and find the one we need
      const res = await api.get<Section[]>("/admin/storefront");
      const section = (res.data ?? []).find((s: Section) => s.id === sectionId);
      if (!section) throw new Error("Section not found");
      return { data: section };
    },
  });

  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    page: "home",
    sortOrder: 0,
    isActive: true,
    startDate: "",
    endDate: "",
    content: {} as Record<string, unknown>,
  });

  useEffect(() => {
    if (data?.data) {
      const s = data.data;
      setForm({
        title: s.title ?? "",
        subtitle: s.subtitle ?? "",
        page: s.page,
        sortOrder: s.sortOrder,
        isActive: s.isActive,
        startDate: s.startDate ? new Date(s.startDate).toISOString().slice(0, 16) : "",
        endDate: s.endDate ? new Date(s.endDate).toISOString().slice(0, 16) : "",
        content: (s.content as Record<string, unknown>) ?? {},
      });
    }
  }, [data]);

  const updateMutation = useMutation({
    mutationFn: (body: any) => api.put(`/admin/storefront/${sectionId}`, body),
    onSuccess: () => router.push("/storefront"),
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.delete(`/admin/storefront/${sectionId}`),
    onSuccess: () => router.push("/storefront"),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({
      title: form.title,
      subtitle: form.subtitle || undefined,
      page: form.page,
      sortOrder: form.sortOrder,
      isActive: form.isActive,
      startDate: form.startDate ? new Date(form.startDate).toISOString() : null,
      endDate: form.endDate ? new Date(form.endDate).toISOString() : null,
      content: form.content,
    });
  };

  const updateContent = (key: string, value: unknown) => {
    setForm(f => ({ ...f, content: { ...f.content, [key]: value } }));
  };

  const section = data?.data;
  const template = section ? SECTION_TEMPLATES[section.type] : null;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-5 w-48 shimmer rounded" />
        <div className="card p-6 h-64 shimmer" />
      </div>
    );
  }

  if (!section) {
    return (
      <div className="card p-12 text-center">
        <Layers size={40} className="mx-auto text-[var(--color-text-tertiary)] mb-3" />
        <h3 className="text-sm font-medium text-[var(--color-text-primary)]">Section not found</h3>
        <Link href="/storefront" className="text-xs text-[var(--color-accent)] mt-2 inline-block hover:underline">
          ← Back to storefront
        </Link>
      </div>
    );
  }

  const Icon = template?.icon ?? Layers;

  return (
    <div className="space-y-6 fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/storefront"
            className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-[var(--color-bg-muted)] text-[var(--color-text-secondary)]">
            <ArrowLeft size={16} />
          </Link>
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg text-white"
            style={{ backgroundColor: template?.color ?? "#6B7280" }}
          >
            <Icon size={16} />
          </div>
          <div>
            <p className="page-label">Edit Section</p>
            <h1 className="page-title">{section.title ?? template?.label ?? section.type}</h1>
          </div>
        </div>
        <button
          onClick={() => { if (confirm("Delete this section?")) deleteMutation.mutate(); }}
          className="btn-danger text-xs flex items-center gap-1.5"
        >
          <Trash2 size={13} /> Delete
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Section Meta */}
        <div className="card p-5 space-y-3">
          <p className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide">Section Settings</p>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="form-label">Title</label>
              <input type="text" className="form-input" value={form.title}
                onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))} />
            </div>
            <div>
              <label className="form-label">Subtitle</label>
              <input type="text" className="form-input" value={form.subtitle}
                onChange={(e) => setForm(f => ({ ...f, subtitle: e.target.value }))} />
            </div>
            <div>
              <label className="form-label">Page</label>
              <select className="form-input" value={form.page}
                onChange={(e) => setForm(f => ({ ...f, page: e.target.value }))}>
                <option value="home">Homepage</option>
                <option value="about">About</option>
                <option value="contact">Contact</option>
                <option value="sale">Sale</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-3">
            <div>
              <label className="form-label">Sort Order</label>
              <input type="number" className="form-input" value={form.sortOrder}
                onChange={(e) => setForm(f => ({ ...f, sortOrder: parseInt(e.target.value, 10) || 0 }))} />
            </div>
            <div>
              <label className="form-label">Start Date</label>
              <input type="datetime-local" className="form-input text-xs" value={form.startDate}
                onChange={(e) => setForm(f => ({ ...f, startDate: e.target.value }))} />
            </div>
            <div>
              <label className="form-label">End Date</label>
              <input type="datetime-local" className="form-input text-xs" value={form.endDate}
                onChange={(e) => setForm(f => ({ ...f, endDate: e.target.value }))} />
            </div>
            <div className="flex items-end pb-1.5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="h-3.5 w-3.5 rounded accent-[var(--color-accent)]"
                  checked={form.isActive} onChange={(e) => setForm(f => ({ ...f, isActive: e.target.checked }))} />
                <span className="text-xs text-[var(--color-text-secondary)]">Active</span>
              </label>
            </div>
          </div>
        </div>

        {/* Dynamic Content Fields */}
        {template && template.fields.length > 0 && (
          <div className="card p-5 space-y-3">
            <p className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide">
              Content Configuration
            </p>
            <div className="grid grid-cols-2 gap-3">
              {template.fields.map((field) => (
                <div key={field.key} className={field.type === "textarea" || field.type === "html" ? "col-span-2" : ""}>
                  <label className="form-label">
                    {field.label}
                    {field.required && <span className="text-[var(--color-danger)] ml-0.5">*</span>}
                  </label>
                  {renderContentField(field, form.content[field.key], (val) => updateContent(field.key, val))}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Submit */}
        <div className="flex gap-2">
          <Link href="/storefront" className="btn-secondary text-xs">Cancel</Link>
          <button type="submit" className="btn-primary text-xs flex items-center gap-1.5" disabled={updateMutation.isPending}>
            <Check size={13} />
            {updateMutation.isPending ? "Saving..." : "Save Changes"}
          </button>
        </div>

        {updateMutation.error && (
          <p className="text-xs text-[var(--color-danger)]">{updateMutation.error.message}</p>
        )}
      </form>
    </div>
  );
}

// ─── Dynamic Field Renderer (same as new page) ──────────────────────────────
function renderContentField(
  field: TemplateField,
  value: unknown,
  onChange: (val: unknown) => void,
) {
  const strValue = String(value ?? "");

  switch (field.type) {
    case "text":
      return (
        <input type="text" className="form-input text-xs" value={strValue}
          onChange={(e) => onChange(e.target.value)} placeholder={field.placeholder} />
      );
    case "textarea":
    case "html":
      return (
        <textarea className="form-input text-xs min-h-[100px] resize-y font-mono" value={strValue}
          onChange={(e) => onChange(e.target.value)} placeholder={field.placeholder} />
      );
    case "number":
      return (
        <input type="number" className="form-input text-xs" value={strValue}
          onChange={(e) => onChange(e.target.value ? Number(e.target.value) : "")} placeholder={field.placeholder} />
      );
    case "color":
      return (
        <div className="flex items-center gap-2">
          <input type="color" className="h-8 w-8 rounded cursor-pointer border-0"
            value={strValue || "#000000"} onChange={(e) => onChange(e.target.value)} />
          <input type="text" className="form-input text-xs flex-1 font-mono"
            value={strValue} onChange={(e) => onChange(e.target.value)} placeholder="#000000" />
        </div>
      );
    case "media":
      return (
        <input type="text" className="form-input text-xs" value={strValue}
          onChange={(e) => onChange(e.target.value)} placeholder="Image URL" />
      );
    case "select":
      return (
        <select className="form-input text-xs" value={strValue} onChange={(e) => onChange(e.target.value)}>
          <option value="">Select...</option>
          {field.options?.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      );
    case "boolean":
      return (
        <label className="flex items-center gap-2 cursor-pointer py-1">
          <input type="checkbox" className="h-3.5 w-3.5 rounded accent-[var(--color-accent)]"
            checked={value === true || value === "true"} onChange={(e) => onChange(e.target.checked)} />
          <span className="text-xs text-[var(--color-text-secondary)]">{field.label}</span>
        </label>
      );
    case "date":
      return (
        <input type="datetime-local" className="form-input text-xs" value={strValue}
          onChange={(e) => onChange(e.target.value)} />
      );
    default:
      return (
        <input type="text" className="form-input text-xs" value={strValue}
          onChange={(e) => onChange(e.target.value)} placeholder={field.placeholder} />
      );
  }
}
