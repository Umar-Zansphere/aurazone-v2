import type { FastifyPluginAsync } from "fastify";
import { prisma } from "@aurazone/database";
import crypto from "crypto";
import { authenticate, optionalAuth } from "../../middleware/auth.js";
import { sendSuccess, sendError } from "../../middleware/response.js";
import { env } from "../../config/env.js";
import * as orderService from "../../services/order.service.js";

const paymentRoutes: FastifyPluginAsync = async (fastify) => {
  // ─── Create Razorpay order ──────────────────────────────────────────────────
  fastify.post("/create", { preHandler: [optionalAuth] }, async (request, reply) => {
    const { orderId } = request.body as { orderId: string };
    const order = await prisma.order.findUnique({ where: { id: orderId } });

    if (!order) return sendError(reply, "Order not found", 404);

    // Verify ownership
    const userId = request.user?.userId;
    const sessionId = request.headers["x-guest-session"] as string | undefined;
    if (userId && order.userId !== userId) return sendError(reply, "Order not found", 404);
    if (!userId && order.sessionId !== sessionId) return sendError(reply, "Order not found", 404);

    if (order.status !== "PENDING") {
      return sendError(reply, "Order is not in pending state", 400);
    }
    if (order.paymentMethod !== "RAZORPAY") {
      return sendError(reply, "Order payment method is not online", 400);
    }

    // Idempotency: if a pending payment already exists, return the existing gateway order
    const existingPayment = await prisma.payment.findFirst({
      where: { orderId: order.id, gateway: "RAZORPAY", status: "PENDING" },
    });
    if (existingPayment && existingPayment.gatewayOrderId) {
      const amountInPaise = Math.round(order.totalAmount.toNumber() * 100);
      return sendSuccess(reply, {
        razorpayOrderId: existingPayment.gatewayOrderId,
        amount: amountInPaise,
        currency: "INR",
        keyId: env.RAZORPAY_KEY_ID,
        orderNumber: order.orderNumber,
      });
    }

    // Create actual Razorpay order via API
    const amountInPaise = Math.round(order.totalAmount.toNumber() * 100);
    let gatewayOrderId: string;

    try {
      const razorpayAuth = Buffer.from(`${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`).toString("base64");
      const rzpResponse = await fetch("https://api.razorpay.com/v1/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${razorpayAuth}`,
        },
        body: JSON.stringify({
          amount: amountInPaise,
          currency: "INR",
          receipt: order.orderNumber,
          notes: {
            orderId: order.id,
            orderNumber: order.orderNumber,
          },
        }),
      });

      if (!rzpResponse.ok) {
        const errorBody = await rzpResponse.text();
        console.error("Razorpay order creation failed:", errorBody);
        return sendError(reply, "Failed to create payment order with gateway", 502);
      }

      const rzpOrder = (await rzpResponse.json()) as { id: string };
      gatewayOrderId = rzpOrder.id;
    } catch (err) {
      console.error("Razorpay API error:", err);
      return sendError(reply, "Payment gateway unavailable", 503);
    }

    // Store payment record
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
      amount: amountInPaise,
      currency: "INR",
      keyId: env.RAZORPAY_KEY_ID,
      orderNumber: order.orderNumber,
    });
  });

  // ─── Client-side signature verification ─────────────────────────────────────
  fastify.post("/verify", { preHandler: [optionalAuth] }, async (request, reply) => {
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

    // Prevent double processing
    if (payment.status === "SUCCESS") {
      return sendSuccess(reply, { message: "Payment already verified", orderId: payment.orderId });
    }

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

  // ─── Razorpay Webhook (server-to-server, no auth required) ──────────────────
  fastify.post("/webhook", {
    config: { rawBody: true },
  }, async (request, reply) => {
    const signature = request.headers["x-razorpay-signature"] as string;
    if (!signature) return sendError(reply, "Missing signature", 400);

    if (!env.RAZORPAY_WEBHOOK_SECRET) {
      console.error("RAZORPAY_WEBHOOK_SECRET is not configured");
      return reply.status(500).send({ status: "error", message: "Webhook secret not configured" });
    }

    // Verify webhook signature using the raw body bytes
    const rawBody = (request as any).rawBody ?? JSON.stringify(request.body);
    const expectedSignature = crypto
      .createHmac("sha256", env.RAZORPAY_WEBHOOK_SECRET)
      .update(typeof rawBody === "string" ? rawBody : Buffer.from(rawBody))
      .digest("hex");

    if (expectedSignature !== signature) {
      return sendError(reply, "Invalid webhook signature", 400);
    }

    const event = request.body as {
      event: string;
      payload: {
        payment?: { entity: { id: string; order_id: string; status: string; amount: number } };
        refund?: { entity: { id: string; payment_id: string; amount: number; status: string } };
      };
    };

    switch (event.event) {
      case "payment.captured": {
        const paymentEntity = event.payload.payment?.entity;
        if (!paymentEntity) break;

        const payment = await prisma.payment.findFirst({
          where: { gatewayOrderId: paymentEntity.order_id },
        });
        if (!payment || payment.status === "SUCCESS") break;

        await prisma.$transaction([
          prisma.payment.update({
            where: { id: payment.id },
            data: {
              gatewayPaymentId: paymentEntity.id,
              status: "SUCCESS",
              paidAt: new Date(),
            },
          }),
          prisma.order.update({
            where: { id: payment.orderId },
            data: { status: "RECEIVED", paymentStatus: "SUCCESS" },
          }),
        ]);
        break;
      }

      case "payment.failed": {
        const paymentEntity = event.payload.payment?.entity;
        if (!paymentEntity) break;

        const payment = await prisma.payment.findFirst({
          where: { gatewayOrderId: paymentEntity.order_id },
        });
        if (!payment || payment.status !== "PENDING") break;

        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            gatewayPaymentId: paymentEntity.id,
            status: "FAILED",
          },
        });

        // Trigger order failure + inventory restock
        try {
          await orderService.failOrder(payment.orderId);
        } catch (e) {
          console.error("Failed to process order failure from webhook:", e);
        }
        break;
      }

      case "refund.created":
      case "refund.processed": {
        const refundEntity = event.payload.refund?.entity;
        if (!refundEntity) break;

        // Find the original payment by razorpay payment ID
        const payment = await prisma.payment.findFirst({
          where: { gatewayPaymentId: refundEntity.payment_id },
        });
        if (!payment) break;

        // Check if we already recorded this refund (idempotency)
        const existingRefund = await prisma.payment.findFirst({
          where: { gateway: "RAZORPAY", gatewayPaymentId: refundEntity.id },
        });
        if (existingRefund) break;

        // Record refund as a separate Payment row.
        // gatewayOrderId is null — refunds are tracked by their own refund ID in gatewayPaymentId.
        await prisma.payment.create({
          data: {
            orderId: payment.orderId,
            gateway: "RAZORPAY",
            gatewayOrderId: null,
            gatewayPaymentId: refundEntity.id,
            amount: refundEntity.amount / 100, // paise to INR
            status: refundEntity.status === "processed" ? "REFUNDED" : "PENDING",
            paidAt: refundEntity.status === "processed" ? new Date() : null,
            note: `Refund for payment ${refundEntity.payment_id}`,
          },
        });

        // Update order payment status
        await prisma.order.update({
          where: { id: payment.orderId },
          data: { paymentStatus: "REFUNDED" },
        });
        break;
      }
    }

    // Always return 200 to Razorpay
    return reply.status(200).send({ status: "ok" });
  });
};

export default paymentRoutes;