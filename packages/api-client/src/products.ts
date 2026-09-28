import { createClient } from "./index.js";

export const createProductApi = (client: ReturnType<typeof createClient>) => ({
  list: (params?: Record<string, string | number | boolean | undefined>) =>
    client.get("/api/v1/products", params),
  getBySlug: (slug: string) => client.get(`/api/v1/products/${slug}`),
  search: (query: string, params?: Record<string, string | number | boolean | undefined>) =>
    client.get("/api/v1/products/search", { q: query, ...params }),
  getPopular: (params?: Record<string, string | number | boolean | undefined>) =>
    client.get("/api/v1/products/popular", params),
  getFeatured: (params?: Record<string, string | number | boolean | undefined>) =>
    client.get("/api/v1/products/featured", params),
});
