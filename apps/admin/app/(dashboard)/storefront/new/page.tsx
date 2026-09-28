"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { ArrowLeft, Check, Layers } from "lucide-react";
import Link from "next/link";
import { SECTION_TEMPLATES, getDefaultContent, type TemplateField } from "@/lib/sectionTemplates";

export default function NewSectionPage() {
  const router = useRouter();
  const [step, setStep] = useState<"pick" | "configure">("pick");
  const [selectedType, setSelectedType] = useState<string | null>(null);
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

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post("/admin/storefront", data),
    onSuccess: () => router.push("/storefront"),
  });

  const handleSelectType = (type: string) => {
    setSelectedType(type);
    const template = SECTION_TEMPLATES[type];
    setForm(f => ({
      ...f,
      title: template?.label ?? type,
      content: getDefaultContent(type),
    }));
    setStep("configure");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      type: selectedType,
      title: form.title,
      subtitle: form.subtitle || undefined,
      page: form.page,
      sortOrder: form.sortOrder,
      isActive: form.isActive,
      startDate: form.startDate || undefined,
      endDate: form.endDate || undefined,
      content: form.content,
    });
  };

  const updateContent = (key: string, value: unknown) => {
    setForm(f => ({ ...f, content: { ...f.content, [key]: value } }));
  };

  const template = selectedType ? SECTION_TEMPLATES[selectedType] : null;

  // ─── Step 1: Template Gallery ─────────────────────────────────────────────
  if (step === "pick") {
    return (
      <div className="space-y-6 fade-in">
        <div className="flex items-center gap-3">
          <Link href="/storefront" className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-[var(--color-bg-muted)] text-[var(--color-text-secondary)]">
            <ArrowLeft size={16} />
          </Link>
          <div>
            <p className="page-label">Storefront</p>
            <h1 className="page-title">Choose a Section Type</h1>
          </div>
        </div>

        <p className="text-sm text-[var(--color-text-secondary)]">
          Select a template to add to your storefront. Each type has configurable fields.
        </p>

        <div className="grid grid-cols-3 gap-3">
          {Object.entries(SECTION_TEMPLATES).map(([type, tmpl]) => {
            const Icon = tmpl.icon;
            return (
              <button
                key={type}
                onClick={() => handleSelectType(type)}
                className="card p-5 text-left hover:shadow-md hover:border-[var(--color-accent)] transition-all group"
              >
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl text-white mb-3 group-hover:scale-110 transition-transform"
                  style={{ backgroundColor: tmpl.color }}
                >
                  <Icon size={20} />
                </div>
                <p className="text-sm font-semibold text-[var(--color-text-primary)]">{tmpl.label}</p>
                <p className="text-xs text-[var(--color-text-tertiary)] mt-1 line-clamp-2">{tmpl.description}</p>
                <p className="text-[10px] text-[var(--color-text-disabled)] mt-2">
                  {tmpl.fields.length} configurable fields
                </p>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // ─── Step 2: Configure Section ────────────────────────────────────────────
  return (
    <div className="space-y-6 fade-in">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setStep("pick")}
          className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-[var(--color-bg-muted)] text-[var(--color-text-secondary)]"
        >
          <ArrowLeft size={16} />
        </button>
        <div className="flex items-center gap-3">
          {template && (
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg text-white"
              style={{ backgroundColor: template.color }}
            >
              <template.icon size={16} />
            </div>
          )}
          <div>
            <p className="page-label">New Section</p>
            <h1 className="page-title">{template?.label ?? selectedType}</h1>
          </div>
        </div>
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
          <button type="button" onClick={() => router.push("/storefront")} className="btn-secondary text-xs">Cancel</button>
          <button type="submit" className="btn-primary text-xs flex items-center gap-1.5" disabled={createMutation.isPending}>
            <Check size={13} />
            {createMutation.isPending ? "Creating..." : "Create Section"}
          </button>
        </div>

        {createMutation.error && (
          <p className="text-xs text-[var(--color-danger)]">{createMutation.error.message}</p>
        )}
      </form>
    </div>
  );
}

// ─── Dynamic Field Renderer ──────────────────────────────────────────────────
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
