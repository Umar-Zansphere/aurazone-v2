import { createClient } from "./index.js";

export const createStorefrontApi = (client: ReturnType<typeof createClient>) => ({
  getSections: (page: string, storeSlug?: string) =>
    client.get("/api/v1/storefront", { page, store: storeSlug }),
});
