import { createClient } from "./index.js";

export const createAdminApi = (client: ReturnType<typeof createClient>) => ({
  // Stores
  stores: {
    list: (params?: Record<string, string | number | boolean | undefined>) =>
      client.get("/api/v1/admin/stores", params),
    create: (body: unknown) => client.post("/api/v1/admin/stores", body),
    update: (id: string, body: unknown) => client.put(`/api/v1/admin/stores/${id}`, body),
    delete: (id: string) => client.delete(`/api/v1/admin/stores/${id}`),
  },
  // Categories
  categories: {
    list: (params?: Record<string, string | number | boolean | undefined>) =>
      client.get("/api/v1/admin/categories", params),
    create: (body: unknown) => client.post("/api/v1/admin/categories", body),
    update: (id: string, body: unknown) =>
      client.put(`/api/v1/admin/categories/${id}`, body),
    delete: (id: string) => client.delete(`/api/v1/admin/categories/${id}`),
  },
  // Attribute Templates
  attributeTemplates: {
    list: (params?: Record<string, string | number | boolean | undefined>) =>
      client.get("/api/v1/admin/attribute-templates", params),
    create: (body: unknown) => client.post("/api/v1/admin/attribute-templates", body),
    update: (id: string, body: unknown) =>
      client.put(`/api/v1/admin/attribute-templates/${id}`, body),
    delete: (id: string) => client.delete(`/api/v1/admin/attribute-templates/${id}`),
  },
  // Products
  products: {
    list: (params?: Record<string, string | number | boolean | undefined>) =>
      client.get("/api/v1/admin/products", params),
    getById: (id: string) => client.get(`/api/v1/admin/products/${id}`),
    create: (body: unknown) => client.post("/api/v1/admin/products", body),
    update: (id: string, body: unknown) =>
      client.put(`/api/v1/admin/products/${id}`, body),
    delete: (id: string) => client.delete(`/api/v1/admin/products/${id}`),
  },
  // Orders
  orders: {
    list: (params?: Record<string, string | number | boolean | undefined>) =>
      client.get("/api/v1/admin/orders", params),
    getById: (id: string) => client.get(`/api/v1/admin/orders/${id}`),
    updateStatus: (id: string, body: unknown) =>
      client.patch(`/api/v1/admin/orders/${id}/status`, body),
  },
  // Inventory
  inventory: {
    list: (params?: Record<string, string | number | boolean | undefined>) =>
      client.get("/api/v1/admin/inventory", params),
    adjust: (variantId: string, body: unknown) =>
      client.patch(`/api/v1/admin/inventory/${variantId}`, body),
  },
  // Analytics
  analytics: {
    dashboard: (params?: Record<string, string | number | boolean | undefined>) =>
      client.get("/api/v1/admin/analytics/dashboard", params),
    revenue: (params?: Record<string, string | number | boolean | undefined>) =>
      client.get("/api/v1/admin/analytics/revenue", params),
  },
  // Storefront CMS
  storefront: {
    list: (params?: Record<string, string | number | boolean | undefined>) =>
      client.get("/api/v1/admin/storefront-sections", params),
    create: (body: unknown) =>
      client.post("/api/v1/admin/storefront-sections", body),
    update: (id: string, body: unknown) =>
      client.put(`/api/v1/admin/storefront-sections/${id}`, body),
    delete: (id: string) =>
      client.delete(`/api/v1/admin/storefront-sections/${id}`),
    reorder: (ids: string[]) =>
      client.patch("/api/v1/admin/storefront-sections/reorder", { ids }),
  },
});
