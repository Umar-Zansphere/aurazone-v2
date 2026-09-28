import { createClient } from "./index.js";

export const createAuthApi = (client: ReturnType<typeof createClient>) => ({
  login: (email: string, password: string) =>
    client.post("/api/v1/auth/login", { email, password }),
  signup: (email: string, password: string, fullName?: string) =>
    client.post("/api/v1/auth/signup", { email, password, fullName }),
  phoneLogin: (phoneNumber: string) =>
    client.post("/api/v1/auth/phone-login", { phoneNumber }),
  phoneLoginVerify: (phoneNumber: string, otp: string) =>
    client.post("/api/v1/auth/phone-login-verify", { phoneNumber, otp }),
  logout: () => client.post("/api/v1/auth/logout"),
  forgotPassword: (email: string) =>
    client.post("/api/v1/auth/forgot-password", { email }),
  resetPassword: (token: string, password: string) =>
    client.post("/api/v1/auth/reset-password", { token, password }),
  me: () => client.get("/api/v1/auth/me"),
});
