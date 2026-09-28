import { createClient } from "./index.js";

export const createUserApi = (client: ReturnType<typeof createClient>) => ({
  getProfile: () => client.get("/api/v1/users/profile"),
  updateProfile: (body: unknown) => client.put("/api/v1/users/profile", body),
  getAddresses: () => client.get("/api/v1/users/addresses"),
  createAddress: (body: unknown) => client.post("/api/v1/users/addresses", body),
  updateAddress: (id: string, body: unknown) =>
    client.put(`/api/v1/users/addresses/${id}`, body),
  deleteAddress: (id: string) => client.delete(`/api/v1/users/addresses/${id}`),
  setDefaultAddress: (id: string) =>
    client.patch(`/api/v1/users/addresses/${id}/default`),
});
