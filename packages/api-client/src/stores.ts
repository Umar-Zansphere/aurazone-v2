import { createClient } from "./index.js";

export const createStoreApi = (client: ReturnType<typeof createClient>) => ({
  list: () => client.get("/api/v1/stores"),
  getBySlug: (slug: string) => client.get(`/api/v1/stores/${slug}`),
  getCategories: (slug: string) => client.get(`/api/v1/stores/${slug}/categories`),
});
