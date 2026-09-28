"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Plus, Trash2, Edit2, Settings2, X, GripVertical } from "lucide-react";

interface AttributeTemplate {
  id: string;
  name: string;
  key: string;
  fieldType: string;
  options: string[] | null;
  placeholder: string | null;
  helpText: string | null;
  isRequired: boolean;
  isVariant: boolean;
  isFilterable: boolean;
  sortOrder: number;
  categoryId: string | null;
  category: { id: string; name: string } | null;
}

const FIELD_TYPES = [
  { value: "TEXT", label: "Text" },
  { value: "NUMBER", label: "Number" },
  { value: "SELECT", label: "Single Select" },
  { value: "MULTI_SELECT", label: "Multi Select" },
  { value: "COLOR_PICKER", label: "Color Picker" },
  { value: "BOOLEAN", label: "Boolean (Yes/No)" },
  { value: "MEDIA", label: "Media Upload" },
];

const TYPE_COLORS: Record<string, string> = {
  TEXT: "#6B7280",
  NUMBER: "#3B82F6",
  SELECT: "#8B5CF6",
  MULTI_SELECT: "#EC4899",
  COLOR_PICKER: "#F59E0B",
  BOOLEAN: "#10B981",
  MEDIA: "#0EA5E9",
};

export default function AttributesTab({ storeId }: { storeId: string }) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "", key: "", fieldType: "TEXT",
    options: "" as string, placeholder: "", helpText: "",
    isRequired: true, isVariant: true, isFilterable: true,
    sortOrder: 0,
  });

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "attribute-templates", storeId],
    queryFn: () => api.get<AttributeTemplate[]>(`/admin/attribute-templates?storeId=${storeId}&take=200`),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post("/admin/attribute-templates", data),
    onSuccess: () => { invalidate(); resetForm(); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.put(`/admin/attribute-templates/${id}`, data),
    onSuccess: () => { invalidate(); resetForm(); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/attribute-templates/${id}`),
    onSuccess: () => invalidate(),
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin", "attribute-templates", storeId] });
    queryClient.invalidateQueries({ queryKey: ["admin", "store", storeId] });
  };

  const templates: AttributeTemplate[] = (data as any)?.data ?? [];

  const keyify = (text: string) =>
    text.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm({
      name: "", key: "", fieldType: "TEXT",
      options: "", placeholder: "", helpText: "",
      isRequired: true, isVariant: true, isFilterable: true,
      sortOrder: 0,
    });
  };

  const startEdit = (t: AttributeTemplate) => {
    setEditingId(t.id);
    setShowForm(true);
    setForm({
      name: t.name, key: t.key, fieldType: t.fieldType,
      options: t.options?.join(", ") ?? "",
      placeholder: t.placeholder ?? "", helpText: t.helpText ?? "",
      isRequired: t.isRequired, isVariant: t.isVariant,
      isFilterable: t.isFilterable, sortOrder: t.sortOrder,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      storeId,
      name: form.name,
      key: form.key,
      fieldType: form.fieldType,
      options: form.options ? form.options.split(",").map(s => s.trim()).filter(Boolean) : null,
      placeholder: form.placeholder || undefined,
      helpText: form.helpText || undefined,
      isRequired: form.isRequired,
      isVariant: form.isVariant,
      isFilterable: form.isFilterable,
      sortOrder: form.sortOrder,
    };
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const showOptions = form.fieldType === "SELECT" || form.fieldType === "MULTI_SELECT";

  if (isLoading) {
    return <div className="space-y-2">{[1, 2, 3].map(i => <div key={i} className="h-14 shimmer rounded-lg" />)}</div>;
  }

  return (
    <div className="space-y-4 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-[var(--color-text-primary)] flex items-center gap-2">
            <Settings2 size={16} /> Attribute Templates ({templates.length})
          </h3>
          <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5">
            Define attributes that generate dynamic product form fields
          </p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="btn-primary flex items-center gap-2 text-xs"
        >
          <Plus size={14} /> Add Attribute
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-muted)] p-4 space-y-3 fade-in">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-semibold text-[var(--color-text-primary)]">
              {editingId ? "Edit Attribute" : "New Attribute"}
            </p>
            <button type="button" onClick={resetForm} className="text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]">
              <X size={14} />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="form-label">Display Name</label>
              <input
                type="text" className="form-input" required placeholder="e.g. Color"
                value={form.name}
                onChange={(e) => setForm(f => ({
                  ...f, name: e.target.value,
                  key: editingId ? f.key : keyify(e.target.value),
                }))}
              />
            </div>
            <div>
              <label className="form-label">Key</label>
              <input
                type="text" className="form-input font-mono text-xs" required placeholder="e.g. color"
                value={form.key}
                onChange={(e) => setForm(f => ({ ...f, key: e.target.value }))}
              />
            </div>
            <div>
              <label className="form-label">Field Type</label>
              <select
                className="form-input"
                value={form.fieldType}
                onChange={(e) => setForm(f => ({ ...f, fieldType: e.target.value }))}
              >
                {FIELD_TYPES.map(ft => (
                  <option key={ft.value} value={ft.value}>{ft.label}</option>
                ))}
              </select>
            </div>
          </div>

          {showOptions && (
            <div>
              <label className="form-label">Options (comma-separated)</label>
              <input
                type="text" className="form-input text-xs" placeholder="Red, Blue, Green"
                value={form.options}
                onChange={(e) => setForm(f => ({ ...f, options: e.target.value }))}
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="form-label">Placeholder</label>
              <input
                type="text" className="form-input text-xs" placeholder="Shown in the product form"
                value={form.placeholder}
                onChange={(e) => setForm(f => ({ ...f, placeholder: e.target.value }))}
              />
            </div>
            <div>
              <label className="form-label">Help Text</label>
              <input
                type="text" className="form-input text-xs" placeholder="Tooltip or description"
                value={form.helpText}
                onChange={(e) => setForm(f => ({ ...f, helpText: e.target.value }))}
              />
            </div>
          </div>

          <div className="flex items-center gap-6 py-1">
            {([
              { key: "isRequired", label: "Required" },
              { key: "isVariant", label: "Creates Variants" },
              { key: "isFilterable", label: "Filterable" },
            ] as const).map(({ key, label }) => (
              <label key={key} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="h-3.5 w-3.5 rounded accent-[var(--color-accent)]"
                  checked={form[key]}
                  onChange={(e) => setForm(f => ({ ...f, [key]: e.target.checked }))}
                />
                <span className="text-xs text-[var(--color-text-secondary)]">{label}</span>
              </label>
            ))}
          </div>

          <div className="flex gap-2">
            <button type="button" onClick={resetForm} className="btn-secondary text-xs">Cancel</button>
            <button
              type="submit" className="btn-primary text-xs"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending ? "Saving..." : editingId ? "Update" : "Create"}
            </button>
          </div>
        </form>
      )}

      {/* Attribute List */}
      <div className="space-y-1">
        {templates.map((t) => (
          <div
            key={t.id}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[var(--color-bg-muted)] transition-colors group"
          >
            <GripVertical size={14} className="text-[var(--color-text-tertiary)] cursor-grab opacity-0 group-hover:opacity-50" />
            <div
              className="flex h-7 w-7 items-center justify-center rounded-md text-[10px] font-bold text-white"
              style={{ backgroundColor: TYPE_COLORS[t.fieldType] ?? "#6B7280" }}
            >
              {t.fieldType.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-[var(--color-text-primary)]">{t.name}</p>
                <span className="text-[10px] font-mono text-[var(--color-text-tertiary)] bg-[var(--color-bg-muted)] px-1.5 py-0.5 rounded">
                  {t.key}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] text-[var(--color-text-tertiary)]">
                  {FIELD_TYPES.find(f => f.value === t.fieldType)?.label ?? t.fieldType}
                </span>
                {t.options && t.options.length > 0 && (
                  <span className="text-[10px] text-[var(--color-text-tertiary)]">
                    · {(t.options as string[]).length} options
                  </span>
                )}
              </div>
            </div>

            {/* Flags */}
            <div className="flex items-center gap-1.5">
              {t.isRequired && (
                <span className="text-[9px] font-medium text-[var(--color-danger)] bg-[var(--color-danger-bg)] px-1.5 py-0.5 rounded">REQ</span>
              )}
              {t.isVariant && (
                <span className="text-[9px] font-medium text-[var(--color-info-text)] bg-[var(--color-info-bg)] px-1.5 py-0.5 rounded">VAR</span>
              )}
              {t.isFilterable && (
                <span className="text-[9px] font-medium text-[var(--color-success-text)] bg-[var(--color-success-bg)] px-1.5 py-0.5 rounded">FIL</span>
              )}
            </div>

            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => startEdit(t)}
                className="flex h-6 w-6 items-center justify-center rounded hover:bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)]"
              >
                <Edit2 size={12} />
              </button>
              <button
                onClick={() => { if (confirm(`Delete "${t.name}"?`)) deleteMutation.mutate(t.id); }}
                className="flex h-6 w-6 items-center justify-center rounded hover:bg-red-50 text-[var(--color-text-secondary)] hover:text-red-500"
              >
                <Trash2 size={12} />
              </button>
            </div>
          </div>
        ))}

        {templates.length === 0 && (
          <div className="py-8 text-center">
            <Settings2 size={28} className="mx-auto text-[var(--color-text-tertiary)] mb-2" />
            <p className="text-sm text-[var(--color-text-secondary)]">No attribute templates yet</p>
            <p className="text-xs text-[var(--color-text-tertiary)] mt-1">
              Attributes define dynamic form fields for products in this store
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
