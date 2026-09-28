import type { FastifyPluginAsync } from "fastify";
import { prisma } from "@aurazone/database";
import crypto from "crypto";
import { authenticate } from "../../middleware/auth.js";
import { sendSuccess, sendError } from "../../middleware/response.js";
import { env } from "../../config/env.js";

const paymentRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post("/create", { preHandler: [authenticate] }, async (request, reply) => {
    const { orderId } = request.body as { orderId: string };
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order || order.userId !== request.user!.userId) {
      return sendError(reply, "Order not found", 404);
    }
    if (order.status !== "PENDING") {
      return sendError(reply, "Order is not in pending state", 400);
    }

    const gatewayOrderId = `order_${crypto.randomBytes(12).toString("hex")}`;
    await prisma.payment.create({
      data: {
        orderId: order.id,
        gateway: "RAZORPAY",
        gatewayOrderId,
        amount: order.totalAmount,
        status: "PENDING",
      },
    });

    return sendSuccess(reply, {
      razorpayOrderId: gatewayOrderId,
      amount: order.totalAmount.toNumber() * 100,
      currency: "INR",
      keyId: env.RAZORPAY_KEY_ID,
    });
  });

  fastify.post("/verify", { preHandler: [authenticate] }, async (request, reply) => {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } =
      request.body as {
        razorpayOrderId: string;
        razorpayPaymentId: string;
        razorpaySignature: string;
      };

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return sendError(reply, "Missing payment verification fields", 400);
    }

    const expectedSignature = crypto
      .createHmac("sha256", env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    if (expectedSignature !== razorpaySignature) {
      return sendError(reply, "Invalid payment signature", 400);
    }

    const payment = await prisma.payment.findFirst({
      where: { gatewayOrderId: razorpayOrderId },
    });
    if (!payment) return sendError(reply, "Payment not found", 404);

    await prisma.$transaction([
      prisma.payment.update({
        where: { id: payment.id },
        data: { gatewayPaymentId: razorpayPaymentId, status: "SUCCESS", paidAt: new Date() },
      }),
      prisma.order.update({
        where: { id: payment.orderId },
        data: { status: "RECEIVED", paymentStatus: "SUCCESS" },
      }),
    ]);

    return sendSuccess(reply, { message: "Payment verified", orderId: payment.orderId });
  });
};

export default paymentRoutes;