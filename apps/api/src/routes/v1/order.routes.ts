import type { FastifyPluginAsync } from "fastify";
import { parsePagination } from "@aurazone/utils";
import { authenticate } from "../../middleware/auth.js";
import { sendSuccess, sendError, sendPaginated } from "../../middleware/response.js";
import * as orderService from "../../services/order.service.js";

const orderRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.addHook("preHandler", authenticate);

  fastify.post("/", async (request, reply) => {
    const { addressId, paymentMethod, couponCode } = request.body as {
      addressId: string;
      paymentMethod: "RAZORPAY" | "COD";
      couponCode?: string;
    };

    if (!addressId) return sendError(reply, "addressId is required", 400);
    if (!paymentMethod) return sendError(reply, "paymentMethod is required", 400);

    try {
      const order = await orderService.createOrderFromCart(
        request.user!.userId, addressId, paymentMethod
      );
      return sendSuccess(reply, order, 201);
    } catch (err: unknown) {
      const error = err as Error & { statusCode?: number };
      return sendError(reply, error.message, error.statusCode ?? 500);
    }
  });

  fastify.get("/", async (request, reply) => {
    const query = request.query as Record<string, string>;
    const { skip, take } = parsePagination(query.skip, query.take);
    const { orders, total } = await orderService.getUserOrders(request.user!.userId, skip, take);
    return sendPaginated(reply, orders, total, Math.floor(skip / take) + 1, take);
  });

  fastify.get("/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      const order = await orderService.getOrderById(id, request.user!.userId);
      return sendSuccess(reply, order);
    } catch (err: unknown) {
      const error = err as Error & { statusCode?: number };
      return sendError(reply, error.message, error.statusCode ?? 500);
    }
  });

  fastify.post("/:id/cancel", async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      await orderService.cancelOrder(id, request.user!.userId);
      return sendSuccess(reply, { message: "Order cancelled" });
    } catch (err: unknown) {
      const error = err as Error & { statusCode?: number };
      return sendError(reply, error.message, error.statusCode ?? 500);
    }
  });
};

export default orderRoutes;