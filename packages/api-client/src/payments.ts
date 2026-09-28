import { createClient } from "./index.js";

export const createPaymentApi = (client: ReturnType<typeof createClient>) => ({
  verify: (razorpayOrderId: string, razorpayPaymentId: string, razorpaySignature: string) =>
    client.post("/api/v1/payments/verify", {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    }),
});
