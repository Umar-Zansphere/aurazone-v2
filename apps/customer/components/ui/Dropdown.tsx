"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Check } from "lucide-react";

export interface DropdownOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  description?: string;
}

interface DropdownProps {
  options: DropdownOption[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function Dropdown({ options, value, onChange, placeholder = "Select...", className = "", disabled = false }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-3 py-2 text-sm text-left transition-colors hover:border-[var(--color-border-strong)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className="flex items-center gap-2 truncate">
          {selected?.icon}
          <span className={selected ? "text-[var(--color-text-primary)]" : "text-[var(--color-text-tertiary)]"}>
            {selected?.label ?? placeholder}
          </span>
        </span>
        <ChevronDown
          size={14}
          className={`shrink-0 text-[var(--color-text-tertiary)] transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute z-50 mt-1.5 w-full min-w-[160px] overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-surface)] shadow-[var(--shadow-lg)] animate-in fade-in slide-in-from-top-2 duration-100">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className={`flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm transition-colors hover:bg-[var(--color-bg-muted)] ${
                opt.value === value ? "text-[var(--color-accent)] font-medium bg-[var(--color-accent-light)]" : "text-[var(--color-text-primary)]"
              }`}
            >
              {opt.icon && <span className="shrink-0">{opt.icon}</span>}
              <span className="flex-1 truncate">{opt.label}</span>
              {opt.description && <span className="text-[10px] text-[var(--color-text-tertiary)]">{opt.description}</span>}
              {opt.value === value && <Check size={13} className="shrink-0 text-[var(--color-accent)]" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
