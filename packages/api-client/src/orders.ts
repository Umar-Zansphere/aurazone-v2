import { createClient } from "./index.js";

export const createOrderApi = (client: ReturnType<typeof createClient>) => ({
  create: (body: unknown) => client.post("/api/v1/orders", body),
  createDirect: (body: unknown) => client.post("/api/v1/orders/direct", body),
  list: (params?: Record<string, string | number | boolean | undefined>) =>
    client.get("/api/v1/orders", params),
  getById: (id: string) => client.get(`/api/v1/orders/${id}`),
  cancel: (id: string, reason?: string) =>
    client.post(`/api/v1/orders/${id}/cancel`, { reason }),
  trackByToken: (token: string) => client.get(`/api/v1/orders/track/${token}`),
});
