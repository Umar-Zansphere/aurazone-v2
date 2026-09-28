// ─── Currency ────────────────────────────────────────────────────────────────
export const formatCurrency = (amount: number, currency = "INR"): string =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency }).format(amount);

// ─── Date ─────────────────────────────────────────────────────────────────────
export const formatDate = (date: string | Date): string =>
  new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));

export const formatDateTime = (date: string | Date): string =>
  new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));

export const timeAgo = (date: string | Date): string => {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  const intervals = [
    { label: "year", secs: 31536000 },
    { label: "month", secs: 2592000 },
    { label: "day", secs: 86400 },
    { label: "hour", secs: 3600 },
    { label: "minute", secs: 60 },
  ];
  for (const i of intervals) {
    const count = Math.floor(seconds / i.secs);
    if (count >= 1) return `${count} ${i.label}${count > 1 ? "s" : ""} ago`;
  }
  return "just now";
};

// ─── Slug ─────────────────────────────────────────────────────────────────────
export const slugify = (text: string): string =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

// ─── SKU ──────────────────────────────────────────────────────────────────────
export const buildSku = (...parts: (string | undefined)[]): string =>
  parts
    .filter(Boolean)
    .join("-")
    .replace(/\s+/g, "")
    .replace(/[^A-Za-z0-9-]/g, "")
    .toUpperCase();

// ─── Pagination ───────────────────────────────────────────────────────────────
export const parsePagination = (
  skip: unknown,
  take: unknown,
  maxTake = 100
): { skip: number; take: number } => {
  const s = Number(skip);
  const t = Number(take);
  return {
    skip: Number.isFinite(s) && s >= 0 ? s : 0,
    take: Number.isFinite(t) && t > 0 ? Math.min(t, maxTake) : 10,
  };
};

// ─── Discount ─────────────────────────────────────────────────────────────────
export const calcDiscountPercent = (
  price: number,
  compareAt: number
): number => {
  if (!compareAt || compareAt <= price) return 0;
  return Math.round(((compareAt - price) / compareAt) * 100);
};

// ─── Order Number ─────────────────────────────────────────────────────────────
export const generateOrderNumber = (): string => {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `AZ-${ts}-${rand}`;
};
