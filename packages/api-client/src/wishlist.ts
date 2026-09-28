import { createClient } from "./index.js";

export const createWishlistApi = (client: ReturnType<typeof createClient>) => ({
  get: () => client.get("/api/v1/wishlist"),
  add: (productId: string, variantId?: string) =>
    client.post("/api/v1/wishlist", { productId, variantId }),
  remove: (itemId: string) => client.delete(`/api/v1/wishlist/${itemId}`),
  moveToCart: (itemId: string) =>
    client.post(`/api/v1/wishlist/${itemId}/move-to-cart`),
});
