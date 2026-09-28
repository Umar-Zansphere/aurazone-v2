import { createClient } from "./index.js";

export const createCartApi = (client: ReturnType<typeof createClient>) => ({
  get: () => client.get("/api/v1/cart"),
  add: (variantId: string, quantity = 1) =>
    client.post("/api/v1/cart", { variantId, quantity }),
  update: (itemId: string, quantity: number) =>
    client.patch(`/api/v1/cart/${itemId}`, { quantity }),
  remove: (itemId: string) => client.delete(`/api/v1/cart/${itemId}`),
  clear: () => client.delete("/api/v1/cart"),
});
