import {
  Layout, ShoppingBag, Grid3X3, Image, Type, Timer, Code, Megaphone, Layers,
} from "lucide-react";

// ─── Field type for each configurable property in a section template ──────────

export interface TemplateField {
  key: string;
  label: string;
  type: "text" | "textarea" | "number" | "color" | "media" | "select" | "boolean" | "products" | "stores" | "categories" | "html" | "date";
  placeholder?: string;
  options?: Array<{ label: string; value: string }>;
  required?: boolean;
}

export interface SectionTemplate {
  label: string;
  description: string;
  icon: typeof Layout;
  color: string;
  fields: TemplateField[];
}

// ─── Template Registry ───────────────────────────────────────────────────────

export const SECTION_TEMPLATES: Record<string, SectionTemplate> = {
  HERO_BANNER: {
    label: "Hero Banner",
    description: "Full-width hero section with heading, subtext, and CTA button",
    icon: Layout,
    color: "#6F7F5F",
    fields: [
      { key: "heading", label: "Heading", type: "text", placeholder: "Welcome to AuraZone", required: true },
      { key: "subheading", label: "Subheading", type: "text", placeholder: "Discover premium products" },
      { key: "imageUrl", label: "Background Image", type: "media" },
      { key: "ctaText", label: "Button Text", type: "text", placeholder: "Shop Now" },
      { key: "ctaLink", label: "Button Link", type: "text", placeholder: "/stores" },
      { key: "bgColor", label: "Background Color", type: "color" },
      { key: "textColor", label: "Text Color", type: "color" },
      { key: "overlayOpacity", label: "Overlay Opacity", type: "number", placeholder: "0.4" },
    ],
  },
  PRODUCT_CAROUSEL: {
    label: "Product Carousel",
    description: "Scrollable carousel of featured products",
    icon: ShoppingBag,
    color: "#3B82F6",
    fields: [
      { key: "heading", label: "Section Title", type: "text", placeholder: "Featured Products" },
      { key: "maxItems", label: "Max Items", type: "number", placeholder: "12" },
      { key: "storeId", label: "Filter by Store", type: "stores" },
      { key: "categoryId", label: "Filter by Category", type: "categories" },
      { key: "autoScroll", label: "Auto Scroll", type: "boolean" },
      { key: "showPrice", label: "Show Price", type: "boolean" },
    ],
  },
  CATEGORY_GRID: {
    label: "Category Grid",
    description: "Grid of category cards with images",
    icon: Grid3X3,
    color: "#10B981",
    fields: [
      { key: "heading", label: "Section Title", type: "text", placeholder: "Shop by Category" },
      { key: "columns", label: "Columns", type: "number", placeholder: "4" },
      { key: "storeId", label: "Filter by Store", type: "stores" },
      { key: "showDescription", label: "Show Description", type: "boolean" },
      { key: "bgColor", label: "Background Color", type: "color" },
    ],
  },
  STORE_GRID: {
    label: "Store Grid",
    description: "Grid of store cards with logos and accent colors",
    icon: Grid3X3,
    color: "#8B5CF6",
    fields: [
      { key: "heading", label: "Section Title", type: "text", placeholder: "Our Stores" },
      { key: "columns", label: "Columns", type: "number", placeholder: "3" },
      { key: "showDescription", label: "Show Description", type: "boolean" },
    ],
  },
  PROMO_BANNER: {
    label: "Promo Banner",
    description: "Promotional banner with image and CTA",
    icon: Megaphone,
    color: "#F59E0B",
    fields: [
      { key: "heading", label: "Heading", type: "text", placeholder: "Summer Sale!" },
      { key: "subheading", label: "Subheading", type: "text", placeholder: "Up to 50% off" },
      { key: "imageUrl", label: "Banner Image", type: "media" },
      { key: "ctaText", label: "Button Text", type: "text", placeholder: "Shop the Sale" },
      { key: "ctaLink", label: "Button Link", type: "text", placeholder: "/sale" },
      { key: "bgColor", label: "Background Color", type: "color" },
      { key: "variant", label: "Variant", type: "select", options: [
        { label: "Full Width", value: "full" },
        { label: "Contained", value: "contained" },
        { label: "Split (Image + Text)", value: "split" },
      ]},
    ],
  },
  TEXT_BLOCK: {
    label: "Text Block",
    description: "Rich text content block",
    icon: Type,
    color: "#6B7280",
    fields: [
      { key: "heading", label: "Heading", type: "text" },
      { key: "body", label: "Body Content", type: "textarea", required: true },
      { key: "alignment", label: "Text Alignment", type: "select", options: [
        { label: "Left", value: "left" },
        { label: "Center", value: "center" },
        { label: "Right", value: "right" },
      ]},
      { key: "bgColor", label: "Background Color", type: "color" },
      { key: "maxWidth", label: "Max Width (px)", type: "number", placeholder: "800" },
    ],
  },
  IMAGE_GALLERY: {
    label: "Image Gallery",
    description: "Grid gallery of images",
    icon: Image,
    color: "#EC4899",
    fields: [
      { key: "heading", label: "Section Title", type: "text" },
      { key: "columns", label: "Columns", type: "number", placeholder: "3" },
      { key: "images", label: "Gallery Images (JSON array)", type: "textarea", placeholder: '[{"url": "...", "alt": "..."}]' },
      { key: "gap", label: "Gap (px)", type: "number", placeholder: "8" },
    ],
  },
  COUNTDOWN_TIMER: {
    label: "Countdown Timer",
    description: "Countdown to a specific date/time",
    icon: Timer,
    color: "#EF4444",
    fields: [
      { key: "heading", label: "Heading", type: "text", placeholder: "Sale Ends In" },
      { key: "subheading", label: "Subheading", type: "text" },
      { key: "targetDate", label: "Target Date", type: "date", required: true },
      { key: "ctaText", label: "Button Text", type: "text" },
      { key: "ctaLink", label: "Button Link", type: "text" },
      { key: "bgColor", label: "Background Color", type: "color" },
    ],
  },
  CUSTOM_HTML: {
    label: "Custom HTML",
    description: "Raw HTML content block — use with caution",
    icon: Code,
    color: "#0EA5E9",
    fields: [
      { key: "html", label: "HTML Content", type: "html", required: true },
      { key: "css", label: "Custom CSS", type: "textarea" },
      { key: "containerClass", label: "Container CSS Class", type: "text" },
    ],
  },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function getTemplate(type: string): SectionTemplate | undefined {
  return SECTION_TEMPLATES[type];
}

export function getTemplateList() {
  return Object.entries(SECTION_TEMPLATES).map(([type, template]) => ({
    type,
    ...template,
  }));
}

/** Build default content for a given section type */
export function getDefaultContent(type: string): Record<string, unknown> {
  const template = SECTION_TEMPLATES[type];
  if (!template) return {};
  const content: Record<string, unknown> = {};
  for (const field of template.fields) {
    if (field.type === "boolean") content[field.key] = true;
    else if (field.type === "number") content[field.key] = field.placeholder ? Number(field.placeholder) : 0;
    else content[field.key] = "";
  }
  return content;
}
